/* Shrimp World - app.js
   Single-page sales site behaviors:
   - Countdown banner
   - Product grid (20 items), search/filter/sort, "View all"
   - In-page product "purchase page" view (gallery, variants, qty, related)
   - Cart count (local demo)
   - Reviews w/ star picker + localStorage persistence
   - Discount modal (corner ribbon + hero button) + newsletter
   - Toast notifications
*/

(() => {

  "use strict";

  /* -----------------------------
   * Helpers
   * ----------------------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const pad2 = (n) => String(n).padStart(2, "0");
  const money = (n) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      Number(n || 0)
    );

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const STORAGE = {
  CART: "sw_cart_v1",
  REVIEWS: "sw_reviews_v1",
  NEWSLETTER_EMAIL: "sw_newsletter_v1",
  DISCOUNT_EMAIL: "sw_discount_v1",

  ACCOUNTS: "sw_accounts_v1",
  REMEMBER_EMAIL: "sw_remember_email_v1",
  SESSION: "sw_session_v1"
};

  function safeJSONParse(v, fallback) {
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  }

  function toast(msg, ms = 2800) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-open");
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(() => el.classList.remove("is-open"), ms);
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function setActiveNavByHash(hash) {
    const links = $$(".nav__link");
    links.forEach((a) => a.classList.remove("is-active"));
    const match = links.find((a) => a.getAttribute("href") === hash);
    if (match) match.classList.add("is-active");
  }




  /* -----------------------------
   * Elements
   * ----------------------------- */
  const els = {
    year: $("#year"),

    // Countdown
    cdDays: $("#cdDays"),
    cdHours: $("#cdHours"),
    cdMins: $("#cdMins"),
    cdSecs: $("#cdSecs"),

    // Products
    productGrid: $("#productGrid"),
    productSearch: $("#productSearch"),
    categoryFilter: $("#categoryFilter"),
    sortSelect: $("#sortSelect"),
    viewAllBtn: $("#viewAllBtn"),

    // Product view
    productView: $("#productView"),
    closeProductView: $("#closeProductView"),
    pvMainImg: $("#pvMainImg"),
    pvThumbs: $("#pvThumbs"),
    pvTitle: $("#pvTitle"),
    pvPrice: $("#pvPrice"),
    pvCompare: $("#pvCompare"),
    pvVariants: $("#pvVariants"),
    qtyMinus: $("#qtyMinus"),
    qtyPlus: $("#qtyPlus"),
    qtyInput: $("#qtyInput"),
    addToCartBtn: $("#addToCartBtn"),
    buyNowBtn: $("#buyNowBtn"),
    morePaymentsBtn: $("#morePaymentsBtn"),
    pvFeatures: $("#pvFeatures"),
    pvSpecs: $("#pvSpecs"),
    pvDesc: $("#pvDesc"),
    pvRelated: $("#pvRelated"),

    // Header actions
    nav: $(".nav"),
    cartCount: $("#cartCount"),
    searchBtn: $("#searchBtn"),
    cartBtn: $("#cartBtn"),
    cartDropdown: $("#cartDropdown"),
    cartItems: $("#cartItems"),
    cartTax: $("#cartTax"),
    cartTotal: $("#cartTotal"),
    closeCartBtn: $("#closeCartBtn"),

    // Discount
    cornerDeal: $("#cornerDeal"),
    openDiscountBtn: $("#openDiscountBtn"),
   
    discountModal: $("#discountModal"),
    discountForm: $("#discountForm"),
    discountEmail: $("#discountEmail"),

    // Newsletter
    newsletterForm: $("#newsletterForm"),
    newsletterEmail: $("#newsletterEmail"),

    // Reviews
    writeReviewBtn: $("#writeReviewBtn"),
    reviewModal: $("#reviewModal"),
    reviewForm: $("#reviewForm"),
    reviewName: $("#reviewName"),
    reviewEmail: $("#reviewEmail"),
    starPick: $("#starPick"),
    reviewStars: $("#reviewStars"),
    reviewTitleInput: $("#reviewTitleInput"),
    reviewBody: $("#reviewBody"),
    reviewList: $("#reviewList"),
    avgStars: $("#avgStars"),
    avgRating: $("#avgRating"),
    reviewCount: $("#reviewCount"),
    bar5: $("#bar5"),
    bar4: $("#bar4"),
    bar3: $("#bar3"),
    bar2: $("#bar2"),
    bar1: $("#bar1"),
    count5: $("#count5"),
    count4: $("#count4"),
    count3: $("#count3"),
    count2: $("#count2"),
    count1: $("#count1"),
  };

  /* -----------------------------
   * Data
   * NOTE: Update image paths to match Drew's assets.
   * Recommended: ./assets/products/<slug>/1.jpg ... etc
   * ----------------------------- */
  const PRODUCTS = [
    {
      id: "Orangehornetcaridinashrimp",
      name: "Orange Hornet Caridina",
      category: "shrimp",
      featured: true,
      priceFrom: 199.99,
      compareAt: 249.99,
      badge: "Sale",
      images: [
        "./assets/products/Orangehornetcaridinashrimp/1.jpg",
        "./assets/products/Orangehornetcaridinashrimp/2.jpg",
        "./assets/products/Orangehornetcaridinashrimp/3.jpg",
        "./assets/products/Orangehornetcaridinashrimp/4.jpg",
      ],
      variants: [
        { label: "Single Shrimp (1)", price: 199.99 },
        { label: "5 Shrimp Pack", price: 899.99 },
      ],
      features: [
        "High-contrast pattern for display tanks",
        "Hardy, community-friendly shrimp",
        "Excellent algae grazers",
        "Thrives in planted aquariums",
        "Best color in stable parameters",
      ],
      specs: {
        "Scientific Name": "Caridina sp.",
        "Water Parameters": "pH 6.2–7.4 • GH 4–7 • KH 0–2",
        Temperature: "68–74°F",
        "Tank Size": "5+ gallons",
        Diet: "Biofilm, algae, high-quality shrimp food",
        Lifespan: "1–2 years",
        Size: "~1–1.5 inches",
      },
      desc:
        "A premium-grade Caridina with a bold tigerstripe pattern. (Ultra Rare) For enthusiests that are looking to add a very rare species to their collections",
    },

    {
      id: "orange-eye-red-tiger-lily",
      name: "Orange Eye Red Tiger Lily Caridina",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 75.99,
      badge: "Sale",
      images: [
        "./assets/products/orange-eye-red-tiger-lily/1.jpg",
        "./assets/products/orange-eye-red-tiger-lily/2.jpg",
        "./assets/products/orange-eye-red-tiger-lily/3.jpg",
        "./assets/products/orange-eye-red-tiger-lily/4.jpg",
      ],
      variants: [
        { label: "Single Shrimp (1)", price: 49.99 },
        { label: "5 Shrimp Pack", price: 249.99 },
      ],
      features: [
        "White and red striped body with orange eyes",
        "High-contrast collector line",
        "Best in stable planted tanks",
        "Peaceful and social shrimp",
        "Premium packing and handling",
      ],
      specs: {
        "Scientific Name": "Caridina sp",
        Temperature: "65–80°F",
        "Tank Size": "5+ gallons",
      },
      desc:
        "A standout shrimp with dramatic contrast — very rare and bright orange eyes. Perfect for collectors and display tanks.",
    },

    {
      id: "red-galaxy-fishbone",
      name: "Red Galaxy Fishbone Caridina",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 80.79,
      badge: "Sale",
      images: [
        "./assets/products/red-galaxy-fishbone/1.jpg",
        "./assets/products/red-galaxy-fishbone/2.jpg",
        "./assets/products/red-galaxy-fishbone/3.jpg",
        "./assets/products/red-galaxy-fishbone/4.jpg",
      ],
     variants: [
        { label: "5 Shrimp Pack", price: 49.99 },
        { label: "10 Shrimp Pack", price: 89.99 },
      ],
      features: [
        "Deep red coloration with galaxy markings",
        "Peaceful and social",
        "Great for planted tanks",
        "Natural algae and biofilm cleaners",
        "Premium care/packing standards",
      ],
      specs: {
        "Scientific Name": "Caridina sp.",
        "Water Parameters": "pH 6.2–7.4 • GH 4–7 • KH 0–2",
        Temperature: "68–74°F",
        "Tank Size": "5+ gallons",
        Diet: "Biofilm, algae, shrimp food",
        Lifespan: "1–2 years",
        Size: "~1–1.5 inches",
      },
      desc:
        "A vivid red galaxy fishbone variant with premium contrast. (Very High Grade) Great for collectors who want a bold centerpiece in a Caridina-focused setup.",
    },

    {
      id: "orange-boa",
      name: "Orange Boa Caridina",
      category: "shrimp",
      featured: true,
      priceFrom: 99.99,
      compareAt: 188.99,
      badge: "Sale",
      images: [
        "./assets/products/orange-boa/1.jpg",
        "./assets/products/orange-boa/2.jpg",
        "./assets/products/orange-boa/3.jpg",
        "./assets/products/orange-boa/4.jpg",
      ],
      variants: [
        { label: "Single Shrimp (1)", price: 99.99 },
        { label: "5 Shrimp Pack", price: 474.99 },
      ],
      features: [
        "Premium orange patterning",
        "High-end collector grade",
        "Best in stable parameters",
        "Stunning in dark substrate tanks",
        "Handled with premium packing",
      ],
      specs: {
        "Scientific Name": "Caridina sp.",
        "Water Parameters": "pH 6.0–6.8 • GH 4–6 • KH 0–1",
        Temperature: "68–74°F",
        "Tank Size": "10+ gallons recommended",
      },
      desc:
        "A high-end Orange Boa selection with bold pattern and intense coloration—built for collectors and showcase tanks.",
    },

    {
      id: "red-fancy-tiger-ass",
      name: "Red Fancy Tiger Caridina (High-Grade)",
      category: "shrimp",
      featured: true,
      priceFrom: 249.99,
      compareAt: 324.54,
      badge: "Sale",
      images: [
        "./assets/products/red-fancy-tiger-ass/1.jpg",
        "./assets/products/red-fancy-tiger-ass/2.jpg",
        "./assets/products/red-fancy-tiger-ass/3.jpg",
        "./assets/products/red-fancy-tiger-ass/4.jpg",
      ],
     variants: [
        { label: "Single Shrimp (1)", price: 49.99 },
        { label: "5 Shrimp Pack", price: 249.99 },
      ],
      features: [
        "Red striping and pattern accents",
        "Hardy with stable parameters",
        "Great algae grazers",
        "Premium packed for transit",
        "Great for pattern collections",
      ],
      specs: {
        "Scientific Name": "Caridina sp.",
        "Water Parameters": "pH 6.2–7.2 • GH 4–7 • KH 0–2",
        Temperature: "68–74°F",
        "Tank Size": "5+ gallons",
      },
      desc:
        "A red-accented fancy tiger with great striping. Excellent choice for those building a mixed pattern lineup.",
    },

    {
      id: "rainbow-skittles-shrimp",
      name: "Rainbow Skittle Neocaradina Shrimp",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 75.99,
      badge: "Sale",
      images: [
        "./assets/products/rainbow-skittles-shrimp/1.jpg",
        "./assets/products/rainbow-skittles-shrimp/2.jpg",
        "./assets/products/rainbow-skittles-shrimp/3.jpg",
        "./assets/products/rainbow-skittles-shrimp/4.jpg",
      ],
      variants: [
        { label: "10 Shrimp Pack", price: 49.99 },
        { label: "40 Shrimp Pack", price: 159.99 },
        { label: "100 Shrimp Pack", price: 299.99 },
      ],
      features: [
        "Multiple variety of coloration",
        "Premium Caridina grade",
        "Best in soft, stable water",
        "Great for shrimp-only tanks",
        "Handled and shipped with care",
      ],
      specs: {
        "Scientific Name": "Caridina cantonensis",
        "Water Parameters": "pH 6.0–6.8 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "68–74°F",
        "Tank Size": "10+ gallons recommended",
        Diet: "Biofilm, specialized shrimp food",
        Lifespan: "1–2 years",
        Size: "~1–1.4 inches",
      },
      desc:
        "Possible colors that you can get: Green cantaloupe, Red Cherry, Painted Fire Red, Bloody Mary, Red Sakura, Orange, Yellow, 24k Gold Yeloow, Green, Green Jade, Wild Colored Type (Random), Blood Orange, Red/Blue rili, Ghost, Snowball, Blue, Ocean Blue, Blue Jelly, Orange Eyed Neocaradina Shrimp, Chocolate, Black Rose, Blue Carbon, and Onyx. The colors you will get will be randomized from the colors stated prior. Looking for a variety of color for your tank these are the right shrimp for you.",
    },


     {
      id: "orange-eye-red-demon",
      name: "Orange Eye Red Demon Neocaridina davidi",
      category: "shrimp",
      featured: true,
      priceFrom: 19.99,
      compareAt: 55.65,
      badge: "Sale",
      images: [
        "./assets/products/Orange-Eye-Red-Demon/1.jpg",
        "./assets/products/Orange-Eye-Red-Demon/2.jpg",
        "./assets/products/Orange-Eye-Red-Demon/3.jpg",
        "./assets/products/Orange-Eye-Red-Demon/4.jpg",
      ],
      variants: [
       
        { label: "5 Shrimp Pack", price: 99.99 },
        { label: "10 Shrimp Pack", price: 199.99 },
      
      ],
      features: [
        "Panda pattern with blue shadow hues",
        "Premium Caridina line",
        "Best in stable, soft water",
        "Peaceful, shrimp-safe community",
        "High visual contrast",
      ],
      specs: {
        "Scientific Name": "Neocaridina davidi",
        "Water Parameters": "pH 6.0–6.8 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "68–74°F",
        "Tank Size": "10+ gallons recommended",
        Diet: "Biofilm, specialized shrimp food",
      },
      desc:
        "NEW SHRIMP STRAIN: EXTREMELY RARE: BEST BLOODLINES IN THE WORLD: Imported from Germany Breeder Micheal Hasler",
    },

    
    {
      id: "bloody-mary",
      name: "Bloody Mary  Neocaridina davidi",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 75.99,
      badge: "sale",
      images: [
        "./assets/products/bloody-mary/1.jpg",
        "./assets/products/bloody-mary/2.jpg",
        "./assets/products/bloody-mary/3.jpg",
        "./assets/products/bloody-mary/4.jpg",
      ],
     variants: [
        { label: "10 Shrimp Pack", price: 49.99 },
        { label: "40 Shrimp Pack", price: 159.99 },
        { label: "100 Shrimp Pack", price: 299.99 },
      ],
      features: [
        "Rich, dark red coloration",
        "Beginner-friendly and hardy",
        "Excellent algae grazers",
        "Peaceful in community tanks",
        "Strong color in stable conditions",
      ],
      specs: {
        "Scientific Name": "Neocaridina davidi",
        "Water Parameters": "pH 6.5–8.0 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "65–80°F",
        "Tank Size": "5+ gallons",
        Diet: "Algae, biofilm, shrimp food",
        Lifespan: "1–2 years",
        Size: "~1–1.5 inches",
      },
      desc:
        "Ultra High Grade Bloody Mary. Beautiful show shrimp great for beginners.",
    },

    {
      id: "sunkist-orange",
      name: "Sunkist Orange Neocaridina davidi",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 75.99,
      badge: "Sale",
      images: [
        "./assets/products/sunkist-orange/1.jpg",
        "./assets/products/sunkist-orange/2.jpg",
        "./assets/products/sunkist-orange/3.jpg",
        "./assets/products/sunkist-orange/4.jpg",
      ],
      variants: [
        { label: "10 Shrimp Pack", price: 49.99 },
        { label: "40 Shrimp Pack", price: 159.99 },
      ],
      features: [
        "Smooth, light orange tones",
        "Hardy and beginner-friendly",
        "Excellent algae cleaners",
        "Great in planted aquariums",
        "Peaceful and social",
      ],
      specs: {
        "Scientific Name": "Neocaridina davidi",
        "Water Parameters": "pH 6.5–8.0 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "65–80°F",
        "Tank Size": "5+ gallons",
        Diet: "Algae, biofilm, shrimp food",
        Lifespan: "1–2 years",
        Size: "~1–1.5 inches",
      },
      desc:
        "High Grade Sunkist Orange Neocaradina Shrimp",
    },



    {
      id: "ocean-blue",
      name: "Ocean Blue Neocaridina davidi",
      category: "shrimp",
      featured: true,
      priceFrom: 49.99,
      compareAt: 75.49,
      badge: "Sale",
      images: [
        "./assets/products/ocean-blue/1.jpg",
        "./assets/products/ocean-blue/2.jpg",
        "./assets/products/ocean-blue/3.jpg",
        "./assets/products/ocean-blue/4.jpg",
      ],
      variants: [
        { label: "10 Shrimp Pack", price: 49.99 },
        { label: "40 Shrimp Pack", price: 159.99 },
        { label: "100 Shrimp Pack", price: 299.99 },
      ],
      features: [
        "Cool ocean-blue tones",
        "Hardy line with strong activity",
        "Great algae grazers",
        "Beautiful in planted tanks",
        "Peaceful and social",
      ],
      specs: {
        "Scientific Name": "Neocaridina davidi",
        "Water Parameters": "pH 6.5–8.0 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "65–80°F",
        "Tank Size": "5+ gallons",
      },
      desc:
        "Highest grade Blue Neocaradina Shrimp money can buy.",
    },


    {
      id: "painted-fire-red-neocaridina-davidi",
      name: "Painted Fire Red Neocaradina Shrimp",
      category: "shrimp",
      featured: true,
      priceFrom: 7.99,
      compareAt: 9.99,
      badge: "Sale",
      images: [
        "./assets/products/painted-fire-red-neocaridina-davidi/1.jpg",
        "./assets/products/painted-fire-red-neocaridina-davidi/2.jpg",
        "./assets/products/painted-fire-red-neocaridina-davidi/3.jpg",
        "./assets/products/painted-fire-red-neocaridina-davidi4.jpg",
      ],
     variants: [
        { label: "10 Shrimp Pack", price: 49.99 },
        { label: "40 Shrimp Pack", price: 159.99 },
        { label: "100 Shrimp Pack", price: 299.99 },
      ],
      features: [
        "Tiger striping with dark tones",
        "Great for collectors",
        "Works well in shrimp-only setups",
        "Excellent algae grazers",
        "Packed for safe arrival",
      ],
      specs: {
        "Scientific Name": "Caridina sp.",
        "Water Parameters": "pH 6.5–8.0 • GH 4–6 • KH 0–1 • TDS/ppm Range: 150-400",
        Temperature: "68–74°F",
        "Tank Size": "5+ gallons",
      },
      desc:
        "Painted Fire Red Neocaradina Shrimp. Great for beginners. Super Hardy. Hardiest of all neocaradina shrimp.",
    },



    /* 4 Plants (to reach 20 total) */
    {
      id: "guppy-grass",
      name: "Guppy Grass (Rhizome Plant)",
      category: "plants",
      featured: true,
      priceFrom: 39.99,
      compareAt: 80.64,
      badge: null,
      images: [
        "./assets/products/guppy-grass/1.jpg",
        "./assets/products/guppy-grass/2.jpg",
        "./assets/products/guppy-grass/3.jpg",
        "./assets/products/guppy-grass/4.jpg",
      ],
      variants: [
        { label: "4 cups", price: 39.99 },
        { label: "8 cups", price: 69.99 },
        { label: "12 cups", price: 119.99 },
      ],
      features: [
        "Hardy, low-light friendly",
        "Shrimp-safe, great cover",
        "Slow growth, minimal maintenance",
        "Attach to rock/wood (don’t bury rhizome)",
        "Great for nano tanks",
      ],
      specs: {
        Type: "Rhizome plant",
        Light: "Low to medium",
        CO2: "Optional",
        Placement: "Hardscape (wood/rock)",
      },
      desc:
        "A classic shrimp-safe plant that provides cover and biofilm surfaces. Great beginner choice and looks premium in any aquascape.",
    },

    {
      id: "pearl-weed",
      name: "Pearl Weed plant/float",
      category: "plants",
      featured: false,
      priceFrom: 7.99,
      compareAt: null,
      badge: "sale",
      images: [
        "./assets/products/pearl-weed/1.jpg",
        "./assets/products/pearl-weed/2.jpg",
        "./assets/products/pearl-weed/3.jpg",
        "./assets/products/pearl-weed/4.jpg",
      ],
      variants: [
        { label: "1 cup", price: 19.99 },
        { label: "2 cups", price: 34.99 },
      ],
      features: [
        "Perfect shrimp grazing surface",
        "Great for baby shrimp survival",
        "Easy to attach and shape",
        "Low-tech friendly",
        "Excellent for breeding setups",
      ],
      specs: {
        Type: "weed plant",
        Light: "Low to medium",
        CO2: "Optional",
        Placement: "Hardscape or mesh",
      },
      desc:
        "A must have for aquarium enthusiests. Great beiginner plant. Grow easy with low maintinance. Great for baby shrimp.",
    },
  ];

  /* Ensure we have exactly 20 items; if not, fill with safe placeholders */
  while (PRODUCTS.length < 13) {
    const n = PRODUCTS.length + 1;
    PRODUCTS.push({
      id: `placeholder-${n}`,
      name: `Premium Item ${n}`,
      category: n % 3 === 0 ? "plants" : n % 3 === 1 ? "shrimp" : "food",
      featured: false,
      priceFrom: 9.99 + n,
      compareAt: null,
      badge: null,
      images: [
        `./assets/products/placeholder-${n}/1.jpg`,
        `./assets/products/placeholder-${n}/2.jpg`,
        `./assets/products/placeholder-${n}/3.jpg`,
        `./assets/products/placeholder-${n}/4.jpg`,
      ],
      variants: [{ label: "Standard", price: 9.99 + n }],
      features: ["Premium quality", "Packed with care", "Great for shrimp tanks"],
      specs: { Note: "Replace placeholder data with real inventory details." },
      desc:
        "Placeholder product. Swap this item with Drew’s real inventory details and images.",
    });
  }
  if (PRODUCTS.length > 24) PRODUCTS.length = 24;

  /* -----------------------------
   * State
   * ----------------------------- */
   const state = {
  viewAll: false,
  search: "",
  category: "all",
  sort: "featured",
  selectedProductId: null,
  selectedVariantIndex: 0,
  qty: 1,
  cartCount: 0,
  cart: [],
  reviews: [],
  starDraft: 5,
  user: null
};

  /* -----------------------------
   * Cart (demo)
   * ----------------------------- */
  function loadCart() {
    const raw = localStorage.getItem(STORAGE.CART);
    const cart = safeJSONParse(raw, []);
    if (!Array.isArray(cart)) return;
    state.cart = cart;
    state.cartCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    if (els.cartCount) els.cartCount.textContent = String(state.cartCount);
  }

  function saveCart() {
    localStorage.setItem(STORAGE.CART, JSON.stringify(state.cart));
    state.cartCount = state.cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    if (els.cartCount) els.cartCount.textContent = String(state.cartCount);
  }

 function addToCart(product, variant, qty) {
  const key = `${product.id}__${variant.label}`;
  const existing = state.cart.find((x) => x.key === key);

  if (existing) existing.qty += qty;
  else {
    state.cart.push({
      key,
      productId: product.id,
      name: product.name,
      variant: variant.label,
      price: variant.price,
      qty,
    });
  }


  saveCart();
  renderCartDropdown(); // <-- ADD THIS
  toast(`Added to cart: ${product.name} • ${variant.label} (x${qty})`);
}

function removeFromCart(key) {
  state.cart = state.cart.filter(item => item.key !== key);
  saveCart();
  renderCartDropdown();
  toast("Item removed from cart");
}

  /* -----------------------------
 * Cart Dropdown UI
 * ----------------------------- */

const TAX_RATE = 0.06;
const SHIPPING = 24.99;

function calculateTotals() {

  let subtotal = 0

  state.cart.forEach(item => {
    subtotal += item.price * item.qty
  })

  const tax = subtotal * TAX_RATE
  const shipping = state.cart.length ? SHIPPING : 0
  const total = subtotal + tax + shipping

  return { subtotal, tax, shipping, total }

}

function toggleCart(open) {
  if (!els.cartDropdown) return;
  els.cartDropdown.classList.toggle("is-open", open);
}

function renderCartDropdown() {
  if (!els.cartItems) return;

  let subtotal = 0;

  // Render cart items
  els.cartItems.innerHTML = state.cart.map(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    return `
      <div class="cartitem">
        <button 
          class="cartitem__remove" 
          data-key="${item.key}" 
          aria-label="Remove item">
          ×
        </button>

        <div class="cartitem__info">
          <div class="cartitem__name">
            ${escapeHtml(item.name)}
          </div>

          <div class="cartitem__variant">
            ${escapeHtml(item.variant)} • Qty: ${item.qty}
          </div>
        </div>

        <div class="cartitem__price">
          ${money(lineTotal)}
        </div>
      </div>
    `;
  }).join("");

  // Calculations
  const TAX_RATE = 0.06;
  const SHIPPING = 24.99;

  const tax = subtotal * TAX_RATE;
  const shipping = state.cart.length ? SHIPPING : 0;
  const total = subtotal + tax + shipping;

  // Update totals
  if (els.cartTax) els.cartTax.textContent = money(tax);
  if (els.cartTotal) els.cartTotal.textContent = money(total);


  // Wire remove buttons
  $$(".cartitem__remove", els.cartItems).forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(btn.dataset.key);
    });
  });
}





