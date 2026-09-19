#!/usr/bin/env node
/**
 * The tests a docs-only plugin can actually have.
 *
 * There is no code here to benchmark, but there is plenty to break silently:
 * a manifest that stops parsing, a skill whose folder and `name` drift apart,
 * a description past the 1024-character limit Cursor enforces, a `skills/`
 * entry with no SKILL.md. Every one of those makes the plugin load with a
 * skill missing and no error anywhere.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const fail = [];
const ok = [];

const MANIFESTS = [
    "plugin.json",
    ".cursor-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".agents/plugins/marketplace.json",
];

let names = new Set();
for (const m of MANIFESTS) {
    const p = join(root, m);
    if (!existsSync(p)) { fail.push(`${m}: missing`); continue; }
    let json;
    try { json = JSON.parse(readFileSync(p, "utf8")); }
    catch (e) { fail.push(`${m}: not valid JSON — ${e.message}`); continue; }
    ok.push(`${m} parses`);
    const n = json.name ?? json.plugins?.[0]?.name;
    if (n) names.add(m.includes("marketplace") && json.plugins ? json.plugins[0].name : json.name);
}
// Marketplace files legitimately carry their own name; the PLUGIN name must agree.
const pluginNames = new Set(
    MANIFESTS.filter((m) => m.endsWith("plugin.json"))
        .map((m) => { try { return JSON.parse(readFileSync(join(root, m), "utf8")).name; } catch { return null; } })
        .filter(Boolean)
);
if (pluginNames.size !== 1) fail.push(`plugin manifests disagree on the name: ${[...pluginNames].join(", ")}`);
else ok.push(`all plugin manifests name "${[...pluginNames][0]}"`);

// Skills
const skillsDir = join(root, "skills");
const folders = readdirSync(skillsDir).filter((f) => statSync(join(skillsDir, f)).isDirectory());
if (!folders.length) fail.push("skills/ is empty");
for (const folder of folders) {
    const p = join(skillsDir, folder, "SKILL.md");
    if (!existsSync(p)) { fail.push(`skills/${folder}: no SKILL.md`); continue; }
    const s = readFileSync(p, "utf8");
    if (!s.startsWith("---\n")) { fail.push(`skills/${folder}: no YAML frontmatter`); continue; }
    const end = s.indexOf("\n---\n", 3);
    if (end < 0) { fail.push(`skills/${folder}: frontmatter is not closed`); continue; }
    const fm = s.slice(4, end);
    const name = /^name:\s*(.+)$/m.exec(fm)?.[1]?.trim();
    const desc = /^description:\s*([\s\S]*?)$/m.exec(fm) ? fm.split("description:")[1] : null;
    if (!name) fail.push(`skills/${folder}: frontmatter has no name`);
    else if (name !== folder) fail.push(`skills/${folder}: name is "${name}" — it must match the folder, Cursor keys on it`);
    if (!desc) fail.push(`skills/${folder}: frontmatter has no description`);
    else if (desc.length > 1024) fail.push(`skills/${folder}: description is ${desc.length} chars, over the 1024 limit`);
    if (name === folder && desc && desc.length <= 1024) ok.push(`skills/${folder} (${desc.length} chars)`);
}

// Assets referenced by a manifest must exist.
for (const m of [".cursor-plugin/plugin.json", ".codex-plugin/plugin.json"]) {
    try {
        const json = JSON.parse(readFileSync(join(root, m), "utf8"));
        for (const key of ["logo", "interface"]) {
            const paths = key === "logo" ? [json.logo] : [json.interface?.logo, json.interface?.composerIcon];
            for (const rel of paths.filter(Boolean)) {
                const clean = rel.replace(/^\.\//, "");
                if (!existsSync(join(root, clean))) fail.push(`${m}: references ${rel}, which does not exist`);
                else ok.push(`${m} → ${clean}`);
            }
        }
    } catch {}
}

for (const line of ok) console.log(`  ok   ${line}`);
for (const line of fail) console.log(`  FAIL ${line}`);
console.log(`\n${ok.length} passed, ${fail.length} failed`);
process.exitCode = fail.length ? 1 : 0;
