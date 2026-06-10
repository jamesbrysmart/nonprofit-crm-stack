import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, useRecordId } from 'twenty-sdk/front-component';
import { Button } from 'twenty-sdk/ui';
import {
  actionRowStyle,
  compactDividerSectionStyle,
  compactMetaGridStyle,
  compactMetaItemStyle,
  compactWidgetRootStyle,
  inputStyle,
  labelStyle,
  secondaryTextStyle,
  textareaStyle,
} from 'src/front-components/front-component-ui';

export const OPPORTUNITY_TRANSITION_TASKS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '0e92a94b-c5f3-4af4-b977-99531ce2b015';

type OpportunityTransitionRecord = {
  id: string;
  name?: string | null;
  company?: {
    id?: string | null;
    name?: string | null;
  } | null;
  owner?: {
    id?: string | null;
    name?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  } | null;
  stage?: string | null;
};

type TaskDraft = {
  id: string;
  title: string;
  body: string;
  dueDate: string;
};

type StageOption = {
  value: string;
  label: string;
};

const normalizeString = (value: string | null | undefined) =>
  typeof value === 'string' ? value.trim() : '';

const getInputEventValue = (event: unknown) => {
  if (
    typeof event === 'object' &&
    event !== null &&
    'detail' in event &&
    typeof event.detail === 'object' &&
    event.detail !== null &&
    'value' in event.detail
  ) {
    return String(event.detail.value ?? '');
  }

  if (
    typeof event === 'object' &&
    event !== null &&
    'target' in event &&
    typeof event.target === 'object' &&
    event.target !== null &&
    'value' in event.target
  ) {
    return String((event.target as { value?: unknown }).value ?? '');
  }

  return '';
};

const buildOwnerLabel = (
  owner: OpportunityTransitionRecord['owner'],
) => {
  const firstName = normalizeString(owner?.name?.firstName);
  const lastName = normalizeString(owner?.name?.lastName);
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName === '' ? 'No owner set' : fullName;
};

const createDraftId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createEmptyDraft = (): TaskDraft => ({
  id: createDraftId(),
  title: '',
  body: '',
  dueDate: '',
});

const loadOpportunity = async (
  recordId: string,
): Promise<OpportunityTransitionRecord | null> => {
  const client = new CoreApiClient();
  const result = await client.query({
    opportunity: {
      __args: {
        filter: {
          id: { eq: recordId },
        },
      },
      id: true,
      name: true,
      company: {
        id: true,
        name: true,
      },
      owner: {
        id: true,
        name: {
          firstName: true,
          lastName: true,
        },
      },
      stage: true,
    },
  } as any);

  return (result?.opportunity as OpportunityTransitionRecord | null) ?? null;
};

const loadOpportunityStageOptions = async (): Promise<StageOption[]> => {
  const client = new MetadataApiClient();
  const result = await client.query({
    objects: {
      __args: {
        paging: {
          first: 200,
        },
      },
      edges: {
        node: {
          nameSingular: true,
          fieldsList: {
            name: true,
            label: true,
            options: true,
          },
        },
      },
    },
  } as any);

  const opportunityObject =
    result?.objects?.edges?.find(
      (edge: { node?: { nameSingular?: string | null } | null }) =>
        normalizeString(edge.node?.nameSingular) === 'opportunity',
    )?.node ?? null;

  const stageField =
    opportunityObject?.fieldsList?.find(
      (field: { name?: string | null }) =>
        normalizeString(field.name) === 'stage',
    ) ?? null;

  if (!Array.isArray(stageField?.options)) {
    return [];
  }

  return stageField.options
    .map((option: { value?: string | null; label?: string | null }) => ({
      value: normalizeString(option.value),
      label:
        normalizeString(option.label) || normalizeString(option.value),
    }))
    .filter((option: StageOption) => option.value !== '');
};

const toDueAtIsoString = (value: string) => {
  const normalized = normalizeString(value);

  if (normalized === '') {
    return null;
  }

  return `${normalized}T12:00:00.000Z`;
};

