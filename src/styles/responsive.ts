// Responsive design system for LAS POS
// Based on common device breakpoints optimized for POS usage

export const breakpoints = {
  // Mobile phones (portrait) - minimal support
  xs: '320px',
  // Mobile phones (landscape) / small tablets
  sm: '576px', 
  // Tablets (portrait) - primary mobile target
  md: '768px',
  // Tablets (landscape) / small laptops
  lg: '1024px',
  // Desktop / large tablets
  xl: '1200px',
  // Large desktop displays
  xxl: '1440px'
};

export const deviceTypes = {
  mobile: `(max-width: ${breakpoints.sm})`,
  tablet: `(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.lg})`,
  desktop: `(min-width: ${breakpoints.lg})`,
  tabletPortrait: `(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg}) and (orientation: portrait)`,
  tabletLandscape: `(min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl}) and (orientation: landscape)`,
  touch: '(hover: none) and (pointer: coarse)'
};

export const mediaQueries = {
  xs: `@media (max-width: ${breakpoints.xs})`,
  sm: `@media (max-width: ${breakpoints.sm})`,
  md: `@media (max-width: ${breakpoints.md})`,
  lg: `@media (max-width: ${breakpoints.lg})`,
  xl: `@media (max-width: ${breakpoints.xl})`,
  
  // Min-width queries
  smUp: `@media (min-width: ${breakpoints.sm})`,
  mdUp: `@media (min-width: ${breakpoints.md})`,
  lgUp: `@media (min-width: ${breakpoints.lg})`,
  xlUp: `@media (min-width: ${breakpoints.xl})`,
  
  // Device-specific
  mobile: `@media ${deviceTypes.mobile}`,
  tablet: `@media ${deviceTypes.tablet}`,
  desktop: `@media ${deviceTypes.desktop}`,
  tabletPortrait: `@media ${deviceTypes.tabletPortrait}`,
  tabletLandscape: `@media ${deviceTypes.tabletLandscape}`,
  touch: `@media ${deviceTypes.touch}`
};

// Spacing system for responsive design
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px'
};

// Touch-friendly sizing
export const touchTargets = {
  minimum: '44px', // iOS/Android minimum
  comfortable: '48px',
  large: '56px'
};

// Panel sizing for different screen sizes
export const panelSizes = {
  mobile: {
    settings: '100vw', // Full width modal on mobile
    basket: '100%',
    actionPad: '100%',
    insight: '100%'
  },
  tablet: {
    settings: '400px', // Larger settings panel
    basket: '280px',
    actionPad: '1fr',
    insight: '300px'
  },
  desktop: {
    settings: '500px', // Even larger for desktop
    basket: '320px',
    actionPad: '1fr', 
    insight: '360px'
  }
};
