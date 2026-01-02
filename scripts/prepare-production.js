#!/usr/bin/env node

/**
 * Prepare Production Build Script
 *
 * This script prepares the app for production deployment by:
 * - Setting USE_TEST_ADS to false for production builds
 * - Can be extended to handle other environment-specific configs
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'src', 'config', 'admob.js');

console.log('🔧 Preparing production build...');

try {
  // Read the config file
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace USE_TEST_ADS: true with USE_TEST_ADS: false
  const updatedContent = configContent.replace(
    /USE_TEST_ADS:\s*true/,
    'USE_TEST_ADS: false'
  );

  // Check if replacement was made
  if (configContent === updatedContent) {
    console.log('⚠️  Warning: USE_TEST_ADS was already set to false or not found');
  } else {
    // Write back the modified content
    fs.writeFileSync(configPath, updatedContent, 'utf8');
    console.log('✅ Set USE_TEST_ADS to false for production');
  }

  console.log('✅ Production build preparation complete!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error preparing production build:', error.message);
  process.exit(1);
}
