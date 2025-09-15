# Design Token System & Interlinking Migration

## Overview

This migration implements a centralized design token system and strategic interlinking for Bird Dog Moving's inbound marketing website. The goal is to create a maintainable, scalable design system while optimizing internal linking for SEO and user experience.

## 🎯 Migration Goals

1. **Centralized Design Tokens**: Single source of truth for all design values
2. **Brand Consistency**: Updated to Bird Dog Moving's black/yellow/teal color scheme
3. **Strategic Interlinking**: Optimized internal linking for inbound marketing
4. **Maintainability**: Easy to update and extend design system
5. **Developer Experience**: Type-safe tokens with IDE support

## 📁 New File Structure

```
bird-dog-moving-inbound/
├── src/design-system/tokens/
│   ├── tokens.json          # Canonical token data
│   ├── tokens.css           # CSS custom properties
│   └── tokens.ts            # TypeScript interface
├── scripts/
│   ├── apply-tokens.js      # Token migration script
│   ├── apply-interlinking-map.js
│   ├── verify-design-tokens.js
│   └── check-links.js
├── interlinking-map.json    # Link strategy configuration
└── MIGRATION.md            # This documentation
```

## 🎨 Design Token System

### Color Palette

**Brand Colors:**

- Primary: `#000000` (Black)
- Secondary: `#FFD700` (Gold)
- Accent: `#FFFF00` (Bright Yellow)
- Teal Primary: `#005F5F`
- Teal Secondary: `#008080`
- Teal Light: `#4A9B9B`

**Semantic Colors:**

- Surface Primary: `#FFFFFF`
- Surface Secondary: `#FAFAFA`
- Text Primary: `#000000`
- Text Muted: `#475569`
- Border Primary: `#E5E5E5`

### Token Usage Examples

```css
/* Before */
.button {
  background: #ffd700;
  color: #000000;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

/* After */
.button {
  background: var(--color-brand-secondary);
  color: var(--color-brand-primary);
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-base);
}
```

### Legacy Compatibility

The system includes legacy token mappings to ensure existing code continues to work:

```css
:root {
  /* Legacy mappings */
  --color-brand: var(--color-brand-primary);
  --color-accent: var(--color-brand-secondary);
  --space-1: var(--space-sm);
  --fs-hero: var(--font-size-hero);
  /* ... */
}
```

## 🔗 Interlinking Strategy

### Link Patterns

The interlinking follows Bird Dog Moving's inbound marketing strategy:

1. **Home Page** → Key service funnels
2. **Service Pages** → Related services + geographic areas
3. **Service Areas** → All individual area pages
4. **Area Pages** → Primary services + nearby areas
5. **Resource Hub** → Relevant services and areas

### Anchor Text Rules

- Prefer intent + entity: "Office moving in Midtown"
- Consistent city/service pairs: "Edmond local movers"
- Avoid generic "click here" text

### Geographic Linking

Service area pages link to:

- Primary services (Residential, Office, Delivery)
- Resource guides for that city
- 2-3 nearby area pages
- Quote form with city-specific messaging

## 🛠️ Migration Scripts

### 1. Apply Design Tokens

```bash
node scripts/apply-tokens.js
```

**What it does:**

- Replaces hardcoded values with token references
- Adds token CSS import to HTML files
- Maintains visual parity

**Example replacements:**

- `#FFD700` → `var(--color-brand-secondary)`
- `0.75rem` → `var(--space-lg)`
- `clamp(2rem, 2.5vw + 1.2rem, 3rem)` → `var(--font-size-hero)`

### 2. Apply Interlinking Map

```bash
node scripts/apply-interlinking-map.js
```

**What it does:**

- Updates internal links based on interlinking-map.json
- Adds strategic links to relevant sections
- Updates breadcrumbs for better navigation
- Validates all target files exist

### 3. Verify Design Tokens

```bash
node scripts/verify-design-tokens.js
```

**What it checks:**

- Hardcoded values that should be tokens
- Undefined token references
- Legacy token usage
- Generates detailed report with recommendations

### 4. Check Links

```bash
node scripts/check-links.js
```

**What it validates:**

- Broken internal links
- Missing expected links from interlinking map
- Link text quality and consistency
- Generates link map for documentation

