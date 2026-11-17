# New Generation Foundation demo

A sales-demo extension for a tailored walkthrough of Twenty CRM with Fundraising for Twenty
(`apps/fundraising/nonprofit-fundraising`) for New Generation Foundation (NGF), a Florence-based arts
philanthropy organisation.

The demo app is not part of the fundraising product. It adds NGF-shaped objects around the fundraising
app's Gift, Fund, Appeal and Opportunity model:

- **Programmes**: NGF's real programmes (Mascarade Opera, Vox Medicea, Nouveaux Ballets Russes / New Ballet).
- **Programme roles**: artists' roles in a programme, with dates and an optional scholarship.
- **Relationships**: typed links between people, and between people and organisations, with dates.
- **Events** and **Event guests**: invitations, RSVPs, attendance and gifts on the night.
- **Memberships**: Friends and Under-35 memberships with renewal dates and payments.
- Profile, preference and GDPR fields on Person; organisation type on Company; giving route and
  original currency on Gift.

All people, organisations, gifts, events and conversations in the seed data are fictional. Only the
programme names and descriptions refer to NGF.

## Building the demo workspace

The demo runs on the local test instance (`fundraising-local`, http://localhost:2021). The fundraising
app must be installed before this app.

```bash
# Fresh instance (deletes everything on the test instance)
twenty local reset --test --yes
twenty local start --test
twenty auth login --url http://localhost:2021 --name fundraising-local
# Then delete the Apple sample data the image creates (people, companies, opportunities,
# tasks, notes, dashboards, attachments, messages, calendar events).

# Install the fundraising app, then this app
(cd ../../fundraising/nonprofit-fundraising && twenty app apply --create --remote fundraising-local)
twenty app apply --create --remote fundraising-local

# Workspace settings neither app owns: Gift Aid off, cultivation stages, Organisations label,
# sidebar folders and order, hidden Gift Aid tab and widget. Safe to rerun, and rerun it after
# re-applying the fundraising app, which can restore its own sidebar items and tabs.
scripts/configure-workspace.sh fundraising-local

# Seed the demo world (does nothing if it is already present)
twenty app exec --name seed-ngf-demo --remote fundraising-local

# Open-rehearsal invitation lists (Italian / English by preferred language) and draft campaigns
twenty app exec --name seed-ngf-campaigns --remote fundraising-local

# Fill the fundraising rollups (donor totals, appeal and company summaries)
cd ../../fundraising/nonprofit-fundraising
twenty app exec --name reconcile-donor-rollups-nightly --remote fundraising-local
twenty app exec --name recompute-appeal-rollups --remote fundraising-local \
  --payload '{"body":{"appealIds":[...all appeal ids...]}}'
```

Use `twenty app plan --remote fundraising-local` before re-applying either app to an existing demo
workspace.

## Checks

```bash
yarn test:unit      # seed data references and volumes
twenty app typecheck
twenty app build
```
