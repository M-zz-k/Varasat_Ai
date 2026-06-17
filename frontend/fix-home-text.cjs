const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const replacements = [
  ['Get Started', "{t('nav.getStarted')}"],
  ['Trusted Digital Inheritance Companion', "{t('home.stamp')}"],
  ["Recover Your Family's{' '}", "{t('home.title')}{' '}"],
  ['Dormant Wealth', "{t('home.accent')}"],
  ['Varasat uses enterprise-grade AI to discover forgotten assets, analyze inheritance claims, and securely guide Indian families through regulated legal recovery channels.', "{t('home.desc')}"],
  ['VARASAT INTELLIGENCE ACTIVE', "{t('home.livePill')}"],
  ['Aadhaar & DigiLocker Integrated', "{t('home.aadhaarPill')}"],
  ['RBI Circular Compliant', "{t('home.circularPill')}"],
  ['Unclaimed Documents', "{t('home.pipeline.docs')}"],
  ['Secure AI Discovery', "{t('home.pipeline.discovery')}"],
  ['Discovered Wealth', "{t('home.pipeline.wealth')}"],
  ['Regulated Recovery', "{t('home.pipeline.recovery')}"],
  ['Start Finding Assets', "{t('home.cta.find')}"],
  ['Try Demo Mode', "{t('home.cta.demo')}"],
  ['Prefer speaking? Talk to Varasat AI', "{t('home.voice.header')}"],
  ['Access the Varasat Ecosystem', "{t('home.ecosystem.title')}"],
  ['Select the secure portal matching your role to query unclaimed assets, track family recovery progress, or verify claims.', "{t('home.ecosystem.desc')}"]
];

replacements.forEach(([oldStr, newStr]) => {
  content = content.replace(oldStr, newStr);
});

fs.writeFileSync('src/pages/Home.jsx', content);
