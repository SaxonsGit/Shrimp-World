export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { cart } = await request.json();

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return Response.json({ error: "Cart is empty." }, { status: 400 });
    }

    const line_items = cart.map((item) => {
      const price = Number(item.price);
      const qty = Number(item.qty) || 1;

      if (!price || price <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
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

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "2-Day Shipping",
        },
        unit_amount: 2499,
      },
      quantity: 1,
    });

    const params = new URLSearchParams();

    params.append("mode", "payment");
    params.append("success_url", `${env.DOMAIN}/success.html`);
    params.append("cancel_url", `${env.DOMAIN}/index.html`);
    params.append("shipping_address_collection[allowed_countries][0]", "US");
    params.append("phone_number_collection[enabled]", "true");
    params.append("automatic_tax[enabled]", "false");

    line_items.forEach((item, i) => {
      params.append(`line_items[${i}][price_data][currency]`, item.price_data.currency);
      params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
      params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount));
      params.append(`line_items[${i}][quantity]`, String(item.quantity));
    });

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      return Response.json({ error: session.error?.message || "Stripe error" }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}