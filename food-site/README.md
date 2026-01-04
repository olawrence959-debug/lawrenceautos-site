Lawrence Eats — Food pre-order site

Quick setup & deployment (Netlify)

1. Create a Netlify site from this repository and set the **base directory** to `food-site`.
2. Set the **Functions directory** to `netlify/functions`.
3. In Netlify Site settings → Environment, add:
   - `STRIPE_SECRET_KEY` (Stripe secret key)
   - `STRIPE_PUBLISHABLE_KEY` (Stripe publishable key)
4. Deploy. Netlify will install dependencies from the `package.json` in the repo root.

Notes
- Formspree is already wired via form action to `https://formspree.io/f/movgwkgr` which will send emails to your address.
- For Stripe, use test keys first. After a successful payment, you'll see the success page.
