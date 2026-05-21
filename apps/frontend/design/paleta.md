---
name: Call Master AI Narrative
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  technical-md:
    fontFamily: Roboto Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.5'
    letterSpacing: 0.02em
  technical-sm:
    fontFamily: Roboto Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality of this design system is centered on "Cognitive Precision"—the intersection of deep-tech intelligence and human-centric reliability. It is designed to evoke a sense of immense processing power filtered through a calm, professional interface. The target audience consists of enterprise stakeholders and technical operators who require clarity in complex data environments.

The visual style utilizes a blend of **Minimalism** and **Glassmorphism**. High-density information is organized through expansive whitespace and rigorous alignment, while depth is achieved through translucent layers that suggest a multi-dimensional "data space." This design system leverages subtle light-emissive properties (glows) to represent active AI processes, providing a high-tech, futuristic aesthetic without compromising professional utility.

## Colors

The color strategy for this design system is built upon an "Obsidian Foundation" to reduce cognitive load and visual fatigue in high-uptime environments. 

- **Electric Blue (#3B82F6)** serves as the primary driver for action and focus.
- **Neon Violet (#8B5CF6)** is reserved for AI-augmented features, intelligence indicators, and secondary visual interest.
- **Emerald (#10B981)** provides a clear success state and signifies optimized performance.
- **Surface Neutrals** use a deep navy spectrum (#0F1117) to create separation between the background and container elements, ensuring that pure white headings achieve maximum legibility.

## Typography

Typography in this design system emphasizes clarity and a "technical edge." **Plus Jakarta Sans** is the primary typeface, chosen for its modern geometric forms which provide a clean, approachable feel to headings and body copy. 

For data-heavy displays, logs, and AI status indicators, **Roboto Mono** is used. This monospaced font signals a "system-level" output, differentiating between human-authored content and machine-generated data. Large headings should use tighter letter-spacing for a more premium, editorial look, while body text maintains standard spacing for maximum readability against the dark background.

## Layout & Spacing

This design system employs a **12-column fluid grid** for dashboard views, transitioning to a centralized fixed-width container (max 1280px) for settings and documentation. 

The spacing rhythm follows an 8px linear scale. Large-scale layouts should prioritize "Generous Breathing Room" (using `lg` and `xl` spacing) to prevent the dark interface from feeling cramped. For technical sidebars and data grids, the scale compresses to `xs` and `sm` to ensure high information density remains navigable.

## Elevation & Depth

Depth in this design system is communicated through **Tonal Layering** and **Glassmorphism** rather than traditional heavy shadows.

- **Level 0 (Base):** Obsidian (#0A0B10).
- **Level 1 (Cards/Panels):** Deep Navy (#0F1117) with a subtle 1px border at 10% opacity white.
- **Level 2 (Modals/Overlays):** Glassmorphic surfaces using a 12px backdrop-blur and a semi-transparent fill (White at 4% opacity).
- **AI-Focus:** Elements containing active AI logic feature a "Glow Border"—a secondary stroke using a linear gradient of Neon Violet and Electric Blue with a soft 4px outer bloom.

Shadows, when used, are extremely diffused and tinted with the primary blue hue (#3B82F6 at 15% opacity) to create an "ambient light" effect rather than a physical shadow.

## Shapes

The shape language is consistently **Rounded**, striking a balance between technical precision and modern software aesthetics. Standard components like cards and input fields utilize a 0.5rem (8px) radius. 

Larger containers (rounded-lg) and prominent feature cards (rounded-xl) use 1rem and 1.5rem respectively to soften the high-contrast dark theme. Interactive elements like buttons and tags should maintain these consistent radii to ensure the UI feels unified and deliberate.

## Components

- **Buttons:** Primary buttons use a subtle vertical gradient (Electric Blue to a slightly deeper shade) with a hover state that increases the brightness. Text is always Pure White. Secondary buttons are ghost-style with a 1px Slate Gray border.
- **AI Glowing Cards:** For AI insights, cards feature a 1px border gradient (Neon Violet to Electric Blue) and a very subtle inner glow. 
- **Input Fields:** Minimalist design with a background slightly darker than the surface layer. Focus states are indicated by an Electric Blue bottom border or a full 1px stroke.
- **Chips & Badges:** Glass-style backgrounds with Roboto Mono text. Success badges use the Emerald accent with 10% opacity fill and 100% opacity text.
- **Data Visualization:** Line graphs and charts utilize the primary and secondary accents against a faint grid of Slate Gray lines at 5% opacity.
- **Status Indicators:** Pulsing dots are used for "Live" AI processing, utilizing the Neon Violet glow effect to indicate system activity.