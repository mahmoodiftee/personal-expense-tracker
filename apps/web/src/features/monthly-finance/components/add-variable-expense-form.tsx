'use client';

import type { CurrencyCode } from '@finance/shared';
import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/design-system';
import { currentMonthKey } from '@/lib/month';

import type { CreateVariableExpenseInput } from '../types';

type AddVariableExpenseFormProps = {
  currency: CurrencyCode;
  monthKey: string;
  isPending?: boolean;
  onSubmit: (input: CreateVariableExpenseInput) => void;
};

function defaultOccurredAt(monthKey: string): string {
  if (monthKey === currentMonthKey()) {
    return new Date().toISOString();
  }

  const [yearStr, monthStr] = monthKey.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, 15, 12).toISOString();
}

export function AddVariableExpenseForm({
  currency,
  monthKey,
  isPending,
  onSubmit,
}: AddVariableExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const amountMajor = Number.parseFloat(amount);
    if (!description.trim() || Number.isNaN(amountMajor) || amountMajor <= 0) return;

    onSubmit({
      description: description.trim(),
      amountMajor,
      currency,
      occurredAt: defaultOccurredAt(monthKey),
      categoryName: categoryName.trim() || undefined,
    });

    setDescription('');
    setAmount('');
    setCategoryName('');
    setOpen(false);
  };

  if (!open) {
    return (
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add variable expense
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-border bg-card p-4"
      aria-label="Add variable expense"
    >
      <Typography variant="label">New variable expense</Typography>
      <Input
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        aria-label="Description"
        required
        maxLength={200}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-label="Amount"
          required
        />
        <Input
          placeholder="Category (optional)"
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
          aria-label="Category"
          maxLength={60}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
