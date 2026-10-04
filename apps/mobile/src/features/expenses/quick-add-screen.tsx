import {
  toDateInputFromIso,
  useCreateVariableExpenseMutation,
  useVariableCategories,
  variableExpenseFormSchema,
  type VariableExpenseFormValues,
} from '@finance/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { FormField } from '@/components/ui/form-field';
import { showError } from '@/lib/alerts';

function todayInput(): string {
  return toDateInputFromIso(new Date().toISOString());
}

export function QuickAddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const categoriesQuery = useVariableCategories();
  const createMutation = useCreateVariableExpenseMutation();

  const form = useForm<VariableExpenseFormValues>({
    resolver: zodResolver(variableExpenseFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      occurredOn: todayInput(),
      categoryId: undefined,
      categoryName: '',
      notes: '',
    },
  });

  const categories = categoriesQuery.data ?? [];

  async function onSubmit(values: VariableExpenseFormValues) {
    try {
      await createMutation.mutateAsync(values);
      form.reset({
        description: '',
        amount: '',
        occurredOn: todayInput(),
        categoryId: undefined,
        categoryName: '',
        notes: '',
      });
      router.replace('/(tabs)/month');
    } catch (error) {
      showError('Could not save expense', error);
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-4 pb-10 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <Typography variant="h1">Add expense</Typography>
          <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
        </View>

        <FormField
          label="Amount"
          error={form.formState.errors.amount?.message}
          value={form.watch('amount')}
          onChangeText={(text) => form.setValue('amount', text, { shouldValidate: true })}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <FormField
          label="Description"
          error={form.formState.errors.description?.message}
          value={form.watch('description')}
          onChangeText={(text) => form.setValue('description', text, { shouldValidate: true })}
          placeholder="Coffee, groceries…"
        />

        <FormField
          label="Date (YYYY-MM-DD)"
          error={form.formState.errors.occurredOn?.message}
          value={form.watch('occurredOn')}
          onChangeText={(text) => form.setValue('occurredOn', text, { shouldValidate: true })}
          placeholder={todayInput()}
          autoCapitalize="none"
        />

        <View className="gap-2">
          <Typography variant="label">Category</Typography>
          <Controller
            control={form.control}
            name="categoryName"
            render={({ field }) => (
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    selected={field.value === category.name}
                    onPress={() => {
                      form.setValue('categoryId', category.id, { shouldValidate: true });
                      form.setValue('categoryName', category.name, { shouldValidate: true });
                    }}
                  />
                ))}
              </View>
            )}
          />
          <FormField
            label="Or type a new category"
            error={form.formState.errors.categoryName?.message}
            value={form.watch('categoryName')}
            onChangeText={(text) => {
              form.setValue('categoryId', undefined);
              form.setValue('categoryName', text, { shouldValidate: true });
            }}
            placeholder="Groceries"
          />
        </View>

        <FormField
          label="Notes (optional)"
          error={form.formState.errors.notes?.message}
          value={form.watch('notes') ?? ''}
          onChangeText={(text) => form.setValue('notes', text, { shouldValidate: true })}
          placeholder="Optional details"
          multiline
        />

        <Button
          label={createMutation.isPending ? 'Saving…' : 'Save expense'}
          disabled={createMutation.isPending}
          onPress={form.handleSubmit(onSubmit)}
        />
      </ScrollView>
    </View>
  );
}
