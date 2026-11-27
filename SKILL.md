---
name: open-design
description: Build design artifacts from the bundled Open Design catalogue — 150+ brand DESIGN.md specs (Stripe, Linear, BMW, Apple…), 110+ rendering templates (pitch decks, slides, prototypes, landing pages, dashboards, posters, image/video/audio), 130+ functional design skills, 100+ image/video generation prompt templates, and universal craft rules (typography, color, accessibility, anti-AI-slop). Use this skill whenever the user wants to make a deck, presentation, landing page, prototype, dashboard, marketing page, poster, or image/video prompt; apply or set up a design system, DESIGN.md, or brand guidelines; make something "look like" a known brand; audit or critique a UI's design; or mentions Open Design — even if they don't name the skill. Not for backend, infra, or non-visual refactoring work.
license: MIT
compatibility: Requires Node.js 16+ for the helper scripts. Open Design content is bundled in repo/ (populate once with scripts/fetch-content.mjs, which needs git); no environment variables needed.
---

# Open Design

This skill bundles a snapshot of [Open Design](https://github.com/nexu-io/open-design)
in `repo/` and turns it into a workflow: **bind a brand spec + a template,
layer in craft rules, follow the template's workflow**. It mirrors what OD's
own daemon does, without needing the daemon. OD's preview/comment/slider
features are out of scope — use normal dev-server and browser tooling instead.

## Paths

All paths below are relative to this skill's directory (the folder containing
this SKILL.md). Resolve them to absolute paths in tool calls.

| Name | Location |
|---|---|
| `SKILL_DIR` | directory containing this file |
| `ROOT` (OD content) | `repo/` — override only if `$OPEN_DESIGN_ROOT` is set |
| Brand specs | `repo/design-systems/<slug>/DESIGN.md` |
| Rendering templates | `repo/design-templates/<slug>/SKILL.md` |
| Functional skills | `repo/skills/<slug>/SKILL.md` |
| Craft rules | `repo/craft/<slug>.md` |
| Image/video prompts | `repo/prompt-templates/{image,video}/<id>.json` |

Listing helpers (Node, cross-platform, TSV output with header, empty = `-`):

| Script | Lists |
|---|---|
| `scripts/list-design-systems.mjs` | `slug title category description` |
| `scripts/list-design-templates.mjs` | `slug mode category upstream name description triggers` |
| `scripts/list-skills.mjs` | same columns as templates |
| `scripts/list-craft.mjs` | `slug title description` |
| `scripts/list-prompt-templates.mjs [image\|video]` | `surface id category model aspect title summary` |

Run as `node "$SKILL_DIR/scripts/<script>"`. The catalogues are large, so
pipe through `grep -i` / `awk -F'\t'` rather than dumping everything into
context.

## Workflow

### 1. Bound or unbound?

Check for `.open-design.json` in the user's project (cwd).

- **Exists** → go to step 3 using its paths. Don't re-pick mid-project; that
  would silently change the design under the user.
- **User asks to switch** ("change brand", "re-pick template") → delete it and
  continue with step 2.
- **Absent** → step 2.

### 2. Pick and bind (unbound only)

**a. Narrow intent.** If the request doesn't already make it clear, ask one
question: deck/slides · prototype/landing/dashboard/page · image/video/audio ·
design system only · functional skill (audit, brief, etc.).

**b. Scan the matching catalogue:**

| Intent | Script | Filter |
|---|---|---|
| Deck | `list-design-templates.mjs` | `mode == deck` |
| Prototype / landing / dashboard | `list-design-templates.mjs` | `mode == prototype` |
| Image / video / audio | `list-design-templates.mjs` + `list-prompt-templates.mjs` | `mode in {image, video, audio, template}` |
| Functional skill | `list-skills.mjs` | all; flag rows with `upstream != -` |
| Design system | `list-design-systems.mjs` | user's brand/mood keyword |

**c. Present a short list.** For design systems, ask for a brand or mood
keyword (minimal, bold, editorial, warm, technical…) and grep the title,
category and description columns. For templates/skills, show ~6 best matches
(slug + one line) and offer three likely defaults plus "other". If the user
already named a brand or template, skip straight to confirming it.

Rows with `upstream != -` are **stubs** pointing to an external repo. Label
them "pointer to upstream — needs separate install" and let the user choose
between installing upstream or using the stub as design context only.

**If the user named a brand**, prefer templates that are not stubs and do not
set `od.design_system.requires: false` — those ignore DESIGN.md and would
silently drop the brand they asked for. (Generic templates like
`simple-deck` work well with any brand.)

**d. Bind.** Write `.open-design.json` in cwd:

```json
{
  "version": 1,
  "designSystem": { "slug": "stripe", "path": "design-systems/stripe" },
  "skill": {
    "slug": "simple-deck",
    "path": "design-templates/simple-deck",
    "kind": "design-template",
    "mode": "deck"
  },
  "boundAt": "2026-05-20T13:22:00Z"
}
```

- Paths are relative to `ROOT` with forward slashes, so the file stays
  portable and can be committed.
- `kind`: `design-template` for `design-templates/`, `skill` for `skills/`,
  `prompt-template` for `prompt-templates/` (path includes `.json`).
- `mode`: copy from the entry's `od.mode`; omit if absent.
- If the template's frontmatter has `od.design_system.requires: false` it
  ships its own style — set `"designSystem": null` and skip the brand pick.
- `boundAt`: ISO 8601 UTC.

### 3. Compose and execute

Read the bound bodies from `ROOT` (never copy them into the skill dir):

1. `ROOT/<designSystem.path>/DESIGN.md` — full file (skip if null).
2. `ROOT/<skill.path>/SKILL.md` — full file. Note in its frontmatter:
   - `od.craft.requires` → read each `ROOT/craft/<slug>.md`.
   - `od.design_system.sections` → the DESIGN.md sections that matter most.
3. Template `assets/` / `references/` — read only when the workflow body
   points to them.
4. For a prompt template, read the JSON, fill its `{argument name=… default=…}`
   placeholders from the brief, and hand the prompt to whatever image/video
   tool is available (or return it to the user).

On conflict, authority is: **DESIGN.md** (brand tokens win) → **craft rules**
→ **template SKILL.md** workflow (clarify brief → write files → self-check).
Templates often carry their own stylistic defaults (serif headlines, "no
gradients", a fixed palette); when a DESIGN.md is bound, treat those as
fallbacks and keep the template's structure, layout and checklist instead.
Explicit user requests (e.g. slide count) override template defaults.

Write artifacts into the **user's project** (cwd), never into `repo/`. If the
template names an output file (usually `index.html`), write it relative to cwd.

On later turns in a bound project, just re-read the same bodies and continue.

## Edge cases

- **User wants a DESIGN.md in their repo:** copy after binding:
  `cp "$ROOT/<designSystem.path>/DESIGN.md" .`
- **`repo/` missing** (scripts print "bundled snapshot is missing"): run
  `node "$SKILL_DIR/scripts/fetch-content.mjs"` (needs git + network), then retry.
- **Updating the bundled catalogue:** `repo/` is a static snapshot (no `.git`).
  Refresh with `node "$SKILL_DIR/scripts/fetch-content.mjs" --force` — only
  when the user asks, and never mid-project.
- **Preview / visual QA:** start a local server and use browser tooling
  (Playwright, chrome-devtools) to inspect the output.

---
Skill wrapper: https://github.com/sugarforever/open-design-skill ·
Content: https://github.com/nexu-io/open-design (see `repo/LICENSE`).
