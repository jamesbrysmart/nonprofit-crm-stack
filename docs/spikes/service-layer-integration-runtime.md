# Service Layer / Integration Runtime Thinking Note

Updated: 2026-04-12  
Status: Exploratory / hypothesis-tracking note (`stage-1`)  
Audience: Product, engineering, and future architecture review

## Purpose

This note captures a broader question that has become more visible through the Gift Aid / HMRC work:

- if Twenty apps become the main home for product-facing capability,
- what is the likely role of a separate service layer or integration runtime alongside them?

This is an exploratory note only.

It is not:

- a platform decision,
- a roadmap commitment,
- a proposal to build a generic integration framework.

The goal is to build a clearer set of questions and heuristics for future work, without accidentally turning an emerging pattern into an implied direction.

## Why this question has surfaced now

The Gift Aid / HMRC work has surfaced a useful distinction:

- some parts of a capability fit naturally inside Twenty apps;
- some parts look more like specialized integration runtime concerns.

Gift Aid is useful here because it is not purely theoretical:

- the Twenty-side workflow shape now looks increasingly clear;
- the HMRC submission transport path also looks clearly real and non-trivial;
- the clean boundary between them has started to emerge in both docs and code.

That makes it a useful anchor for a broader exploratory discussion.

It does not mean the broader pattern is already validated.

## What this note is mainly grounded in

The strongest basis for this note is the current Gift Aid / HMRC work, because it has forced a concrete discussion about:

- what Twenty apps appear to handle well;
- what still looks awkward or uncertain inside the current apps framework;
- how a clean app-to-adapter boundary might work without pushing product truth out of Twenty.

Older repo docs such as:

- [INTEGRATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/INTEGRATIONS.md)
- [AUTOMATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/AUTOMATIONS.md)
- [DECISIONS.md](/home/jamesbryant/workspace/dev-stack/docs/DECISIONS.md)

are useful context, but they should not be treated as strong proof here. Some of that framing predates the current Gift Aid / HMRC work and may drift.

So this note should be read primarily as:

- a reflection on patterns emerging from current work,
- not as a synthesis of settled repo doctrine,
- not as evidence that a service layer is already part of the intended architecture.

## A working spectrum rather than one answer

The first useful observation is that this is probably not a binary “inside Twenty vs outside Twenty” choice.

The more useful framing is a spectrum:

1. **Twenty apps only**
2. **Twenty apps plus a reusable service integration**
3. **Twenty apps plus a custom client-specific service integration**

Different capabilities may land in different places on that spectrum.

That is still only a working hypothesis, and it may turn out to be the wrong framing once Twenty apps mature further.

## Why this line of thinking is attractive

Part of the reason this question is surfacing at all is that a service layer can look attractive for several different reasons, and those reasons are not all the same.

Some are more temporary:

- Twenty apps are still early;
- the real limits of the app/runtime model are not yet fully clear;
- some handoff points may only look necessary because the framework is still immature.

Some may be more durable:

- some integrations really do involve specialized protocol/runtime concerns;
- some execution paths may be easier for us to own directly;
- a service layer may give us a cleaner way to build reusable integration capabilities without tying every runtime concern too tightly to Twenty-specific mechanics.

There is also a strategic attraction:

- it may hedge against current or future limitations in Twenty’s app/runtime model;
- it may preserve some independence in how we deliver non-trivial integrations;
- it may give us a path to reuse integration capabilities across deployment models or partner arrangements.

That attraction is real, but it is also exactly why caution is needed. “Attractive” is not the same as “correct,” and “currently awkward in Twenty” is not the same as “should live outside Twenty long term.”

## Twenty apps uncertainty should stay central

This note should be read with one major caution in mind:

- the Twenty apps framework is still early enough that we may misread where the real long-term boundary should be.

That creates two opposite risks:

1. we underuse Twenty apps because current limitations loom too large in our thinking;
2. we overtrust early app capabilities and push runtime concerns into Twenty that really belong elsewhere.

Because of that, any service-layer thinking here should be treated as provisional and revisitable.

In particular:

- some reasons for a service layer may disappear if Twenty apps mature;
- some reasons may remain because certain integrations are inherently better as managed adapters;
- some apparent “service layer” needs may turn out to be temporary implementation conveniences rather than durable architecture needs;
- right now, we do not know the full balance with confidence.

## 1. When something should live inside Twenty apps only

This looks strongest when:

- the capability is mostly product logic, workflow, UI, metadata, or lightweight automation;
- the capability does not require a specialized external protocol runtime;
- the capability does not require heavy compliance-specific transport handling;
- variation between clients is low enough that the app can stay opinionated.

Examples that look like good app-only candidates:

