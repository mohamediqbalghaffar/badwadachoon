const fs = require('fs');

let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

pv = pv.replace(
  '<Bar dataKey="received" name="received" fill={compConfigA.color} radius={[4, 4, 0, 0]} maxBarSize={40} />',
  '<Bar dataKey="received" name="received" fill={compConfigA.color} radius={[4, 4, 0, 0]} maxBarSize={40} onClick={(data: any) => { if(data?.name) { setDrillDown({ title: \"داتاکانی \" + data.name, data: compConfigA.data.filter((d: any) => d.departments?.includes(data.name) || d.sender === data.name), viewType: compSourceA as \"incoming\" | \"received\" | \"sent\" }); } }} style={{ cursor: \"pointer\" }} />'
);

pv = pv.replace(
  '<Bar dataKey="sent" name="sent" fill={compConfigB.color} radius={[4, 4, 0, 0]} maxBarSize={40} />',
  '<Bar dataKey="sent" name="sent" fill={compConfigB.color} radius={[4, 4, 0, 0]} maxBarSize={40} onClick={(data: any) => { if(data?.name) { setDrillDown({ title: \"داتاکانی \" + data.name, data: compConfigB.data.filter((d: any) => d.departments?.includes(data.name) || d.sender === data.name), viewType: compSourceB as \"incoming\" | \"received\" | \"sent\" }); } }} style={{ cursor: \"pointer\" }} />'
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);

let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');

pz = pz.replace(
  '<Bar dataKey="received" name="?????? ?? ?????" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} />',
  '<Bar dataKey="received" name="نامەی ناوخۆیی" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} onClick={(data: any) => { if(data?.name) { setDrillDown({ title: \"نامەی ناوخۆیی - \" + data.name, data: baseFilteredData.filter((d: any) => d.departments?.includes(data.name) || d.sender === data.name), viewType: \"received\" }); } }} style={{ cursor: \"pointer\" }} />'
);

pz = pz.replace(
  '<Bar dataKey="sent" name="??????????????" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} />',
  '<Bar dataKey="sent" name="نامەی نێردراو" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1200} onClick={(data: any) => { if(data?.name) { setDrillDown({ title: \"نامەی نێردراو - \" + data.name, data: baseFilteredSentData.filter((d: any) => d.departments?.includes(data.name) || d.sender === data.name), viewType: \"sent\" }); } }} style={{ cursor: \"pointer\" }} />'
);

fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed bar clicks');
