#!/bin/sh
# SessionStart: if the working directory is a synced AgentUI project, say so.
#
# .agent.json is gitignored, so nothing else in the repo announces that these
# .jsx files are server-side records rather than a local app — and an assistant
# that does not know that edits them and never pushes. Silent and exit 0 in
# every other case.

[ -f .agent.json ] || exit 0
command -v node >/dev/null 2>&1 || exit 0

# `projectEnvironment` is the APP environment (which deploy, which database).
# `environment` in the same file is the platform API host and says nothing
# about the app — reading it as the app environment would announce "staging"
# while every command targets production. Absent means production.
HEADLINE=$(node -e '
try {
    const c = JSON.parse(require("fs").readFileSync(".agent.json", "utf8"));
    const name = typeof c.projectName === "string" ? c.projectName : "";
    const id = typeof c.projectId === "string" ? c.projectId : "";
    const env = typeof c.projectEnvironment === "string" && c.projectEnvironment
        ? c.projectEnvironment
        : "production";
    let line = "This directory is a synced AgentUI project";
    if (name) line += `: "${name}"`;
    if (id) line += ` (workflow ${id})`;
    line += `, app environment ${env}.`;
    console.log(line);
} catch { process.exit(1); }
' 2>/dev/null) || exit 0
[ -n "$HEADLINE" ] || exit 0

printf '%s\n' "$HEADLINE"
cat <<'TXT'
Files under components/, pages/, functions/, entities/ and mcp/ are server-side
records: local edits do nothing until `agentui project push`, and pushed code is
not live until `agentui build` (which needs `--yes` on production). Read AGENTS.md
before writing app code, and open the `agentui-ship-app` skill for the workflow.
TXT
exit 0
