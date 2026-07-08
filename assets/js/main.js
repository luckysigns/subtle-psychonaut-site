/* ============================================================
   Subtle Psychonaut® — shared site JS
   Cart is Stripe-ready: see checkout() below.
   ============================================================ */

/* ---------- Image registry (swap paths here in one place) ----------
   NOTE FOR LAUNCH: these are hosted URLs (approved AI product shots on
   Higgsfield CDN + original photos on Squarespace CDN). Before going
   live, download them into assets/img/ and update the paths here. */
const IMG = {
  // Approved polished product shots — current labels, Apple-style
  ayahuasca: "https://d8j0ntlcm91z4.cloudfront.net/user_3G0lQGP4VZWUZp8ediTC8en9oKa/hf_20260708_004446_06e77dfb-4375-4aeb-badc-4056c9a84b3a.png",
  psilocybe: "https://d8j0ntlcm91z4.cloudfront.net/user_3G0lQGP4VZWUZp8ediTC8en9oKa/hf_20260708_004451_62667dbf-dfb3-4a60-800a-ffa72c6095bb.png",
  // Original photography (hers) for story/about sections
  ayahuascaOriginal: "https://static1.squarespace.com/static/64b9e7f03251ee572602e6d5/64bb46f681a08e68a53ec1fb/64bf383ac3f79d10f402f14b/1753736502202/IMG_1878.jpeg?format=1000w",
  psilocybeOriginal: "https://static1.squarespace.com/static/64b9e7f03251ee572602e6d5/64bb46f681a08e68a53ec1fb/64bf3ba7c3f79d10f402f256/1753737475817/IMG_1863.jpeg?format=1000w",
  lineup: "https://static1.squarespace.com/static/64b9e7f03251ee572602e6d5/t/64cd75815a0bde6b4484f557/1691186570834/IMG_1885.jpeg?format=1000w",
  journey: "https://images.squarespace-cdn.com/content/v1/64b9e7f03251ee572602e6d5/1691193587725-UVYA52HQ07RDUCTL521E/image-asset.jpeg?format=1000w",
  essenceWater: "https://images.squarespace-cdn.com/content/v1/64b9e7f03251ee572602e6d5/1694722048327-AUYEQ8OY0ZG1V9PMIT0V/image-asset.jpeg?format=1000w",
  essenceFlower: "https://images.squarespace-cdn.com/content/v1/64b9e7f03251ee572602e6d5/1694709242576-UE0R0LIWGEPELEMZ3HWV/image-asset.jpeg?format=1000w",
  gaia: "https://images.squarespace-cdn.com/content/v1/64b9e7f03251ee572602e6d5/1691961697414-896NQ8002DVIFCRMAEVM/image-asset.jpeg?format=1000w",
};

/* Product feature videos — approved renders (localize before launch) */
const VID = {
  ayahuasca: "https://d8j0ntlcm91z4.cloudfront.net/user_3G0lQGP4VZWUZp8ediTC8en9oKa/hf_20260708_012046_ddf5b531-36e2-4e37-8697-8ade0c0a8ef2.mp4",
  psilocybe: "https://d8j0ntlcm91z4.cloudfront.net/user_3G0lQGP4VZWUZp8ediTC8en9oKa/hf_20260708_012048_483281f2-bf89-417c-bf3c-4e854f3d5b50.mp4",
};

/* Apply registry to any element tagged data-img / data-video */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-img]").forEach((el) => {
    const key = el.getAttribute("data-img");
    if (IMG[key]) el.src = IMG[key];
  });
  document.querySelectorAll("[data-video]").forEach((el) => {
    const key = el.getAttribute("data-video");
    if (VID[key]) {
      el.muted = true;
      el.playsInline = true;
      el.loop = true;
      el.src = VID[key];
      if (IMG[key]) el.poster = IMG[key];
      el.closest(".video-pending")?.classList.remove("video-pending");
      el.play().catch(() => {}); // src set after load — autoplay needs an explicit nudge
    }
  });
});

/* ---------- Product catalog ---------- */
/* When Stripe is integrated, add stripe price IDs per variant, e.g.
   priceId: "price_1Abc..." — checkout() already passes them through. */
const PRODUCTS = [
  {
    id: "ayahuasca",
    name: "Ayahuasca Elixir",
    tagline: "Inner vision · energetic cleansing · connection",
    desc: "Vine and leaf in unity. Crafted to evoke the energetic imprint of the ayahuasca experience — structured water infused with vibrational frequency, stabilized with 25% alcohol. Zero plant material, alkaloids, or psychoactive compounds.",
    img: IMG.ayahuasca,
    variants: [
      { sku: "aya-30", size: "30ml", price: 30, available: true, priceId: null },
      { sku: "aya-60", size: "60ml", price: 40, available: true, priceId: null },
    ],
  },
  {
    id: "psilocybe",
    name: "Psilocybe Elixir",
    tagline: "Synaptic connection · harmony · communion",
    desc: "The flower of the fungi. Crafted to evoke the energetic imprint of the psilocybe experience — structured water infused with vibrational frequency, stabilized with 25% alcohol. Zero plant material, alkaloids, or psychoactive compounds.",
    img: IMG.psilocybe,
    variants: [
      { sku: "psi-30", size: "30ml", price: 30, available: false, priceId: null }, // sold out
      { sku: "psi-60", size: "60ml", price: 40, available: true, priceId: null },
    ],
  },
];

const COMING_SOON = [
  { name: "Cacao Elixir", note: "Heart opening · warmth" },
  { name: "Mapacho Elixir", note: "Grounding · clarity" },
];

/* ============================================================
   Cart (persists in localStorage where available)
   ============================================================ */