- declaration review surfaces,
- internal claim review workspace,
- workflow/status tracking,
- standard views/page layouts/front components,
- lightweight orchestration logic,
- metadata-driven enablement/settings.

In those cases, an external service layer would risk becoming unnecessary indirection.

## 2. When something should live in Twenty apps plus a reusable service integration

This looks strongest when:

- the product interaction should still feel like a standard app capability;
- but the execution path requires a specialized runtime, protocol, adapter, or operational control plane;
- and the integration is repeatable enough across customers that we should not rebuild it per client.

Gift Aid / HMRC is the clearest current candidate surfaced so far.

Why it looks reusable rather than custom:

- the protocol is fixed and external;
- the submission mechanics are specialized;
- the app-facing product workflow is still broadly the same across UK charities;
- the integration boundary can be made explicit through a frozen submission object and a small adapter invocation contract.

Other possible candidates in this category:

- receipt/PDF generation and delivery pipelines,
- some regulated tax/compliance exports,
- potentially some tightly defined reporting/analytics refresh jobs,
- selected repeatable payment or donor-ops adapters where the external protocol is stable.

The important point is that “reusable service integration” here does not mean a big platform. At most, it suggests a repeatable service-owned capability behind an app-owned product surface, if that boundary continues to hold up under real implementation and still makes sense once Twenty apps are less immature.

## 3. When something should live in Twenty apps plus a custom client-specific service integration

This looks strongest when:

- the business outcome is recognizable,
- but the external system, rules, mapping, or operational expectations vary heavily between clients;
- and the variation is too high to make a reusable vendor-owned adapter sensible in the short term.

Examples that may lean this way:

- finance/accounting integrations,
- client-specific data warehouse feeds,
- bespoke downstream reporting exports,
- unusual donor-operations or back-office syncs,
- org-specific middleware sitting between the app and a legacy system.

This is where the caution level should rise.

A client-specific service integration can be useful, but it is also where maintenance cost and product drift start to accumulate fastest.

## A useful distinction: repeatable integrations vs variable integrations

One of the clearest lessons from the Gift Aid work is that not all integrations vary in the same way.

### Repeatable integrations

These tend to have:

- a strong common product shape,
- a fixed external protocol,
- limited per-client process variation,
- a stronger case for a reusable service-owned adapter.

Gift Aid / HMRC is the clearest current example.

### Variable integrations

These tend to have:

- looser product shape,
- high variability in field mapping and operating rules,
- different systems per client,
- more pressure toward custom work.

Finance/accounting integrations are the clearest example here.

That does not mean they should never use a shared service layer. It means the reuse boundary is harder to define, easier to overstate, and more likely to blur into services work rather than product capability.

## What the reusable service layer is probably for

If a reusable service layer exists at all, one plausible role for it is not “all integrations.”

A more disciplined role would be:

- host specialized execution paths that do not fit comfortably inside Twenty apps;
- provide repeatable runtime behavior for selected categories of integration;
- handle protocol/auth/retry/polling concerns that are better centralized than duplicated in each app;
- keep Twenty apps focused on product workflow, metadata, and operator-facing state.

That is a much smaller claim than “build a universal integration platform,” which is exactly why the distinction matters.

## The danger if we rely on it too much

This is probably the most important part of the discussion.

The service layer becomes dangerous if it starts to absorb too much product behavior.

Warning signs:

- product workflow logic starts moving out of Twenty because the service is more convenient;
- app-facing state becomes a thin reflection of service-owned truth rather than the other way around;
- customer-specific behavior quietly accumulates in service code;
- “integration runtime” turns into a catch-all bucket for work that really belongs in the app;
- the service becomes the place where business rules go to hide.

If that happens, we would lose some of the main reasons for wanting Twenty apps in the first place.

## Risks for us as the vendor

### Product risks

- service sprawl
- hidden coupling between app and runtime
- reduced clarity about where business logic belongs
- slower migration toward cleaner Twenty-native capabilities

### Delivery risks

- every integration starts to look like a service project
- support burden increases because failures span app, runtime, and external system
- release coordination becomes more complex

### Strategic risks

- we accidentally build a private integration platform before we know whether we really need one
- we overfit to current Twenty alpha limitations that may improve later
- we let exploratory service thinking become a default delivery reflex

## Risks for clients

### Operational risks

- more moving parts
- more secrets/config surfaces
- harder troubleshooting path if boundaries are unclear

### Portability risks

- clients may depend on a vendor-managed runtime they do not fully understand
- self-hosted clients may inherit operational work they did not expect

### Product clarity risks

- if the app/service boundary is poorly designed, clients will not know what is “the product” vs “the integration machinery”

## Commercial-model implications

This line of thinking also has commercial and operating-model implications, which are part of why it deserves explicit exploration.

