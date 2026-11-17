import { useId, type CSSProperties, type ReactNode } from 'react';
import {
  Checkbox,
  Field,
  Input,
  Radio,
  RadioGroup,
  Select,
  Textarea,
} from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { theme } from 'src/front-components/theme-tokens';

export type FormSelectOption = { value: string; label: string };

type FormFieldShellProps = {
  label: string;
  description?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  style?: CSSProperties;
  children: ReactNode;
};

// Field.Root associates the control with its label, help text and error.
const FormFieldShell = ({
  label,
  description,
  error,
  disabled,
  style,
  children,
}: FormFieldShellProps) => (
  <Field.Root disabled={disabled} invalid={Boolean(error)} style={style}>
    <Field.Label>{label}</Field.Label>
    {children}
    {description ? <Field.Description>{description}</Field.Description> : null}
    {error ? <Field.Error match>{error}</Field.Error> : null}
  </Field.Root>
);

// Base UI sets the --anchor-* and --available-* variables on the positioner. The
// default popup surface is translucent, so forms need an opaque background.
const SELECT_POPUP_STYLE: CSSProperties = {
  boxSizing: 'border-box',
  width: 'var(--anchor-width, 280px)',
  maxWidth: 'var(--available-width)',
  maxHeight: 'min(300px, var(--available-height, 300px))',
  overflowY: 'auto',
  background: theme.background.primary,
  backdropFilter: 'none',
};

const SELECT_TRIGGER_STYLE: CSSProperties = { width: '100%' };

export const FormSelect = ({
  label,
  value,
  onChange,
  options,
  emptyOptionLabel,
  description,
  error,
  disabled,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  // Adds a "none" choice; the empty string stands for no selection.
  emptyOptionLabel?: string;
  description?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  style?: CSSProperties;
}) => {
  const items =
    emptyOptionLabel === undefined
      ? options
      : [{ value: '', label: emptyOptionLabel }, ...options];

  return (
    <FormFieldShell
      label={label}
      description={description}
      error={error}
      disabled={disabled}
      style={style}
    >
      <Select.Root
        value={value}
        onValueChange={(nextValue) => onChange(nextValue ?? '')}
        items={items}
        disabled={disabled}
      >
        <Select.Trigger style={SELECT_TRIGGER_STYLE}>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          {/* Aligning the item with the trigger needs layout reads the sandbox cannot provide. */}
          <Select.Positioner
            side="bottom"
            align="start"
            sideOffset={4}
            alignItemWithTrigger={false}
            collisionPadding={8}
            collisionAvoidance={{ side: 'flip', align: 'none' }}
          >
            <Select.Popup style={SELECT_POPUP_STYLE}>
              <Select.List>
                {items.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </FormFieldShell>
  );
};

export const FormInput = ({
  label,
  value,
  onChange,
  type = 'text',
  inputMode,
  placeholder,
  maxLength,
  description,
  error,
  disabled,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'email' | 'tel';
  inputMode?: 'text' | 'decimal' | 'numeric' | 'email' | 'tel';
  placeholder?: string;
  maxLength?: number;
  description?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  style?: CSSProperties;
}) => (
  <FormFieldShell
    label={label}
    description={description}
    error={error}
    disabled={disabled}
    style={style}
  >
    <Input
      type={type}
      inputMode={inputMode}
      placeholder={placeholder}
      maxLength={maxLength}
      value={value}
      onValueChange={(nextValue) => onChange(nextValue)}
    />
  </FormFieldShell>
);

export const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  description,
  error,
  disabled,
  style,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  description?: ReactNode;
  error?: string | null;
  disabled?: boolean;
  style?: CSSProperties;
}) => (
  <FormFieldShell
    label={label}
    description={description}
    error={error}
    disabled={disabled}
    style={style}
  >
    <Textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onValueChange={(nextValue) => onChange(nextValue)}
    />
  </FormFieldShell>
);

const CHECKBOX_LABEL_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  cursor: 'pointer',
};

export const FormCheckbox = ({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  const checkboxId = useId();

  return (
    <label htmlFor={checkboxId} style={CHECKBOX_LABEL_STYLE}>
      <Checkbox
        id={checkboxId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(nextChecked) => onChange(nextChecked)}
      />
      <Text render={<span />}>{label}</Text>
    </label>
  );
};

export type ChoiceCardOption = {
  value: string;
  title: ReactNode;
  description?: ReactNode;
};

const CHOICE_CARD_CONTENT_STYLE: CSSProperties = {
  display: 'grid',
  gap: 4,
  paddingInlineEnd: 24,
};

// A selectable list of records, such as possible donor matches.
export const ChoiceCards = ({
  ariaLabel,
  value,
  onChange,
  options,
}: {
  ariaLabel: string;
  value: string | null;
  onChange: (value: string) => void;
  options: ChoiceCardOption[];
}) => (
  <RadioGroup
    aria-label={ariaLabel}
    value={value ?? ''}
    onValueChange={(nextValue) => onChange(String(nextValue))}
  >
    {options.map((option) => (
      <Radio key={option.value} variant="card" value={option.value}>
        <span style={CHOICE_CARD_CONTENT_STYLE}>
          <Text render={<span />} weight="medium">
            {option.title}
          </Text>
          {option.description ? (
            <Text render={<span />} color="secondary">
              {option.description}
            </Text>
          ) : null}
        </span>
      </Radio>
    ))}
  </RadioGroup>
);
