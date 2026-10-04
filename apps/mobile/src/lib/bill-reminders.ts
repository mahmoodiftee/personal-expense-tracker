import { PaymentStatus, type FixedExpenseMonthlyStatusItem, type MonthKey } from '@finance/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { buildBillReminderDate, clampDueDay } from './bill-due-date';
import { STORAGE_KEYS } from './storage-keys';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_HOUR = 9;
const LOOKAHEAD_DAYS = 3;

export async function getBillRemindersEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.billRemindersEnabled);
  // Default on for first launch.
  return raw !== 'false';
}

export async function setBillRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.billRemindersEnabled, enabled ? 'true' : 'false');
  if (!enabled) {
    await cancelAllBillReminders();
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('bills', {
      name: 'Bill reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelAllBillReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule local reminders for unpaid fixed bills due today or within the next
 * few days of the selected month. Replaces any previously scheduled reminders.
 */
export async function syncBillReminders(
  monthKey: MonthKey,
  items: readonly FixedExpenseMonthlyStatusItem[],
): Promise<{ scheduled: number; skippedReason?: string }> {
  const enabled = await getBillRemindersEnabled();
  if (!enabled) {
    await cancelAllBillReminders();
    return { scheduled: 0, skippedReason: 'disabled' };
  }

  const permitted = await ensureNotificationPermissions();
  if (!permitted) {
    return { scheduled: 0, skippedReason: 'permission-denied' };
  }

  await cancelAllBillReminders();

  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + LOOKAHEAD_DAYS);
  horizon.setHours(23, 59, 59, 999);

  const unpaid = items.filter((item) => item.status !== PaymentStatus.PAID);
  let scheduled = 0;

  for (const item of unpaid) {
    const day = clampDueDay(year, monthIndex, item.dueDay);
    const triggerAt = buildBillReminderDate(year, monthIndex, day, REMINDER_HOUR);

    // Only schedule upcoming reminders in the near window (or later today).
    if (triggerAt < now || triggerAt > horizon) {
      continue;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bill due',
        body: `${item.name} is due today.`,
        data: { expenseId: item.expenseId, monthKey },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerAt,
      },
    });
    scheduled += 1;
  }

  return { scheduled };
}
