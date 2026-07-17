/* Creates a Stripe Checkout session from the site's cart.
   Requires env var STRIPE_SECRET_KEY (set in Vercel → Settings → Environment Variables). */

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* Only these live price IDs can be purchased through this endpoint.
   REPLACE the placeholders with the real price_... IDs from the Stripe dashboard. */
const ALLOWED_PRICES = new Set([
  "price_1Tu0aJGWZGeGjGROF8SZDc2Q", // Vine & Leaf (Ayahuasca) 30ml — $30
  "price_1Tu0bJGWZGeGjGROrdtNC3jY", // Vine & Leaf (Ayahuasca) 60ml — $40
  "price_1Tu0bfGWZGeGjGRO7BpVnHuO", // Flower of the Fungi (Psilocybe) 30ml — $30
  "price_1Tu0brGWZGeGjGROHzheMcfT", // Flower of the Fungi (Psilocybe) 60ml — $40
]);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe not configured yet" });
  }

  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Empty cart" });
    }

    const line_items = items.map(({ price, quantity }) => {
      if (!ALLOWED_PRICES.has(price)) throw new Error("Unknown price: " + price);
      const qty = Math.max(1, Math.min(20, parseInt(quantity, 10) || 1));
      return { price, quantity: qty };
    });

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: false },
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop.html?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("checkout error:", err.message);
    return res.status(500).json({ error: "Unable to start checkout" });
  }
};
