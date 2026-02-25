# Narvo Monetisation

This document describes Narvo’s **monetisation strategy**, revenue model, pricing approach, payment infrastructure, and unit economics. It works with [Narvo_Subscription_Tiers.md](./Narvo_Subscription_Tiers.md) (Free / Pro / Enterprise) and [Narvo_Product_Concept.md](./Narvo_Product_Concept.md).

---

## 1. Revenue Model Overview

Narvo’s primary revenue model is **subscription-led**:


| Stream                   | Description                                                                   | Status       |
| ------------------------ | ----------------------------------------------------------------------------- | ------------ |
| **Pro subscriptions**    | Monthly or annual paid plans for individuals and power users.                 | **Proposed** |
| **Enterprise contracts** | Custom agreements for newsrooms, publishers, and API consumers.               | **Proposed** |
| **Free tier**            | No direct revenue; supports growth, engagement, and upsell to Pro/Enterprise. | **Current**  |


**Optional future streams** (not in current scope):

- **Advertising** – Sponsored slots or display in Free tier (e.g. between stories or in Discover). Would require ad tech, consent, and design-system-compliant placements.
- **API licensing** – Paid access to TTS, translation, or fact-check APIs for third-party apps. Aligns with the Enterprise tier.
- **Partnerships & licensing** – White-label or co-branded deployments for media houses or NGOs.

This doc focuses on **subscription revenue** and what’s needed to support it.

---

## 2. Revenue Streams in Detail

### 2.1 Pro Subscriptions

- **Who:** Individual listeners, professionals, diaspora, and heavy users who want higher limits, more briefings, and a better experience.
- **What:** Recurring revenue (monthly or annual). Annual can be discounted (e.g. 1–2 months free) to improve cash flow and retention.
- **How:** User upgrades from Free to Pro in-app or on web; payment via card or local payment methods (see Payment infrastructure).
- **Metrics to track:** MRR, ARR, Pro conversion rate (Free → Pro), trial-to-paid (if trials are used), churn.

### 2.2 Enterprise

- **Who:** Newsrooms, publishers, NGOs, and businesses that need volume, APIs, admin tools, or SLA.
- **What:** Contract-based (annual or multi-year), often with per-seat or usage-based components.
- **How:** Sales-led; contract, invoicing, and sometimes PO. Payment terms (e.g. net 30) and local currency where relevant.
- **Metrics to track:** Contract value (ACV), number of accounts, usage (API calls, TTS minutes), renewal rate.

### 2.3 Free Tier

- **Role:** User acquisition, habit formation, and product discovery. Free users can convert to Pro or be part of an Enterprise deployment.
- **Monetisation:** Indirect (conversion to paid). Optional future: non-intrusive ads to offset cost or support a “forever free” tier.

---

## 3. Pricing Strategy

### 3.1 Principles

- **Value-based:** Price reflects value (more stories, more TTS, more languages, trust tools), not just cost.
- **Market-aware:** African markets have varying willingness to pay and currency volatility; consider local pricing and payment methods.
- **Simple:** Few plans (Free, Pro, Enterprise) with clear differentiation (see Subscription Tiers doc).
- **Transparent:** Clear limits and benefits per tier; no hidden fees.

### 3.2 Pro Pricing (Proposed)

All figures are **placeholders** for strategy discussion. Final pricing should be validated with research and willingness-to-pay.


| Region / currency           | Monthly         | Annual (e.g. pay 10, get 12) | Notes                                                    |
| --------------------------- | --------------- | ---------------------------- | -------------------------------------------------------- |
| **Nigeria (NGN)**           | ₦2,000 – ₦5,000 | ₦20,000 – ₦50,000            | Adjust for purchasing power and card adoption.           |
| **West Africa (XOF / GHS)** | Equivalent band | Equivalent band              | Consider mobile money and local cards.                   |
| **International (USD)**     | $4 – $10        | $40 – $100                   | Standard reference; may be used for diaspora and global. |


Recommendations:

- Offer **annual** with a visible discount (e.g. “2 months free”).
- Consider a **trial** (e.g. 7 or 14 days Pro) to reduce friction; gate on payment method to limit abuse.
- Revisit pricing when limits (TTS, offline, briefings) are fixed and cost per user is understood.

### 3.3 Enterprise Pricing (Proposed)

- **Model:** Custom (per-seat, usage-based, or flat annual).
- **Components:** Seats, API calls, TTS/translation volume, support level, SLA.
- **Currency:** USD or local currency by contract; invoicing and payment terms as agreed.

---

## 4. Payment Infrastructure

### 4.1 Requirements

- **Pro:** Recurring billing (monthly/annual), card and, where possible, local payment methods; secure storage of payment methods; receipts and invoices.
- **Enterprise:** Invoicing, PO support, and optional annual pre-pay; may not require a card-on-file flow in-product.

### 4.2 Recommended Stack (Proposed)


| Layer                        | Option                           | Notes                                                                 |
| ---------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| **Payments**                 | Stripe                           | Subscriptions, invoices, multi-currency; strong API.                  |
| **Alternative / complement** | Paystack, Flutterwave            | Strong in Nigeria and Africa; local cards and sometimes mobile money. |
| **Billing portal**           | Stripe Customer Portal or custom | Upgrade, downgrade, cancel, update card.                              |
| **Tax**                      | Stripe Tax or local provider     | If required for VAT or local tax.                                     |


Implementation outline:

1. **Backend:** Store `subscription_id`, `plan_id`, `current_period_end`, and `status` (e.g. `active`, `canceled`, `past_due`) in user profile or a `subscriptions` collection; sync from Stripe webhooks.
2. **Frontend:** After successful payment, set user tier to `pro`; show Pro benefits and billing management (e.g. link to Stripe portal or in-app subscription page).
3. **Webhooks:** Handle `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted` to keep tier and access in sync.

