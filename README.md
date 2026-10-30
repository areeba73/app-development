# App Development — Hero / Landing Page

A single-page marketing site built with **plain HTML, CSS and vanilla JavaScript** (no frameworks or build step). It is a faithful recreation of a Framer reference design, with a dark/light theme and animated hero.

## Features

- **Animated hero** — flowing canvas aurora background, floating particles, a tilted phone (aura) mockup, and floating "chips" that continuously rotate with an eased spin.
- **Dark / light mode** — toggle in the header; the choice is saved to `localStorage` and restored before first paint.
- **Scroll-reveal animations** — section headings, cards and app-UI elements animate in on scroll.
- **Sections** — Expertise, Concept Lab, Flight Plan, Built Different, Toolkit (marquee), Pricing, Testimonials (carousel) and a closing CTA.
- **Responsive** — desktop, laptop, tablet and mobile, with a mobile menu.
- **Accessibility** — respects `prefers-reduced-motion`.

## Structure

```
index.html        Markup for all sections
css/styles.css    Design system, layout, responsive rules and keyframes
js/main.js        Theme toggle, scroll reveals, hero animations, carousel
```

## Running locally

It's a static site — open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Tech

- HTML5, CSS3 (custom properties, grid/flex), vanilla JavaScript
- Fonts: Oxanium (display), Exo 2 (labels), Inter (body) via Google Fonts
