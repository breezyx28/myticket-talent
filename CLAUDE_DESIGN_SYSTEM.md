# 🎟️ My Ticket — Design System v2.0
> **Product**: Ticketing Website  
> **Stack**: React 18 + TypeScript + Tailwind CSS + shadcn/ui  
> **Font**: Plus Jakarta Sans | **Icons**: Lucide React  
> **Style**: Bold Multicolor · White-Dominant · Mixed Light/Dark Sections · Large Rounded Corners

---

## 📖 Table of Contents
1. [Typography & Font Sources](#typography)
2. [Icon System & Source](#icons)
3. [Color Tokens](#colors)
4. [Spacing & Radius](#spacing)
5. [Decorative Shapes (from Reference Images)](#shapes)
6. [Unsplash Image Library](#images)
7. [Components](#components)
8. [Page Section Templates](#sections)
9. [Tailwind Config](#config)

---

## 1. 🔤 Typography & Font Sources {#typography}

### Primary Font: Plus Jakarta Sans

**Observed in**: All 5 reference images use this class of bold geometric grotesque sans-serif.  
The closest match across all images — the bold ultra-compressed style of Image 2 (HoneyGuide), the clean weight hierarchy of Image 5 (Connecto), and Image 4 (Tennis) — all align with Plus Jakarta Sans.

| Property | Value |
|---|---|
| **Font family** | Plus Jakarta Sans |
| **Designer** | Gumpita Rahayu (Tokotype) |
| **License** | SIL Open Font License — **100% free, commercial use allowed** |
| **Download (Google Fonts)** | https://fonts.google.com/specimen/Plus+Jakarta+Sans |
| **Download (GitHub)** | https://github.com/tokotype/PlusJakartaSans |
| **Self-host (woff2/ttf)** | https://gwfh.mranftl.com/fonts/plus-jakarta-sans |
| **npm (Fontsource)** | `npm install @fontsource/plus-jakarta-sans` |

**Weights used in My Ticket:**
```
200 ExtraLight  → not used
300 Light       → not used
400 Regular     → body text, meta, labels
500 Medium      → nav links, secondary labels
600 SemiBold    → buttons, badge chips, card labels
700 Bold        → section headings, card titles
800 ExtraBold   → display headings
900 Black (*)   → hero headlines, key display text
```
> ⚠️ Note: Plus Jakarta Sans goes up to **800 ExtraBold** on Google Fonts. For "Black" (900) weight appearance, add `font-stretch: condensed` or pair with CSS `letter-spacing: -0.03em` to achieve the ultra-compressed look seen in Image 2.

### Secondary Font: Space Grotesk (for accent numerals / stats)

Used for the large stat numbers (Image 5 Connecto style: "13,422", "2,582") — slightly more mechanical feel that contrasts with the warmth of Jakarta Sans.

| Property | Value |
|---|---|
| **Font family** | Space Grotesk |
| **License** | SIL Open Font License — **free, commercial use** |
| **Download (Google Fonts)** | https://fonts.google.com/specimen/Space+Grotesk |
| **npm (Fontsource)** | `npm install @fontsource/space-grotesk` |

**Used for**: Stat bubbles, ticket prices, seat numbers, countdown timers.

### HTML Setup

```html
<!-- index.html <head> — Google Fonts CDN -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### OR via npm (Fontsource — recommended for production):

```bash
npm install @fontsource/plus-jakarta-sans @fontsource/space-grotesk
```

```ts
// src/main.tsx
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/700.css';
```

### Tailwind font config:

```ts
fontFamily: {
  sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
  mono:  ['"Space Grotesk"',     'system-ui', 'sans-serif'],  // used for stats/numbers
},
```

---

## 2. 🎯 Icon System & Source {#icons}

### Primary Icon Library: Lucide React

**Observed in reference images**: All 5 images use thin-stroke, rounded, line-style icons — this is the exact Lucide aesthetic. Image 1 uses large flat icons (~64px), Image 3 uses small utility icons (16–18px).

| Property | Value |
|---|---|
| **Library** | Lucide React |
| **Website** | https://lucide.dev |
| **Icon browser** | https://lucide.dev/icons |
| **GitHub** | https://github.com/lucide-icons/lucide |
| **License** | ISC License — **free, commercial use allowed** |
| **Total icons** | 1,695+ icons |
| **Install** | `npm install lucide-react` |

**Usage rules:**
```tsx
import { Ticket, Music2, MapPin, Calendar, Search } from 'lucide-react';

// Standard UI icons: size=16, strokeWidth=2
<Search size={16} strokeWidth={2} />

// Category tile icons: size=64, strokeWidth={2}
<Music2 size={64} strokeWidth={2} />

// Hero / feature icons: size=24, strokeWidth={2}
<Ticket size={24} strokeWidth={2} />
```

### Icon Map for My Ticket Categories

```tsx
// All icons from lucide-react — browse at https://lucide.dev/icons
import {
  // Event categories
  Music2,          // Music / Concerts
  Trophy,          // Sports
  Palette,         // Arts & Culture
  Laugh,           // Comedy
  Monitor,         // Online / Virtual
  Users,           // Family / Community
  UtensilsCrossed, // Food & Drink
  Shirt,           // Fashion
  Cpu,             // Tech / Conferences
  Mic2,            // Theatre / Performing Arts
  Sunset,          // Festivals / Outdoor
  Gamepad2,        // Gaming Events

  // Navigation & UI
  Ticket,          // Logo icon, buy CTA
  Search,          // Search bar
  MapPin,          // Location
  Calendar,        // Date picker
  Bell,            // Notifications
  Heart,           // Save/Wishlist
  Share2,          // Share event
  ArrowRight,      // CTA arrows
  ChevronLeft,     // Slider prev
  ChevronRight,    // Slider next
  SlidersHorizontal, // Filters
  Filter,          // Filter button
  X,               // Close/dismiss
  Menu,            // Hamburger
  User,            // Profile
  LogIn,           // Sign in
  QrCode,          // Ticket QR code
  Clock,           // Time display
  Star,            // Rating
  Download,        // Download ticket
  ExternalLink,    // Open in new tab
  Check,           // Confirmation
  AlertCircle,     // Error/warning
  Info,            // Tooltip
} from 'lucide-react';
```

### Figma Plugin (for designers)

Browse and insert Lucide icons directly inside Figma:
- **Plugin**: Lucide Icons for Figma
- **Install**: https://www.figma.com/community/plugin/1059657763925706415

---

## 3. 🎨 Color Tokens {#colors}

### Brand Color Palette

Extracted from pixel analysis of all 5 reference images, remapped to ticketing event categories:

```ts
// tailwind.config.ts — theme.extend.colors
colors: {

  // ── Brand Primaries ──────────────────────────────────────────────
  coral:    { DEFAULT: '#FF6B4A', light: '#FFB8A8', dark: '#CC4A2E' }, // Music events, secondary CTA
  lemon:    { DEFAULT: '#F5E642', light: '#FDF4A0', dark: '#C9BC1A' }, // Primary CTA, featured badge
  lime:     { DEFAULT: '#BAFF39', light: '#DFFFAA', dark: '#86D400' }, // Sports, outdoor events
  sky:      { DEFAULT: '#A8C9F0', light: '#D6E9FF', dark: '#5A99D4' }, // Arts & culture
  lavender: { DEFAULT: '#C4B5F4', light: '#E8E2FF', dark: '#8B72E0' }, // Theatre, comedy
  mint:     { DEFAULT: '#4DFFC3', light: '#A8FFE5', dark: '#00C990' }, // Online events, stat bubble
  teal:     { DEFAULT: '#6ECFB0', light: '#B8EEE0', dark: '#3DA080' }, // Family, kids
  amber:    { DEFAULT: '#F4A05A', light: '#FFDCB8', dark: '#C47020' }, // Food & drink
  blush:    { DEFAULT: '#F9B8C4', light: '#FFE4EA', dark: '#D4708A' }, // Fashion, art
  indigo:   { DEFAULT: '#3355FF', light: '#A8B8FF', dark: '#1A35CC' }, // Tech, conferences

  // ── Neutrals ─────────────────────────────────────────────────────
  ink: {
    DEFAULT: '#0D0D0D',  // Headings, dark section bg (Image 2 HoneyGuide)
    90:      '#1A1A1A',  // Dark card backgrounds
    80:      '#2E2E2E',  // Hover states on dark
    60:      '#555555',  // Body text on white
    40:      '#888888',  // Meta text, placeholders
    20:      '#BBBBBB',  // Dividers on dark bg
    10:      '#E5E5E5',  // Borders on white bg
    5:       '#F5F5F5',  // Subtle section tint
  },

  // ── Surfaces ─────────────────────────────────────────────────────
  surface: {
    page:  '#FFFFFF',    // Default body background (WHITE DOMINANT)
    tint:  '#F5F5F5',    // Alternate row sections
    warm:  '#F0EDE6',    // Venue/map sections (Image 4 Tennis bg)
    dark:  '#0D0D0D',    // Hero, CTA banners, footer
    card:  '#FFFFFF',    // Card default
  },
}
```

### Category → Color Map

```ts
// lib/categoryColors.ts
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; light: string }> = {
  music:    { bg: '#FF6B4A', text: '#FFFFFF', light: '#FFB8A8' },  // coral
  sports:   { bg: '#BAFF39', text: '#0D0D0D', light: '#DFFFAA' },  // lime
  arts:     { bg: '#A8C9F0', text: '#0D0D0D', light: '#D6E9FF' },  // sky
  comedy:   { bg: '#F5E642', text: '#0D0D0D', light: '#FDF4A0' },  // lemon
  online:   { bg: '#4DFFC3', text: '#0D0D0D', light: '#A8FFE5' },  // mint
  family:   { bg: '#6ECFB0', text: '#0D0D0D', light: '#B8EEE0' },  // teal
  food:     { bg: '#F4A05A', text: '#0D0D0D', light: '#FFDCB8' },  // amber
  fashion:  { bg: '#F9B8C4', text: '#0D0D0D', light: '#FFE4EA' },  // blush
  tech:     { bg: '#3355FF', text: '#FFFFFF', light: '#A8B8FF' },  // indigo
  theatre:  { bg: '#C4B5F4', text: '#0D0D0D', light: '#E8E2FF' },  // lavender
};
```

---

## 4. 📐 Spacing & Border Radius {#spacing}

### Spacing Scale (8px base unit)

```
space-1  →   4px   Icon padding, micro gaps
space-2  →   8px   Tag/badge padding
space-3  →  12px   Tile grid gaps
space-4  →  16px   Card padding (sm)
space-5  →  20px   Component spacing
space-6  →  24px   Card padding (md)
space-8  →  32px   Card padding (lg)
space-10 →  40px   Section gap (mobile)
space-12 →  48px   Section gap (tablet)
space-16 →  64px   Section gap (desktop — primary rhythm)
space-20 →  80px   Hero padding top
space-24 →  96px   Major section separator
```

### Border Radius

```ts
borderRadius: {
  'none': '0px',
  'sm':   '6px',     // Dropdowns, inline elements
  'md':   '8px',     // Input fields
  'lg':   '12px',    // Search inputs, small cards
  'xl':   '16px',    // Medium cards
  '2xl':  '20px',    // Large cards, stat bubbles
  '3xl':  '24px',    // Category tiles (Image 1), hero cards
  '4xl':  '32px',    // Full-bleed container cards (Image 4)
  'full': '9999px',  // Pills: buttons, tags, avatars, badge chips
}
```

---

## 5. ✦ Decorative Shapes (from Reference Images) {#shapes}

This section documents every decorative shape observed across all 5 reference images, with ready-to-use SVG/JSX code for each.

---

### Shape 1: Four-Point Star / Starburst ✦
**Source**: Image 5 (Connecto hero section) — used as a floating ornament between stat bubbles and photos.  
**Also used in**: Image 2 (HoneyGuide) — cross/asterisk pattern decorators.  
**Use in My Ticket**: Scatter on dark hero section, CTA banners, empty states.

```tsx
// components/shapes/Starburst.tsx
interface StarburstProps {
  size?: number;
  color?: string;
  className?: string;
  filled?: boolean;
}

export function Starburst({ size = 32, color = 'currentColor', className = '', filled = false }: StarburstProps) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {filled ? (
        <path
          d="M16 0 L17.5 13.5 L29 8 L19.5 17.5 L32 16 L19.5 14.5 L29 24 L17.5 18.5 L16 32 L14.5 18.5 L3 24 L12.5 14.5 L0 16 L12.5 17.5 L3 8 L14.5 13.5 Z"
          fill={color}
        />
      ) : (
        <path
          d="M16 2 L17.2 13.8 L27 7 L19.5 16 L30 14.8 L19.5 16 L27 25 L17.2 18.2 L16 30 L14.8 18.2 L5 25 L12.5 16 L2 14.8 L12.5 16 L5 7 L14.8 13.8 Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Usage on dark section:
<Starburst size={40} color="#FFFFFF" className="absolute top-12 right-24 opacity-40" />
<Starburst size={24} color="#F5E642" filled className="absolute bottom-8 left-16" />
```

---

### Shape 2: Cross / Plus / X Ornament ✕
**Source**: Image 2 (HoneyGuide) — used as brand pattern decoration in coral, indigo, and lemon colors (3 crosses in a row).  
**Also used in**: Image 1 (Цифрограм tile) — cross-shaped icon, centered large.  
**Use in My Ticket**: Pattern repeat on dark sections, logo area, loading states.

```tsx
// components/shapes/CrossOrnament.tsx
interface CrossOrnamentProps {
  size?: number;
  color?: string;
  rounded?: boolean;
  className?: string;
}

export function CrossOrnament({ size = 28, color = 'currentColor', rounded = true, className = '' }: CrossOrnamentProps) {
  const r = rounded ? size * 0.1 : 0;
  const arm = size * 0.28;
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={className}>
      {/* Horizontal arm */}
      <rect
        x={0} y={center - arm / 2}
        width={size} height={arm}
        rx={r} fill={color}
      />
      {/* Vertical arm */}
      <rect
        x={center - arm / 2} y={0}
        width={arm} height={size}
        rx={r} fill={color}
      />
    </svg>
  );
}

// The exact HoneyGuide 3-cross pattern:
export function CrossPattern() {
  return (
    <div className="flex items-center gap-3">
      <CrossOrnament size={32} color="#FF6B4A" />  {/* coral */}
      <CrossOrnament size={32} color="#3355FF" />  {/* indigo */}
      <CrossOrnament size={32} color="#F5E642" />  {/* lemon */}
    </div>
  );
}
```

---

### Shape 3: Organic Blob / Speech Bubble Shape
**Source**: Image 5 (Connecto) — the stat containers ("Active Professionals 13,422" and "Online Courses 2,582") use rounded organic blob shapes, not rectangles. The black stat bubble is a squircle with very uneven corners. The mint green stat bubble is a rounded blob with a tail direction.

```tsx
// components/shapes/BlobCard.tsx
// Used as: stat bubbles, floating callout cards, featured count badges

interface BlobCardProps {
  children: React.ReactNode;
  color?: string;       // Tailwind class e.g. 'bg-ink-DEFAULT text-white'
  variant?: 'round' | 'arch' | 'blob';
}

// Variant: 'round' — standard pill-rectangle (used for most stats)
// Variant: 'arch'  — top is fully rounded, bottom is flat (Image 5 photo crop shape)
// Variant: 'blob'  — squircle / super-ellipse (Image 5 mint bubble)

export function BlobCard({ children, color = 'bg-ink-DEFAULT text-white', variant = 'round' }: BlobCardProps) {
  const shapes = {
    round: 'rounded-[28px]',
    arch:  'rounded-t-[200px] rounded-b-2xl',
    blob:  'rounded-[40%_60%_55%_45%_/_45%_55%_60%_40%]',  // CSS border-radius blob
  };
  return (
    <div className={cn('px-6 py-5 shadow-blob', color, shapes[variant])}>
      {children}
    </div>
  );
}
```

---

### Shape 4: Rounded Photo Crops (Mixed Shapes)
**Source**: Image 5 (Connecto) — photos are cropped into 3 different shapes: circle, arch (tall rounded-top rectangle), and rounded square. This visual variety is key to the energetic layout.

```tsx
// components/shapes/PhotoCrop.tsx
// Used for artist/performer avatars, event preview photos

type CropShape = 'circle' | 'arch' | 'square' | 'landscape';

interface PhotoCropProps {
  src: string;
  alt?: string;
  shape?: CropShape;
  accentBg?: string;   // Tailwind bg color behind the photo
  size?: 'sm' | 'md' | 'lg';
}

const shapeClasses: Record<CropShape, string> = {
  circle:    'rounded-full aspect-square',
  arch:      'rounded-t-[120px] rounded-b-2xl',     // Image 5 tall arch shape
  square:    'rounded-3xl aspect-square',            // Image 5 blue square crop
  landscape: 'rounded-2xl aspect-video',
};

const sizeClasses = {
  sm: 'w-[80px]',
  md: 'w-[120px]',
  lg: 'w-[160px]',
};

export function PhotoCrop({ src, alt = '', shape = 'square', accentBg = 'bg-coral', size = 'md' }: PhotoCropProps) {
  return (
    <div className={cn('overflow-hidden flex-shrink-0', accentBg, shapeClasses[shape], sizeClasses[size])}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover mix-blend-multiply"
      />
    </div>
  );
}

// The Connecto-style floating photo cluster (Image 5):
export function PhotoCluster({ photos }: { photos: { src: string; bg: string }[] }) {
  return (
    <div className="relative w-[420px] h-[380px]">
      {/* Arch crop — top left */}
      <PhotoCrop src={photos[0].src} shape="arch" accentBg={photos[0].bg} size="md"
        className="absolute top-0 left-12 w-[100px]" />
      {/* Circle — top center */}
      <PhotoCrop src={photos[1].src} shape="circle" accentBg={photos[1].bg} size="md"
        className="absolute top-4 left-36 w-[110px]" />
      {/* Purple arch — top right */}
      <PhotoCrop src={photos[2].src} shape="arch" accentBg="bg-lavender" size="sm"
        className="absolute top-0 right-8 w-[90px]" />
      {/* Square — center left */}
      <PhotoCrop src={photos[3].src} shape="square" accentBg={photos[3].bg} size="lg"
        className="absolute top-20 left-4 w-[130px]" />

      {/* Stat bubbles floating between photos */}
      <StatBubble label="Tickets Sold" value="2.1M"  color="bg-ink-DEFAULT text-white"
        className="absolute top-8 right-0 text-xs" />
      <StatBubble label="Live Events"  value="8,240+" color="bg-mint text-ink-DEFAULT"
        className="absolute bottom-0 left-24" />

      {/* Decorative shapes */}
      <Starburst size={28} color="#0D0D0D" className="absolute bottom-20 right-20" />
      <div className="w-3 h-3 rounded-full border-2 border-ink-DEFAULT absolute top-24 right-28" />
      {/* Triangle outline (Image 5) */}
      <svg width="16" height="14" viewBox="0 0 16 14" className="absolute bottom-12 right-4 text-ink-DEFAULT opacity-50">
        <path d="M8 1 L15 13 L1 13 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}
```

---

### Shape 5: Superellipse / Squircle Tile
**Source**: Image 1 (Ukrainian tiles) + Image 4 (Tennis program cards) — the defining shape of the reference design: rounded corners so large they approach a circle but stay recognizably rectangular. This is the `rounded-3xl` (24px) tile.

```tsx
// This is implemented via Tailwind's rounded-3xl class.
// For 180×180px tiles specifically:

<div className="w-[180px] h-[180px] rounded-3xl bg-coral">
  {/* tile content */}
</div>

// For the Tennis-style full-height program card (Image 4):
<div className="w-[240px] rounded-[28px] overflow-hidden">
  {/* colored header + photo bottom */}
</div>
```

---

### Shape 6: Ticket Perforation / Stub Line
**Source**: Unique to My Ticket — derived from the dashed border concept visible in real-world ticket stubs. Not in reference images but essential to brand identity.

```tsx
// components/shapes/PerforationLine.tsx
// Used inside TicketStub component to separate body from QR stub

export function PerforationLine({ color = 'rgba(255,255,255,0.25)', vertical = false }) {
  return (
    <div
      className={cn(
        vertical ? 'h-full w-0 border-l-2' : 'w-full h-0 border-t-2',
        'border-dashed'
      )}
      style={{ borderColor: color }}
    />
  );
}

// SVG circle-notch version (more authentic ticket look):
export function PerforationDots({ count = 18, color = 'rgba(0,0,0,0.15)' }) {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Left notch */}
      <div className="w-5 h-5 rounded-full" style={{ background: color, marginLeft: '-10px' }} />
      {/* Dots */}
      <div className="flex-1 flex justify-evenly">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full" style={{ background: color }} />
        ))}
      </div>
      {/* Right notch */}
      <div className="w-5 h-5 rounded-full" style={{ background: color, marginRight: '-10px' }} />
    </div>
  );
}
```

---

### Shape 7: Color Swatch Card (HoneyGuide Portrait Card)
**Source**: Image 2 (HoneyGuide) — tall portrait cards (~220×300px) with solid colored background, bold color name overlaid, person photo in lower portion.

```tsx
// components/shapes/SwatchCard.tsx — used for artist/performer spotlight cards

interface SwatchCardProps {
  name:       string;
  role?:      string;
  image:      string;
  bgColor:    string;   // Tailwind bg class
  textColor?: string;
}

export function SwatchCard({ name, role, image, bgColor, textColor = 'text-white' }: SwatchCardProps) {
  return (
    <div className={cn('rounded-[20px] overflow-hidden w-[200px] flex-shrink-0', bgColor)}
      style={{ height: '300px' }}>

      {/* Header with name */}
      <div className="p-5 flex items-start justify-between">
        <div>
          {name.split(' ').map((word, i) => (
            <span key={i} className={cn('font-black text-heading-lg block leading-tight', textColor)}>
              {word}
            </span>
          ))}
          {role && (
            <span className={cn('text-label opacity-60 mt-1 block', textColor)}>{role}</span>
          )}
        </div>
        {/* Brand mark — small ticket icon */}
        <div className="w-7 h-7 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
          <Ticket size={12} className={textColor} strokeWidth={2} />
        </div>
      </div>

      {/* Photo — bottom 65% of card */}
      <div className="mx-3 mb-3 rounded-xl overflow-hidden" style={{ height: '175px' }}>
        <img src={image} alt={name} className="w-full h-full object-cover object-top" />
      </div>
    </div>
  );
}
```

---

### Shape 8: Photo Mosaic Grid
**Source**: Image 3 (Jobply) — 3×2 grid of person photos, each on a different flat-color background. Grid is approximately 480×320px, cells are `rounded-xl`.

```tsx
// components/shapes/PhotoMosaic.tsx — used in hero section

const MOSAIC_COLORS = ['bg-amber', 'bg-indigo', 'bg-lime', 'bg-lemon', 'bg-lavender', 'bg-sky'];

export function PhotoMosaic({ photos }: { photos: string[] }) {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-2.5 rounded-2xl overflow-hidden"
      style={{ width: '480px', height: '320px' }}>
      {photos.slice(0, 6).map((photo, i) => (
        <div key={i} className={cn('relative rounded-xl overflow-hidden', MOSAIC_COLORS[i])}>
          <img src={photo} alt="" className="w-full h-full object-cover mix-blend-multiply" />
          {/* Corner rounding accent — sign-up button in top-right of last cell (Image 3) */}
          {i === 0 && (
            <div className="absolute top-2 right-2">
              <button className="bg-coral text-white text-label font-bold px-3 py-1.5 rounded-full text-xs">
                Buy Now
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. 🖼️ Unsplash Image Library {#images}

All images below are free to use under the **Unsplash License** (free for commercial use, no attribution required).

**Base URL pattern**: `https://images.unsplash.com/photo-{ID}?w=800&q=80`  
**Thumbnail URL**: `https://images.unsplash.com/photo-{ID}?w=400&q=70`

### How to use Unsplash images in React

```tsx
// Utility helper
export function unsplash(id: string, w = 800, q = 80) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}

// Usage:
<img src={unsplash('1493225457124-a3eb161ffa5f')} alt="Concert crowd" />
```

---

### 🎵 Music / Concerts (Category: coral bg)

| ID | Description | Photographer | URL |
|---|---|---|---|
| `1493225457124-a3eb161ffa5f` | Concert crowd from above, colorful stage lights | Aditya Chinchure | https://unsplash.com/photos/eNoeWZkO7Zc |
| `1470229722913-7c0e2dbbafd3` | Concert stage with crowd, orange/warm lighting | Vishnu R Nair | https://unsplash.com/photos/concert |
| `1501386761520-749d994e2b19` | Crowd hands in the air, festival energy | ActionVance | https://unsplash.com/photos/WvDYdXDzkhs |
| `1516450360452-9312f5e86fc7` | DJ performing on stage, blue lights | Nainoa Shizuru | https://unsplash.com/photos/live |
| `1429962714451-bb934ecdc4ec` | Live band performer on stage | Austin Neill | https://unsplash.com/photos/stage |
| `1571266752212-a0dc8ed8e5bb` | Singer with microphone, spotlight | Yvette de Wit | https://unsplash.com/photos/singer |

**Usage:**
```tsx
const MUSIC_IMAGES = [
  unsplash('1493225457124-a3eb161ffa5f'),  // hero mosaic cell 1
  unsplash('1470229722913-7c0e2dbbafd3'),  // hero mosaic cell 2
  unsplash('1501386761520-749d994e2b19'),  // hero mosaic cell 3
  unsplash('1516450360452-9312f5e86fc7'),  // music category featured
  unsplash('1429962714451-bb934ecdc4ec'),  // artist card
];
```

---

### 🏆 Sports (Category: lime bg)

| ID | Description | URL |
|---|---|---|
| `1540747913346-19378f05741b` | Stadium crowd cheering, green field | https://unsplash.com/photos/stadium |
| `1607962837359-5e7e89f86776` | Football match, aerial view | https://unsplash.com/photos/football |
| `1461896836934-ffe607ba8211` | Runner on track, motion blur | https://unsplash.com/photos/runner |
| `1574629810360-7efbbe195018` | Basketball game, stadium lights | https://unsplash.com/photos/basketball |

---

### 🎭 Arts & Culture (Category: sky bg)

| ID | Description | URL |
|---|---|---|
| `1508700115892-45ecd05ae2ad` | Ballet dancer on stage | https://unsplash.com/photos/ballet |
| `1513106580091-1d82408b8cd6` | Art museum, large colorful painting | https://unsplash.com/photos/museum |
| `1467810563316-b1aa2c9d3936` | Orchestra performing, golden light | https://unsplash.com/photos/orchestra |

---

### 😄 Comedy / Theatre (Category: lavender bg)

| ID | Description | URL |
|---|---|---|
| `1524178232363-1fb2b075b655` | Stand-up comedy, microphone spotlight | https://unsplash.com/photos/comedy |
| `1503095396549-807753d3f49a` | Theatre stage, dramatic lighting | https://unsplash.com/photos/theatre |

---

### 🍔 Food & Drink Events (Category: amber bg)

| ID | Description | URL |
|---|---|---|
| `1414235077428-338989a2e8c0` | Food festival tables, colorful dishes | https://unsplash.com/photos/food-festival |
| `1567521464027-f127ff144326` | Wine event, glasses, warm lighting | https://unsplash.com/photos/wine |

---

### 💻 Tech / Conferences (Category: indigo bg)

| ID | Description | URL |
|---|---|---|
| `1540575467537-af8d75aa9adb` | Conference hall, audience and stage | https://unsplash.com/photos/conference |
| `1559523161-0fc0d8b9d6f7` | Keynote speaker on large screen | https://unsplash.com/photos/keynote |

---

### 🎪 Festivals / Outdoor (Category: teal bg)

| ID | Description | URL |
|---|---|---|
| `1506157786151-b8491531ae59` | Outdoor music festival, daytime | https://unsplash.com/photos/outdoor-festival |
| `1533174072545-7a4b6ad7a6c3` | Festival lights at night, crowd | https://unsplash.com/photos/festival-night |

---

### 👨‍👩‍👧 Venue / Interior Shots

| ID | Description | URL |
|---|---|---|
| `1492684223066-81342ee5ff30` | Large concert arena interior | https://unsplash.com/photos/arena |
| `1577962917302-cd874c4e1d0e` | Theater interior, red seats | https://unsplash.com/photos/theater |
| `1566737236500-c8ac43014a67` | Stadium at night, lit up | https://unsplash.com/photos/stadium-night |

---

### Hero Section Mosaic (ready to use, 6 photos)

```tsx
// Hero mosaic: 6 photos that work well together on colored backgrounds
export const HERO_MOSAIC_PHOTOS = [
  unsplash('1493225457124-a3eb161ffa5f'),   // Concert crowd — coral bg
  unsplash('1540747913346-19378f05741b'),   // Stadium — indigo bg
  unsplash('1501386761520-749d994e2b19'),   // Hands up crowd — lime bg
  unsplash('1467810563316-b1aa2c9d3936'),   // Orchestra — lemon bg
  unsplash('1508700115892-45ecd05ae2ad'),   // Ballet — lavender bg
  unsplash('1414235077428-338989a2e8c0'),   // Food festival — sky bg
];
```

### Artist/Performer Portrait Cards (SwatchCard component)

```tsx
// For the HoneyGuide-style artist swatch cards (Image 2)
export const ARTIST_PHOTOS = [
  { name: 'Nour Khalil',    role: 'Pop · R&B',   image: unsplash('1544005313-94ddf0286df2'), bg: 'bg-white',   text: 'text-ink-DEFAULT' },
  { name: 'Marco Silva',    role: 'Electronic',  image: unsplash('1539571696357-5a69c17a67c6'), bg: 'bg-coral',   text: 'text-white' },
  { name: 'Yuki Tanaka',    role: 'Jazz',        image: unsplash('1507003211169-0a1dd7228f2d'), bg: 'bg-indigo',  text: 'text-white' },
  { name: 'Aisha Diallo',   role: 'World Music', image: unsplash('1531746020798-e6953c6e8e04'), bg: 'bg-lemon',   text: 'text-ink-DEFAULT' },
];
```

---

## 7. 🧩 Components {#components}

### Button

```tsx
// components/ui/Button.tsx
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'danger';
type ButtonSize    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  icon?:         LucideIcon;
  iconPosition?: 'left' | 'right';
  pill?:         boolean;
  loading?:      boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:   'bg-lemon   text-ink-DEFAULT hover:bg-lemon-dark   active:scale-[0.97]',
  secondary: 'bg-coral   text-white       hover:bg-coral-dark   active:scale-[0.97]',
  outline:   'border-2 border-ink-DEFAULT text-ink-DEFAULT bg-transparent hover:bg-ink-5',
  ghost:     'text-ink-60 hover:text-ink-DEFAULT hover:bg-ink-5 bg-transparent',
  dark:      'bg-ink-DEFAULT text-white   hover:bg-ink-80       active:scale-[0.97]',
  danger:    'bg-red-500    text-white    hover:bg-red-600      active:scale-[0.97]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8  px-4  text-[12px] font-semibold gap-1.5',
  md: 'h-11 px-6  text-[14px] font-semibold gap-2',
  lg: 'h-13 px-8  text-[16px] font-semibold gap-2.5',
  xl: 'h-16 px-10 text-[18px] font-semibold gap-3',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconPosition = 'right',
  pill = true, loading = false, className, children, disabled, ...props }: ButtonProps) {
  const iconSize = size === 'xl' ? 22 : size === 'lg' ? 20 : size === 'sm' ? 14 : 16;
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 select-none whitespace-nowrap',
        'disabled:opacity-50 disabled:pointer-events-none',
        pill ? 'rounded-full' : 'rounded-xl',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {!loading && Icon && iconPosition === 'left'  && <Icon size={iconSize} strokeWidth={2} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={iconSize} strokeWidth={2} />}
    </button>
  );
}
```

---

### Navbar

```tsx
// components/layout/Navbar.tsx
import { Ticket, Search, Bell, User, Menu } from 'lucide-react';

export function Navbar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const bg    = variant === 'dark' ? 'bg-ink-DEFAULT' : 'bg-white border-b border-ink-10';
  const text  = variant === 'dark' ? 'text-white'     : 'text-ink-DEFAULT';
  const muted = variant === 'dark' ? 'text-ink-20'    : 'text-ink-40';

  return (
    <nav className={cn('w-full h-[72px] flex items-center px-8 sticky top-0 z-50', bg)}>
      {/* Logo — lemon tile + wordmark */}
      <a href="/" className="flex items-center gap-2 mr-12 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-lemon flex items-center justify-center">
          <Ticket size={18} strokeWidth={2.5} className="text-ink-DEFAULT" />
        </div>
        <span className={cn('font-extrabold text-[16px] tracking-tight', text)}>
          My<span className="text-coral">Ticket</span>
        </span>
      </a>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 flex-1">
        {['Events', 'Artists', 'Venues', 'My Tickets'].map(label => (
          <a key={label} href={`/${label.toLowerCase().replace(' ', '-')}`}
            className={cn('text-[14px] font-medium transition-colors hover:text-coral', text)}>
            {label}
          </a>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        <button className={cn('w-9 h-9 rounded-full flex items-center justify-center hover:bg-ink-5', muted)}>
          <Search size={18} strokeWidth={2} />
        </button>
        <button className={cn('w-9 h-9 rounded-full flex items-center justify-center hover:bg-ink-5', muted)}>
          <Bell size={18} strokeWidth={2} />
        </button>
        <Button variant={variant === 'dark' ? 'primary' : 'dark'} size="sm">Sign In</Button>
      </div>
    </nav>
  );
}
```

---

### Category Tile (Image 1 style)

```tsx
// components/cards/CategoryTile.tsx
import { type LucideIcon } from 'lucide-react';

interface CategoryTileProps {
  label:    string;
  icon:     LucideIcon;
  color:    string;         // Tailwind bg + text e.g. 'bg-coral text-white'
  count?:   number;
  size?:    'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizes = {
  sm: { tile: 'w-[140px] h-[140px] p-4', icon: 48 },
  md: { tile: 'w-[180px] h-[180px] p-5', icon: 64 },
  lg: { tile: 'w-[220px] h-[220px] p-6', icon: 80 },
};

export function CategoryTile({ label, icon: Icon, color, count, size = 'md', onClick }: CategoryTileProps) {
  const s = sizes[size];
  return (
    <button onClick={onClick}
      className={cn(
        'rounded-3xl flex flex-col justify-between text-left',
        'transition-all duration-150 hover:scale-[1.04] active:scale-[0.97]',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-DEFAULT',
        color, s.tile
      )}>
      <div>
        <span className="font-bold text-[14px] leading-tight block">{label}</span>
        {count !== undefined && (
          <span className="text-[11px] opacity-60 mt-0.5 block">{count.toLocaleString()} events</span>
        )}
      </div>
      <Icon size={s.icon} strokeWidth={2} className="opacity-90" />
    </button>
  );
}
```

---

### Event Card

```tsx
// components/cards/EventCard.tsx
import { Calendar, MapPin, Ticket, Heart } from 'lucide-react';

export function EventCard({ title, category, accentColor, image, date, time,
  venue, city, priceFrom, currency = '$', isFeatured, isSoldOut, onSave, onClick }) {
  return (
    <div onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden shadow-card-sm
        hover:shadow-card-lg transition-all duration-200 cursor-pointer w-[280px] flex-shrink-0">

      {/* Image with colored bg */}
      <div className={cn('relative h-[180px] overflow-hidden', accentColor)}>
        <img src={image} alt={title}
          className="w-full h-full object-cover mix-blend-multiply
            group-hover:scale-[1.04] transition-transform duration-300" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="bg-white/90 backdrop-blur-sm text-ink-DEFAULT text-[11px] font-semibold px-3 py-1 rounded-full">
            {category}
          </span>
          {isFeatured && (
            <span className="bg-lemon text-ink-DEFAULT text-[11px] font-semibold px-3 py-1 rounded-full">
              Featured
            </span>
          )}
        </div>
        <button onClick={e => { e.stopPropagation(); onSave?.(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full
            flex items-center justify-center hover:bg-white transition-colors">
          <Heart size={14} strokeWidth={2} className="text-ink-DEFAULT" />
        </button>
        {isSoldOut && (
          <div className="absolute inset-0 bg-ink-DEFAULT/60 flex items-center justify-center">
            <span className="bg-white text-ink-DEFAULT font-black text-[14px] px-5 py-2 rounded-full rotate-[-8deg]">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-[18px] text-ink-DEFAULT leading-tight mb-2 line-clamp-2">{title}</h3>
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="flex items-center gap-2 text-[12px] text-ink-60">
            <Calendar size={13} strokeWidth={2} />
            <span>{date} · {time}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-ink-60">
            <MapPin size={13} strokeWidth={2} />
            <span>{venue}, {city}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-ink-10">
          <div>
            <span className="text-[11px] text-ink-40 block">From</span>
            <span className="font-black text-[20px] text-ink-DEFAULT">{currency}{priceFrom}</span>
          </div>
          <button className="flex items-center gap-1.5 font-semibold text-[12px] px-4 py-2.5
            bg-ink-DEFAULT text-white rounded-full hover:bg-ink-80 transition-colors">
            <Ticket size={13} strokeWidth={2} />
            {isSoldOut ? 'Sold Out' : 'Get Tickets'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Ticket Stub Card

```tsx
// components/cards/TicketStub.tsx
import { QrCode } from 'lucide-react';

export function TicketStub({ eventTitle, date, time, venue, seat, section,
  accentColor, textColor = 'text-white', status = 'upcoming' }) {
  return (
    <div className="flex w-[380px] flex-shrink-0 shadow-ticket rounded-2xl overflow-hidden">
      <div className={cn('flex-1 p-6 flex flex-col justify-between', accentColor, textColor,
        status === 'used' && 'opacity-50')}>
        <div>
          <span className="text-[10px] opacity-60 uppercase tracking-[0.14em] block mb-2">
            {status === 'used' ? '✓ Used' : status === 'cancelled' ? '✕ Cancelled' : '● Upcoming'}
          </span>
          <h3 className="font-black text-[22px] leading-tight mb-3">{eventTitle}</h3>
          <div className="flex flex-col gap-1 opacity-80 text-[14px]">
            <span className="font-medium">{date} · {time}</span>
            <span>{venue}</span>
            {section && <span className="text-[12px] opacity-70">Section {section}{seat ? ` · Seat ${seat}` : ''}</span>}
          </div>
        </div>
        {/* Perforation dots */}
        <PerforationDots color="rgba(255,255,255,0.25)" />
      </div>
      {/* QR stub */}
      <div className={cn('w-[88px] flex flex-col items-center justify-center p-4 border-l border-dashed border-white/30', accentColor, textColor)}>
        <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-2">
          <QrCode size={28} strokeWidth={1.5} className="opacity-80" />
        </div>
        <span className="text-[9px] font-semibold opacity-60 text-center uppercase tracking-wider">
          Scan<br/>Entry
        </span>
      </div>
    </div>
  );
}
```

---

### Stat Bubble (Image 5 style)

```tsx
// components/ui/StatBubble.tsx
export function StatBubble({ label, value, color = 'bg-ink-DEFAULT text-white' }) {
  return (
    <div className={cn('rounded-[28px] px-6 py-5 flex flex-col gap-1 shadow-blob', color)}>
      <span className="text-[12px] font-medium opacity-60">{label}</span>
      <span className="font-black text-[36px] leading-none font-mono">{value}</span>
    </div>
  );
}
// Note: font-mono applies Space Grotesk to the number (as per token config)
```

---

### Slider (Image 4 style)

```tsx
// components/ui/Slider.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

export function Slider({ title, overline, children, viewAllHref }) {
  const ref = useRef(null);
  const scroll = dir => ref.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-6">
        <div>
          {overline && <span className="text-[11px] text-ink-40 uppercase tracking-[0.14em] block mb-1">{overline}</span>}
          {title && <h2 className="font-black text-[40px] leading-[1.12] tracking-[-0.015em] text-ink-DEFAULT">{title}</h2>}
        </div>
        <div className="flex items-center gap-3">
          {viewAllHref && <a href={viewAllHref} className="text-[14px] font-semibold text-ink-DEFAULT hover:underline underline-offset-2 mr-2">View All</a>}
          {/* Black circle nav buttons — Image 4 style */}
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-ink-DEFAULT text-white flex items-center justify-center hover:bg-ink-80 transition-colors">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-ink-DEFAULT text-white flex items-center justify-center hover:bg-ink-80 transition-colors">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-1 px-1">
        {children}
      </div>
    </div>
  );
}
```

---

### Badge / Tag Chip

```tsx
export function Badge({ label, variant = 'default', color = '', dot = false }) {
  const variants = {
    default:  'bg-ink-5    text-ink-60',
    colored:  color,
    outline:  'border border-ink-20 text-ink-60',
    dark:     'bg-ink-DEFAULT text-white',
    success:  'bg-lime     text-ink-DEFAULT',
    warning:  'bg-amber    text-ink-DEFAULT',
    danger:   'bg-coral    text-white',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold', variants[variant])}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />}
      {label}
    </span>
  );
}
```

---

## 8. 📐 Page Section Templates {#sections}

### Section Layout Map

```
/                     ← Homepage
  ├── Navbar           [LIGHT — white bg]
  ├── Hero             [DARK — bg-ink-DEFAULT]
  │     Headline + SearchBar + CrossPattern (shapes)
  │     PhotoMosaic (6 Unsplash photos) + PhotoCluster (StatBubbles + Starburst)
  ├── Category Grid    [WHITE — bg-white]
  │     "What are you into?" + 10 CategoryTiles (Image 1 style)
  ├── Featured Slider  [WHITE — bg-white]
  │     Slider of FeaturedEventCards (Image 4 style)
  ├── Upcoming Grid    [TINT — bg-surface-tint]
  │     DateFilter + 8 EventCards (Image 3 style)
  ├── Artist Spotlight [DARK — bg-ink-DEFAULT]
  │     4 SwatchCards (Image 2 HoneyGuide style)
  ├── Stats Banner     [WHITE — bg-white]
  │     StatBubbles + PhotoCluster (Image 5 Connecto style)
  ├── CTA Banner       [DARK — bg-ink-DEFAULT]
  │     Email signup + Starburst ornaments
  └── Footer           [DARK — bg-ink-DEFAULT]
```

### Hero Section (Dark)

```tsx
<section className="bg-ink-DEFAULT min-h-screen flex items-center px-8 py-20 relative overflow-hidden">
  {/* Background decorative shapes */}
  <Starburst size={48} color="#FFFFFF" className="absolute top-16 right-48 opacity-20" />
  <Starburst size={24} color="#F5E642" filled className="absolute bottom-24 left-96 opacity-60" />
  <div className="w-64 h-64 rounded-full bg-coral/10 absolute -top-16 -left-16" />
  <div className="w-40 h-40 rounded-full bg-indigo/15 absolute bottom-0 right-0" />

  <div className="max-w-[1280px] mx-auto w-full grid grid-cols-2 gap-16 items-center relative z-10">
    <div className="flex flex-col gap-6">
      {/* Cross pattern ornament (Image 2 HoneyGuide) */}
      <CrossPattern />
      <h1 className="font-extrabold text-[72px] text-white leading-[1.0] tracking-[-0.03em]">
        Find Tickets<br/><span className="text-lemon">to Anything.</span>
      </h1>
      <p className="text-[18px] text-ink-20 max-w-[440px] leading-relaxed">
        Concerts, sports, comedy, theatre — discover and book tickets for every live experience.
      </p>
      <SearchBar />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] text-ink-40">Trending:</span>
        {['Coldplay', 'Champions League', 'F1 Grand Prix'].map(t => (
          <Badge key={t} label={t} variant="outline" />
        ))}
      </div>
    </div>

    <div className="flex flex-col items-end gap-6">
      <PhotoMosaic photos={HERO_MOSAIC_PHOTOS} />
      <div className="flex gap-3">
        <StatBubble label="Live Events"  value="8,240+" color="bg-lemon text-ink-DEFAULT" />
        <StatBubble label="Tickets Sold" value="2.1M"   color="bg-coral text-white" />
      </div>
    </div>
  </div>
</section>
```

### Artist Spotlight Section (Dark — Image 2 style)

```tsx
<section className="bg-ink-DEFAULT px-8 py-16">
  <div className="max-w-[1280px] mx-auto">
    <div className="flex justify-between items-end mb-10">
      <div>
        <span className="text-[11px] text-ink-40 uppercase tracking-[0.14em] block mb-2">
          Performing Soon
        </span>
        <h2 className="font-extrabold text-[48px] text-white uppercase leading-none tracking-[-0.02em]">
          Hot Artists
        </h2>
      </div>
      <CrossPattern />
    </div>
    <div className="flex gap-4">
      {ARTIST_PHOTOS.map(artist => (
        <SwatchCard key={artist.name} {...artist} />
      ))}
    </div>
  </div>
</section>
```

### Stats + Photo Cluster Section (Image 5 Connecto style)

```tsx
<section className="bg-white px-8 py-20">
  <div className="max-w-[1280px] mx-auto grid grid-cols-2 gap-16 items-center">
    <div>
      <span className="text-[11px] text-ink-40 uppercase tracking-[0.14em] block mb-4">By the numbers</span>
      <h2 className="font-extrabold text-[56px] text-ink-DEFAULT leading-[1.05] tracking-[-0.025em] mb-6">
        The world's<br/>biggest events
      </h2>
      <p className="text-[16px] text-ink-60 leading-relaxed max-w-[380px]">
        Join millions of fans who discover, book, and experience live events through My Ticket.
      </p>
      <Button variant="dark" size="lg" icon={ArrowRight} className="mt-8">Explore Events</Button>
    </div>
    <PhotoCluster photos={HERO_MOSAIC_PHOTOS} />
  </div>
</section>
```

---

## 9. ⚙️ Full Tailwind Config {#config}

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        // Download: https://fonts.google.com/specimen/Plus+Jakarta+Sans
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        // Download: https://fonts.google.com/specimen/Space+Grotesk
        mono: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        coral:    { DEFAULT: '#FF6B4A', light: '#FFB8A8', dark: '#CC4A2E' },
        lemon:    { DEFAULT: '#F5E642', light: '#FDF4A0', dark: '#C9BC1A' },
        lime:     { DEFAULT: '#BAFF39', light: '#DFFFAA', dark: '#86D400' },
        sky:      { DEFAULT: '#A8C9F0', light: '#D6E9FF', dark: '#5A99D4' },
        lavender: { DEFAULT: '#C4B5F4', light: '#E8E2FF', dark: '#8B72E0' },
        mint:     { DEFAULT: '#4DFFC3', light: '#A8FFE5', dark: '#00C990' },
        teal:     { DEFAULT: '#6ECFB0', light: '#B8EEE0', dark: '#3DA080' },
        amber:    { DEFAULT: '#F4A05A', light: '#FFDCB8', dark: '#C47020' },
        blush:    { DEFAULT: '#F9B8C4', light: '#FFE4EA', dark: '#D4708A' },
        indigo:   { DEFAULT: '#3355FF', light: '#A8B8FF', dark: '#1A35CC' },
        ink: {
          DEFAULT: '#0D0D0D', 90: '#1A1A1A', 80: '#2E2E2E',
          60: '#555555', 40: '#888888', 20: '#BBBBBB', 10: '#E5E5E5', 5: '#F5F5F5',
        },
        surface: {
          page: '#FFFFFF', tint: '#F5F5F5', warm: '#F0EDE6',
          dark: '#0D0D0D', card: '#FFFFFF',
        },
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card-sm': '0 2px 8px  rgba(0,0,0,0.06)',
        'card-md': '0 4px 16px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 32px rgba(0,0,0,0.10)',
        'card-xl': '0 16px 48px rgba(0,0,0,0.12)',
        'blob':    '0 12px 40px rgba(0,0,0,0.15)',
        'ticket':  '0 4px 0px  rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 📦 Required Packages

```bash
# Core
npm install lucide-react clsx tailwind-merge class-variance-authority

# Fonts via npm (recommended)
npm install @fontsource/plus-jakarta-sans @fontsource/space-grotesk

# shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card badge dialog sheet tabs
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    background-color: #FFFFFF;
    color: #0D0D0D;
    -webkit-font-smoothing: antialiased;
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
}
```

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Unsplash image helper
export function unsplash(id: string, w = 800, q = 80) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`;
}
```

---

## 🔗 Quick Reference Links

| Resource | URL |
|---|---|
| Plus Jakarta Sans (Google Fonts) | https://fonts.google.com/specimen/Plus+Jakarta+Sans |
| Plus Jakarta Sans (GitHub) | https://github.com/tokotype/PlusJakartaSans |
| Space Grotesk (Google Fonts) | https://fonts.google.com/specimen/Space+Grotesk |
| Lucide Icons Browser | https://lucide.dev/icons |
| Lucide React npm | https://www.npmjs.com/package/lucide-react |
| Lucide Figma Plugin | https://www.figma.com/community/plugin/1059657763925706415 |
| Unsplash (concerts) | https://unsplash.com/s/photos/concert |
| Unsplash (festivals) | https://unsplash.com/s/photos/festival-crowd |
| Unsplash (sports) | https://unsplash.com/s/photos/stadium |
| Unsplash (theatre) | https://unsplash.com/s/photos/theatre |
| Tailwind CSS Docs | https://tailwindcss.com/docs |
| shadcn/ui Docs | https://ui.shadcn.com/docs |

---

*My Ticket Design System v2.0 — Generated April 2026. Pixel analysis of 5 reference images.*