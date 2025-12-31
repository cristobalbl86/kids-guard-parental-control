package com.kidsguard

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "kids-guard-parental-control"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Force layout refresh when resuming from background to fix blank screen issue.
   * This is needed because when Android recreates the JS context after being in background,
   * the native view hierarchy may not properly render until user interaction.
   */
  override fun onResume() {
    super.onResume()

    // Schedule multiple layout refreshes to ensure the view is properly rendered
    val decorView = window.decorView
    val handler = Handler(Looper.getMainLooper())

    // Immediate refresh
    decorView.post {
      decorView.requestLayout()
      decorView.invalidate()
    }

    // Delayed refresh to catch any late rendering issues
    handler.postDelayed({
      decorView.requestLayout()
      decorView.invalidate()
    }, 100)

    handler.postDelayed({
      decorView.requestLayout()
      decorView.invalidate()
    }, 300)
  }
}