/* -----------------------------
   Accounts
----------------------------- */

function loadAccounts(){
  return safeJSONParse(localStorage.getItem(STORAGE.ACCOUNTS),[])
}

function saveAccounts(accounts){
  localStorage.setItem(STORAGE.ACCOUNTS,JSON.stringify(accounts))
}

function registerAccount(first,last,email,password){

  const accounts = loadAccounts()

  if(accounts.find(a => a.email === email)){
    toast("Account already exists.")
    return false
  }

  const newAccount = {
    id: cryptoRandomId(),
    first,
    last,
    email,
    password
  }

  accounts.push(newAccount)
  saveAccounts(accounts)

  toast("Account created successfully.")
  return true
}

function loginAccount(email,password){

  const accounts = loadAccounts()

  const user = accounts.find(
    a => a.email === email && a.password === password
  )

  if(!user){
    toast("Invalid login credentials.")
    return false
  }

  state.user = user

  sessionStorage.setItem(STORAGE.SESSION,JSON.stringify(user))
  localStorage.setItem(STORAGE.REMEMBER_EMAIL,email)

  toast(`Thanks for logging in ${user.first}! Your cart data will be saved to your account for future orders.`)

  return true
}

function logoutAccount(){

  state.user = null

  sessionStorage.removeItem(STORAGE.SESSION)

  toast("Logged out successfully")
}

