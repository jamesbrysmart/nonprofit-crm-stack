import { defaultRollupConfig } from './rollupConfig';

type AggregationType = 'SUM' | 'COUNT' | 'MAX' | 'MIN' | 'AVG';
type Operator = 'equals' | 'notEquals' | 'in' | 'notIn' | 'gt' | 'gte' | 'lt' | 'lte';
type DynamicValue = 'startOfYear';

type QueryParamPrimitive = string | number | boolean;
type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[];

interface FilterConfig {
  field: string;
  operator: Operator;
  value?: QueryParamPrimitive | QueryParamPrimitive[];
  dynamicValue?: DynamicValue;
}

interface AggregationConfig {
  type: AggregationType;
  parentField: string;
  childField?: string;
  currencyField?: string;
  filters?: FilterConfig[];
}

export interface RollupDefinition {
  parentObject: string;
  childObject: string;
  relationField: string;
  childFilters?: FilterConfig[];
  aggregations: AggregationConfig[];
}

export type RollupConfig = RollupDefinition[];

type ChildRecord = Record<string, unknown>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, QueryParamValue>;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ListPageOptions {
  filter?: Record<string, QueryParamValue>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  cursor?: string;
  limit?: number;
}

interface ListPage<T> {
  items: T[];
  hasNextPage: boolean;
  nextCursor?: string;
}

interface ExecutionSummaryItem {
  parentObject: string;
  processed: number;
  updated: number;
  mode: 'full-rebuild' | 'targeted';
  relationField: string;
  skipped?: string;
}

const RESOURCE_PLURALS: Record<string, string> = {
  person: 'people',
  gift: 'gifts',
  company: 'companies',
  opportunity: 'opportunities',
};

const RETRIABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const DEFAULT_PAGE_SIZE = 200;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 300;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizePayload = (payload: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => {
      if (value === undefined) {
        return false;
      }
      if (typeof value === 'number' && !Number.isFinite(value)) {
        return false;
      }
      return true;
    }),
  );

const getResourceName = (objectName: string) =>
  RESOURCE_PLURALS[objectName] ?? `${objectName}s`;

const operatorSet = new Set<Operator>([
  'equals',
  'notEquals',
  'in',
  'notIn',
  'gt',
  'gte',
  'lt',
  'lte',
]);

const aggregationTypes = new Set<AggregationType>([
  'SUM',
  'COUNT',
  'MAX',
  'MIN',
  'AVG',
]);

const validateRollupConfig = (config: unknown): asserts config is RollupConfig => {
  if (!Array.isArray(config)) {
    throw new Error('Rollup configuration must contain an array of rollup definitions');
  }

  config.forEach((definition, index) => {
    if (!isObject(definition)) {
      throw new Error(`Definition at index ${index} must be an object`);
    }
    const { parentObject, childObject, relationField, childFilters, aggregations } =
      definition as Partial<RollupDefinition>;

    if (typeof parentObject !== 'string' || parentObject.trim().length === 0) {
      throw new Error(`Definition ${index} missing parentObject`);
    }
    if (typeof childObject !== 'string' || childObject.trim().length === 0) {
      throw new Error(`Definition ${index} missing childObject`);
    }
    if (typeof relationField !== 'string' || relationField.trim().length === 0) {
      throw new Error(`Definition ${index} missing relationField`);
    }
    if (!Array.isArray(aggregations) || aggregations.length === 0) {
      throw new Error(`Definition ${index} must declare at least one aggregation`);
    }

    const allFilters = [
      ...(Array.isArray(childFilters) ? childFilters : []),
      ...aggregations.flatMap((agg, aggIndex) => {
        if (!isObject(agg)) {
          throw new Error(`Aggregation ${aggIndex} in definition ${index} must be an object`);
        }
        const { type, parentField, childField, filters } = agg as AggregationConfig;
        if (!aggregationTypes.has(type)) {
          throw new Error(
            `Aggregation ${aggIndex} in definition ${index} has unsupported type ${type}`,
          );
        }
        if (typeof parentField !== 'string' || parentField.trim().length === 0) {
          throw new Error(
            `Aggregation ${aggIndex} in definition ${index} missing parentField`,
          );
        }
        if (type !== 'COUNT' && (typeof childField !== 'string' || childField.length === 0)) {
          throw new Error(
            `Aggregation ${aggIndex} in definition ${index} with type ${type} requires childField`,
          );
        }
        if (filters && !Array.isArray(filters)) {
          throw new Error(
            `Aggregation ${aggIndex} in definition ${index} has invalid filters shape`,
          );
        }
        return filters ?? [];
      }),
    ];

    allFilters.forEach((filter, filterIndex) => {
      if (!isObject(filter)) {
        throw new Error(
          `Filter ${filterIndex} in definition ${index} must be an object`,
        );
      }
      const { field, operator } = filter as FilterConfig;
      if (typeof field !== 'string' || field.trim().length === 0) {
        throw new Error(
          `Filter ${filterIndex} in definition ${index} missing field`,
        );
      }
      if (!operatorSet.has(operator)) {
        throw new Error(
          `Filter ${filterIndex} in definition ${index} has unsupported operator ${operator}`,
        );
      }
    });
  });
};

