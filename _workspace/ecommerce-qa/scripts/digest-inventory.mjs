import { readFileSync, writeFileSync, mkdirSync } from 'fs';
const journal = '/home/bahamut/.claude/projects/-home-bahamut-20feet/7a826a32-796b-4f14-b51e-3adf8007e177/subagents/workflows/wf_71961c3a-824/journal.jsonl';
const outDir = '/home/bahamut/20feet/_workspace/ecommerce-qa';
const labels = {
  'a395520bec0bd6436':'core-order-status','a89fe5b8fd665bacb':'options-stock','a0a4da3e5c41e772f':'cart-checkout-shipping',
  'ac997bb9eb2cdab67':'coupon-point','a45c825193f4e02f0':'payment-plugins','ac1764c14322f4250':'basic-template-surface',
  'ab74ae3cd8170b321':'stillform-surface','acb9bb5261992617c':'aux-inquiry-notify-member' };
const lines = readFileSync(journal, 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(r => r.type === 'result');
const agents = [];
for (const r of lines) {
  const label = labels[r.agentId] || r.agentId;
  const val = typeof r.result === 'string' ? JSON.parse(r.result) : r.result;
  if (val && val.features) agents.push({ label, ...val });
}
let md = '# ECOMMERCE_FEATURE_INVENTORY (source-based, auto-extracted 2026-08-31)\n\n';
let all = [];
for (const val of agents) {
  md += `\n## ${val.label}\n\n> notes: ${String(val.notes || '').slice(0, 6000)}\n\n`;
  for (const f of val.features) {
    all.push(f);
    md += `### ${f.id} — ${f.feature}\n- domain: ${f.domain}\n- source: ${f.sourceFile}\n- adminUI: ${f.adminUI}\n- publicUI: ${f.publicUI}\n- api: ${f.api}\n- auth: ${f.requiresAuth}\n- config: ${f.requiresConfig}\n- external: ${f.requiresExternal}\n- dataMutation: ${f.dataMutation}\n- defaultTemplate: ${f.defaultTemplateExposes}\n- stillForm: ${f.stillFormExposes}\n\n`;
  }
}
writeFileSync(outDir + '/feature-inventory.md', md);
writeFileSync(outDir + '/evidence/feature-inventory.json', JSON.stringify(agents, null, 2));
const digest = all.map(f => `${f.id} | ${f.domain} | ${f.feature.slice(0,120)}`).join('\n');
writeFileSync(outDir + '/evidence/inventory-digest.txt', digest);
console.log('agents:', agents.map(a=>a.label).join(', '));
console.log('total features:', all.length);
