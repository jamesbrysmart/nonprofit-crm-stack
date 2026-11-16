import type { CSSProperties, ReactNode } from 'react';
import { Field, Input, Select, Textarea } from 'twenty-ui/primitives/input';

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

const SELECT_LIST_STYLE: CSSProperties = { maxHeight: 240, overflowY: 'auto' };

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
        <Select.Trigger>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          {/* Aligning the item with the trigger needs layout reads the sandbox cannot provide. */}
          <Select.Positioner
            align="start"
            sideOffset={4}
            alignItemWithTrigger={false}
          >
            <Select.Popup>
              <Select.List style={SELECT_LIST_STYLE}>
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
