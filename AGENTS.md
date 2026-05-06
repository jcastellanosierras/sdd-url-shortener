# URL Shortener - OpenCode Rules

## Canonical AI setup

- OpenCode custom commands live in `.opencode/commands/`.
- OpenCode project skills live in `.opencode/skills/` and `.agents/skills/`.
- Legacy Cursor assets in `.cursor/` are reference material during migration.

## Speckit workflow

- Use `/speckit.specify`, `/speckit.clarify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.analyze`, `/speckit.implement`.
- Speckit commands and SDD phase tasks must run as subtasks/subagents to keep orchestrator context clean.
- For project governance and quality gates, follow `.specify/memory/constitution.md`.

## Planning and context update

- In plan workflows, when updating agent context, use:
  - `.specify/scripts/bash/update-agent-context.sh opencode`
- Do not use `cursor-agent` for OpenCode sessions.

## Authentication standard

- For authentication/authorization work, load and apply the `better-auth` skill.
- Prefer skill path `.opencode/skills/better-auth/SKILL.md` (compatible with OpenCode skill discovery).
