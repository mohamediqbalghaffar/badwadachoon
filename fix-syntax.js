const fs = require('fs');

let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');
pv = pv.replace(/forEach\(dept: any\) =>/g, 'forEach((dept: any) =>');
fs.writeFileSync('src/components/PresentationView.tsx', pv);

let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');
pz = pz.replace(/forEach\(dept: any\) =>/g, 'forEach((dept: any) =>');
fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed forEach loops');