### 4.3 Local Payment Methods (Africa)

- **Cards:** Visa/Mastercard via Stripe or Paystack/Flutterwave.
- **Mobile money:** Where supported by provider (e.g. Paystack in some markets); consider for Pro in relevant countries.
- **Bank transfer / USSD:** More common for Enterprise; can be manual or via provider if available.

---

## 5. Unit Economics (Proposed)

### 5.1 Cost of Goods Sold (COGS) – Per-User Approximates

Rough cost drivers per active user (for sizing only; actuals depend on usage and provider pricing):


| Cost                        | Driver                          | Notes                                             |
| --------------------------- | ------------------------------- | ------------------------------------------------- |
| **TTS**                     | Characters or minutes generated | OpenAI TTS via Emergent; cost per request.        |
| **Translation / narrative** | API calls (Gemini)              | Per story or per request.                         |
| **Fact-check**              | API calls                       | Google Fact Check API; mock has no marginal cost. |
| **Hosting & data**          | Monthly active users            | Backend, DB, CDN, bandwidth.                      |
| **Support**                 | Tickets or hours                | Scale with Pro/Enterprise.                        |


**Recommendation:** Instrument usage (TTS requests, translation calls, fact-check calls) per user and per tier. Use this to set Free limits and Pro quotas so that Pro margin stays positive.

### 5.2 Key Metrics


| Metric              | Definition                                | Target (example)                            |
| ------------------- | ----------------------------------------- | ------------------------------------------- |
| **CAC**             | Cost to acquire a user (marketing, sales) | Keep below LTV / 3 for Pro.                 |
| **LTV**             | Net revenue per user over lifetime        | Grow via retention and annual plans.        |
| **LTV:CAC**         | LTV / CAC                                 | e.g. > 3 for Pro.                           |
| **Conversion rate** | Free → Pro (or trial → Pro)               | Track and optimise with pricing and limits. |
| **Churn (Pro)**     | % Pro users cancelling per month          | Reduce with engagement and value.           |
| **ARPU**            | Average revenue per user (all users)      | Increases as Pro share grows.               |


---

## 6. Conversion and Retention

### 6.1 Free → Pro

- **Triggers:** Hitting a limit (TTS, offline, briefing), or desire for more languages, priority support, or ad-free experience.
- **Tactics (proposed):** In-app upsell when limit is reached; clear comparison table (Free vs Pro); time-limited discount for first year; trial.
- **Placement:** Settings, Account page (e.g. where “PREMIUM_ACTIVE” / “SUBSCRIPTION_PLAN” appears), and post-limit modals.

### 6.2 Retention

- **Pro:** Reduce churn by delivering clear value (limits, briefings, export, support). Use email or in-app nudges before renewal; offer pause or downgrade instead of cancel.
- **Enterprise:** Success manager, usage reviews, and product adoption to secure renewals and expansion.

### 6.3 Trials (Proposed)

- **Pro trial:** 7–14 days with full Pro features; collect payment method upfront; auto-convert to paid unless cancelled.
- **Risk:** Abuse (multiple trials). Mitigate with device/account checks or trial once per payment method.

---

## 7. Roadmap (Monetisation-Related)


| Phase                      | Focus                                                                                             | Dependency                             |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **1. Limits & tiers**      | Define and enforce Free limits (TTS, offline, briefings, fact-check). Add `tier` to user profile. | Backend + frontend gating.             |
| **2. Payment integration** | Stripe (or Paystack) for Pro: checkout, webhooks, subscription status.                            | Stripe account; secure env.            |
| **3. Pro experience**      | Unlock Pro features when `tier === 'pro'`; billing portal or subscription management page.        | Phase 1 + 2.                           |
| **4. Trials & pricing**    | Launch trial (if desired); set and communicate pricing (NGN/USD).                                 | Phase 2 + 3.                           |
| **5. Enterprise**          | Contracts, invoicing, API keys, org admin, usage reporting.                                       | Sales process; API and admin features. |
| **6. Optimisation**        | A/B tests on price and trial length; local payment methods; retention campaigns.                  | Analytics and messaging.               |


---

## 8. Legal and Compliance (Considerations)

- **Terms of Service / Subscription terms:** Define billing, renewal, cancellation, and refund policy.
- **Privacy:** Payment data handled by Stripe/provider; do not store full card numbers. Comply with applicable data protection (e.g. NDPR, GDPR where relevant).
- **Tax:** Determine if VAT or other tax applies in Nigeria or other markets; implement collection/remittance if required.
- **Refunds:** Define policy (e.g. pro-rata, no refund after 14 days) and implement via Stripe or provider.

---

## 9. Summary


| Topic          | Summary                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| **Revenue**    | Subscription-led: Pro (recurring) and Enterprise (contracts). Free supports growth.                    |
| **Pricing**    | Pro: placeholder bands in NGN and USD; annual discount; optional trial. Enterprise: custom.            |
| **Payments**   | Stripe (or Paystack/Flutterwave) for Pro; webhooks to keep tier in sync; local methods where possible. |
| **Economics**  | Track TTS, translation, fact-check usage; set limits so Pro is profitable; monitor LTV, CAC, churn.    |
| **Conversion** | Upsell at limits; clear Free vs Pro; trials and first-year discount.                                   |
| **Next steps** | Implement tier + limits → payment integration → Pro experience → trials & pricing → Enterprise.        |


For feature and limit details per tier, see **[Narvo_Subscription_Tiers.md](./Narvo_Subscription_Tiers.md)**.