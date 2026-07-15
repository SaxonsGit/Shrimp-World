const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
require("dotenv").config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    const lineItems = cart.map((item) => {
  const price = Number(item.price);
  const qty = Number(item.qty) || 1;

  if (!price || price <= 0) {
    throw new Error("Invalid price in cart");
  }

  return {
    price_data: {
      currency: "usd",
      product_data: {
        name: item.variant
          ? `${item.name} - ${item.variant}`
          : item.name || "Shrimp World Item",
      },
      unit_amount: Math.round(price * 100),
    },
    quantity: qty,
  };
});

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "2-Day Shipping",
        },
        unit_amount: 2499,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.DOMAIN}/success.html`,
      cancel_url: `${process.env.DOMAIN}/index.html`,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      phone_number_collection: {
        enabled: true,
      },
      automatic_tax: {
  enabled: false,
},
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to create checkout session." });
  }
});

app.listen(4242, () => {
  console.log("Shrimp World Stripe server running on port 4242");
});