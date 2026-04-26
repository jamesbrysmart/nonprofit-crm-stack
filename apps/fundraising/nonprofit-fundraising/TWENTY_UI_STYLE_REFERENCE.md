# Twenty UI Style Reference

Purpose: give app-local agents concrete guidance for making custom front components feel as close to Twenty as possible.

This is an implementation reference for this app. It is derived from `twenty-core` UI primitives, theme tokens, and component patterns, then adapted for custom Twenty app front components.

Use this when refining or building UI in:

- side panels
- record review surfaces
- operational forms
- detail drawers
- compact review and action flows

This doc is not a license to redesign workflow semantics. Use it to shape presentation, hierarchy, composition, and state clarity while preserving product meaning.

## References And Confidence

Use sources in this order when making implementation decisions:

1. local app docs and code in this repo
2. official Twenty docs when they describe the relevant surface
3. verified `twenty-core` source when docs are incomplete

Useful official references:

- `https://docs.twenty.com/developers/extend/apps/front-components`
- `https://docs.twenty.com/developers/extend/apps/building`
- `https://docs.twenty.com/twenty-ui`

Important:

- this file includes some hardcoded working guidance derived from current Twenty docs and `twenty-core`
- treat that guidance as a working implementation reference, not timeless truth
- if a local assumption about primitive availability or styling behavior changes, update this file after checking current official docs and/or current `twenty-core` source

Use these confidence labels mentally when applying the guidance:

- `proven in this app`
- `visible in docs/source, verify before broad use`
- `do not assume yet`

## Primitive Confidence Map

### Proven in this app

- `Button`
- host affordances such as snackbars and side-panel lifecycle helpers already used in this app
- host typography should be inherited by default

### Visible in docs/source, verify before broad use

- `Tag`
- `Status`
- `Label`
- `H2Title`
- `Card`
- `Section`

These are visible in Twenty docs and/or `twenty-core`, but should not be treated as fully safe defaults for this app surface until they have been exercised successfully here.

### Do not assume yet

- a native review-state card primitive
- a native donor-match choice-list primitive
- a native action-group layout primitive
- a native workflow-specific error-summary primitive

If one of these patterns is needed, first check whether an appropriate Twenty primitive now exists. If not, build the smallest custom version that still follows the rest of this reference.

## Candidate Primitive Usage

These examples are meant to lower the cost of trying likely Twenty primitives in this app.

They are:

- examples of likely import and usage shape
- not proof that broad adoption is already safe in this app
- not a replacement for checking actual runtime behavior when introducing a new primitive here

Likely import pattern:

```tsx
import {
  Button,
  Card,
  H2Title,
  Label,
  Section,
  Status,
  Tag,
} from 'twenty-sdk/ui';
```

Example usage patterns:

```tsx
<Section>
  <H2Title
    title="Review state"
    description="Check blockers and next steps before processing."
  />
</Section>

<Status color="yellow" text="Needs review" />

<Tag color="blue" text="Manual entry" />

<Label>Gift date</Label>
```

Possible section/card structure to verify before broader use:

```tsx
<Card fullWidth rounded>
  <Section>
    <Label>Core facts</Label>
    <div>Amount: {amountDisplay}</div>
    <div>Batch: {giftBatchName}</div>
  </Section>
</Card>
```

Use these examples when:

- testing whether a Twenty primitive can replace local hand-rolled presentation
- deciding whether a surface can move closer to Twenty with less custom styling

Do not use these examples as justification to:

- assume the primitive is fully proven in this app
- refactor a large surface to many unverified primitives in one pass
- ignore layout or runtime issues if the primitive behaves differently than expected

The safe approach is:

1. try a primitive in one bounded place
2. verify it works in this app surface
3. then promote it from “verify before broad use” to “proven in this app” only after successful use

## 1. Overall Design Direction

Twenty’s UI style is:

- restrained rather than expressive
- operational rather than promotional
- neutral-first rather than color-first
- compact, calm, and information-dense
- driven by soft borders, modest radii, and quiet hierarchy

