/**
 * Design Tokens for Selfy v3
 * Mapped from Figma design system
 * Last updated: Sprint 2
 */

export const colors = {
  // Primary brand colors (Orange)
  primary: {
    100: '#ffc9ab',
    200: '#ff9256',
    300: '#ff5c02', // Main brand color
    400: '#c74700',
    500: '#8d3200',
    alpha: {
      10: '#ff5c021a', // 10% opacity
    },
  },
  // Secondary colors (Purple)
  secondary: {
    100: '#c4aaff',
    200: '#8855ff',
    300: '#4d00ff', // Main secondary color
    400: '#3c00c6',
    500: '#2a008c',
    alpha: {
      10: '#4d00ff1a', // 10% opacity
    },
  },
  // Neutral/Gray scale
  neutral: {
    100: '#ffffff', // White
    200: '#e8e8e8',
    300: '#d2d2d2',
    400: '#bbbbbb',
    500: '#a4a4a4',
    600: '#8e8e8e',
    700: '#777777',
    800: '#606060',
    900: '#4a4a4a',
    1000: '#333333', // Near black
    alpha: {
      10: '#3333331a', // 10% opacity
    },
  },
  // Semantic colors - Success (Green)
  success: {
    light: '#84ebb4',
    DEFAULT: '#1fc16b',
    dark: '#1fc16b',
    alpha: {
      10: '#1fc16b1a',
    },
  },
  // Semantic colors - Warning (Yellow)
  warning: {
    light: '#ffdb43',
    DEFAULT: '#dfb400',
    dark: '#dfb400',
    alpha: {
      10: '#ffdb431a',
    },
  },
  // Semantic colors - Error (Red)
  error: {
    light: '#fb3748',
    DEFAULT: '#d00416',
    dark: '#d00416',
    alpha: {
      10: '#fb37481a',
    },
  },
  // Semantic colors - Info (keep existing blue)
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e3a8a',
  },
} as const;

export const spacing = {
  // Base spacing scale from Figma (px values)
  0: '0px',
  1: '0.125rem', // 2px
  2: '0.25rem', // 4px
  3: '0.5rem', // 8px
  4: '0.75rem', // 12px
  5: '1rem', // 16px
  6: '1.25rem', // 20px
  7: '1.5rem', // 24px
  8: '2rem', // 32px
  9: '2.5rem', // 40px
  10: '3rem', // 48px
  11: '3.5rem', // 56px
} as const;

export const typography = {
  // Font families
  fontFamily: {
    heading: ['"EB Garamond"', 'Georgia', 'serif'],
    body: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
  },
  // Font sizes - Headings (EB Garamond)
  fontSize: {
    // Headings
    h1: ['4.25rem', { lineHeight: '6.375rem', fontWeight: '500' }], // 68px
    h2: ['3.5rem', { lineHeight: '5.25rem', fontWeight: '500' }], // 56px
    h3: ['2.875rem', { lineHeight: '4.3125rem', fontWeight: '500' }], // 46px
    h4: ['2.375rem', { lineHeight: '3.5625rem', fontWeight: '500' }], // 38px
    h5: ['2rem', { lineHeight: '3rem', fontWeight: '500' }], // 32px
    h6: ['1.625rem', { lineHeight: '2.4375rem', fontWeight: '500' }], // 26px
    h7: ['1.375rem', { lineHeight: '2.0625rem', fontWeight: '500' }], // 22px

    // Body text (Inter)
    b1: ['1.125rem', { lineHeight: '1.6875rem', fontWeight: '500' }], // 18px
    b2: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px (base)
    b3: ['0.875rem', { lineHeight: '1.3125rem', fontWeight: '400' }], // 14px
    b4: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }], // 12px
    b5: ['0.625rem', { lineHeight: '0.9375rem', fontWeight: '400' }], // 10px

    // Aliases for common usage
    base: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // b2
    sm: ['0.875rem', { lineHeight: '1.3125rem', fontWeight: '400' }], // b3
    xs: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }], // b4
    lg: ['1.125rem', { lineHeight: '1.6875rem', fontWeight: '500' }], // b1
  },
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const borderRadius = {
  none: '0px',
  1: '0.125rem', // 2px
  2: '0.25rem', // 4px
  3: '0.375rem', // 6px
  4: '0.5rem', // 8px
  5: '0.625rem', // 10px
  6: '0.75rem', // 12px
  7: '1rem', // 16px
  full: '62.4375rem', // 999px (full rounded)

  // Aliases for component tokens
  DEFAULT: '0.5rem', // 8px
  sm: '0.375rem', // 6px (component s)
  md: '0.5rem', // 8px (component m)
  lg: '0.75rem', // 12px (component xl)
  xl: '1rem', // 16px
} as const;