const resolveRollupConfig = (): RollupConfig => {
  const override =
    process.env.ROLLUP_ENGINE_CONFIG ??
    process.env.ROLLUPS_CONFIG ??
    process.env.CALCULATE_ROLLUPS_CONFIG;

  if (override) {
    try {
      const parsed = JSON.parse(override) as unknown;
      validateRollupConfig(parsed);
      return parsed;
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error';
      throw new Error(`Unable to parse rollup configuration override (reason: ${reason})`);
    }
  }

  const config = defaultRollupConfig;
  validateRollupConfig(config);
  return config;
};

const collectValuesByKey = (value: unknown, key: string, result: Set<string>) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectValuesByKey(entry, key, result));
    return;
  }

  if (!isObject(value)) {
    return;
  }

  Object.entries(value).forEach(([currentKey, entryValue]) => {
    if (currentKey === key && typeof entryValue === 'string' && entryValue.trim().length > 0) {
      result.add(entryValue);
      return;
    }
    collectValuesByKey(entryValue, key, result);
  });
};

const extractRelationValues = (
  params: unknown,
  relationField: string,
): Set<string> => {
  const values = new Set<string>();
  collectValuesByKey(params, relationField, values);
  return values;
};

const resolveDynamicValue = (dynamicValue: DynamicValue, now: Date) => {
  switch (dynamicValue) {
    case 'startOfYear': {
      const utcStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      return utcStart.toISOString();
    }
    default:
      throw new Error(`Unsupported dynamicValue ${dynamicValue}`);
  }
};

const normalizeForEquality = (value: unknown) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

const toComparableNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return timestamp;
    }
    return null;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return null;
};

const compareValues = (left: unknown, right: unknown): number | null => {
  const leftComparable = toComparableNumber(left);
  const rightComparable = toComparableNumber(right);
  if (leftComparable === null || rightComparable === null) {
    return null;
  }
  return leftComparable - rightComparable;
};

const evaluateFilter = (rawValue: unknown, filter: FilterConfig, now: Date) => {
  const comparisonSource =
    filter.dynamicValue !== undefined
      ? resolveDynamicValue(filter.dynamicValue, now)
      : filter.value;

  switch (filter.operator) {
    case 'equals': {
      const left = normalizeForEquality(rawValue);
      const right = normalizeForEquality(comparisonSource);
      return left !== null && right !== null ? left === right : rawValue === comparisonSource;
    }
    case 'notEquals': {
      const left = normalizeForEquality(rawValue);
      const right = normalizeForEquality(comparisonSource);
      return left !== null && right !== null ? left !== right : rawValue !== comparisonSource;
    }
    case 'in': {
      if (!Array.isArray(comparisonSource)) {
        return false;
      }
      const left = normalizeForEquality(rawValue);
      if (left === null) {
        return false;
      }
      return comparisonSource
        .map(normalizeForEquality)
        .some((candidate) => candidate === left);
    }
    case 'notIn': {
      if (!Array.isArray(comparisonSource)) {
        return true;
      }
      const left = normalizeForEquality(rawValue);
      if (left === null) {
        return true;
      }
      return !comparisonSource
        .map(normalizeForEquality)
        .some((candidate) => candidate === left);
    }
    case 'gt': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison > 0 : false;
    }
    case 'gte': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison >= 0 : false;
    }
    case 'lt': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison < 0 : false;
    }
    case 'lte': {
      const comparison = compareValues(rawValue, comparisonSource);
      return comparison !== null ? comparison <= 0 : false;
    }
    default:
      return true;
  }
};

