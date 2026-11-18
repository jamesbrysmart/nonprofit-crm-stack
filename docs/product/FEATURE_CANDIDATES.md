# Fundraising for Twenty: feature candidates

_Status: working list, not commitments_
_Updated: 2026-11-18_

Generic nonprofit features suggested by client work, recorded so they can be weighed for the product
independently of any one client. Each entry notes where a working prototype exists. Prototypes in demo
apps cannot be moved into the product app (objects belong to the app that defines them); they would be
rebuilt there with proper design.

## From the NGF demo (`apps/demos/new-gen-foundation`)

Local demo notes live in `docs/pilots/ngf/OVERVIEW.md`, which is kept out of the repository with the other client notes.

### Events and attendance

Event with type, status, date, venue, capacity, programme or appeal link and income target; Event Guest
with RSVP status, guest role, party size, table, dietary and access notes, attendance and follow-up.
Gifts link to the event. Invited, accepted and attended counts stay current through record-event
triggers. An RSVP kanban worked well in the demo.

Design questions: relationship to Appeal Source (`EVENT_ASK`) for event income; ticketing and paid
registration; online RSVP; whether guests of guests need their own records.

### Memberships and renewals

Membership with tier, status, member since, current period, renewal date and fee, with payments as gifts.
Common in arts and heritage organisations and distinct from recurring agreements (status and renewal
rather than a payment schedule).

Design questions: automatic status from dates; renewal reminders and workflows; link to recurring
agreements for direct-debit members; online joining.

### Relationships with roles and dates

Typed person-to-person and person-to-organisation relationships with start and end dates (spouse or
partner, introduced by, trustee of, works at, main contact for, and similar). Requested by NGF and common
in RFIs.

Design questions: reciprocal labels (patron of / supported by); overlap with households; whether to use a
polymorphic target.

### Constituent types and contact preferences

Constituent types (donor, patron, member, board, prospect, institutional contact, newsletter), preferred
language, contact preferences and GDPR consent date and source on Person.

Design questions: one opt-out and consent model that reconciles Fundraising for Twenty's supporter email
opt-out with native Campaigns unsubscribes and suppressions; consent history rather than a single date.

### Gift currency handling

Donor and other rollups currently add amounts across currencies and label the total with the latest gift's
currency. Organisations taking gifts from several countries need gifts recorded in a base currency with
the original amount and currency retained (the demo used giving route and original amount fields), and
rollups that never mix currencies.

### Cultivation stages and pipeline views

Opportunity stages relabelled as a cultivation cycle (identification, qualification, cultivation,
solicitation, pledged or won, stewardship, declined) with a kanban view. Could ship as recommended
workspace configuration rather than code.

### Fundraising dashboard

A Development dashboard of native widgets: income this year and by year, by fund and by giving route;
open pipeline and pipeline by stage; members by tier; event attendance; upcoming events, stewardship
tasks, renewals due and recent gifts. Could ship from the product app as a standalone page layout.

### Gift Aid setting coverage

`GIFT_AID_ENABLED` should hide Gift Aid tabs, widgets and navigation, not only the New gift panel. (Product
fix rather than a new feature.)
