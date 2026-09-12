/*
 * Patches @react-native/gradle-plugin's build.gradle.kts for compatibility
 * with Gradle 8.11+ / AGP 8.9+ (required for compileSdk/targetSdk 36 support):
 *
 * 1. Removes its testRuntimeOnly wiring, which references the internal
 *    Gradle API `org.gradle.configurationcache.extensions.serviceOf`. That
 *    API was removed in Gradle 8.10+. The removed block only wires up the
 *    plugin's own unit tests, not app builds.
 * 2. Disables `allWarningsAsErrors` on its Kotlin compile task, which turns
 *    new deprecation warnings from the newer Kotlin/Gradle Kotlin DSL APIs
 *    into hard build failures.
 *
 * Re-applied via postinstall since npm install overwrites node_modules.
 *
 * If a future @react-native/gradle-plugin release reformats this file, our
 * exact-string replacements can silently fail to match, which would leave
 * the plugin unpatched while npm install still reports success - the build
 * would only fail much later, inside Android Gradle. To avoid that, we
 * verify the file is actually in a known-good state (unpatched-and-fixed,
 * or already-patched) before exiting 0, and hard-fail postinstall otherwise.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'build.gradle.kts',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const isFixed = (text) =>
  !text.includes('serviceOf') && !text.includes('allWarningsAsErrors = true');

const original = fs.readFileSync(target, 'utf8');

if (isFixed(original)) {
  // Already patched (or a newer plugin release that doesn't need this fix).
  process.exit(0);
}

const patched = original
  .replace(
    'import org.gradle.api.internal.classpath.ModuleRegistry\nimport org.gradle.api.tasks.testing.logging.TestExceptionFormat\nimport org.gradle.configurationcache.extensions.serviceOf\nimport org.jetbrains.kotlin.gradle.tasks.KotlinCompile',
    'import org.gradle.api.tasks.testing.logging.TestExceptionFormat\nimport org.jetbrains.kotlin.gradle.tasks.KotlinCompile',
  )
  .replace(
    '  testImplementation(libs.junit)\n\n  testRuntimeOnly(\n      files(\n          serviceOf<ModuleRegistry>()\n              .getModule("gradle-tooling-api-builders")\n              .classpath\n              .asFiles\n              .first()))\n}',
    '  testImplementation(libs.junit)\n}',
  )
  .replace('allWarningsAsErrors = true', 'allWarningsAsErrors = false');

if (!isFixed(patched)) {
  console.error(
    '[patch-rn-gradle-plugin] Failed to patch @react-native/gradle-plugin build.gradle.kts: ' +
      'expected content not found (the plugin may have changed format). ' +
      'This must be fixed before building for Android, or the Gradle build will fail under Gradle 8.10+. ' +
      'See scripts/patch-rn-gradle-plugin.js.',
  );
  process.exit(1);
}

fs.writeFileSync(target, patched);
console.log('[patch-rn-gradle-plugin] Patched @react-native/gradle-plugin build.gradle.kts');
