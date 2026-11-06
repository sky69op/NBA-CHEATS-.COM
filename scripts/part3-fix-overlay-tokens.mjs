import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'content/part3/translations');
const reps = [
  ['__UGC_FULL__', 'Unban & Governance Control'],
  ['__NBA2K27_CHEATS__', 'NBA2K27 CHEATS'],
  ['__NBA2K27__', 'NBA2K27'],
  ['__NBA_2K27__', 'NBA 2K27'],
  ['__HWID__', 'HWID Spoofer'],
  ['__CLOUD_DMA__', 'Cloud DMA'],
  ['__NUBE_DMA__', 'Cloud DMA'],
  ['__UGC__', 'UGC'],
  ['__PRICE35__', '$35'],
  ['__PRICE50__', '$50'],
  ['__PRICE150__', '$150'],
  ['__30D__', '30 days'],
  ['__STEAM__', 'Steam'],
  ['__VC__', 'Visual Concepts'],
  ['__BRAND__', 'NBA2K27 Cheats'],
];

const disclosures = {
  es: 'Inicio de debate editorial de NBA2K27 Cheats.',
  de: 'Redaktioneller Diskussionsstarter von NBA2K27 Cheats.',
  fr: 'Amorce de discussion éditoriale de NBA2K27 Cheats.',
};

for (const loc of ['es', 'de', 'fr']) {
  const file = path.join(root, `${loc}.json`);
  let text = fs.readFileSync(file, 'utf8');
  for (const [from, to] of reps) text = text.split(from).join(to);
  text = text.replace(/NBA2K27 Trucos/g, 'NBA2K27 Cheats');
  const o = JSON.parse(text);
  o.forumDisclosure[loc] = disclosures[loc];
  fs.writeFileSync(file, `${JSON.stringify(o, null, 2)}\n`);
  console.log(loc, 'tokens left', /__/.test(JSON.stringify(o)));
}