const applyFilters = (
  records: ChildRecord[],
  filters: FilterConfig[] | undefined,
  now: Date,
) => {
  if (!filters || filters.length === 0) {
    return records;
  }
  return records.filter((record) =>
    filters.every((filter) =>
      evaluateFilter(getNestedValue(record, filter.field), filter, now),
    ),
  );
};

const getNestedValue = (record: ChildRecord, pathExpression: string): unknown => {
  if (!pathExpression.includes('.')) {
    return record[pathExpression];
  }

  return pathExpression.split('.').reduce<unknown>((accumulator, key) => {
    if (!isObject(accumulator)) {
      return undefined;
    }
    return accumulator[key];
  }, record);
};

const roundForSum = (value: number) =>
  Number.isInteger(value) ? value : Math.round(value * 100) / 100;

const computeAggregations = (
  definition: RollupDefinition,
  records: ChildRecord[],
  now: Date,
) => {
  const baseFiltered = applyFilters(records, definition.childFilters, now);
  const result: Record<string, number | string | null | Record<string, unknown>> = {};

  definition.aggregations.forEach((aggregation) => {
    const scopedRecords = applyFilters(
      baseFiltered,
      aggregation.filters,
      now,
    );

    switch (aggregation.type) {
      case 'COUNT':
        result[aggregation.parentField] = scopedRecords.length;
        break;
      case 'SUM': {
        if (!aggregation.childField) {
          throw new Error('SUM aggregation requires childField');
        }
        const total = scopedRecords.reduce(
          (accumulator, record) => {
            const rawValue = getNestedValue(record, aggregation.childField!);
            const currencyRaw =
              aggregation.currencyField !== undefined
                ? getNestedValue(record, aggregation.currencyField)
                : undefined;
            const numeric = typeof rawValue === 'number'
              ? rawValue
              : typeof rawValue === 'string'
                ? Number(rawValue)
                : NaN;
            if (Number.isNaN(numeric)) {
              return accumulator;
            }
            return {
              amount: accumulator.amount + numeric,
              currency:
                typeof currencyRaw === 'string' && currencyRaw.trim().length > 0
                  ? currencyRaw
                  : accumulator.currency,
            };
          },
          { amount: 0, currency: undefined as string | undefined },
        );
        result[aggregation.parentField] = {
          amountMicros: Math.round(roundForSum(total.amount)),
          currencyCode: total.currency ?? '',
        };
        break;
      }
      case 'AVG': {
        if (!aggregation.childField) {
          throw new Error('AVG aggregation requires childField');
        }
        const { total, count } = scopedRecords.reduce(
          (accumulator, record) => {
            const rawValue = getNestedValue(record, aggregation.childField!);
            const numeric = typeof rawValue === 'number'
              ? rawValue
              : typeof rawValue === 'string'
                ? Number(rawValue)
                : NaN;
            if (Number.isNaN(numeric)) {
              return accumulator;
            }
            return {
              total: accumulator.total + numeric,
              count: accumulator.count + 1,
            };
          },
          { total: 0, count: 0 },
        );
        result[aggregation.parentField] =
          count === 0 ? null : roundForSum(total / count);
        break;
      }
      case 'MAX':
      case 'MIN': {
        if (!aggregation.childField) {
          throw new Error(`${aggregation.type} aggregation requires childField`);
        }
        const direction = aggregation.type === 'MAX' ? 1 : -1;
        let chosen: { raw: unknown; comparable: number | null } | null = null;
        scopedRecords.forEach((record) => {
          const rawValue = getNestedValue(record, aggregation.childField!);
          const comparable = toComparableNumber(rawValue);
          if (comparable === null) {
            return;
          }
          if (
            chosen === null ||
            (chosen.comparable !== null &&
              direction * (comparable - chosen.comparable) > 0)
          ) {
            chosen = { raw: rawValue, comparable };
          }
        });
        if (chosen === null) {
          result[aggregation.parentField] = null;
        } else if (typeof chosen.raw === 'number') {
          result[aggregation.parentField] = chosen.raw;
        } else if (chosen.raw instanceof Date) {
          result[aggregation.parentField] = chosen.raw.toISOString().slice(0, 10);
        } else if (chosen.raw === null || chosen.raw === undefined) {
          result[aggregation.parentField] = null;
        } else {
          const rawString = String(chosen.raw);
          const parsed = Date.parse(rawString);
          result[aggregation.parentField] = Number.isNaN(parsed)
            ? rawString
            : new Date(parsed).toISOString().slice(0, 10);
        }
        break;
      }
      default:
        break;
    }
  });

  return result;
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

class TwentyClient {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    baseUrl: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    attempt = 1,
  ): Promise<Response> {
    const response = await fetch(url, init);
    if (response.ok) {
      return response;
    }

    if (
      RETRIABLE_STATUS.has(response.status) &&
      attempt < MAX_RETRIES
    ) {
      const delayMs = RETRY_BASE_DELAY_MS * attempt;
      await sleep(delayMs);
      return this.fetchWithRetry(url, init, attempt + 1);
    }

    const errorBody = await response.text();
    throw new Error(
      `Request failed (${response.status}): ${errorBody || 'no body returned'}`,
    );
  }

  private appendQueryParams(url: URL, params: Record<string, QueryParamValue>) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          url.searchParams.append(key, String(entry));
        });
        return;
      }
      url.searchParams.set(key, String(value));
    });
  }

  private async request(
    resourcePath: string,
    options: RequestOptions = {},
  ) {
    const { method = 'GET', query, body, headers = {} } = options;

    const url = resourcePath.startsWith('http')
      ? new URL(resourcePath)
      : new URL(`${this.baseUrl}/${resourcePath.replace(/^\/+/, '')}`);

    if (query) {
      this.appendQueryParams(url, query);
    }

    let serializedBody: string | undefined;

    if (body !== undefined) {
      serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const mergedHeaders: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      ...headers,
    };

    if (serializedBody && !mergedHeaders['Content-Type']) {
      mergedHeaders['Content-Type'] = 'application/json';
    }

    const response = await this.fetchWithRetry(url.toString(), {
      method,
      headers: mergedHeaders,
      body: serializedBody,
    });

    if (response.status === 204) {
      return {};
    }

    const text = await response.text();
    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response from ${url.toString()}: ${(error as Error).message}`,
      );
    }
  }

  private extractRecords(body: unknown, resource: string): ChildRecord[] {
    if (!isObject(body)) {
      return [];
    }
    const data = isObject(body.data) ? (body.data as Record<string, unknown>) : undefined;

    const direct = data && Array.isArray(data[resource]) ? data[resource] : undefined;
    if (Array.isArray(direct)) {
      return direct as ChildRecord[];
    }

    const singular = resource.endsWith('s')
      ? resource.slice(0, -1)
      : resource;
    const singularMatch =
      data && Array.isArray(data[singular]) ? data[singular] : undefined;
    if (Array.isArray(singularMatch)) {
      return singularMatch as ChildRecord[];
    }

    const capitalized = resource.charAt(0).toUpperCase() + resource.slice(1);
    const findManyKey = `findMany${capitalized}`;
    const findMany = data && Array.isArray(data[findManyKey])
      ? data[findManyKey]
      : undefined;
    if (Array.isArray(findMany)) {
      return findMany as ChildRecord[];
    }

    return [];
  }

  private extractPageInfo(body: unknown) {
    if (!isObject(body)) {
      return undefined;
    }
    if (isObject(body.pageInfo)) {
      return body.pageInfo as Record<string, unknown>;
    }
    if (isObject(body.data) && isObject((body.data as Record<string, unknown>).pageInfo)) {
      return (body.data as Record<string, unknown>).pageInfo as Record<string, unknown>;
    }
    return undefined;
  }

  private async listRecordsPage(
    resource: string,
    options: ListPageOptions = {},
  ): Promise<ListPage<ChildRecord>> {
    const query: Record<string, QueryParamValue> = {};
    const limit = options.limit ?? DEFAULT_PAGE_SIZE;
    query.limit = String(limit);

    if (options.cursor) {
      query.starting_after = options.cursor;
    }

    if (options.filter) {
      Object.entries(options.filter).forEach(([field, value]) => {
        query[`filter[${field}]`] = value;
      });
    }

    if (options.orderBy) {
      Object.entries(options.orderBy).forEach(([field, direction]) => {
        query[`order_by[${field}]`] = direction;
      });
    }

    const response = await this.request(resource, {
      method: 'GET',
      query,
    });

    const items = this.extractRecords(response, resource);
    const pageInfo = this.extractPageInfo(response);
    const hasNextPage =
      !!pageInfo &&
      (Boolean(pageInfo.hasNextPage) ||
        Boolean(pageInfo.endCursor) ||
        Boolean(pageInfo.nextCursor));
    const nextCursor =
      (pageInfo && typeof pageInfo.endCursor === 'string' && pageInfo.endCursor) ||
      (pageInfo && typeof pageInfo.nextCursor === 'string' && pageInfo.nextCursor) ||
      undefined;

    return {
      items,
      hasNextPage,
      nextCursor,
    };
  }

  async listAllRecords(
    objectName: string,
    options: ListPageOptions = {},
  ): Promise<ChildRecord[]> {
    const resource = getResourceName(objectName);
    const aggregated: ChildRecord[] = [];
    let cursor: string | undefined;
    let hasNext = true;

    while (hasNext) {
      const page = await this.listRecordsPage(resource, {
        ...options,
        cursor,
      });
      aggregated.push(...page.items);
      hasNext = page.hasNextPage && Boolean(page.nextCursor);
      cursor = hasNext ? page.nextCursor : undefined;
    }

    return aggregated;
  }

  async updateObject(
    objectName: string,
    id: string,
    payload: Record<string, unknown>,
  ) {
    const resource = getResourceName(objectName);
    await this.request(`${resource}/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  }
}

