'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DeleteBudgetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onConfirm: () => Promise<void>;
  isPending?: boolean;
};

export function DeleteBudgetDialog({
  open,
  onOpenChange,
  categoryName,
  onConfirm,
  isPending,
}: DeleteBudgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Delete budget</DialogTitle>
          <DialogDescription>
            Remove the budget for &quot;{categoryName}&quot;? This cannot be undone.
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
            {isPending ? 'Deleting…' : 'Delete budget'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
