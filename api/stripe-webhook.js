/* Stripe webhook receiver.
   Requires env vars STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (from the
   webhook endpoint's "Signing secret" in the Stripe dashboard).
   Endpoint URL to register in Stripe: https://<your-domain>/api/stripe-webhook
   Event to listen for: checkout.session.completed */

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  // Signature verification needs the raw request body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object;
      console.log(
        "✦ Order completed:",
        s.id,
        (s.amount_total / 100).toFixed(2),
        s.currency?.toUpperCase(),
        s.customer_details?.email,
        s.shipping_details?.address?.city
      );
      // TODO fulfillment: email Hilarey the order, decrement inventory, etc.
      break;
    }
    default:
      console.log("Unhandled event:", event.type);
  }

  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
