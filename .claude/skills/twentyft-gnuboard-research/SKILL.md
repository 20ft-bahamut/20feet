---
name: 20ft G7 Research
description: Researches a narrow Gnuboard 7 question for the 20ft template using current AGENTS.md, official docs, and bundled samples without polluting the main context.
disable-model-invocation: true
context: fork
agent: twentyft-gnuboard-researcher
allowed-tools: Read Grep Glob
background: false
---

Research only this question: `$ARGUMENTS`

Use `.claude/reference/doc-map.md`. Search first, read only relevant source sections, and return the compact G7 evidence contract. Do not modify files.