The target is not “beautiful standalone UI”.

The target is:

- a cleaner, clearer, more intentional version of a Twenty CRM surface

Do not introduce:

- premium dashboard styling
- glossy panels
- oversized hero-like headings
- decorative gradients
- heavy shadows
- bold visual reinvention

## 2. Surface Model

For this app, assume most custom front components are compact operational surfaces inside Twenty, especially side panels and review drawers.

Practical implications:

- think in terms of a narrow operational workspace, not a full-page marketing canvas
- optimize for scanning, triage, and next-step clarity
- keep related information close to the actions it supports
- prefer one calm vertical flow over busy multi-column layouts in side panels

When in doubt, prefer:

- one-column grouping
- short sections
- compact summaries
- clear action clusters
- progressive disclosure for secondary detail

## 3. Spacing Rhythm

Twenty uses a 4px spacing rhythm.

Default spacing steps to use:

- `4px`
- `8px`
- `12px`
- `16px`
- `20px`
- `24px`

Recommended usage:

- `4px`: tiny gaps inside tight controls or status items
- `8px`: gap between closely related lines or inline elements
- `12px`: gap inside compact cards or between label/value groups
- `16px`: default section-internal spacing
- `20px`: outer panel padding or separation between major sections
- `24px`: larger separation only when a real section break is needed

Avoid arbitrary spacing values when one of these standard steps would work.

## 4. Borders, Radius, And Surfaces

Twenty’s surfaces are usually defined by:

- light borders
- subtle surface contrast
- modest radius
- little or no shadow

Use these defaults:

- prefer a light border over a heavy filled panel
- prefer white or very light neutral surfaces
- prefer `4px` or `8px` radius
- use larger radii only for pills or clearly rounded controls

Avoid:

- thick borders
- dark panel chrome
- large floating-card shadows
- oversized rounded “dashboard card” styling

If a section needs emphasis, prefer:

- a subtle background tint
- a semantic status/banner treatment
- stronger hierarchy and grouping

Do not reach first for:

- stronger decoration
- louder color
- heavier container styling

## 5. Typography And Hierarchy

Twenty’s hierarchy is restrained.

Use this posture:

- typography should inherit from the Twenty host by default
- do not introduce a custom font stack for app front components
- section labels are small, muted, and semibold
- titles are modest, not oversized
- body and supporting text should stay easy to scan
- hierarchy should come from spacing, grouping, and contrast, not large type jumps

Practical guidance:

- if font family ever needs to be set explicitly, match Twenty’s theme font: `Inter, sans-serif`
- use small muted labels for section headers and metadata captions
- use moderate semibold titles for the main subject or section title
- use secondary text for explanation, hints, and supporting evidence
- keep microcopy concise and operational

Avoid:

- all-caps headings as a dominant visual pattern
- oversized display typography
- large jumps between section title and body text
- decorative copy or clever phrasing

## 6. Color Usage

Twenty uses quiet neutrals by default and semantic color sparingly.

Use color mainly for:

- status
- success/error/warning/info feedback
- emphasis on interactive state when already supported by the host system

Prefer:

- neutral text and surfaces for the base UI
- semantic tints for status or warning states
- tokenized component colors where available

Avoid:

- hardcoded hex colors unless there is no practical alternative in the app surface
- building a local palette by hand
- using bright accent color as the main way to create hierarchy

If you need stronger emphasis, try first:

- better grouping
- label/value restructuring
- status/tag/banner components
- clearer section order

## 7. Status, Tags, And Banners

Do not invent ad hoc status visuals if a Twenty-like treatment will work.

Preferred order:

1. use a native Twenty UI component directly if available
2. imitate Twenty’s compact semantic treatment closely
3. only build a custom status block if the information shape genuinely requires it

Status guidance:

- statuses should be compact, pill-like, and clearly semantic
- status color should be enough to scan, but not dominate the whole surface
- use one status treatment consistently across similar screens

Tag guidance:

- use tags for compact classification or metadata markers
- keep them soft and compact
- do not use tags as oversized callouts

Banner guidance:

