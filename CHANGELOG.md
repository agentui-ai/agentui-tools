# Changelog

## Unreleased

- Entity files are `entities/<Name>.json`, matching the project's `AGENTS.md`. The
  skills said `entities/<Name>.schema.json`, which is the table dump older CLIs wrote
  on `sync` — pushing those created fieldless `<Name>.schema` entities. The data skill
  now says never to push them and points at `agentui data entities` for the live tables.

## 0.1.0

First release. Eight model-invoked skills covering the `@agentuiai/cli` surface:
app creation and shipping, hosted data and row-level security, workspace file storage,
custom and standalone MCP servers, integrations, automations, and troubleshooting.

Ships manifests for Cursor, Claude Code and the Agent Plugins format over one shared
`skills/` folder, plus a Claude Code `SessionStart` hook that recognises a synced
AgentUI project.
