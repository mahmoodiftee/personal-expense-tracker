'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DeleteSavingsGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  onConfirm: () => Promise<void>;
  isPending?: boolean;
};

export function DeleteSavingsGoalDialog({
  open,
  onOpenChange,
  goalName,
  onConfirm,
  isPending,
}: DeleteSavingsGoalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Delete savings goal</DialogTitle>
          <DialogDescription>
            Delete &quot;{goalName}&quot;? This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={async () => {
              await onConfirm();
              onOpenChange(false);
            }}
          >
            {isPending ? 'Deleting…' : 'Delete goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