function loadSession(){

  const raw = sessionStorage.getItem(STORAGE.SESSION)

  if(!raw) return

  state.user = safeJSONParse(raw,null)
}

function wireAccounts(){

  loadSession()

  const loginModal = document.getElementById("loginModal")
  const registerModal = document.getElementById("registerModal")

  const loginEmail = document.getElementById("loginEmail")
  const loginPassword = document.getElementById("loginPassword")

  const registerFirst = document.getElementById("registerFirst")
  const registerLast = document.getElementById("registerLast")
  const registerEmail = document.getElementById("registerEmail")
  const registerPassword = document.getElementById("registerPassword")

  const rememberedEmail = localStorage.getItem(STORAGE.REMEMBER_EMAIL)

  if(rememberedEmail && loginEmail){
    loginEmail.value = rememberedEmail
  }

  const loginForm = document.getElementById("loginForm")

  loginForm?.addEventListener("submit",(e)=>{

    e.preventDefault()

    const email = loginEmail.value.trim()
    const password = loginPassword.value.trim()

    if(loginAccount(email,password)){
      closeModal(loginModal)
      loginForm.reset()
    }

  })

  const registerForm = document.getElementById("registerForm")

  registerForm?.addEventListener("submit",(e)=>{

    e.preventDefault()

    const first = registerFirst.value.trim()
    const last = registerLast.value.trim()
    const email = registerEmail.value.trim()
    const password = registerPassword.value.trim()

    if(registerAccount(first,last,email,password)){
      closeModal(registerModal)
      registerForm.reset()
    }

  })

}

