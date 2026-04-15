# Toggleable Capabilities Architecture (Working Note)

Updated: 2026-03-21  
Status: Exploratory architecture note (`trial`)  
Audience: Product, engineering, and AI tooling

This note captures the current architectural framing for **toggleable capabilities** in the nonprofit suite.

It exists to prevent us from jumping too quickly into implementation-specific answers before we are clear on what a toggleable capability actually is in this product.

This is not a final ADR. It is a working note to guide the next design conversations.

## 1. Why this note exists

We have started using Gift Aid as the first serious test case for optional/toggleable functionality.

That immediately raises practical questions:

- how is a capability turned on or off;
- who is allowed to do that;
- what is different in self-hosted, managed-hosted, and cloud/SaaS modes;
- what happens at install/provision time versus runtime;
- how should current hybrid implementation choices relate to Twenty’s evolving Apps/extensibility model.

Those are not just UI questions. They are architecture questions.

## 2. Core framing

### 2.1 Capability is not the same as packaging

A capability such as Gift Aid is a **domain-level product capability**.

The following are **delivery or packaging mechanisms**, not the capability itself:

- Twenty metadata objects and fields;
- `fundraising-service` logic;
- custom React admin UI;
- future Twenty Apps, front components, or logic functions;
- scripts, manifests, install steps, or hosting controls.

This distinction matters because we do not want the capability model to be dictated by the current implementation surface.

### 2.2 The current posture is hybrid

The repo’s current posture is:

- **hybrid now**;
- **app-first later if/when Twenty’s extensibility surface proves mature enough**.

Implication:

- we should design toggleable capabilities so they work cleanly in the current hybrid architecture;
- we should avoid coupling the concept too tightly to today’s implementation details;
- we should preserve a future path where the same capability can be packaged more directly through Twenty Apps.

## 3. A toggleable capability has three layers

For this product, a capability is not truly "enabled" or "disabled" unless three layers align.

### 3.1 Provisioning layer

Questions:

- what schema, metadata, app entities, or assets must exist for the capability to function;
- are those provisioned only when enabled, or provisioned ahead of time and left dormant;
- can provisioning differ by hosting model.

Examples:

- Twenty custom objects/fields;
- app installation;
- metadata scripts;
- seeded config or capability manifests.

### 3.2 Behavior layer

Questions:

- what server-side logic becomes active when the capability is enabled;
- what evaluation, recalculation, export, automation, or workflow rules should be suppressed when it is disabled;
- what source of truth decides whether the backend should act.

Examples:

- Gift Aid determination logic;
- claim/export grouping;
- recalculation triggers;
- event handlers or scheduled jobs.

### 3.3 Visibility layer

Questions:

- what UI is shown, hidden, or simplified when the capability is disabled;
- should disabled capabilities be completely invisible, or visible in some admin-only context;
- how do we avoid confusing users with dormant fields or controls.

Examples:

- navigation items;
- form fields;
- queue columns or drawer sections;
- record detail panels;
- admin settings screens.

## 4. A capability needs one authoritative state

We need a single authoritative answer to:

- "Is this capability enabled for this workspace?"

That answer then needs to drive:

- backend behavior;
- UI visibility;
- installation/provisioning assumptions.

Working principle:

- avoid multiple competing definitions of capability state;
- avoid relying only on UI toggles or only on env vars for something that is conceptually workspace-scoped.

This does not yet answer where that state should live. It only states that we need one authoritative source.

## 5. Hosting mode matters

The activation path may legitimately differ by hosting model.

### 5.1 Self-hosted

Self-hosted environments can tolerate more operator-driven setup.

Possible characteristics:

- capability enabled through metadata provisioning plus runtime config;
- activation may involve scripts, manifests, or environment variables;
- operator/admin may be the same person.

### 5.2 Managed-hosted

Managed-hosted environments can support guided or operator-assisted enablement.

Possible characteristics:

- activation may still be initiated by us or by a managed onboarding process;
- internal tooling or runbooks may remain part of the process;
- workspace-level controls still matter if we host multiple client deployments.

### 5.3 Cloud / SaaS

Cloud/SaaS environments need cleaner and more standardized capability boundaries.

Possible characteristics:

- activation should not depend on editing env files or one-off scripts per tenant;
- capability state likely needs a more formal install or workspace-configuration path;
- packaging/distribution may align more closely with Twenty Apps once that surface is mature enough.

## 6. Why Gift Aid is a strong first test case

Gift Aid is useful as the first architectural test because it is:

- clearly optional;
- clearly UK-specific;
- broad enough to affect schema, backend logic, UI, and exports together;
- meaningful enough that "on" versus "off" really changes the product experience.

