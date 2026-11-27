#!/usr/bin/env node
// List Open Design functional skills (utilities, briefs, audits).
// Note: ~half of these are "stub" pointers (od.upstream is set) — they
// advertise the capability but the runnable workflow lives in the upstream
// repo. The agent should flag those in the picker so users can install the
// upstream bundle if they actually want to run it.
//
// Output: TSV with header. Columns:
//   slug  mode  category  upstream  name  description  triggers
//
// Reads from the bundled <skill-dir>/repo (override with $OPEN_DESIGN_ROOT).

import fs from 'node:fs';
import path from 'node:path';
import { resolveRoot, failIfMissing, listSubdirs, parseSkillFrontmatter, row } from './_parse.mjs';

const dir = path.join(resolveRoot(), 'skills');
failIfMissing(dir, 'skills');

row(['slug', 'mode', 'category', 'upstream', 'name', 'description', 'triggers']);

for (const [slug, full] of listSubdirs(dir)) {
  const skillPath = path.join(full, 'SKILL.md');
  if (!fs.existsSync(skillPath)) continue;
  const fm = parseSkillFrontmatter(skillPath);
  row([
    slug,
    fm.od.mode,
    fm.od.category,
    fm.od.upstream,
    fm.name,
    fm.description,
    fm.triggers.length ? fm.triggers.join(', ') : '',
  ]);
}
