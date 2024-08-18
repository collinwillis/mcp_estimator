import React from 'react';
import { NumericFormat } from 'react-number-format';
import { TextField, TextFieldProps } from '@mui/material';

interface FormattedNumberInput {
  value?: string;
  label: string;
  setValue: (value: string) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  readOnly?: boolean;
}

function FormattedNumberInput({
  value,
  label,
  setValue,
  prefix,
  suffix,
  disabled,
  onBlur,
  onFocus,
  readOnly,
}: FormattedNumberInput) {
  const materialUITextFieldProps = {
    id: 'filled-multiline-flexible',
    label,
    maxRows: 1,
    variant: 'standard',
    disabled,
  } as const;

  type MaterialUITextFieldProps = Partial<
    Pick<TextFieldProps, keyof typeof materialUITextFieldProps>
  >;

  const textFieldProps: MaterialUITextFieldProps = materialUITextFieldProps;

  return (
    <NumericFormat
      style={{ width: '100%' }}
      InputProps={{
        readOnly,
      }}
      valueIsNumericString
      onValueChange={(_) => {
        setValue(_.value);
      }}
      decimalScale={2}
      value={value}
      customInput={TextField}
      thousandSeparator
      prefix={prefix}
      suffix={suffix}
      onBlur={onBlur}
      onFocus={onFocus}
      {...textFieldProps}
    />
  );
}

export default FormattedNumberInput;
