# Changelog

## 0.3.0

- Windows installs without npm: `irm https://cdn.agentui.ai/cli/install.ps1 | iex`
  (the assistant runs it; `agentui` works on the next line) or the double-click
  `AgentUI-Setup.exe`. npm stays the route on macOS and Linux.
- `agentui update` updates a Windows install; npm installs still update with npm.
- Login: the email-code relay is spelled out as the assistant's job — ask for the
  email, run step 1, ask the user to paste the code, run step 2.

## 0.2.0

Catches up with `@agentuiai/cli` through 2026-09-27.

- Entities are `entities/<Name>.json`. The old `entities/<Name>.schema.json` files are
  table dumps an older `sync` wrote; `push` ignores them and `sync` deletes them.
- Brand and project knowledge: `agentui design` (status, import, sync), `brand.css`,
  `design/DESIGN.md`, `.agentui/WORKSPACE.md`, `agentui project knowledge`.
- Workspace skills: `custom/<name>` in `agentui skills list`, and `skills pull` / `push`
  to edit them as files.
- Automation steps can be a script with `return` or a module with `export default`;
  a pull backs up an untracked file it overwrites to `<file>.orig`.
- `agentui agent-skill` noted for users running the CLI without this plugin.

## 0.1.0

First release. Eight model-invoked skills covering the `@agentuiai/cli` surface:
app creation and shipping, hosted data and row-level security, workspace file storage,
custom and standalone MCP servers, integrations, automations, and troubleshooting.

Ships manifests for Cursor, Claude Code and the Agent Plugins format over one shared
`skills/` folder, plus a Claude Code `SessionStart` hook that recognises a synced
AgentUI project.