That makes it a better test than a trivial cosmetic toggle.

## 7. Current architectural conclusions

At this stage, the strongest conclusions are:

- we should treat Gift Aid as a **capability**, not as a set of scattered flags;
- the capability should be optional and off by default;
- the activation model must account for provisioning, behavior, and visibility together;
- the current hybrid architecture is the implementation context we must design for now;
- Twenty Apps/extensibility should influence future packaging direction, but should not prematurely dictate the capability model.

## 8. Working baseline (current recommendation, open to change)

Use this as the starting model for future sessions unless later evidence changes it.

### 8.1 Capability state

- capability state should be a **first-class workspace-level fact**;
- it should not be inferred only from env vars, UI flags, or metadata presence;
- backend behavior and UI visibility should both respect the same authoritative state.

### 8.2 Activation model

- capability activation should be treated as an **administrative/governance action**;
- it is closer to enabling a module than toggling a user preference;
- activation mechanics may differ by hosting model, but the conceptual model should stay consistent.
- current working model: capabilities should be **reversible in principle**, but **operationally heavyweight**.
- expected norm: a capability is usually enabled once and then left on.
- important distinction: "reversible" does **not** mean "casually toggled on and off at will."

### 8.3 Provisioning model

- provisioning should be considered part of capability activation;
- for Gift Aid specifically, current leaning is **conditional provisioning**, not pre-provisioning by default;
- Gift Aid-specific schema should only be created when the capability is enabled, unless a later reason emerges to keep some minimal shared pieces always present.

### 8.4 Runtime behavior

- runtime logic should always check capability state;
- disabled capabilities should not continue to run hidden backend behavior;
- visibility and behavior should stay aligned.

### 8.5 Meaning of disabled

- disabled should mean **hidden and inactive by default**;
- normal users should experience the product as if the capability does not exist;
- any admin-only traces or historical remnants should be treated as exceptional, not the default experience.
- if a capability was previously active, disabling it should normally mean **deactivating future use**, not erasing historical truth.
- current leaning: disable should stop ongoing behavior and hide normal UI, while preserving historical data/auditability unless a later tested pattern proves safer.

### 8.6 Packaging direction

- implement for the **current hybrid architecture first**;
- preserve a clean future path toward Twenty Apps/app-packaging;
- do not let immature upstream packaging constraints distort the capability model too early.

### 8.7 Ownership vs packaging

- capability **ownership** and app/package **boundaries** should be treated as separate questions;
- a capability may clearly belong to one domain (for example, Gift Aid belongs to Fundraising) without that automatically deciding whether it should be packaged inside one broader app or as a separately installable unit;
- future architecture should avoid accidental app sprawl, but should also avoid forcing all optional capability boundaries into one package if that produces poor modularity or weak activation semantics.

Current working interpretation:

- Gift Aid is clearly **fundraising-owned**;
- the open architectural question is whether fundraising-owned optional capabilities should live:
  - inside one broader Fundraising app/package,
  - as separate apps/modules,
  - or as fundraising-owned capability packs with separate implementation packaging where useful.

### 8.8 Confidence note

- this baseline is still a working model;
- the activation/deactivation posture must be validated through real implementation attempts before we treat it as settled;
- future capability test cases may reveal that some parts of this baseline need to change.

## 9. Fundamental architectural question to spike

Before finalizing capability activation mechanics, we need to answer a deeper question:

- for a **domain-owned optional capability**, where should the packaging boundary sit?

Using Gift Aid as the first test case:

- Gift Aid clearly belongs to the Fundraising domain;
- but it is still unclear whether it should be represented architecturally as:
  - part of one broader Fundraising app/package,
  - a separately installable Gift Aid app/module,
  - or a hybrid model where Fundraising owns the capability but implementation/installation boundaries remain more granular.

Why this matters:

- this choice affects activation semantics, app sprawl, UX coherence, provisioning complexity, and how well we can align with Twenty Apps in the future;
- the answer for Gift Aid may become the template for later capabilities such as receipts, reconciliation, enhanced households, and other modular features.

Current leaning:

- do not assume every optional capability deserves its own visible app;
- prefer domain coherence where possible;
- but validate through a spike whether a separate packaging boundary is the cleaner bridge pattern in the current hybrid-now, app-first-later reality.

### 9.1 First spike outcome (current recommendation)

The first architecture spike suggests the following working direction:

- do **not** treat "separate installed app" as the default authoritative source of capability state for Gift Aid;
- instead, prefer a **fundraising-owned workspace capability state/config model** as the authoritative source of truth;
- keep separate app packaging as a viable implementation/distribution option, but treat it as a packaging boundary rather than the meaning of the capability itself.

