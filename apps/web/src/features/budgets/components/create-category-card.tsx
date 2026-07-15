'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import type { ApiClientError } from '@/lib/api-client';

import { createVariableCategory } from '../api/budgets-api';

type CreateCategoryCardProps = {
  isPending?: boolean;
  onCreated: () => void;
};

export function CreateCategoryCard({ isPending, onCreated }: CreateCategoryCardProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a category name.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await createVariableCategory(trimmed);
      setName('');
      onCreated();
    } catch (err) {
      const clientError = err as ApiClientError;
      setError(clientError.message ?? 'Could not create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Create a category</CardTitle>
        <CardDescription>
          Budgets are set per category — for example Loan, Groceries, or Transport.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="category-name" className="text-sm font-medium">
              Category name
            </label>
            <Input
              id="category-name"
              placeholder="Loan, Groceries, Dining…"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting || isPending}
            />
            {error ? (
              <Typography variant="caption" className="text-destructive">
                {error}
              </Typography>
            ) : null}
          </div>
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting ? 'Creating…' : 'Create category'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
