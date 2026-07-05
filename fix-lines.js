const fs = require('fs');
let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');

pz = pz.replace(
  '<LineChart data={comparisonTimelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>',
  '<LineChart data={comparisonTimelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }} onClick={(e: any) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"بەراوردکردنی مانگی \" + m, data: baseFilteredData.filter((d: any) => d.sentDate && d.sentDate.startsWith(m)), viewType: \"received\" }); } }} style={{ cursor: \"pointer\" }}>'
);

fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed line clicks');
