/**
 * Kids guard - Parental Control App
 * React Native CLI version
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, AppState} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import ParentVerificationScreen from './src/screens/ParentVerificationScreen';
import SetupPINScreen from './src/screens/SetupPINScreen';
import HomeScreen from './src/screens/HomeScreen';
import ParentSettingsScreen from './src/screens/ParentSettingsScreen';
import PINEntryScreen from './src/screens/PINEntryScreen';

// Utils
import {checkFirstLaunch, initializeApp} from './src/utils/storage';
import {theme} from './src/utils/theme';
import {initializeVolumeControl} from './src/utils/volumeControl';
import {initializeBrightnessControl} from './src/utils/brightnessControl';
import {initializeAdMob, showInterstitialIfEligible} from './src/utils/admobControl';

const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApplication();
  }, []);

  // AppState listener for showing ads on foreground
  useEffect(() => {
    if (!isSetupComplete) {
      // Don't show ads until setup is complete
      return;
    }

    const handleAppStateChange = async (nextAppState: string) => {
      // Only show ads when transitioning FROM background/inactive TO active (foreground)
      const isComingToForeground =
        (appState === 'background' || appState === 'inactive') &&
        nextAppState === 'active';

      if (isComingToForeground) {
        console.log('[App] App came to foreground from background');
        // Try to show ad if eligible (6-hour check happens inside)
        await showInterstitialIfEligible();
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isSetupComplete, appState]);

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
          await initializeAdMob();
          // Show ad after initialization if eligible
          setTimeout(async () => {
            await showInterstitialIfEligible();
          }, 2000);
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

  const handleSetupComplete = async () => {
    setIsSetupComplete(true);
    setIsFirstLaunch(false);

    // Initialize AdMob after setup completes
    try {
      await initializeAdMob();
      // Show ad after a short delay to let the UI settle
      setTimeout(async () => {
        await showInterstitialIfEligible();
      }, 2000);
    } catch (error) {
      console.warn('Failed to initialize AdMob after setup:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={theme.colors.primary}
            />
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}>
              {!isSetupComplete ? (
                <>
                  <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                    options={{headerShown: false}}
                  />
                  <Stack.Screen
                    name="ParentVerification"
                    component={ParentVerificationScreen}
                    options={{title: 'Parent Verification'}}
                  />
                  <Stack.Screen name="SetupPIN" options={{title: 'Set Up PIN'}}>
                    {props => (
                      <SetupPINScreen
                        {...props}
                        onSetupComplete={handleSetupComplete}
                      />
                    )}
                  </Stack.Screen>
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{title: 'Kids Guard'}}
                  />
                  <Stack.Screen
                    name="PINEntry"
                    component={PINEntryScreen}
                    options={{title: 'Enter PIN'}}
                  />
                  <Stack.Screen
                    name="ParentSettings"
                    component={ParentSettingsScreen}
                    options={{title: 'Parent Settings'}}
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
