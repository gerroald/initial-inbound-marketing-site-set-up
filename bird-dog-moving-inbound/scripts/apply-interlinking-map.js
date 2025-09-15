#!/usr/bin/env node

/**
 * Apply Interlinking Map Script
 * Updates internal links across all HTML files based on interlinking-map.json
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load interlinking map
const interlinkingMap = JSON.parse(
  fs.readFileSync('interlinking-map.json', 'utf8')
);

/**
 * Get links for a specific source file
 */
function getLinksForFile(sourceFile) {
  const pattern = interlinkingMap.patterns.find(p => p.from === sourceFile);
  return pattern ? pattern.to : [];
}

/**
 * Update links in HTML content
 */
function updateLinksInContent(content, sourceFile) {
  const links = getLinksForFile(sourceFile);
  
  if (links.length === 0) {
    return content;
  }
  
  let updatedContent = content;
  
  // Update navigation links
  links.forEach(link => {
    const { path: targetPath, anchor, relate } = link;
    
    // Skip relationship-based links for now (they need more complex logic)
    if (relate) {
      return;
    }
    
    // Create regex patterns for common link structures
    const patterns = [
      // Direct href matches
      new RegExp(`href=["']${targetPath}["']`, 'gi'),
      // Links with specific text content
      new RegExp(`<a[^>]*>\\s*${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</a>`, 'gi'),
      // Links with title attributes
      new RegExp(`<a[^>]*title=["']${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi')
    ];
    
    patterns.forEach(pattern => {
      updatedContent = updatedContent.replace(pattern, (match) => {
        // Preserve the existing link structure but update the href
        if (match.includes('href=')) {
          return match.replace(/href=["'][^"']*["']/, `href="${targetPath}"`);
        }
        return match;
      });
    });
  });
  
  return updatedContent;
}

/**
 * Add strategic links based on the interlinking map
 */
function addStrategicLinks(content, sourceFile) {
  const links = getLinksForFile(sourceFile);
  
  if (links.length === 0) {
    return content;
  }
  
  // Find strategic placement points in the content
  let updatedContent = content;
  
  // Add links to service area pages in relevant sections
  if (sourceFile.includes('service-area-') && !sourceFile.includes('service-areas.html')) {
    // This is a specific service area page
    const areaName = sourceFile.replace('service-area-', '').replace('.html', '');
    const capitalizedArea = areaName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Add links to related services
    const serviceLinks = `
      <div style="margin-top: var(--space-4); padding: var(--space-3); background: var(--color-surface-secondary); border-radius: var(--radius-base);">
        <h3 style="margin-top: 0;">Related Services in ${capitalizedArea}</h3>
        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
          <a href="service-residential.html" class="btn btn--ghost">Residential Moving</a>
          <a href="service-office.html" class="btn btn--ghost">Office Moving</a>
          <a href="service-delivery.html" class="btn btn--ghost">Local Delivery</a>
          <a href="quote.html" class="btn btn--primary">Get Quote</a>
        </div>
      </div>
    `;
    
    // Insert before footer
    updatedContent = updatedContent.replace(
      /<footer[^>]*>/i,
      serviceLinks + '\n  <footer role="contentinfo">'
    );
  }
  
  // Add links to service pages from service area hub
  if (sourceFile === 'service-areas.html') {
    // Add service links to each area card
    const serviceLinksHtml = `
      <div style="margin-top: var(--space-2); display: flex; gap: var(--space-1); flex-wrap: wrap;">
        <a href="service-residential.html" style="font-size: 0.85rem; padding: 0.25rem 0.5rem; background: var(--color-surface-secondary); border-radius: var(--radius-full); text-decoration: none; color: var(--color-text-secondary);">Residential</a>
        <a href="service-office.html" style="font-size: 0.85rem; padding: 0.25rem 0.5rem; background: var(--color-surface-secondary); border-radius: var(--radius-full); text-decoration: none; color: var(--color-text-secondary);">Office</a>
      </div>
    `;
    
    // Add to each area card
    updatedContent = updatedContent.replace(
      /(<div class="pill-list">[^<]*<\/div>)/g,
      `$1${serviceLinksHtml}`
    );
  }
  
  return updatedContent;
}

/**
 * Update breadcrumbs for better navigation
 */
function updateBreadcrumbs(content, sourceFile) {
  let updatedContent = content;
  
  // Define breadcrumb mappings
  const breadcrumbMappings = {
    'service-residential.html': [
      { name: 'Home', href: 'moving-inbound-marketing-home.html' },
      { name: 'Services', href: 'service-residential.html' },
      { name: 'Residential Moving', href: null }
    ],
    'service-office.html': [
      { name: 'Home', href: 'moving-inbound-marketing-home.html' },
      { name: 'Services', href: 'service-office.html' },
      { name: 'Office Moving', href: null }
    ],
    'service-delivery.html': [
      { name: 'Home', href: 'moving-inbound-marketing-home.html' },
      { name: 'Services', href: 'service-delivery.html' },
      { name: 'Delivery Services', href: null }
    ],
    'resource-hub.html': [
      { name: 'Home', href: 'moving-inbound-marketing-home.html' },
      { name: 'Resources', href: 'resource-hub.html' },
      { name: 'Resource Hub', href: null }
    ],
    'service-areas.html': [
      { name: 'Home', href: 'moving-inbound-marketing-home.html' },
      { name: 'Service Areas', href: 'service-areas.html' },
      { name: 'All Areas', href: null }
    ]
  };
  
  const breadcrumbs = breadcrumbMappings[sourceFile];
  if (!breadcrumbs) return updatedContent;
  
  const breadcrumbHtml = `
    <nav aria-label="Breadcrumb" style="margin-bottom: var(--space-3);">
      <ol style="display: flex; list-style: none; padding: 0; margin: 0; gap: var(--space-1); font-size: var(--font-size-sm); color: var(--color-text-muted);">
        ${breadcrumbs.map((crumb, index) => {
          if (index === breadcrumbs.length - 1) {
            return `<li style="color: var(--color-text-primary); font-weight: var(--font-weight-medium);">${crumb.name}</li>`;
          }
          return `<li><a href="${crumb.href}" style="color: var(--color-text-muted); text-decoration: none;">${crumb.name}</a> <span style="margin: 0 var(--space-1);">/</span></li>`;
        }).join('')}
      </ol>
    </nav>
  `;
  
  // Insert breadcrumbs after hero section or main content start
  const heroEndRegex = /<\/section>\s*(?=<section|<main)/i;
  const mainStartRegex = /<main[^>]*>/i;
  
  if (heroEndRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(heroEndRegex, `</section>\n  ${breadcrumbHtml}`);
  } else if (mainStartRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(mainStartRegex, `$& ${breadcrumbHtml}`);
  }
  
  return updatedContent;
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
  console.log(`Processing interlinking for: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Apply link updates
  let updatedContent = updateLinksInContent(content, filePath);
  
  // Add strategic links
  updatedContent = addStrategicLinks(updatedContent, filePath);
  
  // Update breadcrumbs
  updatedContent = updateBreadcrumbs(updatedContent, filePath);
  
  // Write back to file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log(`✅ Updated interlinking for: ${filePath}`);
}

/**
 * Validate that all target files exist
 */
function validateTargets() {
  const allTargets = new Set();
  
  interlinkingMap.patterns.forEach(pattern => {
    pattern.to.forEach(link => {
      if (link.path && !link.relate) {
        allTargets.add(link.path);
      }
    });
  });
  
  const missingFiles = [];
  allTargets.forEach(target => {
    if (!fs.existsSync(target)) {
      missingFiles.push(target);
    }
  });
  
  if (missingFiles.length > 0) {
    console.warn('⚠️  Missing target files:');
    missingFiles.forEach(file => console.warn(`   - ${file}`));
  }
  
  return missingFiles.length === 0;
}

/**
 * Main execution
 */
function main() {
  console.log('🔗 Applying interlinking map...');
  
  // Validate targets first
  if (!validateTargets()) {
    console.log('\n❌ Some target files are missing. Please create them first.');
    return;
  }
  
  const htmlFiles = glob.sync('*.html', { cwd: process.cwd() });
  
  if (htmlFiles.length === 0) {
    console.log('No HTML files found in current directory');
    return;
  }
  
  console.log(`Found ${htmlFiles.length} HTML files to process`);
  
  let processedCount = 0;
  htmlFiles.forEach(file => {
    try {
      processFile(file);
      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Interlinking applied to ${processedCount} files!`);
  console.log('\nNext steps:');
  console.log('1. Review the link changes');
  console.log('2. Test navigation between pages');
  console.log('3. Run link verification script');
}

if (require.main === module) {
  main();
}

module.exports = { updateLinksInContent, processFile, validateTargets };
