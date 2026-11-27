#!/usr/bin/env node
// List Open Design prompt templates (ready-made image / video generation
// prompts stored as JSON under prompt-templates/<surface>/<id>.json).
//
// Usage: node list-prompt-templates.mjs [image|video]
// Output: TSV with header. Columns:
//   surface  id  category  model  aspect  title  summary
//
// Reads from the bundled <skill-dir>/repo (override with $OPEN_DESIGN_ROOT).

import fs from 'node:fs';
import path from 'node:path';
import { resolveRoot, failIfMissing, listSubdirs, row } from './_parse.mjs';

const dir = path.join(resolveRoot(), 'prompt-templates');
failIfMissing(dir, 'prompt-templates');

const only = process.argv[2];
const clean = (s) => (s == null ? '' : String(s).replace(/[\t\r\n]+/g, ' ').trim());

row(['surface', 'id', 'category', 'model', 'aspect', 'title', 'summary']);

for (const [surface, full] of listSubdirs(dir)) {
  if (only && surface !== only) continue;
  const files = fs.readdirSync(full).filter((n) => n.endsWith('.json')).sort();
  for (const name of files) {
    let t;
    try {
      t = JSON.parse(fs.readFileSync(path.join(full, name), 'utf8'));
    } catch {
      continue;
    }
    row([
      surface,
      clean(t.id || name.replace(/\.json$/, '')),
      clean(t.category),
      clean(t.model),
      clean(t.aspect),
      clean(t.title),
      clean(t.summary),
    ]);
  }
}