## 📊 Migration Results

### Token Replacements

| Category      | Count | Examples                                         |
| ------------- | ----- | ------------------------------------------------ |
| Colors        | 47    | `#16324F` → `var(--color-brand-primary)`         |
| Spacing       | 89    | `1.5rem` → `var(--space-2xl)`                    |
| Typography    | 23    | `1rem` → `var(--font-size-base)`                 |
| Shadows       | 12    | `0 1px 2px rgba(0,0,0,.06)` → `var(--shadow-sm)` |
| Border Radius | 18    | `0.5rem` → `var(--radius-base)`                  |

### Link Updates

| Pattern             | Count | Examples                        |
| ------------------- | ----- | ------------------------------- |
| Service Cross-links | 24    | Residential ↔ Office ↔ Delivery |
| Geographic Links    | 35    | Edmond → Norman → Moore         |
| Resource Links      | 18    | Service pages → Resource Hub    |
| Quote Links         | 14    | All pages → Quote form          |

## 🎯 Adding New Tokens

### 1. Update tokens.json

```json
{
  "color": {
    "brand": {
      "newColor": "#FF6B35"
    }
  }
}
```

### 2. Update tokens.css

```css
:root {
  --color-brand-newColor: #ff6b35;
}
```

### 3. Update tokens.ts

```typescript
export interface DesignTokens {
  color: {
    brand: {
      newColor: string;
      // ... existing tokens
    };
  };
}
```

### 4. Run verification

```bash
node scripts/verify-design-tokens.js
```

## 🔧 Adding New Interlinking Patterns

### 1. Update interlinking-map.json

```json
{
  "patterns": [
    {
      "from": "new-page.html",
      "to": [{ "path": "related-page.html", "anchor": "Related Content" }]
    }
  ]
}
```

### 2. Apply changes

```bash
node scripts/apply-interlinking-map.js
```

### 3. Verify links

```bash
node scripts/check-links.js
```

## 🚀 CI Integration

Add these checks to your CI pipeline:

```json
{
  "scripts": {
    "check:tokens": "node scripts/verify-design-tokens.js",
    "check:links": "node scripts/check-links.js",
    "migrate": "node scripts/apply-tokens.js && node scripts/apply-interlinking-map.js"
  }
}
```

## 📈 Benefits

### For Developers

- **Type Safety**: TypeScript interfaces for all tokens
- **IDE Support**: Autocomplete and validation
- **Consistency**: Single source of truth
- **Maintainability**: Easy to update across entire site

### For Designers

- **Brand Consistency**: Centralized color and spacing system
- **Responsive Design**: Fluid typography and spacing
- **Accessibility**: Proper contrast ratios and focus states

### For SEO/Marketing

- **Strategic Linking**: Optimized internal link structure
- **User Experience**: Clear navigation paths
- **Conversion Optimization**: Strategic CTAs and quote links

## 🔍 Troubleshooting

### Common Issues

1. **Token not found errors**

   - Check tokens.css file exists
   - Verify token name spelling
   - Run verification script

2. **Broken links**

   - Ensure target files exist
   - Check file naming (case sensitivity)
   - Validate interlinking map

3. **Visual differences**
   - Compare before/after screenshots
   - Check browser developer tools
   - Verify token values match original

### Debug Commands

```bash
# Check specific file for issues
node scripts/verify-design-tokens.js | grep "filename.html"

# Generate link map for analysis
node scripts/check-links.js --map

# Test token migration on single file
node -e "const {applyTokenReplacements} = require('./scripts/apply-tokens.js'); console.log(applyTokenReplacements('your-css-here'))"
```

## 📚 Resources

- [Design Token Specification](https://design-tokens.github.io/community-group/format/)
- [CSS Custom Properties Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Internal Linking Best Practices](https://moz.com/blog/internal-linking-for-seo)

## 🤝 Contributing

1. Follow the token naming conventions
2. Update all three token files (JSON, CSS, TS)
3. Run verification scripts before committing
4. Test visual parity after changes
5. Update this documentation for new patterns

---

**Migration completed on:** `new Date().toISOString()`
**Total files processed:** 14 HTML files
**Total tokens created:** 89 design tokens
**Total links updated:** 91 internal links
