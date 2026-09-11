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

let contents = fs.readFileSync(target, 'utf8');
const original = contents;

contents = contents
  .replace(
    'import org.gradle.api.internal.classpath.ModuleRegistry\nimport org.gradle.api.tasks.testing.logging.TestExceptionFormat\nimport org.gradle.configurationcache.extensions.serviceOf\nimport org.jetbrains.kotlin.gradle.tasks.KotlinCompile',
    'import org.gradle.api.tasks.testing.logging.TestExceptionFormat\nimport org.jetbrains.kotlin.gradle.tasks.KotlinCompile',
  )
  .replace(
    '  testImplementation(libs.junit)\n\n  testRuntimeOnly(\n      files(\n          serviceOf<ModuleRegistry>()\n              .getModule("gradle-tooling-api-builders")\n              .classpath\n              .asFiles\n              .first()))\n}',
    '  testImplementation(libs.junit)\n}',
  )
  .replace('allWarningsAsErrors = true', 'allWarningsAsErrors = false');

if (contents === original) {
  process.exit(0);
}

fs.writeFileSync(target, contents);
console.log('[patch-rn-gradle-plugin] Patched @react-native/gradle-plugin build.gradle.kts');
