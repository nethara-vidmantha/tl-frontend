// TaskLanka Two-Tone Design System Theme

export const COLORS = {
  // Primary Two-Tone Pair
  primary: '#0D5C75',       // Deep Ocean Teal (Dominant)
  primaryDark: '#083B4C',   // Midnight Navy-Teal
  primaryLight: '#E6F4F8',  // Soft Ice Teal Tint
  
  secondary: '#F59E0B',     // Warm Amber Gold (Accent & Highlights)
  secondaryLight: '#FEF3C7',// Amber Tint
  secondaryDark: '#D97706', // Deep Gold

  // Semantic Colors
  success: '#10B981',       // Emerald Green (Available / Verified / Paid)
  successLight: '#D1FAE5',
  warning: '#F59E0B',       // Amber (Pending)
  warningLight: '#FEF3C7',
  danger: '#EF4444',        // Crimson Red (Cancelled / Rejected / Unavailable)
  dangerLight: '#FEE2E2',
  info: '#3B82F6',          // Sky Blue

  // Neutrals & Backgrounds
  background: '#F8FAFC',    // Slate 50
  cardBg: '#FFFFFF',        // Pure White
  cardBorder: '#E2E8F0',    // Slate 200
  textPrimary: '#0F172A',   // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',     // Slate 400
  divider: '#EDF2F7',

  // Gradients & Accents
  twoToneGradient: ['#0D5C75', '#164E63'],
  goldGradient: ['#F59E0B', '#D97706'],
  heroHeader: '#0D5C75',
  glassWhite: 'rgba(255, 255, 255, 0.92)'
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  lg: {
    shadowColor: '#0D5C75',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  }
};

export const SIZES = {
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusFull: 999
};
