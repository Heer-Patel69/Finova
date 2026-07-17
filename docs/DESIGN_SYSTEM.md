# Finova - Neo-Brutalist Design System

## Version 1.0

This design system defines the color palette, typography, visual tokens, and Tailwind configuration guidelines to achieve the **Neo-Brutalist** aesthetic specified in the Finova PRD.

---

## 1. Visual Principles & Constraints

Neo-Brutalism rejects typical modern UI trends (like gradients, soft drop shadows, glassmorphism, and thin borders) in favor of high-contrast, structural, and flat UI elements.

| Principle | Guideline |
|---|---|
| **Borders** | Bold, solid black borders (`#000000`, size `2px` or `3px`). |
| **Shadows** | Flat, offset hard-black shadows (`shadow-[4px_4px_0px_0px_#000000]`). No blur. |
| **Corners** | Sharp or slightly rounded corners (`rounded-none` or `rounded-xl`). |
| **Animations**| Minimal, snappy micro-interactions. Pre-rendered layouts. No heavy transitions. |
| **Layout** | Flat grid lines, clean blocks, high readability, and extreme clarity. |

---

## 2. Color Palette

```
===========================================================
Primary: Finova Yellow (#FFE81A) | Secondary: Pure Black (#000000)
Background: Soft White (#FBFBF9) | Card Background: Pure White (#FFFFFF)
Success: Emerald Green (#2DDC73) | Warning: Alert Orange (#FF8B20)
Error: Crimson Red (#FF3E3E)
===========================================================
```

- **Primary**: `#FFE81A` (Yellow) - Used for primary action buttons, key metrics, and stream indicators.
- **Secondary**: `#000000` (Black) - Used for all borders, shadows, headings, and body copy.
- **Background**: `#FBFBF9` (Soft Warm White) - Default canvas background color.
- **Card Fill**: `#FFFFFF` (Pure White) - Inner container backgrounds.
- **Success**: `#2DDC73` - Financial health green, income, budget compliance.
- **Warning**: `#FF8B20` - Approaching budget cap, goal lag.
- **Error**: `#FF3E3E` - Over budget alerts, failed settlements.

---

## 3. Typography

- **Headings**: **Space Grotesk** (Sans-Serif, high geometric personality, bold weights).
- **Body & Captions**: **Inter** (High readability, neutral, readable at small phone screens).

---

## 4. Tailwind CSS Configurations

Add the following to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        finovaYellow: '#FFE81A',
        finovaBlack: '#000000',
        finovaBg: '#FBFBF9',
        finovaWhite: '#FFFFFF',
        finovaSuccess: '#2DDC73',
        finovaWarning: '#FF8B20',
        finovaError: '#FF3E3E',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #000000',
        brutalActive: '1px 1px 0px 0px #000000',
      },
      borderWidth: {
        brutal: '2px',
        brutalThick: '3px',
      }
    },
  },
  plugins: [],
}
```

---

## 5. Base Components Spec

### 5.1 The Neo-Brutalist Card
A flat container with a thick black outline and offset shadow.

```html
<div class="bg-white border-2 border-black rounded-xl p-6 shadow-brutal hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_0px_#000000] transition-all">
  <h3 class="font-heading font-bold text-xl mb-2 text-black">Card Title</h3>
  <p class="font-body text-gray-700">Detailed component text goes here.</p>
</div>
```

### 5.2 The Primary Button
Interactive element that shifts when clicked to simulate physical depression.

```html
<button class="bg-finovaYellow font-heading font-bold px-6 py-3 border-2 border-black rounded-xl shadow-brutal active:translate-y-[3px] active:translate-x-[3px] active:shadow-brutalActive transition-all text-black">
  Save Transaction
</button>
```

### 5.3 Input Fields
Clear, high-contrast inputs for rapid offline data entry.

```html
<input 
  type="number" 
  placeholder="0.00" 
  class="w-full bg-white border-2 border-black rounded-xl p-4 font-body text-lg text-black focus:outline-none focus:bg-finovaYellow/10 transition-colors"
/>
```

---

## 6. Mobile-First Layout Grid

- **Bottom Navigation Bar**: Fixed bottom panel containing 5 tabs (Home, Transactions, ADD [Central Yellow Plus Button], Goals, Profile).
- **Add Screen Overlay**: Clicking the central "Add" button opens a fullscreen, zero-scroll interface designed to enter amounts and press "Save" under 5 seconds.
