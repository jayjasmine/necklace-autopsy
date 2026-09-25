# Necklace Autopsy

$19 one-time necklace-line autopsy. A static funnel: one neck photo, a hard paywall, then a cosmetic grade and a cream-versus-clinic path.

Your face looks 38. Your neck looks 50.

This is not medical advice, not a diagnosis, and not a medical device. It does not prescribe treatment or book a procedure. Photos stay in the browser. Nothing is uploaded.

## Open locally

ES modules do not run from `file://`. Use a local static server:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/](http://localhost:8080/).

## Pages

| Page | Role |
| --- | --- |
| `index.html` | Fear and status hooks, then the upload CTA |
| `upload.html` | One neck photo plus rest vs looking-down. Saved in IndexedDB on the device |
| `paywall.html` | Hard paywall. Scores are not on this page |
| `success.html` | Stripe after-payment return. Unlocks, then opens the report |
| `report.html` | Grade, Keep / Pause / Kill, what cream will not fix, clinic categories, SPF checklist |

`js/config.js` exports `STRIPE_PAYMENT_LINK` (`""`), `ALLOW_TEST_UNLOCK` (`false`), `PRICE_LABEL` (`"$19"`), and `PRODUCT_NAME`.

## Stripe Payment Link

1. In Stripe, create a one-time product. Exact fields are in `OFFER.md` (name **Necklace Autopsy**, **1900** cents, USD).
2. Create a Payment Link for that price.
3. Set after-completion to **redirect** (do not stop on Stripe’s hosted confirmation) to:

   `https://jayjasmine.github.io/necklace-autopsy/success.html`

4. Paste the `https://buy.stripe.com/...` URL into `STRIPE_PAYMENT_LINK` in `js/config.js`.

Until that string is a real `https://buy.stripe.com/` or `https://checkout.stripe.com/` link, the Pay control stays disabled. It does not navigate to `success.html` and it does not unlock the report. Pointing the config at `success.html` is rejected on purpose.

`ALLOW_TEST_UNLOCK` defaults to `false`. Leave it false on the public site. `true` only adds a paywall link to `?unlocked=1`. The flag alone never unlocks a normal visit.

### Dev unlock

`?unlocked=1` on `paywall.html` or `report.html` is the only bypass. It is a same-tab preview, not a payment. It is not a secret: this site has no server to verify Stripe. Clear site data for the origin to drop a paid unlock; closing the tab drops the dev unlock.

A direct visit to `success.html` also unlocks, because that is the Payment Link return and a static host cannot check a Checkout Session. Do not link to it from the landing page.

## GitHub Pages

Live URL: `https://jayjasmine.github.io/necklace-autopsy/`

Pick one source:

**Branch (simplest).** Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main` → Folder: **`/ (root)`** → Save. `.nojekyll` is in the repo so Pages serves the files as-is.

**GitHub Actions.** Settings → Pages → Source: **GitHub Actions**, then run the **pages** workflow (`.github/workflows/pages.yml`, manual dispatch). It publishes the same root files. Do not enable both sources.

## Disclaimer

Every page that shows advice carries this line: cosmetic and educational only; not medical advice, not a diagnosis, not a medical device; Necklace Autopsy does not prescribe treatment or tell you to have a procedure.

The necklace-line grade (mild / moderate / deep) is an automated contrast estimate on a mid-neck crop. Lighting, jewelry, clothing, and filters change it. The report says that in the UI. Clinic options are named as categories only — HA injectable for neck lines, radiofrequency (RF), filler class — with “talk to a licensed clinician.”

## Smoke test

1. `python3 -m http.server 8080` and open the site.
2. Home → **Upload one neck photo** → add a JPG/PNG, mark rest or looking down → **Continue**.
3. On the paywall, confirm the grade word is absent and **Pay $19** does not leave the page or unlock anything while `STRIPE_PAYMENT_LINK` is `""`.
4. Open `paywall.html?unlocked=1` → **Open the report**.
5. Confirm a mild / moderate / deep grade, Keep / Pause / Kill, cream limits, clinic categories, the SPF checklist, and the cosmetic disclaimer.
6. Open `report.html` in a new tab (no `?unlocked=1`). It should return to the paywall.

## Out of scope

No accounts, no subscription, no Rx fulfillment, no telehealth, no marketplace, no app binary.
