# Armory selection and narrow focus integration

This checkpoint combines two independently preserved changes. The Armory's selected details now follow the visible filtered equipment list, while the narrow viewport retains the fixed-navigation focus clearance and larger source-policy link from the later focus correction.

## Exact component origins

- Base and full stylesheet: `120b204684adfdbf543d882887218d8a444b15fe` (narrow focus insets).
- Entire application module: `1f05b997349e7b0d6611ae89a4b7ab081d966eca` (visible Armory selection).
- All other runtime modules, release source stub, original artwork and historical fixtures remain unchanged from the base. No engine, save schema, currency, protection, trading or battle rule changes.
- `evidence/armory-focus-integration-origins.json` records exact lengths, hashes and per-component commits. The build's release stub transformation remains separately identified in the distribution manifest.

The merge retains both source histories. The original Armory document's unchanged-CSS contract describes its original checkpoint; this integrated version intentionally uses the complete newer narrow-focus stylesheet. Do not deploy the old Armory build over this integration: it would omit that correction. Earlier baseline manifests and native HOLD findings remain historical evidence, not current assembly expectations.

## Verification boundaries

The original slot-picker version `4e8b341` passed source checks but failed native offscreen successful-focus observation. Its `5685b4` successor corrected that focus and exposed a separate narrow source-policy-link visibility concern. Neither earlier observation is erased or retroactively classified as a new regression. The narrow CSS successor `120b204` subsequently passed its bounded native checks; the operating-system reduced-motion preference was not changed in that native run.

This integration requires its own full source/build gate, independent review and native checks for Armory filtering/empty details and the retained keyboard focus flow. Prior native acceptance does not certify this assembled release. Computed CSS contract tests are source-cascade probes, not native geometry or accessibility certification.

The Armory VM tests retain the documented options-object realm bridge: only plain VM records are rebuilt with preserved descriptors for the real strict host module. It does not change production validation, invoke accessors, or normalize custom prototypes. The original 13-case failure evidence and 64-combination independent matrix remain separate from this candidate's acceptance.

The narrow-focus test's exact app hash is updated solely to the declared Armory module origin. The successful `focus()` requirement and all six CSS cascade/mutation cases are retained. No historical fixture expectations are weakened.

## Build and review

Run `npm run check`, `npm run build`, then `npm run verify:checkpoint`. Verification checks all 31 runtime modules and the full stylesheet against their declared origins, as well as inherited replay fixtures and artwork. Publication and native review are separate gates owned by the release workflow.
