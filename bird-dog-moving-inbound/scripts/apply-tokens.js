#!/usr/bin/env node

/**
 * Apply Design Tokens Migration Script
 * Replaces hardcoded values with centralized token references
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Color mapping from old values to new token references
const COLOR_MAPPINGS = {
  '#16324F': 'var(--color-brand-primary)',
  '#FF7A00': 'var(--color-brand-secondary)', 
  '#32C671': 'var(--color-brand-accent)',
  '#005F5F': 'var(--color-brand-teal-primary)',
  '#008080': 'var(--color-brand-teal-secondary)',
  '#4A9B9B': 'var(--color-brand-teal-light)',
  '#FFFFFF': 'var(--color-surface-primary)',
  '#F6F8FB': 'var(--color-surface-secondary)',
  '#FAFAFA': 'var(--color-surface-secondary)',
  '#0F172A': 'var(--color-text-primary)',
  '#475569': 'var(--color-text-muted)',
  '#E2E8F0': 'var(--color-border-primary)',
  '#E5E5E5': 'var(--color-border-primary)',
  '#cbd5e1': 'var(--color-text-muted)',
  '#F59E0B': 'var(--color-state-warning)',
  '#dbeafe': 'var(--color-surface-tertiary)',
  '#F8FAFF': 'var(--color-surface-tertiary)'
};

// Spacing mappings
const SPACING_MAPPINGS = {
  '0.375rem': 'var(--space-sm)',
  '0.75rem': 'var(--space-lg)', 
  '1rem': 'var(--space-xl)',
  '1.5rem': 'var(--space-2xl)',
  '2rem': 'var(--space-3xl)',
  '3rem': 'var(--space-4xl)',
  '4rem': 'var(--space-5xl)'
};

// Font size mappings
const FONT_SIZE_MAPPINGS = {
  'clamp(2rem, 2.5vw + 1.2rem, 3rem)': 'var(--font-size-hero)',
  'clamp(1.375rem, 1.5vw + 1rem, 2rem)': 'var(--font-size-h2)',
  '1rem': 'var(--font-size-base)',
  '0.9rem': 'var(--font-size-sm)',
  '1.1rem': 'var(--font-size-lg)',
  '1.2rem': 'var(--font-size-xl)'
};

// Shadow mappings
const SHADOW_MAPPINGS = {
  '0 1px 2px rgba(0,0,0,.06)': 'var(--shadow-sm)',
  '0 6px 16px rgba(0,0,0,.10)': 'var(--shadow-base)',
  '0 4px 8px rgba(0,0,0,.08)': 'var(--shadow-base)',
  '0 8px 16px rgba(0,0,0,.12)': 'var(--shadow-md)',
  '0 16px 32px rgba(0,0,0,.16)': 'var(--shadow-lg)'
};

// Border radius mappings
const RADIUS_MAPPINGS = {
  '0.5rem': 'var(--radius-base)',
  '0.75rem': 'var(--radius-md)',
  '1rem': 'var(--radius-lg)',
  '0.4rem': 'var(--radius-base)',
  '0.6rem': 'var(--radius-base)',
  '999px': 'var(--radius-full)',
  '9999px': 'var(--radius-full)'
};

// Line height mappings
const LINE_HEIGHT_MAPPINGS = {
  '1.15': 'var(--line-height-tight)',
  '1.6': 'var(--line-height-relaxed)',
  '1.5': 'var(--line-height-normal)'
};

// Font weight mappings
const FONT_WEIGHT_MAPPINGS = {
  '400': 'var(--font-weight-normal)',
  '500': 'var(--font-weight-medium)',
  '600': 'var(--font-weight-semibold)',
  '700': 'var(--font-weight-bold)'
};

// Letter spacing mappings
const LETTER_SPACING_MAPPINGS = {
  '0.06em': 'var(--letter-spacing-widest)'
};

// Max width mappings
const MAX_WIDTH_MAPPINGS = {
  '1200px': 'var(--max-width-wrap)'
};

// Z-index mappings
const Z_INDEX_MAPPINGS = {
  '50': 'var(--z-sticky)',
  '1000': 'var(--z-skipLink)'
};

// Transition mappings
const TRANSITION_MAPPINGS = {
  '0.15s': 'var(--transition-duration-fast)',
  '0.25s': 'var(--transition-duration-base)',
  '0.4s': 'var(--transition-duration-slow)',
  '0.3s': 'var(--transition-duration-base)'
};

// Font family mappings
const FONT_FAMILY_MAPPINGS = {
  'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif': 'var(--font-family-sans)'
};

/**
 * Apply token replacements to CSS content
 */
function applyTokenReplacements(content) {
  let updatedContent = content;
  
  // Apply all mappings
  const allMappings = [
    COLOR_MAPPINGS,
    SPACING_MAPPINGS, 
    FONT_SIZE_MAPPINGS,
    SHADOW_MAPPINGS,
    RADIUS_MAPPINGS,
    LINE_HEIGHT_MAPPINGS,
    FONT_WEIGHT_MAPPINGS,
    LETTER_SPACING_MAPPINGS,
    MAX_WIDTH_MAPPINGS,
    Z_INDEX_MAPPINGS,
    TRANSITION_MAPPINGS,
    FONT_FAMILY_MAPPINGS
  ];
  
  allMappings.forEach(mapping => {
    Object.entries(mapping).forEach(([oldValue, newValue]) => {
      // Escape special regex characters
      const escapedOldValue = oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOldValue, 'g');
      updatedContent = updatedContent.replace(regex, newValue);
    });
  });
  
  return updatedContent;
}

/**
 * Add token import to HTML file if not present
 */
function addTokenImport(content) {
  // Check if tokens.css is already imported
  if (content.includes('tokens.css')) {
    return content;
  }
  
  // Find the first <style> tag and add import before it
  const styleTagRegex = /<style>/i;
  const match = content.match(styleTagRegex);
  
  if (match) {
    const tokenImport = '  <link rel="stylesheet" href="src/design-system/tokens/tokens.css">\n';
    return content.replace(styleTagRegex, tokenImport + '  <style>');
  }
  
  return content;
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Apply token replacements
  let updatedContent = applyTokenReplacements(content);
  
  // Add token import if needed
  updatedContent = addTokenImport(updatedContent);
  
  // Write back to file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log(`✅ Updated: ${filePath}`);
}

/**
 * Main execution
 */
function main() {
  const htmlFiles = glob.sync('*.html', { cwd: process.cwd() });
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found in current directory');
    return;
  }
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  htmlFiles.forEach(file => {
    try {
      processFile(file);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });
  
  console.log('\n🎉 Token migration completed!');
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Test the pages to ensure visual parity');
  console.log('3. Run the interlinking script');
}

if (require.main === module) {
  main();
}

module.exports = { applyTokenReplacements, processFile };
