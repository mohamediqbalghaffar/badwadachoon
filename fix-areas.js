const fs = require('fs');
let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

pv = pv.replace(
  '<AreaChart data={timelineDataComparison} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>',
  '<AreaChart data={timelineDataComparison} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} onClick={(e: any) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"بەراوردکردنی مانگی \" + m, data: compConfigA.data.filter((d: any) => d.sentDate && d.sentDate.startsWith(m)), viewType: compSourceA as \"incoming\" | \"received\" | \"sent\" }); } }} style={{ cursor: \"pointer\" }}>'
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);
console.log('Fixed AreaChart clicks');
