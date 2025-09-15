#!/usr/bin/env node

/**
 * Link Verification Script
 * Checks internal links for broken references and validates interlinking
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load interlinking map
let interlinkingMap = null;
try {
  interlinkingMap = JSON.parse(fs.readFileSync('interlinking-map.json', 'utf8'));
} catch (error) {
  console.warn('Could not load interlinking-map.json');
}

/**
 * Extract all links from HTML content
 */
function extractLinks(content, sourceFile) {
  const links = [];
  
  // Find all anchor tags with href attributes
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[1];
    const text = match[2].trim();
    
    // Skip external links
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }
    
    // Skip anchor links
    if (href.startsWith('#')) {
      continue;
    }
    
    links.push({
      source: sourceFile,
      href: href,
      text: text,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return links;
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Validate links against interlinking map
 */
function validateAgainstMap(links, sourceFile) {
  if (!interlinkingMap) return [];
  
  const issues = [];
  const expectedLinks = interlinkingMap.patterns.find(p => p.from === sourceFile);
  
  if (!expectedLinks) {
    return issues;
  }
  
  const expectedPaths = expectedLinks.to.map(link => link.path).filter(Boolean);
  const actualPaths = links.map(link => link.href);
  
  // Check for missing expected links
  expectedPaths.forEach(expectedPath => {
    if (!actualPaths.includes(expectedPath)) {
      issues.push({
        type: 'missing_expected_link',
        source: sourceFile,
        expected: expectedPath,
        message: `Missing expected link to ${expectedPath}`
      });
    }
  });
  
  // Check for unexpected links (optional - can be commented out for flexibility)
  // actualPaths.forEach(actualPath => {
  //   if (!expectedPaths.includes(actualPath)) {
  //     issues.push({
  //       type: 'unexpected_link',
  //       source: sourceFile,
  //       actual: actualPath,
  //       message: `Unexpected link to ${actualPath}`
  //     });
  //   }
  // });
  
  return issues;
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const links = extractLinks(content, filePath);
  
  const brokenLinks = [];
  const validationIssues = [];
  
  // Check for broken links
  links.forEach(link => {
    if (!fileExists(link.href)) {
      brokenLinks.push({
        source: filePath,
        href: link.href,
        text: link.text,
        line: link.line,
        message: `Broken link to ${link.href}`
      });
    }
  });
  
  // Validate against interlinking map
  const mapIssues = validateAgainstMap(links, filePath);
  validationIssues.push(...mapIssues);
  
  return {
    file: filePath,
    links: links,
    broken: brokenLinks,
    validation: validationIssues,
    total: brokenLinks.length + validationIssues.length
  };
}

/**
 * Generate a detailed report
 */
function generateReport(results) {
  const totalIssues = results.reduce((sum, result) => sum + result.total, 0);
  const filesWithIssues = results.filter(result => result.total > 0);
  const totalLinks = results.reduce((sum, result) => sum + result.links.length, 0);
  
  console.log('\n🔗 Link Verification Report');
  console.log('===========================\n');
  
  console.log(`📊 Overview:`);
  console.log(`  Total files analyzed: ${results.length}`);
  console.log(`  Total links found: ${totalLinks}`);
  console.log(`  Files with issues: ${filesWithIssues.length}`);
  console.log(`  Total issues: ${totalIssues}\n`);
  
  if (totalIssues === 0) {
    console.log('✅ All internal links are working correctly!');
    return;
  }
  
  // Group issues by type
  const brokenLinks = results.flatMap(result => result.broken);
  const validationIssues = results.flatMap(result => result.validation);
  
  if (brokenLinks.length > 0) {
    console.log('🔴 Broken Links:');
    brokenLinks.forEach(issue => {
      console.log(`  ${issue.source}:${issue.line}`);
      console.log(`    ${issue.message}`);
      console.log(`    Link text: "${issue.text}"`);
      console.log(`    Target: ${issue.href}\n`);
    });
  }
  
  if (validationIssues.length > 0) {
    console.log('🟡 Interlinking Validation Issues:');
    validationIssues.forEach(issue => {
      console.log(`  ${issue.source}`);
      console.log(`    ${issue.message}\n`);
    });
  }
  
  // Summary by file
  console.log('📄 Issues by File:');
  filesWithIssues.forEach(result => {
    console.log(`  ${result.file}: ${result.total} issues`);
    if (result.broken.length > 0) {
      console.log(`    - ${result.broken.length} broken links`);
    }
    if (result.validation.length > 0) {
      console.log(`    - ${result.validation.length} validation issues`);
    }
  });
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  if (brokenLinks.length > 0) {
    console.log('  • Fix broken links by creating missing files or updating paths');
    console.log('  • Check file naming conventions and case sensitivity');
  }
  if (validationIssues.length > 0) {
    console.log('  • Review interlinking-map.json for expected link patterns');
    console.log('  • Add missing expected links or update the interlinking map');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('  1. Fix broken links');
  console.log('  2. Review and update interlinking strategy if needed');
  console.log('  3. Re-run this script to verify fixes');
}

/**
 * Generate a link map for documentation
 */
function generateLinkMap(results) {
  const linkMap = {};
  
  results.forEach(result => {
    linkMap[result.file] = result.links.map(link => ({
      href: link.href,
      text: link.text,
      exists: fileExists(link.href)
    }));
  });
  
  console.log('\n🗺️  Link Map (for documentation):');
  console.log(JSON.stringify(linkMap, null, 2));
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Checking internal links...');
  
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
      return { file, links: [], broken: [], validation: [], total: 0 };
    }
  });
  
  generateReport(results);
  
  // Generate link map if requested
  if (process.argv.includes('--map')) {
    generateLinkMap(results);
  }
  
  // Exit with error code if issues found
  const totalIssues = results.reduce((sum, result) => sum + result.total, 0);
  if (totalIssues > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { extractLinks, analyzeFile, validateAgainstMap };
