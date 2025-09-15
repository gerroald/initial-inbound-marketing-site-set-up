#!/usr/bin/env node

/**
 * Design Token Verification Script
 * Checks for hardcoded values and validates token usage
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Patterns to detect hardcoded values
const HARDCODED_PATTERNS = [
  // Hex colors
  /#[0-9a-fA-F]{3,6}(?![a-fA-F0-9])/g,
  // RGB/RGBA colors
  /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+)?\s*\)/g,
  // HSL colors
  /hsla?\(\s*\d+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+)?\s*\)/g,
  // Common hardcoded spacing values
  /(?<!\w)(?:0\.25rem|0\.375rem|0\.5rem|0\.75rem|1rem|1\.25rem|1\.5rem|2rem|3rem|4rem)(?!\w)/g,
  // Hardcoded font sizes
  /(?<!\w)(?:0\.75rem|0\.875rem|1rem|1\.125rem|1\.25rem|1\.5rem|1\.875rem|2\.25rem|3rem)(?!\w)/g,
  // Hardcoded border radius
  /(?<!\w)(?:0\.25rem|0\.5rem|0\.75rem|1rem|1\.5rem)(?!\w)/g,
  // Hardcoded box shadows
  /box-shadow:\s*[^;]*rgba?\([^)]*\)[^;]*;/g,
  // Hardcoded z-index
  /z-index:\s*\d+/g
];

// Allowed exceptions (common values that don't need tokens)
const ALLOWED_EXCEPTIONS = [
  '0px', '0rem', '0', '1px', '2px', '3px', '4px', '8px',
  '100%', '50%', 'auto', 'none', 'transparent', 'inherit',
  'currentColor', 'initial', 'unset'
];

/**
 * Check for hardcoded values in content
 */
function findHardcodedValues(content, filePath) {
  const issues = [];
  
  HARDCODED_PATTERNS.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Check if it's an allowed exception
        const isException = ALLOWED_EXCEPTIONS.some(exception => 
          match.includes(exception)
        );
        
        if (!isException) {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          issues.push({
            type: 'hardcoded_value',
            file: filePath,
            line: lineNumber,
            value: match.trim(),
            pattern: index
          });
        }
      });
    }
  });
  
  return issues;
}

/**
 * Check for unused token references
 */
function findUnusedTokens(content, filePath) {
  const issues = [];
  
  // Find all var(--token-name) references
  const tokenMatches = content.match(/var\(--[^)]+\)/g);
  if (!tokenMatches) return issues;
  
  // Read the tokens.css file to get all available tokens
  let availableTokens = [];
  try {
    const tokensContent = fs.readFileSync('src/design-system/tokens/tokens.css', 'utf8');
    const tokenMatches = tokensContent.match(/--[^:]+:/g);
    if (tokenMatches) {
      availableTokens = tokenMatches.map(match => match.replace(/[:\s]/g, ''));
    }
  } catch (error) {
    console.warn('Could not read tokens.css file');
  }
  
  // Check if used tokens exist
  const usedTokens = [...new Set(tokenMatches.map(match => match.replace(/var\(--|\)/g, '')))];
  
  usedTokens.forEach(token => {
    if (!availableTokens.includes(token)) {
      const lineNumber = content.substring(0, content.indexOf(`var(--${token})`)).split('\n').length;
      issues.push({
        type: 'undefined_token',
        file: filePath,
        line: lineNumber,
        token: token
      });
    }
  });
  
  return issues;
}

/**
 * Check for legacy token usage that should be updated
 */
function findLegacyTokens(content, filePath) {
  const issues = [];
  
  // Legacy token patterns that should be updated
  const legacyPatterns = [
    { pattern: /--color-brand(?!-)/g, replacement: '--color-brand-primary', message: 'Use semantic brand color tokens' },
    { pattern: /--color-accent(?!-)/g, replacement: '--color-brand-secondary', message: 'Use semantic brand color tokens' },
    { pattern: /--color-surface-alt/g, replacement: '--color-surface-secondary', message: 'Use semantic surface color tokens' },
    { pattern: /--fs-(?!hero|h2)/g, replacement: '--font-size-', message: 'Use semantic font size tokens' },
    { pattern: /--lh-(?!tight|body)/g, replacement: '--line-height-', message: 'Use semantic line height tokens' },
    { pattern: /--space-[1-7]/g, replacement: '--space-', message: 'Use semantic spacing tokens' },
    { pattern: /--radius-[1-3]/g, replacement: '--radius-', message: 'Use semantic radius tokens' },
    { pattern: /--shadow-[1-4]/g, replacement: '--shadow-', message: 'Use semantic shadow tokens' }
  ];
  
  legacyPatterns.forEach(({ pattern, replacement, message }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
        issues.push({
          type: 'legacy_token',
          file: filePath,
          line: lineNumber,
          value: match,
          suggestion: match.replace(pattern, replacement),
          message: message
        });
      });
    }
  });
  
  return issues;
}

