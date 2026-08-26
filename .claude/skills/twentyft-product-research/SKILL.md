---
name: 20ft Product Research
description: Extracts only the current 20ft product, IA, brand, design, content, and acceptance evidence needed for one scope.
disable-model-invocation: true
context: fork
agent: twentyft-product-researcher
background: false
allowed-tools: Read Grep Glob
---

Research only this 20ft scope: `$ARGUMENTS`

Start with `20ftdocs/19_CURRENT_DECISIONS.md` and `.claude/reference/doc-map.md`. Read only the mapped sections/files. Return the compact product/design evidence contract; do not modify files.
