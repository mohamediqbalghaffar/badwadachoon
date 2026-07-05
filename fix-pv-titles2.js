const fs = require('fs');
let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

pv = pv.replace(
  "<div onClick={() => setDrillDown({ title: '?????? ???????????', data: baseFilteredSentData, viewType: 'sent' })}",
  "<div onClick={() => setDrillDown({ title: 'سەرجەم نێردراوەکان', data: baseFilteredSentData, viewType: 'sent' })}"
);

pv = pv.replace(
  "<div onClick={() => setDrillDown({ title: '?????? ???????????', data: baseFilteredSentData, viewType: 'sent' })}",
  "<div onClick={() => setDrillDown({ title: 'سەرجەم هاتووەکان', data: baseFilteredIncomingData, viewType: 'incoming' })}"
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);
console.log('Fixed titles');