const CART_KEY = "sp_cart_v1";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return window.__memCart || [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    window.__memCart = cart;
  }
  renderCartCount();
}

function findVariant(sku) {
  for (const p of PRODUCTS) {
    const v = p.variants.find((v) => v.sku === sku);
    if (v) return { product: p, variant: v };
  }
  return null;
}

function addToCart(sku) {
  const hit = findVariant(sku);
  if (!hit || !hit.variant.available) return;
  const cart = loadCart();
  const line = cart.find((l) => l.sku === sku);
  if (line) line.qty += 1;
  else cart.push({ sku, qty: 1 });
  saveCart(cart);
  renderCartDrawer();
  toast(`${hit.product.name} (${hit.variant.size}) added to bag`);
}

function setQty(sku, qty) {
  let cart = loadCart();
  const line = cart.find((l) => l.sku === sku);
  if (!line) return;
  line.qty = qty;
  if (line.qty <= 0) cart = cart.filter((l) => l.sku !== sku);
  saveCart(cart);
  renderCartDrawer();
}

function cartSubtotal(cart) {
  return cart.reduce((sum, l) => {
    const hit = findVariant(l.sku);
    return sum + (hit ? hit.variant.price * l.qty : 0);
  }, 0);
}

/* ============================================================
   STRIPE CHECKOUT — integration point
   ------------------------------------------------------------
   When the Stripe account is ready, either:
   A) Simplest: create a Payment Link per variant in the Stripe
      dashboard, put them in a map { sku: url }, and redirect.
   B) Proper: run a tiny backend endpoint that creates a
      Checkout Session from the cart lines:

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(l => ({ price: findVariant(l.sku).variant.priceId, quantity: l.qty }))
        }),
      });
      const { url } = await res.json();
      window.location.href = url;
   ============================================================ */
async function checkout() {
  const cart = loadCart();
  if (!cart.length) return;
  toast("Checkout opens soon — Stripe integration in progress ✦");
}

/* ============================================================
   UI scaffolding injected on every page
   ============================================================ */
function injectChrome() {
  // Cart drawer + overlay + toast
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="cart-overlay" onclick="toggleCart(false)"></div>
    <aside class="cart-drawer" aria-label="Shopping bag">
      <div class="cart-head">
        <h3>Your Bag</h3>
        <button class="cart-close" onclick="toggleCart(false)" aria-label="Close bag">×</button>
      </div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-foot">
        <div class="cart-subtotal"><span>Subtotal</span><span id="cartSubtotal">$0.00</span></div>
        <div class="cart-note">Shipping calculated at checkout. Secure payment by Stripe — coming online soon.</div>
        <button class="btn btn-primary" onclick="checkout()">Check Out</button>
      </div>
    </aside>
    <div class="toast" id="toast"></div>`;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

function toggleCart(open) {
  const willOpen = open !== undefined ? open : !document.body.classList.contains("cart-open");
  document.body.classList.toggle("cart-open", willOpen);
  if (willOpen) renderCartDrawer();
}

function renderCartCount() {
  const n = loadCart().reduce((s, l) => s + l.qty, 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = n;
    el.classList.toggle("hidden", n === 0);
  });
}

function money(n) {
  return "$" + n.toFixed(2);
}

function renderCartDrawer() {
  const box = document.getElementById("cartItems");
  if (!box) return;
  const cart = loadCart();
  if (!cart.length) {
    box.innerHTML = `<div class="cart-empty">Your bag is empty.<br/>The essences await. ✦</div>`;
  } else {
    box.innerHTML = cart
      .map((l) => {
        const hit = findVariant(l.sku);
        if (!hit) return "";
        const { product, variant } = hit;
        return `
        <div class="cart-item">
          <img src="${product.img}" alt="${product.name}" />
          <div class="cart-item-info">
            <div class="name">${product.name}</div>
            <div class="meta">${variant.size} · Quantum Dosing™ Essence</div>
            <div class="qty-row">
              <button class="qty-btn" onclick="setQty('${l.sku}', ${l.qty - 1})" aria-label="Decrease">−</button>
              <span class="qty-val">${l.qty}</span>
              <button class="qty-btn" onclick="setQty('${l.sku}', ${l.qty + 1})" aria-label="Increase">+</button>
            </div>
            <button class="remove-btn" onclick="setQty('${l.sku}', 0)">Remove</button>
          </div>
          <div class="cart-item-price">${money(variant.price * l.qty)}</div>
        </div>`;
      })
      .join("");
  }
  const sub = document.getElementById("cartSubtotal");
  if (sub) sub.textContent = money(cartSubtotal(cart));
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------- Starfield ---------- */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 9000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.15 + 0.25,
      base: Math.random() * 0.5 + 0.15,
      speed: Math.random() * 1.6 + 0.4,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const tw = reduced ? 1 : 0.6 + 0.4 * Math.sin(t / 1000 * s.speed + s.phase);
      ctx.globalAlpha = s.base * tw;
      ctx.fillStyle = "#cdd3ff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (!reduced) requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(draw);
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  els.forEach((el) => {
    // Anything already in the viewport shows immediately — don't gate
    // above-the-fold content on observer timing.
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("visible");
    else io.observe(el);
  });
}

/* ---------- Nav ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
  // Active link highlight
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === here) a.classList.add("active");
  });
}

/* ---------- Fake form handlers (wire to a backend later) ---------- */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector("input[type=email]");
  if (input && input.value) {
    toast("Welcome to the field ✦ Your 10% code is on its way");
    input.value = "";
  }
  return false;
}

function handleContact(e) {
  e.preventDefault();
  toast("Message received — we'll be in touch ✦");
  e.target.reset();
  return false;
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  injectChrome();
  initStarfield();
  initReveal();
  initNav();
  renderCartCount();
});