/**
 * Process a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const hardcodedIssues = findHardcodedValues(content, filePath);
  const unusedTokenIssues = findUnusedTokens(content, filePath);
  const legacyTokenIssues = findLegacyTokens(content, filePath);
  
  return {
    file: filePath,
    hardcoded: hardcodedIssues,
    unused: unusedTokenIssues,
    legacy: legacyTokenIssues,
    total: hardcodedIssues.length + unusedTokenIssues.length + legacyTokenIssues.length
  };
}

/**
 * Generate a detailed report
 */
function generateReport(results) {
  const totalIssues = results.reduce((sum, result) => sum + result.total, 0);
  const filesWithIssues = results.filter(result => result.total > 0);
  
  console.log('\n📊 Design Token Verification Report');
  console.log('=====================================\n');
  
  if (totalIssues === 0) {
    console.log('✅ All files are using design tokens correctly!');
    return;
  }
  
  console.log(`Found ${totalIssues} issues across ${filesWithIssues.length} files:\n`);
  
  filesWithIssues.forEach(result => {
    console.log(`📄 ${result.file} (${result.total} issues)`);
    
    if (result.hardcoded.length > 0) {
      console.log('  🔴 Hardcoded Values:');
      result.hardcoded.forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.value}`);
      });
    }
    
    if (result.unused.length > 0) {
      console.log('  🟡 Undefined Tokens:');
      result.unused.forEach(issue => {
        console.log(`    Line ${issue.line}: var(--${issue.token})`);
      });
    }
    
    if (result.legacy.length > 0) {
      console.log('  🟠 Legacy Tokens:');
      result.legacy.forEach(issue => {
        console.log(`    Line ${issue.line}: ${issue.value} → ${issue.suggestion}`);
        console.log(`    ${issue.message}`);
      });
    }
    
    console.log('');
  });
  
  // Summary
  const hardcodedCount = results.reduce((sum, result) => sum + result.hardcoded.length, 0);
  const unusedCount = results.reduce((sum, result) => sum + result.unused.length, 0);
  const legacyCount = results.reduce((sum, result) => sum + result.legacy.length, 0);
  
  console.log('📈 Summary:');
  console.log(`  🔴 Hardcoded values: ${hardcodedCount}`);
  console.log(`  🟡 Undefined tokens: ${unusedCount}`);
  console.log(`  🟠 Legacy tokens: ${legacyCount}`);
  console.log(`  📁 Files with issues: ${filesWithIssues.length}`);
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (hardcodedCount > 0) {
    console.log('  • Replace hardcoded values with design tokens');
    console.log('  • Run the apply-tokens.js script to automate replacements');
  }
  if (unusedCount > 0) {
    console.log('  • Check token names in tokens.css file');
    console.log('  • Update token references to match available tokens');
  }
  if (legacyCount > 0) {
    console.log('  • Update legacy token references to semantic tokens');
    console.log('  • Use the new token naming convention');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Verifying design token usage...');
  
  const htmlFiles = glob.sync('*.html', { cwd: process.cwd() });
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found in current directory');
    return;
  }
  
  console.log(`Analyzing ${htmlFiles.length} HTML files...`);
  
  const results = htmlFiles.map(file => {
    try {
      return analyzeFile(file);
    } catch (error) {
      console.error(`❌ Error analyzing ${file}:`, error.message);
      return { file, hardcoded: [], unused: [], legacy: [], total: 0 };
    }
  });
  
  generateReport(results);
  
  // Exit with error code if issues found
  const totalIssues = results.reduce((sum, result) => sum + result.total, 0);
  if (totalIssues > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeFile, findHardcodedValues, findUnusedTokens };
