import {TextField, TextFieldProps} from "@mui/material";
import React from "react";
import {NumericFormat} from "react-number-format";

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

const FormattedNumberInput = ({
                                  value,
                                  label,
                                  setValue,
                                  prefix,
                                  suffix,
                                  disabled,
                                  onBlur,
                                  onFocus,
                                  readOnly
                              }: FormattedNumberInput) => {
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

    const textFieldProps: MaterialUITextFieldProps = materialUITextFieldProps;

    return (
        <NumericFormat
            InputProps={{
                readOnly: readOnly
            }}
            valueIsNumericString={true}
            onValueChange={(_) => {
                setValue(_.value);
            }}
            decimalScale={2}
            value={value}
            customInput={TextField}
            thousandSeparator={true}
            prefix={prefix}
            suffix={suffix}
            onBlur={onBlur}
            onFocus={onFocus}
            {...textFieldProps}
        />
    );
};

export default FormattedNumberInput;
