/**
 * Bird Dog Moving Design Tokens - TypeScript Interface
 * Generated from tokens.json for type safety and IDE support
 */

export interface DesignTokens {
  color: {
    brand: {
      primary: string;
      secondary: string;
      accent: string;
      teal: {
        primary: string;
        secondary: string;
        light: string;
      };
    };
    surface: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
    state: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  typography: {
    fontFamily: {
      sans: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
      hero: string;
      h2: string;
    };
    lineHeight: {
      tight: string;
      snug: string;
      normal: string;
      relaxed: string;
      loose: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      extrabold: string;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
      wider: string;
      widest: string;
    };
  };
  radius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    teal: string;
  };
  zIndex: {
    hide: string;
    base: string;
    docked: string;
    dropdown: string;
    sticky: string;
    banner: string;
    overlay: string;
    modal: string;
    popover: string;
    skipLink: string;
    toast: string;
    tooltip: string;
  };
  borderWidth: {
    '0': string;
    '1': string;
    '2': string;
    '4': string;
    '8': string;
  };
  opacity: {
    '0': string;
    '5': string;
    '10': string;
    '20': string;
    '25': string;
    '30': string;
    '40': string;
    '50': string;
    '60': string;
    '70': string;
    '75': string;
    '80': string;
    '90': string;
    '95': string;
    '100': string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  transition: {
    duration: {
      fast: string;
      base: string;
      slow: string;
    };
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      bounce: string;
    };
  };
  layout: {
    maxWidth: {
      wrap: string;
    };
  };
}

// Import the actual token values
import tokensData from './tokens.json';

export const tokens: DesignTokens = tokensData as DesignTokens;

// Helper functions for accessing tokens
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = tokens.color;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color token not found: ${path}`);
      return '#000000';
    }
  }
  return value;
};

export const getSpacing = (size: keyof DesignTokens['spacing']): string => {
  return tokens.spacing[size];
};

export const getFontSize = (size: keyof DesignTokens['typography']['fontSize']): string => {
  return tokens.typography.fontSize[size];
};

export const getShadow = (size: keyof DesignTokens['shadow']): string => {
  return tokens.shadow[size];
};

export const getRadius = (size: keyof DesignTokens['radius']): string => {
  return tokens.radius[size];
};

// CSS Custom Property helpers
export const cssVar = (property: string): string => {
  return `var(--${property.replace(/\./g, '-')})`;
};

// Common token combinations
export const commonStyles = {
  button: {
    primary: {
      backgroundColor: cssVar('color-brand-secondary'),
      color: cssVar('color-brand-primary'),
      borderRadius: cssVar('radius-base'),
      padding: `${cssVar('space-lg')} ${cssVar('space-xl')}`,
      fontSize: cssVar('font-size-base'),
      fontWeight: cssVar('font-weight-semibold'),
      boxShadow: cssVar('shadow-base'),
      transition: `all ${cssVar('transition-duration-base')} ${cssVar('transition-easing-ease')}`,
    },
    secondary: {
      backgroundColor: cssVar('color-brand-teal-primary'),
      color: cssVar('color-text-inverse'),
      borderRadius: cssVar('radius-base'),
      padding: `${cssVar('space-lg')} ${cssVar('space-xl')}`,
      fontSize: cssVar('font-size-base'),
      fontWeight: cssVar('font-weight-semibold'),
      boxShadow: cssVar('shadow-teal'),
      transition: `all ${cssVar('transition-duration-base')} ${cssVar('transition-easing-ease')}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: cssVar('color-brand-primary'),
      border: `${cssVar('border-width-1')} solid ${cssVar('color-border-primary')}`,
      borderRadius: cssVar('radius-base'),
      padding: `${cssVar('space-lg')} ${cssVar('space-xl')}`,
      fontSize: cssVar('font-size-base'),
      fontWeight: cssVar('font-weight-semibold'),
      transition: `all ${cssVar('transition-duration-base')} ${cssVar('transition-easing-ease')}`,
    },
  },
  card: {
    base: {
      backgroundColor: cssVar('color-surface-primary'),
      border: `${cssVar('border-width-1')} solid ${cssVar('color-border-primary')}`,
      borderRadius: cssVar('radius-md'),
      boxShadow: cssVar('shadow-sm'),
      padding: cssVar('space-2xl'),
      transition: `all ${cssVar('transition-duration-base')} ${cssVar('transition-easing-ease')}`,
    },
  },
  typography: {
    hero: {
      fontSize: cssVar('font-size-hero'),
      lineHeight: cssVar('line-height-tight'),
      fontWeight: cssVar('font-weight-bold'),
      color: cssVar('color-brand-primary'),
    },
    h2: {
      fontSize: cssVar('font-size-h2'),
      lineHeight: cssVar('line-height-tight'),
      fontWeight: cssVar('font-weight-bold'),
      color: cssVar('color-brand-primary'),
    },
    body: {
      fontSize: cssVar('font-size-base'),
      lineHeight: cssVar('line-height-relaxed'),
      color: cssVar('color-text-primary'),
    },
    muted: {
      fontSize: cssVar('font-size-base'),
      lineHeight: cssVar('line-height-relaxed'),
      color: cssVar('color-text-muted'),
    },
  },
} as const;

export default tokens;

