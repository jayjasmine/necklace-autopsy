# Necklace Autopsy — offer

## Product card

- **Name:** Necklace Autopsy
- **Problem:** My face looks fine. My neck has rings. I still button to the collarbone and skip v-necks because the mirror and Zoom both snitch.
- **Avatar:** Women 35–55 who already buy face retinol and SPF, notice horizontal necklace lines / tech-neck rings, and hide décolletage.
- **Hook:** Your face looks 38. Your neck looks 50.
- **Fear:** Your necklace lines are aging you past your face. Upload a photo before you buy one more neck cream.
- **Status:** She wears v-necks. You still button to the collarbone. Guess whose Zoom still looks expensive.
- **Promise:** In under 5 minutes, upload one neck photo and get a necklace-line grade, what cream cannot fix, and a cream-vs-clinic path — before another neck-cream refill.
- **Price:** $19 USD, one time. Hard paywall before full report scores.
- **Channel hypothesis:** Meta, using the hook above.
- **Verdict:** TEST

### What the $19 report contains

- Necklace-line grade: mild, moderate, or deep. Automated cosmetic estimate from a mid-neck crop. Not a diagnosis.
- Optional pose note: photo at rest, or after looking down.
- Keep / Pause / Kill on cream spend versus a clinic path.
- What cream will not fix (deep etched lines are a clinic conversation, not another jar).
- Clinic categories, named generically: HA injectable for neck lines, radiofrequency (RF), filler class. Talk to a licensed clinician. No prescribing.
- SPF and extend-the-face-routine checklist.

### Nearby money (context, not our reviews)

Neck creams are commonly about $30–$60 a month. Clinic neck rejuvenation is commonly hundreds to a few thousand. This product sells the one-time read, not the cream and not the procedure.

### Explicit non-goals

No Rx fulfillment, no telehealth, no marketplace, no login, no subscription, no app-store binary. Not medical advice.

## Stripe product fields

Create these in Stripe. Do not invent a subscription price.

| Field | Value |
| --- | --- |
| Product name | `Necklace Autopsy` |
| Description | One-time necklace-line grade, what cream cannot fix, and a cream-vs-clinic path. Cosmetic and educational only. Not medical advice, not a diagnosis, not a prescription. |
| Pricing | One time |
| Amount | `1900` cents |
| Currency | `USD` |
| Charge | `$19.00` once |
| Quantity | 1, not adjustable |
| Shipping address | Off |
| Payment Link after completion | Redirect to `https://jayjasmine.github.io/necklace-autopsy/success.html` |

Do not leave customers on Stripe’s hosted confirmation page. If they never hit `success.html`, the report stays locked.

After the link exists, set `STRIPE_PAYMENT_LINK` in `js/config.js` to the `https://buy.stripe.com/...` URL. Until then leave it as `""`. An empty link must not unlock the report.

`ALLOW_TEST_UNLOCK` stays `false`.
