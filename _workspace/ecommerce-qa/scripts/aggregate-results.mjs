import { readFileSync, writeFileSync } from 'fs';
const journal = '/home/bahamut/.claude/projects/-home-bahamut-20feet/7a826a32-796b-4f14-b51e-3adf8007e177/subagents/workflows/wf_b925bc3b-327/journal.jsonl';
const out = '/home/bahamut/20feet/_workspace/ecommerce-qa';
const labels = {
  'a7e42a9065c3fc770':'product-option','aeaa0a6ee5636e3c4':'cart-checkout-address','a065653b3e840762e':'coupon-mileage',
  'a2a7eb101003c42bb':'payment','a36648efcdcf45739':'order-stock-claim','a3dbcb8bb873a16ea':'shipping',
  'a4400ab2206d6a677':'aux-member','a63a9e2ae33cc0ff8':'stillform-parity','a45e98ae661daa4cf':'security' };
const rows = readFileSync(journal,'utf8').trim().split('\n').map(l=>JSON.parse(l)).filter(r=>r.type==='result');
let all = [];
const notes = {};
for (const r of rows) {
  const label = labels[r.agentId]||r.agentId;
  const val = typeof r.result==='string'?JSON.parse(r.result):r.result;
  notes[label]=val.notes;
  for (const c of val.cases||[]) all.push({agent:label,...c});
}
// dedupe by id (keep first)
const seen = new Set(); const cases = [];
for (const c of all){ if(seen.has(c.id)) continue; seen.add(c.id); cases.push(c); }
const counts = {PASS:0,FAIL:0,BLOCKED:0,NOT_APPLICABLE:0};
for (const c of cases) counts[c.status]=(counts[c.status]||0)+1;
const fails = cases.filter(c=>c.status==='FAIL');
const blocked = cases.filter(c=>c.status==='BLOCKED');
const na = cases.filter(c=>c.status==='NOT_APPLICABLE');
writeFileSync(out+'/results.json', JSON.stringify({generated:'2026-09-01',counts,total:cases.length,cases},null,2));
writeFileSync(out+'/domain-notes.json', JSON.stringify(notes,null,2));
// md
let md = '# QA RESULTS\n\n';
md += `Total: ${cases.length} | PASS ${counts.PASS} | FAIL ${counts.FAIL} | BLOCKED ${counts.BLOCKED} | NOT_APPLICABLE ${counts.NA||counts.NOT_APPLICABLE}\n\n## FAILS\n\n`;
for (const c of fails){ md += `### ${c.id} [${c.severity||'?'}] (${c.bugOwner||'?'})\n${c.domain} — ${c.feature}\n- expected: ${c.expected}\n- actual: ${c.actual}\n- evidence: ${c.evidence}\n- rootCause: ${c.rootCause||''}\n- fixProposal: ${c.fixProposal||''}\n\n`; }
md += '\n## BLOCKED\n\n';
for (const c of blocked){ md += `### ${c.id}\n${c.domain} — ${c.feature}\n- reason: ${c.actual}\n- next: ${c.fixProposal||''}\n\n`; }
md += '\n## NOT_APPLICABLE\n\n';
for (const c of na){ md += `### ${c.id}\n${c.domain} — ${c.feature}\n- why: ${c.actual}\n\n`; }
md += '\n## ALL CASES\n\n| id | status | sev | domain | feature |\n|---|---|---|---|---|\n';
for (const c of cases) md += `| ${c.id} | ${c.status} | ${c.severity||''} | ${c.domain} | ${String(c.feature).slice(0,80)} |\n`;
writeFileSync(out+'/results.md', md);
console.log(JSON.stringify(counts), 'total:', cases.length, 'dedupedFrom:', all.length);
console.log('\nFAILS:'); fails.forEach(c=>console.log(`- ${c.id} [${c.severity}] ${c.bugOwner} :: ${String(c.feature).slice(0,90)}`));
console.log('\nBLOCKED:'); blocked.forEach(c=>console.log(`- ${c.id} :: ${String(c.feature).slice(0,90)}`));
console.log('\nN/A:'); na.forEach(c=>console.log(`- ${c.id} :: ${String(c.feature).slice(0,90)}`));
