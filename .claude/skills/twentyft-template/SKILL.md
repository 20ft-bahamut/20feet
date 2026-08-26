---
name: 20ft Template Orchestrator
description: Orchestrates research, architecture, implementation, and independent QA for the 20ft Gnuboard 7 website template while keeping the main context compact.
argument-hint: "[plan|scaffold|home|portfolio|superbify|inquiry|qa|task description]"
allowed-tools: Agent Read Grep Glob Write Edit Bash
disable-model-invocation: true
---

# 20ft Template Orchestrator

Scope: `$ARGUMENTS`

1. Read `CLAUDE.md`, `20ftdocs/19_CURRENT_DECISIONS.md`, and `.claude/reference/doc-map.md` first.
2. Do not bulk-read all 20ftdocs or all G7 docs.
3. Delegate product/design research to `twentyft-product-researcher` and G7 research to `twentyft-gnuboard-researcher`. Run independently when possible.
4. Pass compact evidence only: verified rule, evidence path/heading/symbol, impact, blocker.
5. Use `twentyft-template-architect` for scaffold/routes/layout/component/data-source decisions.
6. If architecture requires a new Module or Plugin, stop with `USER APPROVAL REQUIRED`.
7. Delegate approved implementation to `twentyft-template-engineer`.
8. Delegate independent review to `twentyft-qa-reviewer`.
9. If QA finds deterministic defects, allow one automatic fix cycle only. Run QA once more. If the same issue remains, stop and report it.
10. Do not install/activate/update/force-sync runtime in this workflow.

## Failure rule

If the same Bash command or Tool action fails twice for the same reason, stop. Do not retry it again automatically.

Report:

```text
FAILED COMMAND:
FAILURE TYPE:
LIKELY CAUSE:
NEXT ACTION:
```

Permission failure, user rejection, Tool failure, build failure, and test failure are different failure types.

## Final report

Return only:
- changed files
- 20ft evidence paths
- G7 evidence paths
- architecture decisions
- test/typecheck/build results
- blockers
- `IMPLEMENTATION COMPLETE / REVIEW PENDING`

Do not self-approve final visual quality.