### Cloud customers

A reusable managed adapter can be attractive because:

- it hides protocol/runtime complexity;
- it keeps the customer experience product-like rather than implementation-heavy;
- it can let us roll out fixes and improvements centrally.

But it also creates obligations:

- we become responsible for more of the runtime and support path;
- availability and operational trust matter more;
- customers may become more dependent on vendor-managed infrastructure than they initially realise;
- pricing, support expectations, and trust boundaries may become more complex than the app UX suggests.

### Self-hosted customers

A service layer may still be valuable, but the trade-off changes:

- do they run it themselves?
- do we provide it as an optional managed companion?
- does it become an operational burden that weakens the self-hosted value proposition?

The answer may differ by integration type, and the wrong answer here could weaken the value of self-hosting rather than strengthen it.

### Partners / distributors

This adds another layer again.

If partners or distributors want to package or deliver the product, a service layer can be:

- a useful reuse point;
- a strategic control point for us;
- or a source of friction if the runtime is too centralized, too opaque, or too vendor-specific.

This also introduces a commercial-model question, not just a technical one:

- does the runtime become part of the product;
- part of our managed service offering;
- something partners can run;
- or something that quietly limits how distributable the product really is?

That is another reason not to rush from “useful pattern” to “settled platform direction.”

## How to think about the boundary without overbuilding

A useful discipline is:

- keep product truth and operator-facing state in Twenty;
- keep the service layer focused on execution, transport, and adapter responsibilities;
- make handoff contracts explicit and narrow;
- prefer app-owned durable state over service-owned shadow state unless there is a clear reason not to.

The Gift Aid direction is a good example of that discipline:

- internal workflow stays on `GiftAidClaimBatch`
- external lifecycle lives on `GiftAidClaimSubmission`
- the adapter reads a frozen submission row and writes back results
- the service does not become the primary home of Gift Aid product state

That currently feels like a reasonable working boundary for that case, but it should still be treated as a working pattern rather than a settled general rule.

## A practical decision lens

For future integrations, a useful first-pass set of questions might be:

1. Is the capability mainly product workflow/UI/metadata, or mainly protocol/runtime work?
2. Is the external integration behavior repeatable across customers, or highly variable?
3. Does the integration require specialized runtime concerns that are awkward inside Twenty apps?
4. If we build this outside the app, can we keep the product-facing state and logic clearly in Twenty?
5. Are we creating a reusable service capability, or just hiding client-specific complexity in a shared runtime?

If those answers point strongly toward repeatable specialized runtime needs, a reusable service integration may make sense.

If they point toward high variation or mostly product logic, the answer is probably different.

## Current exploratory hypothesis

Current exploratory hypothesis, based on the Gift Aid work:

- a reusable service layer may have a real role in this product/company;
- if so, it probably needs to stay narrow and selective;
- it currently looks most plausible for repeatable integrations with specialized runtime/protocol needs;
- it currently looks much less obviously justified as a default answer for broad client-specific integrations.

If that hypothesis turns out to be right, the role would be more like:

- not a generic platform,
- not a universal default,
- but a small set of repeatable, service-owned integration capabilities sitting alongside Twenty apps.

That remains a hypothesis, not a direction, and it should be re-tested as Twenty apps mature and as more concrete integration cases appear.

## Good candidates to watch

Based on current work, possible candidates to keep watching are:

- Gift Aid / HMRC submission
- receipt generation/delivery runtime
- selected repeatable payment-provider adapters
- some structured reporting/export jobs

Lower-confidence candidates, where more caution is needed:

- accounting integrations
- variable finance exports
- bespoke client middleware
- anything with high per-client process variation

## What this note is not concluding

This note does not conclude:

- that we should build a shared integration platform now;
- that every external integration should use a reusable service;
- that the current Gift Aid boundary automatically generalizes cleanly to every other category.

It only argues that the Gift Aid work has surfaced a pattern worth tracking deliberately instead of leaving it implicit.

The useful output here is not certainty. It is a better set of questions for future sessions.

## Relationship to other notes

- [gift-aid-hmrc-integration-shape.md](/home/jamesbryant/workspace/dev-stack/docs/spikes/gift-aid-hmrc-integration-shape.md) is the concrete Gift Aid / HMRC boundary note.
- [INTEGRATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/INTEGRATIONS.md) is useful background context, not strong proof.
- [AUTOMATIONS.md](/home/jamesbryant/workspace/dev-stack/docs/AUTOMATIONS.md) is useful background context, not strong proof.
- [DECISIONS.md](/home/jamesbryant/workspace/dev-stack/docs/DECISIONS.md) remains the place for actual architecture decisions if this line of thinking later hardens into one.
