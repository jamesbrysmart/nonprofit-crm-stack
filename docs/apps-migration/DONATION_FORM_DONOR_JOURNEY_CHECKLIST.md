# Donation form donor journey checklist

A manual regression pass over the public donation form, run in Stripe test mode
on the local `fundraising-local` server (port 2021). Run it before and after any
change to the donor-facing page, and record the date, the Twenty server version
and the app commit next to the results.

Never run it against port 2020 or a client workspace.

## Setup

1. The app is applied to `fundraising-local`, with `STRIPE_PUBLISHABLE_KEY`,
   `STRIPE_SECRET_KEY` (test mode) and `STRIPE_WEBHOOK_SECRET` set.
2. Forward webhooks and copy the signing secret it prints into
   `STRIPE_WEBHOOK_SECRET`:
   `stripe listen --events checkout.session.completed,invoice_payment.paid --forward-to <app functions URL>/stripe/webhook` (locally without a public domain: `http://localhost:2021/s/stripe/webhook`)
3. A Live donation form with: one-off and monthly, three preset amounts, custom
   amount with a minimum, Gift Aid enabled, phone collected.
4. Open the form two ways:
   - directly: `http://localhost:2021/s/donation-forms/embed-frame?publicId=<publicId>`
   - embedded: a copy of `docs/spikes/fixtures/embedded-donation-form-host-page.html`
     with its iframe replaced by the embed code from the form's Publish panel
     (the code includes the resize script)
5. Keep the browser developer tools console open and note any errors.

Stripe test cards (any future expiry, any CVC, any postcode):

| Card | Behaviour |
|---|---|
| 4242 4242 4242 4242 | Succeeds |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | Requires 3D Secure authentication |

## Platform check (first)

Twenty sends route pages with `Content-Security-Policy: sandbox …` (from SDK
2.59), so the page runs with an opaque origin.

- [ ] The form loads with no console errors
- [ ] Submitting step 1 loads the Stripe payment fields (no CORS or storage
      errors in the console)

If either fails, stop and record the console output: it is a platform
compatibility issue, not a form bug.

## Journeys

| # | Journey | Expected |
|---|---|---|
| 1 | One-off, preset amount, card 4242 | Thank-you shown; staging row moves from awaiting payment to payment confirmed after the webhook |
| 2 | Monthly, preset amount, card 4242 | Thank-you shown; staging row confirmed with recurring evidence |
| 3 | Custom amount above the minimum | Charged amount matches the custom amount |
| 4 | Custom amount below the minimum | Error summary takes focus and links to the amount; no payment fields; can correct and continue |
| 5 | Gift Aid ticked | Address fields appear and are required; declaration evidence on the staging row |
| 6 | Card 4000…0002 (declined) | Clear decline message; can retry with another card |
| 7 | Card 4000…3155 (3D Secure) | Authentication modal appears; completing it shows thank-you |
| 8 | Change donation details from step 2 | Returns to step 1 with entries kept; continuing creates a working payment step |
| 9 | Missing required fields | Error summary lists each problem, takes focus, and its links move to the fields; inline errors clear as fields are edited |
| 10 | Reload the page after a successful journey and submit again | A new payment step loads (a fresh form token is issued per page) |

## Donor experience

- [ ] Phone width (375px and 320px): no horizontal scrolling, fields and
      buttons usable, payment fields fit
- [ ] Embedded in the host page: the iframe resizes to the form at each step,
      with no scrollbar inside it; moving between steps scrolls the form into
      view if it is off screen
- [ ] Keyboard only: every control reachable in order, selection visible, form
      can be completed and submitted
- [ ] Screen reader (VoiceOver or NVDA), optional: amount choice, errors and the
      move to the payment step are announced

## Results

| Date | Server | App commit | Result and notes |
|---|---|---|---|
| | | | |