const determineFullRebuild = (params: unknown) => {
  if (!isObject(params)) {
    return false;
  }
  if (params.recalculateAll === true || params.fullRebuild === true) {
    return true;
  }
  if (isObject(params.trigger) && params.trigger.type === 'cron') {
    return true;
  }
  if (params.trigger === 'cron') {
    return true;
  }
  return false;
};

const ensureMapHasTargets = (
  container: Map<string, ChildRecord[]>,
  targetIds: Set<string> | undefined,
) => {
  if (!targetIds) {
    return;
  }
  targetIds.forEach((id) => {
    if (!container.has(id)) {
      container.set(id, []);
    }
  });
};

const getApiCredentials = () => {
  const apiKey =
    process.env.TWENTY_API_KEY ??
    process.env.TWENTY_API_TOKEN ??
    process.env.API_KEY;

  if (!apiKey) {
    return null;
  }

  const baseUrl =
    process.env.TWENTY_API_BASE_URL ??
    process.env.TWENTY_REST_BASE_URL ??
    process.env.TWENTY_API_URL ??
    'https://api.twentycrm.com/rest';

  return { apiKey, baseUrl };
};

const buildChildRecordIndex = async (
  definition: RollupDefinition,
  client: TwentyClient,
  parentIds: Set<string> | undefined,
): Promise<Map<string, ChildRecord[]>> => {
  if (parentIds && parentIds.size > 0) {
    const parentIdList = Array.from(parentIds);
    const result = new Map<string, ChildRecord[]>();
    const concurrency = 5;

    for (let index = 0; index < parentIdList.length; index += concurrency) {
      const slice = parentIdList.slice(index, index + concurrency);
      const batch = await Promise.all(
        slice.map(async (parentId) => {
          const records = await client.listAllRecords(definition.childObject, {
            filter: {
              [definition.relationField]: parentId,
            },
          });
          const filtered = records.filter((record) => {
            const relationValue = getNestedValue(record, definition.relationField);
            return typeof relationValue === 'string' && relationValue === parentId;
          });
          return { parentId, records: filtered };
        }),
      );
      batch.forEach(({ parentId, records }) => {
        result.set(parentId, records);
      });
    }

    ensureMapHasTargets(result, parentIds);
    return result;
  }

  const allRecords = await client.listAllRecords(definition.childObject);
  const grouped = new Map<string, ChildRecord[]>();
  allRecords.forEach((record) => {
    const relationValue = getNestedValue(record, definition.relationField);
    if (typeof relationValue !== 'string' || relationValue.trim().length === 0) {
      return;
    }
    if (!grouped.has(relationValue)) {
      grouped.set(relationValue, []);
    }
    grouped.get(relationValue)!.push(record);
  });
  return grouped;
};

