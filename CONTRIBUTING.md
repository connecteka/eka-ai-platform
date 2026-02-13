# Contributing to EKA-AI Platform

## Development Setup

```bash
git clone https://github.com/ekaaiurgaa-glitch/eka-ai-platform.git
cd eka-ai-platform
npm install
npm run dev
```

## Design System (Dark Mode)

### Color Palette

Our design system uses a Dark Mode color scheme with the following hex codes:

| Token | Hex Code | Usage |
|-------|----------|-------|
| `brand-orange` | `#F45D3D` | Accent color, buttons, highlights |
| `background` | `#0D0D0D` | Primary background (body, main areas) |
| `background-alt` | `#1B1B1D` | Card backgrounds, elevated surfaces |
| `text-primary` | `#FFFFFF` | Primary text, headings |
| `text-secondary` | `#E5E5E5` | Secondary text, descriptions |
| `border` | `#333333` | Subtle borders, dividers |

### Tailwind Classes

```jsx
// Backgrounds
<div className="bg-background">      {/* Primary background #0D0D0D */}
<div className="bg-background-alt">  {/* Card background #1B1B1D */}

// Text
<p className="text-text-primary">   {/* Primary text #FFFFFF */}
<p className="text-text-secondary"> {/* Secondary text #E5E5E5 */}
<p className="text-brand-orange">   {/* Accent text #F45D3D */}

// Borders
<div className="border border-border"> {/* Subtle border #333333 */}
```

## Code Standards

- **TypeScript:** All new code must be typed
- **Components:** Use functional components with hooks
- **Styling:** Tailwind CSS only, following the Dark Mode design system

## Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Design system or styling changes
```

## Questions?

Contact: tech@go4garage.com
