import { currentMonthKey, useMonthlyFinance } from '@finance/client';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { syncBillReminders } from '@/lib/bill-reminders';

/** Keeps local bill-due notifications in sync with unpaid fixed expenses. */
export function BillRemindersSync() {
  const month = currentMonthKey();
  const { data } = useMonthlyFinance(month);

  useEffect(() => {
    if (!data) return;

    void syncBillReminders(month, data.fixed.items);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void syncBillReminders(month, data.fixed.items);
      }
    });

    return () => subscription.remove();
  }, [data, month]);

  return null;
}