const loginModal = document.getElementById("loginModal")
const closeLoginModal = document.getElementById("closeLoginModal")

closeLoginModal?.addEventListener("click",()=>{
  loginModal.classList.remove("is-open")
  document.body.classList.remove("modal-open")
})

loginModal?.addEventListener("click",(e)=>{
  if(e.target === loginModal){
    loginModal.classList.remove("is-open")
    document.body.classList.remove("modal-open")
  }
})


  /* -----------------------------
   * Countdown
   * ----------------------------- */
  function initCountdown() {
    if (!els.cdDays || !els.cdHours || !els.cdMins || !els.cdSecs) return;

    // Sale end: next 48 hours from first visit (persist)
    const key = "sw_sale_end_v1";
    let end = Number(localStorage.getItem(key) || 0);
    const now = Date.now();
    if (!end || end < now) {
      end = now + 48 * 60 * 60 * 1000;
      localStorage.setItem(key, String(end));
    }

    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      els.cdDays.textContent = pad2(days);
      els.cdHours.textContent = pad2(hours);
      els.cdMins.textContent = pad2(mins);
      els.cdSecs.textContent = pad2(secs);

      if (diff <= 0) {
        // Restart a 24h cycle for demo purposes
        end = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem(key, String(end));
      }
    };

    tick();
    window.setInterval(tick, 1000);
  }

  /* -----------------------------
   * Product Grid Rendering
   * ----------------------------- */
  function getFilteredSortedProducts() {
    let items = PRODUCTS.slice();

    // Filter: category
    if (state.category !== "all") {
      items = items.filter((p) => p.category === state.category);
    }

    // Search
    const q = state.search.trim().toLowerCase();
    if (q) {
      items = items.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort
    switch (state.sort) {
      case "priceAsc":
        items.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
        break;
      case "priceDesc":
        items.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
        break;
      case "nameAsc":
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        items.sort((a, b) => Number(b.featured) - Number(a.featured));
        break;
    }

    return items;
  }

  function cardHTML(p) {
    const compare =
      p.compareAt && p.compareAt > p.priceFrom
        ? `<span class="card__compare">${money(p.compareAt)}</span>`
        : "";

    const badge = p.badge ? `<span class="badge">${p.badge}</span>` : "";

    return `
      <article class="card" role="button" tabindex="0" data-product="${p.id}" aria-label="Open ${escapeHtml(
      p.name
    )}">
        <div class="card__img">

  <img 
    class="card__img-main"
    src="${p.images?.[0] || ""}" 
    alt="${escapeHtml(p.name)}"
    loading="lazy"
  />

  <img 
    class="card__img-hover"
    src="${p.images?.[1] || p.images?.[0] || ""}" 
    alt="${escapeHtml(p.name)} alternate"
    loading="lazy"
  />

  ${badge}

</div>
        <div class="card__body">
          <h3 class="card__name">${escapeHtml(p.name)}</h3>
          <div class="card__price">
            ${compare}
            <span class="card__from">From ${money(p.priceFrom)}</span>
          </div>
          <div class="card__meta">
            <span class="metapill">${p.category === "plants"
              ? "Plants"
              : p.category === "food"
                ? "Food & Essentials"
                : "Shrimp"
            }</span>
            <span class="metapill">${p.badge ? "Limited" : "Premium"}</span>
          </div>
        </div>
      </article>
    `;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderGrid() {
    if (!els.productGrid) return;

    const items = getFilteredSortedProducts();
    const limit = state.viewAll ? items.length : 12;
    const slice = items.slice(0, limit);

    els.productGrid.innerHTML = slice.map(cardHTML).join("");

   $$(".card", els.productGrid).forEach((card) => {

  const productId = card.dataset.product

  card.addEventListener("click", () => {

    const product = PRODUCTS.find(p => p.id === productId)
    if(!product) return

    const badge = (product.badge || "").toLowerCase()

    if(badge === "coming soon"){
      toast("This product is coming soon.")
      return
    }

    if(badge === "out of stock"){
      toast("This product is currently out of stock.")
      return
    }

    openProduct(productId)

  })

  card.addEventListener("keydown", (e) => {

    if(e.key !== "Enter" && e.key !== " ") return

    e.preventDefault()

    const product = PRODUCTS.find(p => p.id === productId)
    if(!product) return

    const badge = (product.badge || "").toLowerCase()

    if(badge === "coming soon"){
      toast("This product is coming soon.")
      return
    }

    if(badge === "out of stock"){
      toast("This product is currently out of stock.")
      return
    }

    openProduct(productId)

  })

})

    if (els.viewAllBtn) {
      els.viewAllBtn.textContent = state.viewAll ? "Show less" : "View all";
      els.viewAllBtn.style.display = items.length > 12 ? "" : "none";
    }
  }

  /* -----------------------------
   * Product View (in-page purchase page)
   * ----------------------------- */
  function openProduct(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product || !els.productView) return;

    state.selectedProductId = productId;
    state.selectedVariantIndex = 0;
    state.qty = 1;

    // Show view
    els.productView.classList.add("is-open");

    // Scroll into view for the "purchase page" effect
    els.productView.scrollIntoView({ behavior: "smooth", block: "start" });

    // Populate
    if (els.pvTitle) els.pvTitle.textContent = product.name;

    // Price
    setPVPrice(product, 0);

    // Gallery
    renderPVGallery(product);

    // Variants
    renderPVVariants(product);

    // Qty
    if (els.qtyInput) els.qtyInput.value = String(state.qty);

    // Features
    renderPVFeatures(product);

    // Specs
    renderPVSpecs(product);

    // Desc
    if (els.pvDesc) els.pvDesc.textContent = product.desc || "";

    // Related
    renderPVRelated(product);
  }

  function closeProduct() {
    if (!els.productView) return;
    els.productView.classList.remove("is-open");
    state.selectedProductId = null;
  }

  function setPVPrice(product, variantIndex) {
    const v = product.variants?.[variantIndex] || { price: product.priceFrom, label: "Default" };
    const compare =
      product.compareAt && product.compareAt > (v.price || 0) ? money(product.compareAt) : "";

    if (els.pvPrice) els.pvPrice.textContent = money(v.price ?? product.priceFrom);
    if (els.pvCompare) els.pvCompare.textContent = compare;
  }

  function renderPVGallery(product) {
    if (!els.pvMainImg || !els.pvThumbs) return;

    const imgs = (product.images || []).filter(Boolean);
    const main = imgs[0] || "";
    els.pvMainImg.src = main;
    els.pvMainImg.alt = product.name;

    els.pvThumbs.innerHTML = imgs
      .map(
        (src, i) => `
        <button class="thumb ${i === 0 ? "is-active" : ""}" type="button" data-i="${i}" aria-label="View image ${i + 1}">
          <img src="${src}" alt="${escapeHtml(product.name)} image ${i + 1}" loading="lazy" />
        </button>
      `
      )
      .join("");

    $$(".thumb", els.pvThumbs).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".thumb", els.pvThumbs).forEach((t) => t.classList.remove("is-active"));
        btn.classList.add("is-active");
        const i = Number(btn.dataset.i || 0);
        const src = imgs[i] || imgs[0] || "";
        els.pvMainImg.src = src;
      });
    });
  }

  function renderPVVariants(product) {
    if (!els.pvVariants) return;
    const variants = product.variants?.length ? product.variants : [{ label: "Default", price: product.priceFrom }];

    els.pvVariants.innerHTML = variants
      .map(
        (v, i) => `
        <button class="pillbtn ${i === 0 ? "is-active" : ""}" type="button" data-i="${i}">
          ${escapeHtml(v.label)}
        </button>
      `
      )
      .join("");

    $$(".pillbtn", els.pvVariants).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".pillbtn", els.pvVariants).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.selectedVariantIndex = Number(btn.dataset.i || 0);
        setPVPrice(product, state.selectedVariantIndex);
      });
    });
  }

  function renderPVFeatures(product) {
    if (!els.pvFeatures) return;
    const features = Array.isArray(product.features) ? product.features : [];
    els.pvFeatures.innerHTML = features.map((f) => `<li>${escapeHtml(f)}</li>`).join("");
  }

  function renderPVSpecs(product) {
    if (!els.pvSpecs) return;
    const specs = product.specs || {};
    const rows = Object.entries(specs).map(
      ([k, v]) => `<dt>${escapeHtml(k)}:</dt><dd>${escapeHtml(v)}</dd>`
    );
    els.pvSpecs.innerHTML = rows.join("");
  }

  function renderPVRelated(product) {
    if (!els.pvRelated) return;

    const pool = PRODUCTS.filter((p) => p.id !== product.id);
    // Prefer same category, then any
    const same = pool.filter((p) => p.category === product.category);
    const pickFrom = same.length >= 4 ? same : pool;

    // Simple deterministic-ish shuffle
    const seed = product.id.length;
    const sorted = pickFrom
      .slice()
      .sort((a, b) => (a.id.charCodeAt(0) + seed) - (b.id.charCodeAt(0) + seed));

    const related = sorted.slice(0, 4);

    els.pvRelated.innerHTML = related
      .map(
        (p) => `
        <div class="related" role="button" tabindex="0" data-product="${p.id}" aria-label="Open ${escapeHtml(p.name)}">
          <img src="${p.images?.[0] || ""}" alt="${escapeHtml(p.name)}" loading="lazy" />
          <div class="related__name">${escapeHtml(p.name)}</div>
        </div>
      `
      )
      .join("");

    $$(".related", els.pvRelated).forEach((el) => {
      el.addEventListener("click", () => openProduct(el.dataset.product));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProduct(el.dataset.product);
        }
      });
    });
  }

  function wireProductViewButtons() {
    if (els.closeProductView) {
      els.closeProductView.addEventListener("click", closeProduct);
    }

    if (els.qtyMinus) {
      els.qtyMinus.addEventListener("click", () => {
        state.qty = clamp(state.qty - 1, 1, 999);
        if (els.qtyInput) els.qtyInput.value = String(state.qty);
      });
    }
    if (els.qtyPlus) {
      els.qtyPlus.addEventListener("click", () => {
        state.qty = clamp(state.qty + 1, 1, 999);
        if (els.qtyInput) els.qtyInput.value = String(state.qty);
      });
    }
    if (els.qtyInput) {
      els.qtyInput.addEventListener("input", () => {
        const n = parseInt(String(els.qtyInput.value || "1").replace(/[^\d]/g, ""), 10);
        state.qty = clamp(Number.isFinite(n) ? n : 1, 1, 999);
        els.qtyInput.value = String(state.qty);
      });
      els.qtyInput.addEventListener("blur", () => {
        if (!els.qtyInput.value) {
          state.qty = 1;
          els.qtyInput.value = "1";
        }
      });
    }

     if (els.addToCartBtn) {
  els.addToCartBtn.addEventListener("click", () => {
    const product = PRODUCTS.find((p) => p.id === state.selectedProductId);
    if (!product) return;

    const variants = product.variants?.length
      ? product.variants
      : [{ label: "Default", price: product.priceFrom }];

    const variant = variants[state.selectedVariantIndex] || variants[0];

    addToCart(product, variant, state.qty);
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("#buyNowBtn");
  if (!btn) return;

  e.preventDefault();

  openCartAndScroll();
});
  }


  /* -----------------------------
   * Discount + Newsletter
   * ----------------------------- */
  function wireDiscount() {
    const open = () => openModal(els.discountModal);

    if (els.cornerDeal) els.cornerDeal.addEventListener("click", open);
    if (els.openDiscountBtn) els.openDiscountBtn.addEventListener("click", open);

    // Modal close controls
    $$("#discountModal [data-close]").forEach((el) => {
      el.addEventListener("click", () => closeModal(els.discountModal));
    });

    // Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal(els.discountModal);
        closeModal(els.reviewModal);
      }
    });

    if (els.discountForm) {
      els.discountForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = String(els.discountEmail?.value || "").trim();
        if (!email) return;

        localStorage.setItem(STORAGE.DISCOUNT_EMAIL, email);

        // Simple deterministic code based on date (demo)
        const code = `SW10-${todayISO().replaceAll("-", "")}`;

        closeModal(els.discountModal);
        toast(`Discount code sent (demo): ${code}`);
        if (els.discountForm) els.discountForm.reset();
      });
    }

    if (els.newsletterForm) {
      els.newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = String(els.newsletterEmail?.value || "").trim();
        if (!email) return;
        localStorage.setItem(STORAGE.NEWSLETTER_EMAIL, email);
        toast("Subscribed! Thank you for joining!");
        els.newsletterForm.reset();
      });
    }
  }

  /* -----------------------------
   * Reviews
   * ----------------------------- */
  function starSVG(filled = true) {
    // Inline SVG star
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"
          d="M12 2.4l2.9 6.1 6.7.9-4.9 4.8 1.2 6.7L12 18.9 6.1 20.9l1.2-6.7-4.9-4.8 6.7-.9L12 2.4z"/>
      </svg>
    `;
  }

  function renderStars(container, rating, size = "normal") {
    if (!container) return;
    const r = clamp(Number(rating || 0), 0, 5);
    container.innerHTML = Array.from({ length: 5 }).map((_, i) => {
      const filled = i < Math.round(r);
      return `<span class="star ${size}">${starSVG(filled)}</span>`;
    }).join("");
  }

  function loadReviews() {
    const raw = localStorage.getItem(STORAGE.REVIEWS);
    const stored = safeJSONParse(raw, null);
    if (Array.isArray(stored) && stored.length) {
      state.reviews = stored;
      return;
    }

    // Seed with premium-looking demo reviews
    state.reviews = [
      {
        id: cryptoRandomId(),
        name: "Hassan A",
        stars: 5,
        title: "Great service and even better shrimp",
        body:
          "Got exactly what I needed, fast shipment, nice fully grown shrimp with great color. Transitioned well to my planted tank.",
        date: "2026-02-28",
        verified: true,
      },
      {
        id: cryptoRandomId(),
        name: "Donald Walton",
        stars: 5,
        title: "Beautiful shrimp",
        body:
          "Fast delivery and the shrimp were healthy. I would definitely do business with them again.",
        date: "2025-11-25",
        verified: true,
      },
      {
        id: cryptoRandomId(),
        name: "Renea Ward",
        stars: 5,
        title: "Shrimp Order",
        body: "They really are Fintastic!",
        date: "2025-11-13",
        verified: true,
      },
    ];
    saveReviews();
  }

  function saveReviews() {
    localStorage.setItem(STORAGE.REVIEWS, JSON.stringify(state.reviews));
  }

  function cryptoRandomId() {
    try {
      const a = new Uint32Array(2);
      crypto.getRandomValues(a);
      return `${a[0].toString(16)}${a[1].toString(16)}`;
    } catch {
      return String(Math.random()).slice(2);
    }
  }

  function calcReviewStats() {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of state.reviews) {
      const s = clamp(Number(r.stars || 0), 1, 5);
      counts[s] += 1;
    }
    const total = state.reviews.length || 0;
    const sum =
      counts[1] * 1 + counts[2] * 2 + counts[3] * 3 + counts[4] * 4 + counts[5] * 5;
    const avg = total ? sum / total : 0;
    return { counts, total, avg };
  }

  function renderReviewBreakdown() {
    const { counts, total, avg } = calcReviewStats();

    if (els.reviewCount) els.reviewCount.textContent = String(total);
    if (els.avgRating) els.avgRating.textContent = avg.toFixed(2);
    if (els.avgStars) renderStars(els.avgStars, avg);

    const setBar = (barEl, countEl, n) => {
      if (!barEl || !countEl) return;
      countEl.textContent = String(counts[n] || 0);
      const pct = total ? ((counts[n] || 0) / total) * 100 : 0;
      barEl.style.width = `${pct.toFixed(0)}%`;
    };

    setBar(els.bar5, els.count5, 5);
    setBar(els.bar4, els.count4, 4);
    setBar(els.bar3, els.count3, 3);
    setBar(els.bar2, els.count2, 2);
    setBar(els.bar1, els.count1, 1);
  }

  function reviewItemHTML(r) {
    const date = r.date ? new Date(r.date) : new Date();
    const pretty = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return `
      <div class="reviewitem">
        <div class="reviewitem__top">
          <div class="reviewitem__name">
            <span>${escapeHtml(r.name || "Customer")}</span>
            ${r.verified ? `<span class="verified">Verified</span>` : ""}
          </div>
          <div class="reviewitem__date">${pretty}</div>
        </div>
        <div class="stars" aria-label="${Number(r.stars || 0)} star rating">${starsInline(Number(r.stars || 0))}</div>
        <div class="reviewitem__title">${escapeHtml(r.title || "")}</div>
        <div class="reviewitem__body">${escapeHtml(r.body || "")}</div>
      </div>
    `;
  }

  function starsInline(rating) {
    const r = clamp(Number(rating || 0), 0, 5);
    return Array.from({ length: 5 })
      .map((_, i) => `<span>${starSVG(i < r)}</span>`)
      .join("");
  }

  function renderReviewList() {
    if (!els.reviewList) return;
    // Newest first
    const items = state.reviews
      .slice()
      .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    els.reviewList.innerHTML = items.map(reviewItemHTML).join("");
  }

  function renderStarPicker() {
    if (!els.starPick || !els.reviewStars) return;

    const makeBtn = (n) => `
      <button type="button" data-star="${n}" aria-label="${n} star">
        ${starSVG(n <= state.starDraft)}
      </button>
    `;

    const draw = () => {
      els.starPick.innerHTML = [1, 2, 3, 4, 5].map(makeBtn).join("");
      els.reviewStars.value = String(state.starDraft);

      $$("#starPick button").forEach((btn) => {
        btn.addEventListener("mouseenter", () => {
          const n = Number(btn.dataset.star || 5);
          updateDraft(n, false);
        });
        btn.addEventListener("click", () => {
          const n = Number(btn.dataset.star || 5);
          updateDraft(n, true);
        });
      });

      // Restore on leave to committed value
      els.starPick.addEventListener("mouseleave", () => {
        updateDraft(state.starDraft, false);
      });
    };

    const updateDraft = (n, commit) => {
      const val = clamp(n, 1, 5);
      if (commit) state.starDraft = val;
      // redraw icons using current hover value
      const buttons = $$("#starPick button");
      buttons.forEach((b) => {
        const s = Number(b.dataset.star || 0);
        b.innerHTML = starSVG(s <= val);
      });
      if (commit) els.reviewStars.value = String(val);
    };

    draw();
  }

  function wireReviews() {
    // Open review modal
    if (els.writeReviewBtn) {
      els.writeReviewBtn.addEventListener("click", () => {
        state.starDraft = 5;
        renderStarPicker();
        openModal(els.reviewModal);
      });
    }

    // Close review modal
    $$("#reviewModal [data-close]").forEach((el) => {
      el.addEventListener("click", () => closeModal(els.reviewModal));
    });

    // Submit review
    if (els.reviewForm) {
      els.reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = String(els.reviewName?.value || "").trim();
        const title = String(els.reviewTitleInput?.value || "").trim();
        const body = String(els.reviewBody?.value || "").trim();
        const stars = clamp(Number(els.reviewStars?.value || 5), 1, 5);

        if (!name || !title || !body) {
          toast("Please complete all review fields.");
          return;
        }

        state.reviews.push({
          id: cryptoRandomId(),
          name,
          stars,
          title,
          body,
          date: todayISO(),
          verified: false, // demo: set true if you later implement verification
        });

        saveReviews();
        renderReviewBreakdown();
        renderReviewList();

        closeModal(els.reviewModal);
        els.reviewForm.reset();
        toast("Review posted! (Demo: stored locally)");
      });
    }
  }

  /* -----------------------------
   * Nav active state + smooth scroll polish
   * ----------------------------- */
  function wireNav() {
    // Set year
    if (els.year) els.year.textContent = String(new Date().getFullYear());

    // Smooth scroll offsets already handled in CSS; we just update active state.
    const sections = ["#products", "#difference", "#reviews", "#newsletter", "#footer"]
      .map((id) => ({ id, el: $(id) }))
      .filter((x) => x.el);

    $$(".nav__link").forEach((link) => {

  link.addEventListener("click", (e) => {

    const targetId = link.getAttribute("href")

    if(!targetId || !targetId.startsWith("#")) return

    const targetEl = document.querySelector(targetId)

    if(!targetEl) return

    e.preventDefault()

    targetEl.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })

    setActiveNavByHash(targetId)

  })

})

    // Observer updates active on scroll
    if ("IntersectionObserver" in window && sections.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          // Pick the most visible intersecting section
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
          if (visible) setActiveNavByHash(`#${visible.target.id}`);
        },
        {
          root: null,
          rootMargin: "-30% 0px -60% 0px",
          threshold: [0.15, 0.25, 0.35, 0.5],
        }
      );

      sections.forEach((s) => obs.observe(s.el));
    }

    // Search icon focuses product search
    if (els.searchBtn && els.productSearch) {
      els.searchBtn.addEventListener("click", () => {
        els.productSearch.focus();
        els.productSearch.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }

  /* -----------------------------
   * Wire product controls
   * ----------------------------- */
  function wireProductControls() {
    if (els.productSearch) {
      els.productSearch.addEventListener("input", () => {
        state.search = els.productSearch.value || "";
        renderGrid();
      });
    }

    if (els.categoryFilter) {
      els.categoryFilter.addEventListener("change", () => {
        state.category = els.categoryFilter.value || "all";
        renderGrid();
      });
    }

    if (els.sortSelect) {
      els.sortSelect.addEventListener("change", () => {
        state.sort = els.sortSelect.value || "featured";
        renderGrid();
      });
    }

    if (els.viewAllBtn) {
      els.viewAllBtn.addEventListener("click", () => {
        state.viewAll = !state.viewAll;
        renderGrid();
      });
    }
  }



  /* -----------------------------
   * Global modal click-close
   * ----------------------------- */
  function wireModalOverlayClose() {
    $$(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        const t = e.target;
        if (!(t instanceof Element)) return;
        const shouldClose = t.matches("[data-close]") || t.getAttribute("data-close") === "true";
        if (shouldClose) closeModal(modal);
      });
    });
  }


  function openCartAndScroll() {
  renderCartDropdown();
  toggleCart(true);

  if (els.cartDropdown) {
    els.cartDropdown.setAttribute("aria-hidden", "false");
  }

  const scrollTarget = document.scrollingElement || document.documentElement;

  scrollTarget.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}