const OpportunityTransitionTasks = () => {
  const recordId = useRecordId();
  const [record, setRecord] = useState<OpportunityTransitionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [taskDrafts, setTaskDrafts] = useState<TaskDraft[]>([createEmptyDraft()]);
  const [stageOptions, setStageOptions] = useState<StageOption[]>([]);
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!recordId) {
        setRecord(null);
        setError('No opportunity selected');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [loaded, availableStageOptions] = await Promise.all([
          loadOpportunity(recordId),
          loadOpportunityStageOptions(),
        ]);

        if (!loaded) {
          setRecord(null);
          setError('Opportunity not found');
          return;
        }

        setRecord(loaded);
        setSelectedStage(normalizeString(loaded.stage));
        setStageOptions(availableStageOptions);
      } catch (loadError) {
        setRecord(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load opportunity context.',
        );
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [recordId]);

  if (loading) {
    return <div style={secondaryTextStyle}>Loading transition tasks...</div>;
  }

  if (error) {
    return <div style={secondaryTextStyle}>{error}</div>;
  }

  if (!recordId || !record) {
    return <div style={secondaryTextStyle}>Opportunity not found.</div>;
  }

  const companyId = normalizeString(record.company?.id);
  const companyName = normalizeString(record.company?.name);
  const ownerId = normalizeString(record.owner?.id);
  const ownerLabel = buildOwnerLabel(record.owner);
  const currentStage = normalizeString(record.stage);
  const stageHasChanged = selectedStage !== '' && selectedStage !== currentStage;

  const hasAnyEnteredTask = taskDrafts.some(
    (draft) => normalizeString(draft.title) !== '',
  );

  const updateDraft = (
    draftId: string,
    changes: Partial<Pick<TaskDraft, 'title' | 'body' | 'dueDate'>>,
  ) => {
    setTaskDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId ? { ...draft, ...changes } : draft,
      ),
    );
  };

  const addCustomTaskRow = () => {
    setTaskDrafts((current) => [...current, createEmptyDraft()]);
  };

  const removeTaskRow = (draftId: string) => {
    setTaskDrafts((current) => {
      const remaining = current.filter((draft) => draft.id !== draftId);

      return remaining.length === 0 ? [createEmptyDraft()] : remaining;
    });
  };

  const handleCreateTasks = async () => {
    if (!stageHasChanged) {
      await enqueueSnackbar({
        message: 'Choose a different target stage before saving this transition.',
        variant: 'error',
      });
      return;
    }

    const tasksToCreate = taskDrafts
      .map((draft) => ({
        title: normalizeString(draft.title),
        body: normalizeString(draft.body),
        dueAt: toDueAtIsoString(draft.dueDate),
      }))
      .filter((draft) => draft.title !== '');

    if (tasksToCreate.length === 0) {
      await enqueueSnackbar({
        message: 'Add at least one task title before saving next actions.',
        variant: 'error',
      });
      return;
    }

    setSaving(true);

    const client = new CoreApiClient();
    let createdTaskCount = 0;

    try {
      await client.mutation({
        updateOpportunity: {
          __args: {
            id: recordId,
            data: {
              stage: selectedStage,
            },
          },
          id: true,
          stage: true,
        },
      } as any);

      for (const task of tasksToCreate) {
        const createTaskResult = await client.mutation({
          createTask: {
            __args: {
              data: {
                title: task.title,
                status: 'TODO',
                dueAt: task.dueAt,
                ...(task.body !== ''
                  ? {
                      bodyV2: {
                        blocknote: null,
                        markdown: task.body,
                      },
                    }
                  : {}),
                ...(ownerId !== '' ? { assigneeId: ownerId } : {}),
              },
            },
            id: true,
          },
        } as any);

        const taskId = normalizeString(createTaskResult?.createTask?.id);

        if (taskId === '') {
          throw new Error('Task creation did not return an id.');
        }

        await client.mutation({
          createTaskTarget: {
            __args: {
              data: {
                taskId,
                targetOpportunityId: recordId,
              },
            },
            id: true,
          },
        } as any);

        if (companyId !== '') {
          await client.mutation({
            createTaskTarget: {
              __args: {
                data: {
                  taskId,
                  targetCompanyId: companyId,
                },
              },
              id: true,
            },
          } as any);
        }

        createdTaskCount += 1;
      }

      setRecord((current) =>
        current
          ? {
              ...current,
              stage: selectedStage,
            }
          : current,
      );
      setTaskDrafts([createEmptyDraft()]);

      await enqueueSnackbar({
        message:
          createdTaskCount === 1
            ? 'Stage updated and 1 linked task created.'
            : `Stage updated and ${createdTaskCount} linked tasks created.`,
        variant: 'success',
      });
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Unable to create linked tasks.',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={compactWidgetRootStyle}>
      <div style={{ ...secondaryTextStyle, color: '#1f2328' }}>
        Move this opportunity to its next stage and create the follow-up tasks
        that should happen next. Tasks created here link back to this
        opportunity automatically.
      </div>

      <div style={compactDividerSectionStyle}>
        <div style={compactMetaGridStyle}>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Current stage</div>
            <div style={secondaryTextStyle}>
              {currentStage === '' ? 'No stage set' : currentStage}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Funder</div>
            <div style={secondaryTextStyle}>
              {companyName === '' ? 'No company linked' : companyName}
            </div>
          </div>
          <div style={compactMetaItemStyle}>
            <div style={labelStyle}>Task assignee</div>
            <div style={secondaryTextStyle}>
              {ownerId === '' ? 'Tasks will stay unassigned' : ownerLabel}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <div style={labelStyle}>Target stage</div>
        <select
          value={selectedStage}
          onChange={(event) => {
            setSelectedStage(getInputEventValue(event));
          }}
          style={inputStyle}
          disabled={saving || stageOptions.length === 0}
        >
          <option value="">Select next stage</option>
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {stageOptions.length === 0 ? (
          <div style={secondaryTextStyle}>
            Unable to load stage options for this workspace.
          </div>
        ) : null}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {taskDrafts.map((draft, index) => (
          <div
            key={draft.id}
            style={{
              display: 'grid',
              gap: '8px',
              padding: '10px',
              border: '1px solid #d8dee4',
              borderRadius: '6px',
              background: '#ffffff',
            }}
          >
            <div style={labelStyle}>Task {index + 1}</div>
            <input
              value={draft.title}
              onChange={(event) => {
                updateDraft(draft.id, { title: getInputEventValue(event) });
              }}
              placeholder="Task title"
              style={inputStyle}
              disabled={saving}
            />
            <textarea
              value={draft.body}
              onChange={(event) => {
                updateDraft(draft.id, { body: getInputEventValue(event) });
              }}
              placeholder="Optional task details"
              style={textareaStyle}
              disabled={saving}
            />
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => {
                updateDraft(draft.id, { dueDate: getInputEventValue(event) });
              }}
              style={inputStyle}
              disabled={saving}
            />
            <div style={actionRowStyle}>
              <Button
                title="Remove"
                variant="secondary"
                onClick={() => {
                  removeTaskRow(draft.id);
                }}
                disabled={saving || taskDrafts.length === 1}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={actionRowStyle}>
        <Button
          title="Add another task"
          variant="secondary"
          onClick={() => {
            addCustomTaskRow();
          }}
          disabled={saving}
        />
        <Button
          title={saving ? 'Applying transition...' : 'Update stage and create tasks'}
          variant="primary"
          onClick={() => {
            void handleCreateTasks();
          }}
          disabled={saving || !hasAnyEnteredTask || !stageHasChanged}
        />
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    OPPORTUNITY_TRANSITION_TASKS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'opportunity-transition-tasks',
  description:
    'Creates multiple follow-up tasks linked to an opportunity at the point of lifecycle transition.',
  component: OpportunityTransitionTasks,
});
