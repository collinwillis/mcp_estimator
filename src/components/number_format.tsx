import { TextField, TextFieldProps } from "@mui/material";
import React, { useState } from "react";
import { NumericFormat } from "react-number-format";

interface CurrencyInputProps {
  value?: string;
  label: string;
  setValue: (value: string) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
}
const FormattedInput = ({
  value,
  label,
  setValue,
  prefix,
  suffix,
  disabled,
}: CurrencyInputProps) => {
  const materialUITextFieldProps = {
    id: "filled-multiline-flexible",
    label: label,
    maxRows: 1,
    variant: "standard",
    disabled: disabled,
  } as const;

  type MaterialUITextFieldProps = Partial<
    Pick<TextFieldProps, keyof typeof materialUITextFieldProps>
  >;
  const [formattedValue, setFormattedValue] = useState(value);
  const textFieldProps: MaterialUITextFieldProps = materialUITextFieldProps;
  return (
    <NumericFormat
      onValueChange={(_) => {
        setFormattedValue(_.formattedValue);
        setValue(_.value);
      }}
      decimalScale={2}
      value={formattedValue}
      customInput={TextField}
      thousandSeparator={true}
      prefix={prefix}
      suffix={suffix}
      {...textFieldProps}
    />
  );
};

export default FormattedInput;
