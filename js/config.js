/**
 * Necklace Autopsy runtime config.
 *
 * TODO: Paste a Stripe Payment Link, for example https://buy.stripe.com/...
 * In Stripe, set that link's after-completion redirect to:
 * https://jayjasmine.github.io/necklace-autopsy/success.html
 *
 * Leave this as an empty string until the link exists.
 * An empty value must not unlock the report, and Pay must not pretend it did.
 */
export const STRIPE_PAYMENT_LINK = "";

/**
 * Default false so the public paywall has no test-unlock button.
 * true: show a control that goes to ?unlocked=1.
 * The only dev bypass is the query ?unlocked=1. The flag alone never unlocks.
 */
export const ALLOW_TEST_UNLOCK = false;

export const PRICE_LABEL = "$19";
export const PRODUCT_NAME = "Necklace Autopsy";
