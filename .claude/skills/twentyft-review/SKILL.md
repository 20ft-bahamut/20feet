---
name: 20ft Independent Review
description: Runs an independent read-only review of current 20ft template changes against current IA/design requirements and verified G7 rules.
disable-model-invocation: true
context: fork
agent: twentyft-qa-reviewer
allowed-tools: Read Grep Glob Bash
background: false
---

Review the current `twentyft-studio` changes. Use `CLAUDE.md` and the doc routing map; do not edit anything. Focus on `$ARGUMENTS` if provided. Return the qa-reviewer contract and clearly separate verified facts from visual items that still need the user.