Why this is the current recommendation:

- Twenty does already have a real workspace-installed applications model and per-application variables;
- that makes a standalone Gift Aid app technically plausible;
- however, using separate installed apps as the default answer for every optional fundraising capability would likely create avoidable app sprawl;
- Gift Aid is clearly fundraising-owned, so capability state should ideally live at the fundraising-domain level rather than being defined only by package boundaries.

Working interpretation:

- **ownership:** Gift Aid belongs to Fundraising;
- **authority:** capability enabled/disabled should be represented by a fundraising-owned workspace capability record/config;
- **packaging:** separate app, bundled app, or hybrid packaging remains open and can evolve with Twenty's app surface.

What remains worth testing:

- the best concrete place in Twenty to hold fundraising-owned capability state today;
- how `fundraising-service` and the custom UI should read that state;
- whether a future Twenty App packaging model can cleanly map onto the same capability contract.

### 9.2 Implementation spike outcome (learning, not retained direction)

We did run a **real implementation spike** in the current hybrid stack, not just a code review.

That spike used a generic fundraising capability registry shape in Twenty to test whether workspace-scoped capability state could be represented in the current architecture.

What that spike usefully demonstrated:

- workspace-scoped capability state is technically representable in the current hybrid model;
- `fundraising-service` can, in principle, read capability-like state from Twenty rather than relying only on env flags;
- a client-facing settings contract would also be technically straightforward if we chose that path.

What it also made clear:

- the custom-object-backed registry felt too much like **ordinary domain data pretending to be configuration**;
- it was a technically viable bridge, but a clunky expression of capability state;
- it did not feel close enough to the likely long-term product/platform direction to justify keeping as an active implementation path.

Current interpretation after that spike:

- the spike was valuable as an architectural learning exercise;
- it should **not** be treated as the current recommended implementation;
- the retained lesson is about capability-state requirements, not about keeping a custom-object registry.

### 9.3 Updated direction after the hybrid-spike learning

The spike clarified an important architectural constraint:

- today, `fundraising-service` is still a **separate application** sitting beside Twenty;
- in practice, the stable bridge between Twenty and `fundraising-service` is the API plus metadata;
- that means any "toggle in Twenty" can only affect `fundraising-service` if the service can read that state through the API.

This was useful clarity, but it also reinforced why the custom-object registry approach felt clunky:

- it worked technically;
- but it behaved more like a workaround for the current hybrid boundary than like the right long-term capability model;
- it did not feel like a strong enough bridge to keep investing in once the likely app-oriented direction became clearer.

Current interpretation:

- this is further evidence that the long-term future of `fundraising-service` and later modules likely sits **inside the Twenty app model**, not permanently beside it as a separate service/UI;
- if we need an interim bridge again later, we should evaluate it against this lesson rather than assuming the custom-object registry deserves revival by default.

#### 9.3.1 Preferred long-term direction

Current preference:

- **one broader Fundraising app/package**
- with **internal optional capabilities** such as Gift Aid, receipts, reconciliation, and later enhancements

Why this is currently preferred:

- it preserves fundraising-domain coherence;
- it avoids app sprawl;
- it fits the "lean, modular CRM" direction better than many micro-apps;
- it gives us a more natural conceptual home for capability settings/toggles than ad hoc hybrid-side records.

#### 9.3.2 Viable fallback / bridge option

Still viable:

- **separate Gift Aid app/module**, installed per workspace

Why this remains worth keeping open:

- install/uninstall semantics may be easier to test on Twenty’s current app surface;
- it may be the cleanest early proof of optional capability packaging if the broader Fundraising app shape is not yet practical;
- it can act as a bridge experiment without committing us to long-term app sprawl.

#### 9.3.3 Working spike posture now

Updated working posture:

- **preferred spike target:** test **Option 4** first:
  - a broader **Fundraising app** with internal capability boundaries/settings
- **fallback spike target:** if that is not yet viable on Twenty’s current app/config surface, test **Option 3**:
  - **Gift Aid as a separately installable fundraising-owned app/module**

Important scope note:

- testing Option 3 would be a **pragmatic bridge**, not a final product commitment that every optional fundraising feature should become its own visible app.
- domain ownership remains the same either way:
  - Gift Aid is still **fundraising-owned**
  - the open question is packaging and configuration expression on Twenty’s current extensibility surface.

### 9.4 Current Twenty Apps capability model (working interpretation)

After reviewing Twenty’s current Apps surface more closely, the picture is clearer.

Twenty apps already appear to support the following primitives:

