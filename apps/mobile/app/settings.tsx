import {
  APP_CURRENCY,
  TAKA_SYMBOL,
  apiHealthLiveUrl,
  currentMonthKey,
  useMonthlyFinance,
} from '@finance/client';
import { Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import { PageShell, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import {
  ensureNotificationPermissions,
  getBillRemindersEnabled,
  setBillRemindersEnabled,
  syncBillReminders,
} from '@/lib/bill-reminders';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useTheme, type ThemePreference } from '@/providers/theme-provider';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const { preference, setPreference } = useTheme();
  const [health, setHealth] = useState<'checking' | 'ok' | 'down'>('checking');
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const month = currentMonthKey();
  const monthlyFinance = useMonthlyFinance(month);

  useEffect(() => {
    void getBillRemindersEnabled().then(setRemindersEnabled);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(apiHealthLiveUrl(), { signal: controller.signal })
      .then((response) => setHealth(response.ok ? 'ok' : 'down'))
      .catch(() => setHealth('down'));
    return () => controller.abort();
  }, []);

  const onToggleReminders = useCallback(
    async (enabled: boolean) => {
      setRemindersEnabled(enabled);
      await setBillRemindersEnabled(enabled);

      if (enabled) {
        const permitted = await ensureNotificationPermissions();
        if (!permitted) {
          Alert.alert(
            'Notifications blocked',
            'Enable notifications in system settings to receive bill reminders.',
          );
          setRemindersEnabled(false);
          await setBillRemindersEnabled(false);
          return;
        }

        if (monthlyFinance.data) {
          const result = await syncBillReminders(month, monthlyFinance.data.fixed.items);
          Alert.alert(
            'Bill reminders on',
            result.scheduled > 0
              ? `Scheduled ${result.scheduled} reminder(s) for the next few days.`
              : 'No unpaid bills are due in the next few days.',
          );
        }
      }
    },
    [month, monthlyFinance.data],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Settings' }} />
      <PageShell safeTop={false}>
        <Card>
          <CardContent className="gap-3">
            <Typography variant="h2">Appearance</Typography>
            <View className="flex-row gap-2">
              {THEME_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setPreference(option)}
                  className={cn(
                    'rounded-full border border-border px-4 py-2',
                    preference === option && 'border-primary bg-primary/20',
                  )}
                >
                  <Typography variant="caption" className="capitalize text-foreground">
                    {option}
                  </Typography>
                </Pressable>
              ))}
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Typography variant="h2">Bill reminders</Typography>
              <Typography variant="caption">
                Local alerts at 9:00 for unpaid fixed bills due in the next 3 days.
              </Typography>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={(value) => {
                void onToggleReminders(value);
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-2">
            <Typography variant="h2">Currency</Typography>
            <Typography variant="body" className="text-sm">
              Display {TAKA_SYMBOL} ({APP_CURRENCY})
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="gap-2">
            <Typography variant="h2">API</Typography>
            <Typography variant="caption">Base URL</Typography>
            <Typography variant="body" className="text-sm">
              {env.apiBaseUrl}
            </Typography>
            <Typography variant="caption">
              Health:{' '}
              {health === 'checking' ? 'Checking…' : health === 'ok' ? 'Online' : 'Unreachable'}
            </Typography>
            <Typography variant="caption">
              Offline cache: dashboard and lists reopen from the last successful sync.
            </Typography>
          </CardContent>
        </Card>
      </PageShell>
    </>
  );
}
