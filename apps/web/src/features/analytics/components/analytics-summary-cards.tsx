import { StatCard } from '@/components/design-system';

import type { AnalyticsSummaryCard } from '../types';

type AnalyticsSummaryCardsProps = {
  cards: AnalyticsSummaryCard[];
};

export function AnalyticsSummaryCards({ cards }: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          hint={card.hint}
          trend={card.trend}
        />
      ))}
    </div>
  );
}
