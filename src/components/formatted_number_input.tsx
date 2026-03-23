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
  value, label, setValue, prefix, suffix, disabled, onBlur, onFocus, readOnly,
}: FormattedNumberInput) {
  return (
    <NumericFormat
      style={{ width: '100%' }}
      InputProps={{ readOnly }}
      valueIsNumericString
      onValueChange={(_) => setValue(_.value)}
      decimalScale={2}
      value={value}
      customInput={TextField}
      thousandSeparator
      prefix={prefix}
      suffix={suffix}
      onBlur={onBlur}
      onFocus={onFocus}
      id='formatted-number'
      label={label}
      maxRows={1}
      variant='outlined'
      size='small'
      disabled={disabled}
      sx={{
        '& .MuiOutlinedInput-root': {
          'borderRadius': 1,
          'fontSize': '0.8rem',
          'backgroundColor': '#f9fafb',
          '& fieldset': { borderColor: '#e5e7eb' },
          '&:hover fieldset': { borderColor: '#d1d5db' },
          '&.Mui-focused fieldset': { borderColor: '#9ca3af', borderWidth: 1 },
        },
        '& .MuiInputLabel-root': { fontSize: '0.75rem', color: '#6b7280' },
      }}
    />
  );
}

export default FormattedNumberInput;
