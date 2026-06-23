export type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type Connection<TNode> = {
  edges: Array<{ node: TNode }>;
  pageInfo?: PageInfo;
  totalCount?: number;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const extractQueryRecord = <T>(
  result: unknown,
  field: string,
): T | undefined => {
  if (!isObject(result)) {
    return undefined;
  }

  const candidate = result[field];

  if (!isObject(candidate)) {
    return undefined;
  }

  return candidate as T;
};

export const extractConnection = <TNode>(
  result: unknown,
  field: string,
): Connection<TNode> => {
  const candidate = extractQueryRecord<Connection<TNode>>(result, field);

  if (!candidate) {
    return { edges: [] };
  }

  return {
    edges: Array.isArray(candidate.edges) ? candidate.edges : [],
    pageInfo: candidate.pageInfo,
    totalCount:
      typeof candidate.totalCount === 'number' ? candidate.totalCount : undefined,
  };
};

export const extractConnectionNodes = <TNode>(
  result: unknown,
  field: string,
): TNode[] => extractConnection<TNode>(result, field).edges.map((edge) => edge.node);

export const extractMutationRecord = <T>(
  result: unknown,
  field: string,
): T | undefined => extractQueryRecord<T>(result, field);
