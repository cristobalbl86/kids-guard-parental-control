/**
 * Family Helper - Parental Control App
 * React Native CLI version
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ParentVerificationScreen from './src/screens/ParentVerificationScreen';
import SetupPINScreen from './src/screens/SetupPINScreen';
import HomeScreen from './src/screens/HomeScreen';
import ParentSettingsScreen from './src/screens/ParentSettingsScreen';
import PINEntryScreen from './src/screens/PINEntryScreen';

// Utils
import { checkFirstLaunch, initializeApp } from './src/utils/storage';
import { theme } from './src/utils/theme';
import { initializeVolumeControl } from './src/utils/volumeControl';
import { initializeBrightnessControl } from './src/utils/brightnessControl';

const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApplication();
  }, []);

  const initializeApplication = async () => {
    try {
      await initializeApp();
      const firstLaunch = await checkFirstLaunch();
      setIsFirstLaunch(firstLaunch);
      setIsSetupComplete(!firstLaunch);

      // Initialize control modules if setup is complete
      if (!firstLaunch) {
        try {
          await initializeVolumeControl();
          await initializeBrightnessControl();
        } catch (error) {
          console.warn('Failed to initialize controls:', error);
        }
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setIsSetupComplete(true);
    setIsFirstLaunch(false);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              {!isSetupComplete ? (
                <>
                  <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ParentVerification"
                    component={ParentVerificationScreen}
                    options={{ title: 'Parent Verification' }}
                  />
                  <Stack.Screen
                    name="SetupPIN"
                    options={{ title: 'Set Up PIN' }}
                  >
                    {props => <SetupPINScreen {...props} onSetupComplete={handleSetupComplete} />}
                  </Stack.Screen>
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Family Helper' }}
                  />
                  <Stack.Screen
                    name="PINEntry"
                    component={PINEntryScreen}
                    options={{ title: 'Enter PIN' }}
                  />
                  <Stack.Screen
                    name="ParentSettings"
                    component={ParentSettingsScreen}
                    options={{ title: 'Parent Settings' }}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
