import { Alert } from 'react-native';

export function confirmDelete(title: string, message: string, onConfirm: () => void) {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export function showError(title: string, error: unknown) {
  Alert.alert(title, error instanceof Error ? error.message : 'Please try again.');
}
