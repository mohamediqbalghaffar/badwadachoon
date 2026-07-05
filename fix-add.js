const fs = require('fs');

let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');
pv = pv.replace(/add\(dept: any\)/g, 'add(dept)');
fs.writeFileSync('src/components/PresentationView.tsx', pv);

let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');
pz = pz.replace(/add\(dept: any\)/g, 'add(dept)');
fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed add(dept)');