export const shadows = {
  none: 'none',
  // e0 - No shadow
  0: '0 0 0 0 rgba(0, 0, 0, 0)',
  // e1 - Small shadow with inner shadow
  1: '4px 4px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
  // e2 - Medium shadow with inner shadow
  2: '6px 6px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
  // e3 - Large shadow with inner shadow
  3: '8px 8px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',

  // Aliases for easier usage
  sm: '4px 4px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
  DEFAULT: '6px 6px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
  md: '6px 6px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
  lg: '8px 8px 0px 0px rgba(0, 0, 0, 1), inset 0 0 0 2px rgba(0, 0, 0, 1)',
} as const;

export const stroke = {
  0: '1px',
  1: '2px',
  2: '4px',
  3: '6px',

  // Aliases
  sm: '1px',
  DEFAULT: '2px',
  lg: '4px',
} as const;

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
} as const;

// Component-specific tokens
export const componentTokens = {
  // Gap sizes
  gap: {
    '3xs': '0.125rem', // 2px
    '2xs': '0.25rem', // 4px
    xs: '0.5rem', // 8px
  },
  // Padding sizes
  padding: {
    '2xs': '0.125rem', // 2px
    xs: '0.25rem', // 4px
    s: '0.5rem', // 8px
    m: '0.75rem', // 12px
    l: '1rem', // 16px
  },
  // Fill colors (semantic component colors)
  fill: {
    brand1: {
      default: '#ff5c02',
      strong: '#ff5c02',
      subtle: '#ffc9ab',
    },
    brand2: {
      default: '#4d00ff',
      subtle: '#c4aaff',
    },
    neutrals: {
      white: '#ffffff',
      subtle: '#ffffff',
    },
    status: {
      disabled: '#ffffff',
      error: {
        default: '#fb3748',
        subtle: '#fb37481a',
      },
      success: {
        default: '#1fc16b',
        subtle: '#1fc16b1a',
      },
      warning: {
        default: '#ffdb43',
        subtle: '#ffdb431a',
      },
    },
  },
  // Stroke colors
  stroke: {
    brand1: {
      default: '#ff5c02',
      strong: '#ff5c02',
    },
    brand2: {
      default: '#c4aaff',
    },
    focus: {
      default: '#ff5c021a',
      error: '#fb37481a',
    },
    primary: {
      default: '#e8e8e8',
      strong: '#d2d2d2',
    },
    status: {
      disabled: '#e8e8e8',
      error: '#fb3748',
      success: '#1fc16b',
      warning: '#ffdb43',
    },
  },
  // Icon colors
  icon: {
    white: '#ffffff',
    black: '#4a4a4a',
    grey: '#a4a4a4',
    brand1: '#ff5c02',
    status: {
      disabled: '#e8e8e8',
      error: '#fb3748',
      success: '#1fc16b',
      caution: '#ffdb43',
    },
  },
  // Text colors
  text: {
    inverse: '#ffffff',
    primary: '#4a4a4a',
    secondary: '#a4a4a4',
    brand1: '#ff5c02',
    brand2: '#4d00ff',
    status: {
      disabled: '#e8e8e8',
      error: '#fb3748',
      success: '#1fc16b',
      warning: '#ffdb43',
    },
  },
} as const;

// Export all tokens as a single object for easy import
export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  stroke,
  breakpoints,
  zIndex,
  componentTokens,
} as const;

export default designTokens;
