---
name: 20ft Runtime Sync
description: Manually prepares and performs runtime sync for twentyft-studio only when the user explicitly requests install, activate, update, or sync.
disable-model-invocation: true
allowed-tools: Read Grep Glob Bash Agent
---

# Manual-only Runtime Gate

Target identifier: `twentyft-studio`

Required order:
1. Read `20ftdocs/12_G7_TEMPLATE_RULES.md`.
2. Read the current G7 template workflow/command docs relevant to the requested operation.
3. Check `git status --short` and relevant diff.
4. Confirm source is `templates/_bundled/twentyft-studio/**`.
5. Verify required build/tests are green.
6. Determine exactly what runtime files/data the G7 command will replace.
7. Show the exact runtime command to the user.
8. Run install/activate/update/force only after explicit user approval.
9. Delegate read-only verification to `twentyft-runtime-verifier`.

Never use force update as a development save mechanism.
