# Responsive Portfolio: Jayden Pereira

Single-page responsive portfolio for **Lab Assignment WEEK06, HCI Lab**.
Built with HTML5, CSS3 and a small amount of vanilla JavaScript. The site is fully readable without JavaScript; the script only adds extras.

- **Live site:** `https://YOUR-USERNAME.github.io/portfolio/`
- **Design (Figma/Canva):** `PASTE LINK HERE`

## Purpose and audience
A simple portfolio for a second-semester Computer Science student at BINUS International. Target audience: recruiters and academic supervisors looking for a quick overview of skills and projects.

## Structure
```
portfolio/
├── index.html
├── style.css
├── script.js
├── images/avatar.svg
└── README.md
```
Semantic elements used: `header`, `nav`, `main`, `section`, `article`, `footer`.

## JavaScript features
| Feature | What it does |
|---------|--------------|
| Theme toggle | Switches light/dark, saves the choice in `localStorage`, defaults to dark |
| Project filter | Builds filter buttons from each card's tags; `aria-pressed` and a live region announce changes |
| Copy email | Copies the email address to the clipboard and confirms with a label change |
| Motion | Scroll progress line, reveal on scroll, cursor spotlight on cards and skills |
| Navigation | Sticky bar that turns to frosted glass on scroll, highlights the section you are in, and collapses into a hamburger menu on small screens (keyboard accessible, closes on Esc, outside click or link tap) |
| Contact form | Builds a ready-to-send email from the name, topic and message fields; works without JavaScript too |
| Hero effects | Headline decodes from random glyphs on load, a rotating word types and erases, and a light particle network reacts to the cursor (pauses when off-screen or the tab is hidden) |
| Interaction | Cards and skill tiles tilt toward the cursor; buttons pull slightly toward it (mouse devices only) |
| Command palette | `Ctrl/Cmd + K` or `/` (or the Quick jump button) opens a searchable list to jump to sections, filter projects, email, copy the address, open GitHub or switch theme; arrow keys, Enter and Esc work |
| Local time | Live Jakarta time in the contact list using `Intl.DateTimeFormat` |
| Footer year | Keeps the copyright year current |

## Design decisions
| Item | Choice |
|------|--------|
| Colors | Black `#000000`, Ink `#F4F4F6`, Muted `#8C8C98`, one gradient `#4F8CFF` → `#A06BFF` → `#FF5CC8` (light theme: white background) |
| Fonts | Space Grotesk (headings), DM Sans (body) from Google Fonts |
| Layout | One centered column (`.wrap`, max 48em), Flexbox for cards and skills, `em` units |
| Breakpoints | 44em (hamburger menu, stacked contact), 40em (mobile layout) |
| Style | Minimal and futuristic: black surfaces, 1px hairlines, a single gradient used for text, buttons, borders and glow |
| Motion | Quick (0.25–0.5s): hero load-in, scroll reveal, scroll progress line, gradient borders and cursor spotlight on hover; hero effects, tilt and magnetic buttons are skipped entirely for reduced motion |

## Testing
- Browser DevTools device mode: desktop, tablet, mobile
- W3C HTML and CSS validators (run on the deployed URL)
- Keyboard focus visible on all links; reduced motion respected, theme toggle and filter work by keyboard

## Deployment
GitHub repository > Settings > Pages > Deploy from branch `main` / root.

## Credits
Avatar is an original SVG placeholder. Built with help from an AI assistant for layout ideas and syntax; all content was reviewed and customized by me.
