import { NativeModules, Platform, Alert } from 'react-native';
import { t } from './i18n';

const { PermissionsModule } = NativeModules;

/**
 * Check if POST_NOTIFICATIONS permission is granted
 * Returns true on Android < 13 (permission not required)
 */
export const checkPostNotificationsPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    return await PermissionsModule.checkPostNotificationsPermission();
  } catch (error) {
    console.error('Error checking POST_NOTIFICATIONS permission:', error);
    return false;
  }
};

/**
 * Request POST_NOTIFICATIONS permission
 * Shows explanation dialog before requesting
 */
export const requestPostNotificationsPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // Check if already granted
    const hasPermission = await checkPostNotificationsPermission();
    if (hasPermission) {
      return true;
    }

    // Request permission
    const granted = await PermissionsModule.requestPostNotificationsPermission();

    if (!granted) {
      console.warn('POST_NOTIFICATIONS permission denied');
    }

    return granted;
  } catch (error) {
    console.error('Error requesting POST_NOTIFICATIONS permission:', error);
    return false;
  }
};

/**
 * Request POST_NOTIFICATIONS permission with user-friendly explanation
 */
export const requestPostNotificationsWithExplanation = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  // Check if already granted
  const hasPermission = await checkPostNotificationsPermission();
  if (hasPermission) {
    return true;
  }

  // Show explanation dialog
  return new Promise((resolve) => {
    Alert.alert(
      t('permissions.notificationTitle') || 'Notification Permission Required',
      t('permissions.notificationMessage') || 'Kids Guard needs notification permission to keep parental controls active in the background. This ensures volume and brightness remain locked even when the app is minimized.',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: t('permissions.notificationButton') || 'Allow',
          onPress: async () => {
            const granted = await requestPostNotificationsPermission();
            resolve(granted);
          },
        },
      ]
    );
  });
};