- use banners for important contextual guidance or warnings near the top of a panel
- keep banners compact and informative
- banners should help orient the user, not become the main layout device

Avoid:

- large red/yellow blocks as a default warning pattern
- mixing multiple unrelated status styles on one surface
- using color-only communication without clear text

## 8. Buttons And Actions

Twenty’s action styling is more restrained than many dashboard UIs.

Guidance:

- keep action hierarchy clear, but do not assume the primary action should be loud
- group related actions together
- separate destructive or risky actions from ordinary progression actions
- prefer fewer clearer actions over many equal-weight buttons

In dense review surfaces:

- one primary next-step action should be easiest to find
- secondary actions should remain available but visually calmer
- repeated low-value actions should not crowd the top of the panel

Avoid:

- multiple competing primary buttons
- very large CTA-style buttons
- action rows that overwhelm the record context

## 9. Composition For Review Drawers And Side Panels

For review-heavy operational UI, this is the default content order:

1. current state / readiness / blocker summary
2. identity and core record facts
3. the main review or correction module
4. related secondary detail
5. lower-priority historical or diagnostic detail

This order should help the user answer:

1. what am I looking at?
2. what state is it in?
3. what do I need to do next?
4. what supporting detail do I need?

Good review surfaces usually:

- start with the most decision-relevant state
- keep primary facts together
- place editing near the facts it changes
- keep diagnostics visible but secondary unless they block the workflow

Avoid:

- leading with generic prose instead of the actual record state
- scattering key facts across many weak sections
- burying the next action below low-value detail
- turning a side panel into a long undifferentiated stack

## 10. Information Density

This app should feel operational, not sparse.

Prefer:

- compact but readable sections
- short label/value groupings
- clear status summaries
- enough density that the operator can work quickly without extra navigation

Do not:

- over-expand the layout just to make it feel “designed”
- replace useful density with decorative whitespace
- force everything into big cards if smaller grouped sections are clearer

The goal is:

- dense enough to work efficiently
- calm enough to scan

## 11. State Handling

Loading, empty, error, and success states should feel deliberate.

Guidance:

- loading copy should be plain and specific
- empty states should explain what is missing, not just that nothing exists
- error states should be clear and operationally useful
- success feedback should confirm the outcome and, when relevant, imply the next step

For feedback:

- prefer host affordances such as snackbars when available
- keep messages concise
- use sentence case

## 12. What To Reuse First

Before hand-rolling UI, check whether the Twenty app surface can use:

- `Button`
- `Tag`
- `Status`
- `Card`
- `Section`
- `H2Title`
- `Label`
- side-panel information banners or similar compact callout treatments

If these exact components are not available in the app surface, mirror their visual posture:

- token-like spacing
- restrained title scale
- compact semantic status treatment
- light borders
- quiet surfaces

## 13. Current App-Specific Advice

In this fundraising app:

- preserve Twenty coherence strongly
- prefer calm review surfaces over expressive visual treatment
- make blocker/readiness state highly legible
- make donor-review and gift-review groupings easy to scan
- use visual emphasis to support operational decisions, not to make the screen look premium

For staging and review surfaces especially:

- make the review state obvious near the top
- keep core facts together
- keep donor resolution actions close to donor evidence
- keep last error or failure detail visible but secondary unless it is the main blocker

## 14. Anti-Patterns

Avoid these unless there is a strong, explicit reason:

- hardcoded custom color systems
- large custom shadows
- big-radius dashboard cards everywhere
- oversized page-builder style headings
- gradient backgrounds
- marketing-style polish
- decorative icon use
- turning one review surface into multiple competing visual systems
- changing workflow meaning by relabeling statuses or action groupings

## 15. Practical Rule Of Thumb

If a refinement makes the UI:

- calmer
- easier to scan
- more clearly structured
- more semantically legible
- and still recognizably part of Twenty

then it is likely moving in the right direction.

If it makes the UI:

- louder
- more branded
- more decorative
- more custom-looking
- or more workflow-opinionated

then it is likely drifting away from the target.