/* -----------------------------
 * Mobile Menu
 * ----------------------------- */

function wireMobileMenu() {

  const mobileBtn = document.getElementById("mobileMenuBtn");

  if (!mobileBtn || !els.nav) return;

  mobileBtn.addEventListener("click", () => {

    els.nav.classList.toggle("is-open");

    const isOpen = els.nav.classList.contains("is-open");

    mobileBtn.classList.toggle("is-active", isOpen);

  });

  // Close after clicking nav item

  $$(".nav__link", els.nav).forEach(link => {

    link.addEventListener("click", () => {
      els.nav.classList.remove("is-open");
      mobileBtn.classList.remove("is-active");
    });

  });

}

  /* -----------------------------
   * Init
   * ----------------------------- */
  function init(){

  loadCart();
  loadSession();

  initCountdown();

  wireNav();
  wireMobileMenu();
  wireProductControls();
  wireProductViewButtons();
  wireDiscount();
  wireReviews();
  wireModalOverlayClose();
  wireCheckout();
  wireAccounts();

  loadReviews();

  renderReviewBreakdown();
  renderReviewList();

  renderGrid();

  /* Cart button wiring */

  /* -----------------------------
   * Cart Button Wiring
   * ----------------------------- */

  if (els.cartBtn) {
    els.cartBtn.addEventListener("click", () => {
      const isOpen = els.cartDropdown?.classList.contains("is-open");
      toggleCart(!isOpen);
      renderCartDropdown();
    });
  }

  if (els.closeCartBtn) {
    els.closeCartBtn.addEventListener("click", () => toggleCart(false));
  }

  renderGrid();
}



