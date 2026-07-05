const fs = require('fs');

// PresentationView.tsx (Classic)
let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');
pv = pv.replace(/max-w-5xl/g, 'max-w-[1400px]');
fs.writeFileSync('src/components/PresentationView.tsx', pv);
console.log('Fixed Classic width');

// PreziPresentationView.tsx
let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');
pz = pz.replace(/w-\[1000px\]/g, 'w-[1400px]');
fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed Prezi width');