const formatSummary = (
  summaries: ExecutionSummaryItem[],
  durationMs: number,
) => ({
  status: 'ok',
  tookMs: durationMs,
  totals: {
    processed: summaries.reduce((accumulator, item) => accumulator + item.processed, 0),
    updated: summaries.reduce((accumulator, item) => accumulator + item.updated, 0),
  },
  details: summaries,
});

export const main = async (params: unknown): Promise<object> => {
  const start = Date.now();
  try {
    const config = resolveRollupConfig();
    if (config.length === 0) {
      return { status: 'noop', reason: 'No rollup definitions configured' };
    }

    const fullRebuild = determineFullRebuild(params);
    const relationCache = new Map<string, Set<string>>();

    config.forEach((definition) => {
      if (!relationCache.has(definition.relationField)) {
        relationCache.set(
          definition.relationField,
          extractRelationValues(params, definition.relationField),
        );
      }
    });

    const credentials = getApiCredentials();
    if (!credentials) {
      console.warn('[rollup] skipping execution because TWENTY_API_KEY is not set');
      return { status: 'noop', reason: 'TWENTY_API_KEY not configured' };
    }

    const { apiKey, baseUrl } = credentials;
    const client = new TwentyClient(apiKey, baseUrl);
    const now = new Date();
    const summaries: ExecutionSummaryItem[] = [];

    for (const definition of config) {
      const targetIds = fullRebuild
        ? undefined
        : relationCache.get(definition.relationField);

      if (!fullRebuild && (!targetIds || targetIds.size === 0)) {
        summaries.push({
          parentObject: definition.parentObject,
          processed: 0,
          updated: 0,
          relationField: definition.relationField,
          mode: 'targeted',
          skipped: `No ${definition.relationField} values found in payload`,
        });
        continue;
      }

      const childIndex = await buildChildRecordIndex(
        definition,
        client,
        targetIds,
      );

      const updates: Array<{
        id: string;
        payload: Record<string, unknown>;
        context: { relationId: string };
      }> = [];
      childIndex.forEach((records, parentId) => {
        const recordIds = records
          .map((record) => getNestedValue(record, 'id'))
          .filter((value): value is string => typeof value === 'string');
        console.info(
          `[rollup] relation ${parentId} includes ${recordIds.length} ${definition.childObject}(s): ${recordIds.join(', ')}`,
        );
        const aggregates = computeAggregations(definition, records, now);
        const payload = sanitizePayload(aggregates);
        if (Object.keys(payload).length === 0) {
          return;
        }
        console.info(
          `[rollup] computed aggregates for ${definition.parentObject} ${parentId}: ${JSON.stringify(payload)}`,
        );
        updates.push({ id: parentId, payload, context: { relationId: parentId } });
      });

      let updatedCount = 0;
      for (const update of updates) {
        try {
          await client.updateObject(definition.parentObject, update.id, update.payload);
          updatedCount += 1;
          console.info(
            `[rollup] updated ${definition.parentObject} ${update.id} (relation ${update.context.relationId})`,
          );
        } catch (error) {
          const reason =
            error instanceof Error
              ? error.message || error.toString()
              : typeof error === 'string'
                ? error
                : 'Unknown error';
          console.warn(
            `[rollup] failed to update ${definition.parentObject} ${update.id} (relation ${update.context.relationId}): ${reason}`,
          );
        }
      }

      summaries.push({
        parentObject: definition.parentObject,
        processed: childIndex.size,
        updated: updatedCount,
        relationField: definition.relationField,
        mode: fullRebuild ? 'full-rebuild' : 'targeted',
      });
    }

    const totalProcessed = summaries.reduce(
      (accumulator, item) => accumulator + item.processed,
      0,
    );

    if (!fullRebuild && totalProcessed === 0) {
      return {
        status: 'noop',
        reason: 'No matching relation ids found in payload',
      };
    }

    const duration = Date.now() - start;
    console.info(
      `[rollup] completed mode=${fullRebuild ? 'full-rebuild' : 'targeted'} processed=${totalProcessed} durationMs=${duration}`,
    );
    return formatSummary(summaries, duration);
  } catch (error) {
    const serializedError =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`
        : JSON.stringify(error);
    console.error('[rollup] execution failed', serializedError);
    return {
      status: 'error',
      message:
        error instanceof Error
          ? error.message || 'Unknown error'
          : typeof error === 'string'
            ? error
            : 'Unknown error',
    };
  }
};
