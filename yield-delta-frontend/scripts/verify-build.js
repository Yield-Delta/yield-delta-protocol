#!/usr/bin/env node

/**
 * Build verification script to check for common syntax issues
 * This script verifies that the build output doesn't contain problematic patterns
 */

const fs = require('fs');
const path = require('path');

function findJSFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'node_modules') {
      files.push(...findJSFiles(fullPath));
    } else if (stat.isFile() && item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

function verifyBuild() {
  console.log('🔍 Verifying build for concatenation issues...');
  
  const searchDirs = ['.next'].filter(dir => fs.existsSync(dir));
  let totalFiles = 0;
  let issuesFound = 0;
  const problematicPatterns = [
    /[A-Z_]+globalThis\./g,
    /[a-zA-Z0-9_$]+globalThis/g,
    /MAX_BF_CACHEglobalThis/g
  ];
  
  for (const dir of searchDirs) {
    const files = findJSFiles(dir);
    totalFiles += files.length;
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        for (const pattern of problematicPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            console.log(`⚠️  Found issue in ${path.relative(process.cwd(), file)}: ${matches[0]}`);
            issuesFound++;
          }
        }
      } catch (error) {
        console.warn(`Could not verify ${file}: ${error.message}`);
      }
    }
  }
  
  if (issuesFound === 0) {
    console.log(`✅ Build verification passed! Checked ${totalFiles} files.`);
    return true;
  } else {
    console.log(`❌ Build verification failed! Found ${issuesFound} potential issues.`);
    return false;
  }
}

// Run if this script is executed directly
if (require.main === module) {
  const success = verifyBuild();
  process.exit(success ? 0 : 1);
}

module.exports = { verifyBuild };