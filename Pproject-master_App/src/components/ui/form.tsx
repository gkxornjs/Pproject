// src/components/ui/form.tsx
import React, { PropsWithChildren } from 'react';
import {
  View,
  Text,
  ViewProps,
  TextProps,
  StyleSheet,
} from 'react-native';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from './label';

/* ------------------------------------------------------------------ */
/* Form (FormProvider 그대로 사용)                                    */
/* ------------------------------------------------------------------ */

export const Form = FormProvider;

/* ------------------------------------------------------------------ */
/* FormField context                                                   */
/* ------------------------------------------------------------------ */

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext =
  React.createContext<FormFieldContextValue | null>(null);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>,
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/* FormItem context                                                    */
/* ------------------------------------------------------------------ */

type FormItemContextValue = {
  id: string;
};

const FormItemContext =
  React.createContext<FormItemContextValue | null>(null);

/* ------------------------------------------------------------------ */
/* useFormField                                                        */
/* ------------------------------------------------------------------ */

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({
    name: fieldContext?.name,
  });

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }
  if (!itemContext) {
    throw new Error('useFormField should be used within <FormItem>');
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

/* ------------------------------------------------------------------ */
/* FormItem                                                            */
/* ------------------------------------------------------------------ */

interface FormItemProps extends ViewProps {}

function FormItem({
  children,
  style,
  ...rest
}: PropsWithChildren<FormItemProps>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <View style={[styles.item, style]} {...rest}>
        {children}
      </View>
    </FormItemContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* FormLabel                                                           */
/* ------------------------------------------------------------------ */

interface FormLabelProps extends TextProps {}

function FormLabel({
  style,
  ...rest
}: PropsWithChildren<FormLabelProps>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      // RN에서는 htmlFor 대신 해당 필드를 설명하는 용도로 nativeID만 사용
      nativeID={`${formItemId}-label`}
      style={[styles.label, error && styles.labelError, style]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* FormControl                                                         */
/* ------------------------------------------------------------------ */

interface FormControlProps {
  children: React.ReactElement;
}

function FormControl({ children }: { children: React.ReactElement }) {
  const { error, formItemId } = useFormField();

  // children은 실제 TextInput / Switch 같은 RN 컴포넌트가 온다고 가정하고 any로 캐스팅
  const child = children as React.ReactElement<any>;

  return React.cloneElement(
    child,
    {
      nativeID: formItemId,
      // 기존 accessibilityState 유지 + invalid만 덮어쓰기
      accessibilityState: {
        ...(child.props.accessibilityState as any),
        invalid: !!error,
      },
    } as any, // cloneElement 두 번째 인자 타입도 any로 완화
  );
}

/* ------------------------------------------------------------------ */
/* FormDescription                                                     */
/* ------------------------------------------------------------------ */

interface FormDescriptionProps extends TextProps {}

function FormDescription({
  style,
  ...rest
}: PropsWithChildren<FormDescriptionProps>) {
  const { formDescriptionId } = useFormField();

  return (
    <Text
      // 웹의 id 역할은 RN에선 크게 의미 없지만, 구조 유지 차원에서 넣어둠
      nativeID={formDescriptionId}
      style={[styles.description, style]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* FormMessage                                                         */
/* ------------------------------------------------------------------ */

interface FormMessageProps extends TextProps {}

function FormMessage({
  style,
  children,
  ...rest
}: PropsWithChildren<FormMessageProps>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? '') : children;

  if (!body) return null;

  return (
    <Text
      nativeID={formMessageId}
      style={[styles.message, style]}
      {...rest}
    >
      {body}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  labelError: {
    color: '#EF4444', // red-500
  },
  description: {
    fontSize: 12,
    color: '#6B7280', // gray-500
  },
  message: {
    fontSize: 12,
    color: '#EF4444', // red-500
  },
});

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

export {
  useFormField,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
