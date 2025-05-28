/**
 * Script for fixing import paths in tests
 *
 * This script fixes import paths in tests to match
 * the actual project structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function for recursive directory traversal
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.test.js')) {
      callback(path.join(dir, f));
    }
  });
}

// Function for fixing import paths in tests
function fixImports(filePath) {
  console.log(`Fixing imports in file: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix path to DataFrame
    content = content.replace(
      /import\s+{\s*DataFrame\s*}\s+from\s+['"](.*)\/core\/DataFrame\.js['"]/g,
      'import { DataFrame } from \'$1/core/dataframe/DataFrame.js\'',
    );

    // Fix path to Series
    content = content.replace(
      /import\s+{\s*Series\s*}\s+from\s+['"](.*)\/core\/Series\.js['"]/g,
      'import { Series } from \'$1/core/dataframe/Series.js\'',
    );

    // Fix import from chai to vitest
    content = content.replace(
      /import\s+{\s*expect\s*}\s+from\s+['"]chai['"]/g,
      'import { expect } from \'vitest\'',
    );

    // Fix issue with duplicate df variable
    const dfRegex =
      /const\s+df\s*=\s*createDataFrameWithStorage\(DataFrame,\s*testData,\s*storageType\);/g;
    const matches = content.match(dfRegex);

    if (matches && matches.length > 0) {
      // If df is already created with testWithBothStorageTypes, remove other df declarations
      const dfCreationRegex = /const\s+df\s*=\s*DataFrame\.create\([^)]+\);/g;
      content = content.replace(
        dfCreationRegex,
        '// df created above using createDataFrameWithStorage',
      );
    }

    // Write updated file content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Imports successfully fixed: ${filePath}`);
  } catch (error) {
    console.error(`  Error fixing imports in file ${filePath}:`, error);
  }
}

// Function to start fixing imports
async function main() {
  // Fix imports in the test/methods directory
  const testDir = path.join(__dirname, 'test', 'methods');
  walkDir(testDir, fixImports);

  console.log('Import fixing completed!');
}

// Run the script
main().catch((error) => {
  console.error('Error fixing imports:', error);
  process.exit(1);
});
