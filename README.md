# Subtle Psychonaut® — Site Rebuild

Apple-clean, cosmic redesign of subtlepsychonaut.com. Four pages, shared design system, working cart, Stripe-ready.

## Preview

Open `index.html` in a browser (internet required — product imagery/videos and fonts are hosted).

## Structure

```
index.html        Home — hero, product feature videos, essence explainer, coming soon
shop.html         Shop — product grid, size variants, cart drawer, checkout stub
about.html        Story, how-to-use, testimonial
contact.html      Contact form, wholesale, newsletter
assets/css/style.css   Design system (colors, type, components)
assets/js/main.js      Catalog, cart, starfield, animations, IMG/VID registries
```

## Product imagery

- Shop + feature imagery: **client-approved AI recreations of her current bottles/labels** (Higgsfield CDN).
- Feature videos: approved zoom-in renders with moving essence background (Higgsfield CDN).
- Story sections: her original photography (Squarespace CDN).

**Before launch:** download all URLs listed in the `IMG`/`VID` registries at the top of `assets/js/main.js` into `assets/img/` and `assets/video/`, then update those paths. (CDN links — especially Squarespace — will break if her old hosting is cancelled.)

## Stripe integration (when ready)

Everything funnels through `checkout()` in `assets/js/main.js` (clearly marked). Two options documented inline:

1. **Payment Links** (no backend): create one per variant in the Stripe dashboard, map `sku → url`, redirect.
2. **Checkout Sessions** (proper): small backend endpoint creates a session from cart lines; each variant already has a `priceId` field waiting for its Stripe price ID.

Cart state persists in `localStorage` (`sp_cart_v1`).

## Still stubbed

- Contact + newsletter forms show a confirmation toast but don't send anywhere — wire to a form service (Formspree etc.) or backend, and connect newsletter to her email platform (the 10%-off promise needs a real code/automation).
- "Coming soon" (Cacao & Mapacho) links to contact for notify — could become a proper waitlist.
- New label design teaser: copy mentions "refreshed label in the works"; drop in real renders when her new label exists.
