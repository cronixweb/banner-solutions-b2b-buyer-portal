import { KeyboardEvent, WheelEvent } from 'react';
import { Controller } from 'react-hook-form';
import { useB3Lang } from '@b3/lang';
import { Box, TextField } from '@mui/material';
import debounce from 'lodash-es/debounce';

import { StyleNumberTextField } from './styled';
import Form from './ui';

export default function B3ControlTextField({ control, errors, ...rest }: Form.B3UIProps) {
  const {
    fieldType,
    isAutoComplete = false,
    name,
    default: defaultValue,
    required,
    label,
    validate,
    variant,
    rows,
    min,
    max,
    minLength,
    maxLength,
    fullWidth,
    muiTextFieldProps,
    disabled,
    labelName,
    size,
    readOnly,
    allowArrow = false,
    sx = {},
    isTip = false,
    tipText = '',
    extraPadding,
    fieldId,
    isEnterTrigger,
    handleEnterClick,
    placeholder,
    hidden
  } = rest;

  const b3Lang = useB3Lang();

  let requiredText = '';
  if (fieldType === 'password') {
    requiredText = b3Lang('global.validate.password.required');
  } else {
    requiredText = b3Lang('global.validate.required', {
      label: labelName || label,
    });
  }

  const fieldsProps = {
    type: fieldType,
    name,
    defaultValue,
    rules: {
      required: required && requiredText,
      validate: validate && ((v: string) => validate(v, b3Lang)),
    },
    control,
  };

  const textField = {
    type: fieldType,
    name,
    rows,
    disabled,
    multiline: fieldType === 'multiline',
    variant,
    fullWidth: fullWidth || true,
    required,
    size,
    placeholder,
    hidden
  };

  const inputProps = {
    min,
    max,
    maxLength,
    minLength,
    readOnly,
  };

  const muiAttributeProps = muiTextFieldProps
    ? {
        ...muiTextFieldProps,
        ...inputProps,
      }
    : {
        ...inputProps,
      };

  const handleNumberInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const keys = allowArrow ? ['KeyE', 'Period'] : ['ArrowUp', 'ArrowDown', 'KeyE', 'Period'];
    if (keys.indexOf(event.code) > -1) {
      event.preventDefault();
    }
  };

  const handleKeyDown = debounce((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && handleEnterClick) {
      handleEnterClick();
    } else {
      event.preventDefault();
    }
  }, 300);

  const handleNumberInputWheel = (event: WheelEvent<HTMLInputElement>) => {
    (event.target as HTMLElement).blur();
  };
  const autoCompleteFn = () => {
    if (!isAutoComplete) {
      return {
        autoComplete: 'off',
      };
    }
    return {};
  };
  const newExtraPadding =
    fieldId === 'field_state' && extraPadding.paddingTop === '0px' ? {} : extraPadding;

  return ['text', 'number', 'password', 'multiline'].includes(fieldType) ? (
    <>
      {labelName && (
        <Box
          sx={{
            mb: 1,
          }}
        >
          {`${labelName} :`}
        </Box>
      )}
      <Controller
        key={fieldsProps.name}
        {...fieldsProps}
        render={({ field: { ...rest } }) =>
          fieldType === 'number' ? (
            <StyleNumberTextField
              key={textField.name}
              {...textField}
              {...rest}
              sx={{
                color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.6)',
                '& input': {
                  ...newExtraPadding,
                },
              }}
              allowarrow={allowArrow ? 1 : 0}
              inputProps={muiAttributeProps}
              error={!!errors[name]}
              helperText={(errors as any)[name] ? (errors as any)[name].message : null}
              onKeyDown={handleNumberInputKeyDown}
              onWheel={handleNumberInputWheel}
            />
          ) : (
            <TextField
              key={textField.name}
              {...textField}
              {...rest}
              sx={{
          color: disabled ? 'rgba(0, 0, 0, 0.38)' : 'rgba(0, 0, 0, 0.6)',
          display: hidden ? 'none' : undefined,
          ...sx,
          '& input': {
            ...newExtraPadding,
          },
          '& textarea': {
            ...newExtraPadding,
          },
              }}
              inputProps={muiAttributeProps}
              error={!!errors[name]}
              helperText={(errors as any)[name] ? (errors as any)[name].message : null}
              onKeyDown={isEnterTrigger ? handleKeyDown : () => {}}
              {...autoCompleteFn()}
            />
          )
        }
      />
      {isTip && (
        <Box
          sx={{
            fontSize: '12px',
            color: 'rgba(0, 0, 0, 0.6)',
            marginTop: '0.5rem',
          }}
        >
          {tipText}
        </Box>
      )}
    </>
  ) : null;
}
