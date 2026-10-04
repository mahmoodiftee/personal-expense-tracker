import { TextInput, View, type TextInputProps } from 'react-native';

import { Typography } from '@/components/design-system';
import { cn } from '@/lib/cn';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
  className?: string;
};

export function FormField({ label, error, className, multiline, ...inputProps }: FormFieldProps) {
  return (
    <View className="gap-1.5">
      <Typography variant="label">{label}</Typography>
      <TextInput
        className={cn(
          'rounded-2xl border border-input bg-card px-4 py-3 text-base text-foreground',
          multiline && 'min-h-[96px]',
          className,
        )}
        placeholderTextColor="#8A8A93"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...inputProps}
      />
      {error ? (
        <Typography variant="caption" className="text-destructive">
          {error}
        </Typography>
      ) : null}
    </View>
  );
}
