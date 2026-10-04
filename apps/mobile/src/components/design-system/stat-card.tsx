import { Card, CardContent } from '@/components/ui/card';
import { Typography } from './typography';

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: string | null;
};

export function StatCard({ label, value, hint, trend }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="gap-2">
        <Typography variant="label">{label}</Typography>
        <Typography variant="h2" className="tabular-nums">
          {value}
        </Typography>
        {hint ? <Typography variant="caption">{hint}</Typography> : null}
        {trend ? <Typography variant="caption">{trend}</Typography> : null}
      </CardContent>
    </Card>
  );
}
