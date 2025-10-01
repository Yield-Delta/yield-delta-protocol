#!/usr/bin/env node

/**
 * Post-build script to fix concatenation issues in Cloudflare deployment
 * This script runs after the Next.js build and fixes any remaining syntax issues
 * that might occur during the Cloudflare Pages build process.
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

async function fixConcatenationIssues() {
  console.log('🔧 Starting concatenation fix for Cloudflare deployment...');
  
  try {
    // Find all JS files in the build output directories
    const searchDirs = [
      '.next',
      '.vercel/output',
      'out'
    ].filter(dir => fs.existsSync(dir));
    
    let totalFiles = 0;
    let fixedFiles = 0;
    
    for (const dir of searchDirs) {
      const files = findJSFiles(dir);
      console.log(`📁 Found ${files.length} JS files in ${dir}/`);
      totalFiles += files.length;
        
      for (const file of files) {
        try {
          let content = fs.readFileSync(file, 'utf8');
          const originalContent = content;
          
          // Apply all the concatenation fixes
          content = content.replace(/MAX_BF_CACHEglobalThis/g, 'MAX_BF_CACHE; globalThis');
          content = content.replace(/([A-Z_]{3,})globalThis\./g, '$1; globalThis.');
          content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)globalThis\./g, '$1; globalThis.');
          content = content.replace(/([a-zA-Z0-9_$]+)globalThis/g, '$1; globalThis');
          
          // Additional patterns that might cause issues
          content = content.replace(/(\w+)\.globalThis/g, '$1.globalThis');
          content = content.replace(/globalThis\.globalThis/g, 'globalThis');
          
          if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✅ Fixed: ${path.relative(process.cwd(), file)}`);
            fixedFiles++;
          }
        } catch (error) {
          console.warn(`⚠️  Could not process ${file}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n🎉 Concatenation fix complete!`);
    console.log(`📊 Processed ${totalFiles} files, fixed ${fixedFiles} files`);
    
  } catch (error) {
    console.error('❌ Error fixing concatenation issues:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  fixConcatenationIssues();
}

module.exports = { fixConcatenationIssues };