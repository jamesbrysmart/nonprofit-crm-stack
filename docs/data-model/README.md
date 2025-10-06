# Data Model Index

This folder captures canonical documentation for the data models that power our modular stack. Use these notes to keep cross-module contracts consistent and to spot overlap before it happens.

- `twenty-core.md` tracks the base CRM objects surfaced by Twenty (people, organisations, households, tasks, etc.).
- `fundraising.md` covers the managed extension layer that introduces gifts, appeals, opportunities, and related attribution helpers.

As new modules emerge (events, membership, finance), add a peer file rather than expanding an existing one. Each module doc should highlight:

1. **Purpose & Scope** – what the module owns.
2. **Primary Objects & Fields** – the stable contracts we expose.
3. **Relationships & Dependencies** – how this module links to others, and any assumptions.
4. **Open Questions / Upcoming Changes** – hotspots to revisit before shipping.
5. **References** – specs, tickets, or diagrams that offer deeper context.

Keeping this folder current is a prerequisite for backlog grooming; when we update specs in `docs/features`, reflect the data model impact here.
