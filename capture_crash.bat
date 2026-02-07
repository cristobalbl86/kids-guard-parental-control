@echo off
echo Clearing logcat buffer...
adb logcat -c

echo.
echo Starting logcat monitoring...
echo Please:
echo 1. Launch the app on your Android 11 device
echo 2. Navigate to the math question screen
echo 3. Click the TextInput
echo.
echo Press Ctrl+C after the crash to stop logging
echo.

adb logcat -v time com.kidsguard:V ReactNative:V ReactNativeJS:V AndroidRuntime:E *:S
