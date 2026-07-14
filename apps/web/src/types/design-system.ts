import type { LucideIcon } from 'lucide-react';

export type TypographyVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption' | 'label';

import type { Route } from 'next';

export type StateAction = {
  label: string;
  onClick?: () => void;
  href?: Route;
};

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: StateAction;
};

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export type LoadingStateProps = {
  label?: string;
  rows?: number;
};
