# open-design (Pi agent skill)

Self-contained skill that brings the [Open Design](https://github.com/nexu-io/open-design)
catalogue into an agent session: 150+ brand `DESIGN.md` specs, 110+ rendering
templates (decks, prototypes, dashboards, posters, image/video/audio), 160+
functional skills, 100+ image/video prompt templates, and universal craft rules.

Combines the wrapper from [sugarforever/open-design-skill](https://github.com/sugarforever/open-design-skill)
with a bundled snapshot of the OD content in `repo/` — no environment
variables required. `repo/` (~355 MB) is git-ignored in this project; fetch it
once with `node scripts/fetch-content.mjs`.

## Install (Pi agent)

```bash
AGENT_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
git clone https://github.com/harsh123456/open_design_skill "$AGENT_DIR/skills/open-design"
rm -rf "$AGENT_DIR/skills/open-design/.git"
node "$AGENT_DIR/skills/open-design/scripts/fetch-content.mjs"
```

## Layout

```
open-design/
├── SKILL.md                       ← workflow (frontmatter + instructions)
├── README.md
├── LICENSE                        ← wrapper license (MIT)
├── scripts/
│   ├── _parse.mjs                 ← shared helpers; resolves ROOT = <skill>/repo
│   ├── list-design-systems.mjs
│   ├── list-design-templates.mjs
│   ├── list-skills.mjs
│   ├── list-craft.mjs
│   ├── list-prompt-templates.mjs  ← [image|video]
│   └── fetch-content.mjs          ← populates/refreshes repo/
├── evals/evals.json               ← skill-creator test prompts
└── repo/                          ← shallow snapshot of nexu-io/open-design (no .git, git-ignored)
    ├── design-systems/  design-templates/  skills/  craft/  prompt-templates/
    └── …
```

## Usage

```
/skill:open-design build a seed-round pitch deck in the Stripe design system
```

Or just ask for design work ("make a SaaS landing page that looks like Linear").
The skill binds a design system + template into `.open-design.json` in your
project, then follows the template's workflow and writes output to your cwd.

Inspect the catalogue directly:

```bash
node scripts/list-design-systems.mjs | column -t -s $'\t' | less
node scripts/list-design-templates.mjs | awk -F'\t' '$2=="deck"'
node scripts/list-skills.mjs | awk -F'\t' '$4 != "-"'   # upstream stubs
node scripts/list-prompt-templates.mjs video
```

`OPEN_DESIGN_ROOT` is an optional override pointing at another OD checkout.

## Refreshing the bundled content

```bash
node scripts/fetch-content.mjs --force
```

## License

Wrapper: MIT (`LICENSE`). Open Design content: see `repo/LICENSE`.
