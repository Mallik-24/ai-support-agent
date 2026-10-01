// knowledge-base.js — Comprehensive FAQ knowledge base for AI Customer Support Agent
// Each entry has: id, category, tags, question (variants), answer

const knowledgeBase = [
  // ─── ORDERS ────────────────────────────────────────────────────────────────
  {
    id: "order-001",
    category: "Orders",
    tags: ["order", "track", "tracking", "status", "where", "shipment"],
    questions: [
      "Where is my order?",
      "How do I track my order?",
      "What is the status of my order?",
      "Can I track my shipment?",
      "I want to know where my package is",
    ],
    answer:
      "You can track your order by visiting **My Orders** in your account dashboard and clicking **Track Shipment**. You'll receive a tracking number via email once your order ships — use it at the carrier's website for real-time updates. Orders typically ship within 1–2 business days. If you haven't received a tracking email after 3 business days, please contact support with your order number.",
  },
  {
    id: "order-002",
    category: "Orders",
    tags: ["cancel", "cancellation", "order", "stop"],
    questions: [
      "How do I cancel my order?",
      "Can I cancel my order?",
      "I want to cancel my purchase",
      "Stop my order",
    ],
    answer:
      "You can cancel an order within **2 hours** of placing it by going to **My Orders → Cancel Order**. After 2 hours the order enters processing and cancellation may not be possible. If it has already shipped, you'll need to return it after delivery. To cancel, log in to your account, navigate to My Orders, select the order, and click **Cancel**.",
  },
  {
    id: "order-003",
    category: "Orders",
    tags: ["modify", "change", "edit", "order", "update", "address", "quantity"],
    questions: [
      "Can I change my order?",
      "How do I modify my order?",
      "I want to update my shipping address",
      "Can I change the quantity on my order?",
    ],
    answer:
      "Order modifications (address, items, quantity) are possible within **1 hour** of placing the order. Go to **My Orders → Edit Order**. After 1 hour, modifications are locked as the order moves to fulfillment. For address-only changes, contact support immediately — we'll do our best to update it before it ships.",
  },
  {
    id: "order-004",
    category: "Orders",
    tags: ["order history", "past orders", "previous", "purchase history"],
    questions: [
      "How do I view my order history?",
      "Where can I see my past orders?",
      "I want to see all my purchases",
    ],
    answer:
      "Your full order history is available under **My Account → Order History**. Each entry shows the order date, items, total, and current status. You can re-order any past purchase with one click using the **Reorder** button.",
  },

  // ─── RETURNS & REFUNDS ─────────────────────────────────────────────────────
  {
    id: "return-001",
    category: "Returns & Refunds",
    tags: ["return", "refund", "policy", "how", "return policy"],
    questions: [
      "What is your return policy?",
      "How do I return an item?",
      "Can I return a product?",
      "What are the return rules?",
    ],
    answer:
      "We offer a **30-day hassle-free return policy**. Items must be unused, in original packaging, and accompanied by a receipt. To start a return:\n1. Log in and go to **My Orders**\n2. Select the item and click **Return Item**\n3. Print the prepaid return label\n4. Drop off at any carrier location\n\nRefunds are processed within 5–7 business days after we receive the item.",
  },
  {
    id: "return-002",
    category: "Returns & Refunds",
    tags: ["refund", "money back", "refund status", "when", "how long"],
    questions: [
      "When will I get my refund?",
      "How long does a refund take?",
      "Where is my refund?",
      "Has my refund been processed?",
    ],
    answer:
      "Once we receive your returned item, refunds are processed within **5–7 business days**. After processing, it takes 3–5 additional business days for the funds to appear on your statement depending on your bank. You'll receive an email confirmation when the refund is initiated. If it's been more than 10 business days since we confirmed receipt, please contact support with your return tracking number.",
  },
  {
    id: "return-003",
    category: "Returns & Refunds",
    tags: ["exchange", "swap", "different", "wrong size", "wrong item"],
    questions: [
      "How do I exchange an item?",
      "I received the wrong item",
      "Can I swap for a different size?",
      "I want a different color",
    ],
    answer:
      "For exchanges, return the original item using our standard return process and place a new order for the replacement. If you received a **wrong item** due to our error, contact support immediately — we'll send the correct item with expedited shipping and cover all return costs. For size/color exchanges, the fastest route is returning and reordering online.",
  },

  // ─── SHIPPING ──────────────────────────────────────────────────────────────
  {
    id: "ship-001",
    category: "Shipping",
    tags: ["shipping", "delivery", "how long", "time", "days", "arrive"],
    questions: [
      "How long does delivery take?",
      "When will my order arrive?",
      "What are your shipping times?",
      "How many days for delivery?",
    ],
    answer:
      "Delivery times depend on your chosen shipping method:\n- **Standard (Free):** 5–7 business days\n- **Expedited:** 2–3 business days ($9.99)\n- **Overnight:** Next business day ($24.99)\n\nOrders placed before 2 PM EST ship the same day. Orders after 2 PM ship the next business day. Delivery times may be longer during peak seasons.",
  },
  {
    id: "ship-002",
    category: "Shipping",
    tags: ["shipping cost", "free shipping", "price", "charge"],
    questions: [
      "Do you offer free shipping?",
      "What does shipping cost?",
      "How much is delivery?",
      "Is there free delivery?",
    ],
    answer:
      "Yes! We offer **free standard shipping** on all orders over **$50**. For orders under $50, standard shipping is $5.99. Expedited shipping is $9.99 and overnight is $24.99 regardless of order value. Free shipping is automatically applied at checkout when your order total meets the threshold.",
  },
  {
    id: "ship-003",
    category: "Shipping",
    tags: ["international", "overseas", "ship to", "worldwide", "country"],
    questions: [
      "Do you ship internationally?",
      "Can you ship to my country?",
      "Do you deliver overseas?",
      "International shipping",
    ],
    answer:
      "We currently ship to **45+ countries** worldwide. International shipping rates and delivery times vary by destination (typically 7–14 business days). Customs duties and import taxes are the customer's responsibility and are not included in our shipping charges. Select your country at checkout to see exact shipping costs and estimated delivery dates.",
  },

  // ─── PAYMENT ───────────────────────────────────────────────────────────────
  {
    id: "pay-001",
    category: "Payment",
    tags: ["payment", "pay", "method", "credit card", "paypal", "accepted"],
    questions: [
      "What payment methods do you accept?",
      "Can I pay with PayPal?",
      "Do you take credit cards?",
      "What are the payment options?",
    ],
    answer:
      "We accept all major payment methods:\n- 💳 **Credit/Debit cards:** Visa, Mastercard, American Express, Discover\n- 🅿️ **PayPal** and **PayPal Pay Later**\n- 🍎 **Apple Pay** and **Google Pay**\n- 🏦 **Bank Transfer / ACH**\n- 🛍️ **Buy Now Pay Later:** Klarna, Afterpay\n\nAll transactions are secured with 256-bit SSL encryption.",
  },
  {
    id: "pay-002",
    category: "Payment",
    tags: ["promo", "coupon", "discount", "code", "voucher", "deal"],
    questions: [
      "How do I apply a promo code?",
      "I have a coupon code",
      "Where do I enter my discount code?",
      "Do you have any discounts?",
    ],
    answer:
      "To apply a promo code:\n1. Add items to your cart\n2. Proceed to **Checkout**\n3. Enter your code in the **Promo Code** field\n4. Click **Apply** — the discount appears instantly\n\nNote: Only one promo code can be applied per order. Codes are case-insensitive and cannot be combined with other offers unless stated. Expired codes will show an error message.",
  },
  {
    id: "pay-003",
    category: "Payment",
    tags: ["invoice", "receipt", "billing", "bill"],
    questions: [
      "How do I get an invoice?",
      "Can I get a receipt?",
      "I need a billing invoice",
      "Where is my invoice?",
    ],
    answer:
      "An order confirmation email with a receipt is sent automatically after every purchase. For a formal **PDF invoice**, go to **My Orders → Order Details → Download Invoice**. Business customers requiring VAT/tax invoices can request one by contacting support with their order number and tax registration details.",
  },

  // ─── ACCOUNT ───────────────────────────────────────────────────────────────
  {
    id: "acct-001",
    category: "Account",
    tags: ["password", "reset", "forgot", "login", "sign in"],
    questions: [
      "I forgot my password",
      "How do I reset my password?",
      "Can't log in to my account",
      "Password reset",
    ],
    answer:
      "To reset your password:\n1. Click **Sign In** on the top right\n2. Click **Forgot Password?**\n3. Enter your email address\n4. Check your inbox for a reset link (valid for 24 hours)\n5. Click the link and set a new password\n\nIf you don't receive the email within 5 minutes, check your spam folder. Still having trouble? Contact support with your account email.",
  },
  {
    id: "acct-002",
    category: "Account",
    tags: ["account", "create", "register", "sign up", "new account"],
    questions: [
      "How do I create an account?",
      "How do I sign up?",
      "I want to register",
      "How do I make an account?",
    ],
    answer:
      "Creating an account is free and takes under a minute:\n1. Click **Sign Up** at the top of the page\n2. Enter your name, email, and a password\n3. Verify your email address via the confirmation link\n4. Start shopping!\n\nYou can also sign up using your **Google** or **Apple** account for instant access.",
  },
  {
    id: "acct-003",
    category: "Account",
    tags: ["delete", "close", "deactivate", "remove account"],
    questions: [
      "How do I delete my account?",
      "I want to close my account",
      "Delete my data",
      "Deactivate my account",
    ],
    answer:
      "To delete your account, go to **My Account → Settings → Privacy → Delete Account**. This permanently removes all your data including order history. **This action cannot be undone.** Any pending orders will still be fulfilled. If you have gift card balance or store credit, those will be forfeited. Consider downloading your data before deletion via **Settings → Download My Data**.",
  },

  // ─── PRODUCT ───────────────────────────────────────────────────────────────
  {
    id: "prod-001",
    category: "Products",
    tags: ["warranty", "guarantee", "defective", "broken", "damaged"],
    questions: [
      "What is your warranty policy?",
      "Is there a guarantee on products?",
      "I received a damaged item",
      "My product stopped working",
    ],
    answer:
      "All products come with a **12-month manufacturer's warranty** covering defects in materials and workmanship. If your item arrives damaged or becomes defective within the warranty period:\n1. Contact support with photos of the issue\n2. We'll arrange a free replacement or full refund\n3. No need to return the defective item in most cases\n\nWarranty does not cover accidental damage, misuse, or normal wear and tear.",
  },
  {
    id: "prod-002",
    category: "Products",
    tags: ["stock", "availability", "out of stock", "when back", "restock"],
    questions: [
      "When will this be back in stock?",
      "Is this item available?",
      "How do I know when something is restocked?",
      "Out of stock notification",
    ],
    answer:
      "For out-of-stock items, click **Notify Me When Available** on the product page. You'll receive an email as soon as it's restocked. Restock times vary — popular items typically return within 2–4 weeks. You can also check back regularly or follow us on social media where we announce restocks.",
  },

  // ─── TECHNICAL / GENERAL ───────────────────────────────────────────────────
  {
    id: "tech-001",
    category: "Technical Support",
    tags: ["website", "error", "bug", "not working", "technical", "issue", "problem"],
    questions: [
      "The website isn't working",
      "I'm getting an error",
      "Page won't load",
      "Technical problem with the site",
    ],
    answer:
      "Sorry to hear you're having trouble! Try these steps:\n1. **Clear browser cache** (Ctrl+Shift+Del)\n2. **Try a different browser** (Chrome, Firefox, Safari)\n3. **Disable browser extensions** temporarily\n4. **Check your internet connection**\n5. **Try incognito/private mode**\n\nIf the issue persists, please describe the error message and the page you were on when contacting support — include a screenshot if possible.",
  },
  {
    id: "tech-002",
    category: "Technical Support",
    tags: ["app", "mobile", "phone", "download", "android", "ios"],
    questions: [
      "Do you have a mobile app?",
      "Where can I download your app?",
      "Is there an iOS or Android app?",
    ],
    answer:
      "Yes! Our mobile app is available for both platforms:\n- 📱 **iOS:** Search 'SupportAgent Shop' on the App Store\n- 🤖 **Android:** Search 'SupportAgent Shop' on Google Play\n\nThe app offers exclusive app-only deals, push notifications for order updates, faster checkout, and a seamless shopping experience. It's free to download.",
  },
  {
    id: "gen-001",
    category: "General",
    tags: ["contact", "support", "human", "agent", "help", "talk", "speak"],
    questions: [
      "How do I contact support?",
      "I want to speak to a human",
      "Talk to a real person",
      "Customer service contact",
    ],
    answer:
      "You can reach our support team through multiple channels:\n- 💬 **Live Chat:** Available 24/7 on our website (bottom right corner)\n- 📧 **Email:** support@example.com (response within 24 hours)\n- 📞 **Phone:** 1-800-123-4567 (Mon–Fri 9 AM–6 PM EST)\n- 🐦 **Twitter/X:** @ExampleSupport for quick queries\n\nFor urgent issues, live chat or phone is fastest.",
  },
  {
    id: "gen-002",
    category: "General",
    tags: ["hours", "open", "available", "working hours", "operating"],
    questions: [
      "What are your business hours?",
      "When are you open?",
      "What time does support close?",
      "Are you available on weekends?",
    ],
    answer:
      "Our support availability:\n- 💬 **Live Chat & AI Assistant:** 24/7, always available\n- 📞 **Phone Support:** Monday–Friday, 9 AM–6 PM EST\n- 📧 **Email Support:** Monitored 24/7, responses within 24 hours (faster on weekdays)\n- 🏪 **Store Hours:** Monday–Sunday, 10 AM–9 PM (varies by location)",
  },
  {
    id: "gen-003",
    category: "General",
    tags: ["loyalty", "rewards", "points", "program", "membership"],
    questions: [
      "Do you have a loyalty program?",
      "How do I earn rewards?",
      "What is your rewards program?",
      "How do I use my points?",
    ],
    answer:
      "Yes! Our **Rewards Program** lets you earn points on every purchase:\n- 🛍️ **Earn:** 1 point per $1 spent\n- 🎂 **Bonus:** 2x points on your birthday month\n- ⭐ **Tiers:** Silver (100 pts), Gold (500 pts), Platinum (1000 pts)\n- 💰 **Redeem:** 100 points = $1 discount\n\nEnroll for free under **My Account → Rewards**. Points expire after 12 months of account inactivity.",
  },
];

module.exports = knowledgeBase;