/* -----------------------------
 * Checkout Modal
 * ----------------------------- */

function wireCheckout() {
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    if (!state.cart.length) {
      toast("Your cart is empty. Add items before checkout.");
      return;
    }

    try {
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart: state.cart
        })
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast(data.error || "Checkout could not be started.");
      }
    } catch (err) {
      console.error(err);
      toast("Stripe checkout error. Please try again.");
    }
  });

}


  if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
})();



/* ===============================
ACCOUNT LOGIN / REGISTER SYSTEM
=============================== */

const accountBtn = document.getElementById("accountBtn");
const loginModalGlobal = document.getElementById("loginModal");
const registerModalGlobal = document.getElementById("registerModal");

const closeLogin = document.getElementById("closeLoginModal");
const openRegister = document.getElementById("openRegisterModal");
const closeRegister = registerModalGlobal?.querySelector("[data-close]");

accountBtn?.addEventListener("click", () => {
  loginModalGlobal?.classList.add("is-open");
});

closeLogin?.addEventListener("click", () => {
  loginModalGlobal?.classList.remove("is-open");
});

openRegister?.addEventListener("click", () => {
  loginModalGlobal?.classList.remove("is-open");
  registerModalGlobal?.classList.add("is-open");
});

closeRegister?.addEventListener("click", () => {
  registerModalGlobal?.classList.remove("is-open");
});

window.addEventListener("click", (e) => {
  if (e.target === loginModalGlobal) {
    loginModalGlobal.classList.remove("is-open");
  }

  if (e.target === registerModalGlobal) {
    registerModalGlobal.classList.remove("is-open");
  }
});



 /* Smooth anchor scrolling fix */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function (e) {

const target = document.querySelector(this.getAttribute("href"));

if(!target) return;

e.preventDefault();

const navOffset = 120; // adjust for navbar height

const targetPosition =
target.getBoundingClientRect().top + window.pageYOffset - navOffset;

window.scrollTo({
top: targetPosition,
behavior: "smooth"
});

});

});