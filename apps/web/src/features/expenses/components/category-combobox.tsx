'use client';

import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ApiClientError } from '@/lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

import { resolveCategoryColor } from '@finance/shared';
import { createVariableExpenseCategory } from '@/features/categories/api/categories-api';
import {
  useVariableCategories,
  variableCategoriesQueryKey,
} from '@/features/categories/hooks/use-variable-categories';

export type CategorySelection = {
  id?: string;
  name: string;
};

type CategoryComboboxProps = {
  value: CategorySelection;
  onChange: (value: CategorySelection) => void;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
};

export function CategoryCombobox({
  value,
  onChange,
  disabled,
  id,
  'aria-invalid': ariaInvalid,
}: CategoryComboboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, isError } = useVariableCategories();

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedSearch) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(normalizedSearch));
  }, [categories, normalizedSearch]);

  const exactMatch = useMemo(
    () => categories.some((category) => category.name.toLowerCase() === normalizedSearch),
    [categories, normalizedSearch],
  );

  const showCreateOption = normalizedSearch.length > 0 && !exactMatch;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch(value.name);
      setCreateError(null);
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, value.name]);

  const selectCategory = (selection: CategorySelection) => {
    onChange(selection);
    setOpen(false);
    setSearch('');
    setCreateError(null);
  };

  const handleCreate = async () => {
    const name = search.trim();
    if (!name) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const created = await createVariableExpenseCategory(name);
      await queryClient.invalidateQueries({ queryKey: variableCategoriesQueryKey });
      selectCategory({ id: created.id, name: created.name });
    } catch (error) {
      const clientError = error as ApiClientError;
      setCreateError(clientError.message ?? 'Could not create category.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        id={id}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        disabled={disabled || isLoading}
        className={cn(
          'h-10 w-full justify-between font-normal',
          !value.name && 'text-muted-foreground',
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{value.name || 'Select category…'}</span>
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        )}
      </Button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card p-2 shadow-lg">
          <Input
            ref={searchRef}
            value={search}
            placeholder="Search categories…"
            disabled={disabled || isCreating}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
                return;
              }
              if (event.key === 'Enter' && showCreateOption) {
                event.preventDefault();
                void handleCreate();
              }
            }}
            className="mb-2 h-9"
          />

          <div className="max-h-52 overflow-y-auto">
            {isError ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Could not load categories.</p>
            ) : null}

            {!isError && filtered.length === 0 && !showCreateOption ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                {categories.length === 0 ? 'No categories yet.' : 'No matches.'}
              </p>
            ) : null}

            {filtered.map((category) => {
              const isSelected =
                value.id === category.id ||
                (!value.id && value.name.toLowerCase() === category.name.toLowerCase());

              return (
                <button
                  key={category.id}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent',
                    isSelected && 'bg-accent',
                  )}
                  onClick={() => selectCategory({ id: category.id, name: category.name })}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: resolveCategoryColor(category.name, category.color) }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                </button>
              );
            })}

            {showCreateOption ? (
              <button
                type="button"
                disabled={isCreating}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-primary hover:bg-accent disabled:opacity-50"
                onClick={() => void handleCreate()}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate">Add &ldquo;{search.trim()}&rdquo;</span>
              </button>
            ) : null}
          </div>

          {createError ? (
            <p className="mt-2 px-1 text-xs text-destructive" role="alert">
              {createError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
