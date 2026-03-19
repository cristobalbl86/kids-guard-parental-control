# Kids Guard - Website

Marketing website for the **Kids Guard - Parental Control** Android app. Built with Next.js 15, Tailwind CSS 4, and Framer Motion.

**Live App**: [Google Play Store](https://play.google.com/store/apps/details?id=com.kidsguard)

## Quick Start

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
website/
├── src/
│   ├── app/                    # Pages (Next.js App Router)
│   │   ├── page.tsx            # Landing page
│   │   ├── contact/page.tsx    # Developer contact page
│   │   └── privacy/page.tsx    # Privacy policy
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── sections/           # Landing page sections
│   │   └── ui/                 # Reusable components
│   └── lib/
│       ├── constants.ts        # All content, URLs, feature data, Formspree ID
│       └── utils.ts            # Utility functions
├── public/
│   └── images/
│       ├── screenshots/        # App screenshots (replace placeholders!)
│       └── google-play-badge.svg
└── package.json
```

## Customization

### Replace Screenshot Placeholders

The screenshots in `public/images/screenshots/` are SVG placeholders. Replace them with real device screenshots:

1. Take screenshots from your Android device or emulator
2. Recommended size: **1080 x 2340px** (or any 9:19.5 aspect ratio)
3. Save as PNG or WebP files
4. Replace the files in `public/images/screenshots/`:
   - `screenshot-1.svg` → **Welcome Screen** (rename to `.png` or `.webp`)
   - `screenshot-2.svg` → **Home Dashboard**
   - `screenshot-3.svg` → **Parent Settings**
   - `screenshot-4.svg` → **Screen Time**
   - `screenshot-5.svg` → **PIN Entry**
5. Update file extensions in `src/lib/constants.ts` if you change from `.svg` to `.png`

### Update Content

All website content is centralized in `src/lib/constants.ts`:

- **APP_META**: App name, version, Play Store URL, developer info
- **FEATURES**: Feature cards data
- **BENEFITS**: Parent and kid benefits
- **TECH_STACK**: Technologies used
- **NAV_LINKS**: Navigation menu items

### Change Colors/Branding

Brand colors are defined as CSS custom properties in `src/app/globals.css` under `@theme`:

```css
@theme {
  --color-brand-primary: #4A90E2;
  --color-brand-secondary: #50C878;
  --color-brand-accent: #F5A623;
  --color-brand-error: #E74C3C;
  --color-brand-bg: #F5F7FA;
  --color-brand-text: #2C3E50;
}
```

## Contact Form Setup (Formspree)

The contact form uses [Formspree](https://formspree.io) to send emails. Formspree is free for up to 50 submissions/month — no backend, no database, no environment variables needed.

### Setup (2 minutes)

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and set the recipient email (e.g. `cristobalbtech@gmail.com`)
3. Copy your **Form ID** (e.g. if your endpoint is `https://formspree.io/f/xrgvalbn`, the ID is `xrgvalbn`)
4. Paste it into `src/lib/constants.ts`:

```ts
export const FORMSPREE_ID = 'xrgvalbn'; // Replace with your actual form ID
```

That's it. Form submissions will be emailed directly to you.

> **Note**: Without a Formspree ID, the form will show a friendly "email us directly" message. The rest of the website works fine without it.

## Deployment

### Vercel (Recommended)

The easiest way to deploy:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Set the **Root Directory** to `website`
4. Deploy

Or via CLI:

```bash
cd website
npx vercel
```

### Netlify

1. Go to [netlify.com](https://www.netlify.com/) and connect your repository
2. Set build settings:
   - **Base directory**: `website`
   - **Build command**: `npm run build`
   - **Publish directory**: `website/out`
3. Deploy

### Static Export (Any Host)

The website is configured for static export (`output: 'export'` in `next.config.ts`). After building, the `out/` directory contains pure static HTML/CSS/JS that can be hosted anywhere:

```bash
cd website
npm run build
# Upload the 'out/' folder to any static host (GitHub Pages, S3, Firebase Hosting, etc.)
```

### GitHub Pages

1. Build the site: `cd website && npm run build`
2. The `out/` directory is your static site
3. Configure GitHub Pages to serve from the `out/` directory, or use the `gh-pages` package:

```bash
npx gh-pages -d out
```

## Custom Domain Setup

### Vercel
1. Go to your project settings on Vercel
2. Navigate to Domains
3. Add your domain and follow DNS configuration instructions

### Netlify
1. Go to your site settings on Netlify
2. Navigate to Domain Management
3. Add your custom domain and update DNS records

### DNS Records (General)
- **A Record**: Point `@` to your hosting provider's IP
- **CNAME Record**: Point `www` to your hosting provider's domain

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org/) | React framework with App Router |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Scroll animations |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Formspree](https://formspree.io/) | Contact form emails |
| TypeScript | Type safety |

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (static export to `out/`) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## License

Part of the Kids Guard - Parental Control project.