- **workspace installation** of an app;
- **application variables** editable per workspace in the built-in Applications settings UI;
- an optional **custom settings tab** via a front component;
- **post-install logic functions** for one-time setup;
- generated **CoreApiClient** and **MetadataApiClient** clients for workspace data and metadata/configuration access.

This makes the preferred direction much more concrete than before.

#### 9.4.1 Preferred Option 4 shape

The currently preferred model can be described like this:

1. A workspace installs **one broader Fundraising app**.
2. That app exposes **internal capability settings** (for example Gift Aid on/off).
3. Those settings live in the app’s own settings surface:
   - simple cases via **application variables**;
   - richer cases via a **custom settings tab** front component.
4. Fundraising logic/functions/UI inside the app read those settings and decide what to show or run.

Conceptually, this gives us:

- **one fundraising-owned package**
- with **multiple optional internal capabilities**
- without immediately fragmenting the product into many visible micro-apps.

#### 9.4.2 Two sub-options inside Option 4

There are still two materially different ways this could work.

##### Option 4A: pre-provision within the Fundraising app

- install the broader Fundraising app once;
- sync all relevant metadata up front;
- use capability settings only to control **behavior** and **visibility**.

Pros:

- the cleanest fit for today’s app/install/settings surface;
- simpler lifecycle;
- simpler admin mental model.

Cons:

- optional capability schema may still exist even when the capability is "off";
- weaker modular boundary for capabilities like Gift Aid.

##### Option 4B: provision capability metadata on demand

- install a lean Fundraising app base;
- expose capability settings in the app;
- when Gift Aid is enabled, trigger logic that creates Gift Aid-specific metadata using app-side APIs/functions.

Pros:

- closer to a true optional capability model;
- keeps the core app lighter when capabilities are disabled.

Cons:

- this is the main unproven area;
- static app manifests do not obviously express "install only some of the metadata if a variable is true";
- dynamic metadata lifecycle, uninstall semantics, and drift management may become awkward.

#### 9.4.3 Key current gap

The key unresolved question is not:

- "can an app store a toggle?"

That part appears yes.

The key unresolved question is:

- **can one broader Fundraising app cleanly manage capability-specific metadata conditionally, or does that break down in practice?**

This is the central capability question for Option 4.

#### 9.4.4 Implication for Option 3

If Option 4 proves viable only in the weaker 4A form, or if 4B proves too awkward on Twenty’s current surface, then Option 3 remains the practical fallback:

- install a separate Gift Aid app when needed;
- let installed-app state provide the capability boundary;
- treat that as a bridge pattern rather than the ideal final fundraising product shape.

#### 9.4.5 Current recommendation for the next spike

The next spike should test Option 4 specifically:

1. model a **Fundraising app** with one internal capability setting such as `ENABLE_GIFT_AID`;
2. test whether the setting can live acceptably in:
   - app variables,
   - a custom settings tab,
   - or a combination of both;
3. determine whether enabling the capability can reasonably control:
   - only behavior/visibility,
   - or also metadata provisioning;
4. if the metadata/provisioning story breaks down, treat Option 3 as the fallback experiment.

Current view:

- **Option 4 remains preferred**
- **Option 3 remains viable**
- the real spike question is whether Twenty’s current app/install/settings model is strong enough to support Option 4 without an awkward capability lifecycle.

## 10. Questions for the next conversation

Once this framing is accepted, the next architectural questions become:

1. What should be the authoritative source of capability state?
2. Which parts of activation are install-time versus runtime?
3. Should provisioning be conditional, pre-provisioned, or mixed?
4. Who is allowed to enable/disable a capability in each hosting model?
5. What should "disabled" mean for UI visibility versus backend behavior?
6. How do we keep the current hybrid implementation compatible with a future app-packaging path?

## 10a. Near-Term Engineering Constraint

Before we implement full capability activation mechanics, there is a simpler near-term requirement:

- optional capabilities such as Gift Aid should remain **architecturally separable** from core fundraising behaviour.

In practice, this means:

- core donation flows should still work cleanly without Gift Aid-specific logic;
- Gift Aid should live behind focused service/module boundaries rather than being spread through generic processing code;
- shared queue, review, and batch patterns should not become implicitly Gift Aid-specific;
- later toggleability should mainly be a question of enabling, bypassing, or hiding a bounded capability layer, not untangling Gift Aid from the core system.

This is intentionally weaker than solving activation now. It is a design constraint to keep future capability control feasible.

## 11. Related docs

- `docs/features/gift-aid.md`
- `docs/features/gift-aid-implementation-shape.md`
- `docs/PROJECT_CONTEXT.md`
- `docs/DECISIONS.md`
- `docs/TWENTY_EXTENSIBILITY_WATCH.md`
