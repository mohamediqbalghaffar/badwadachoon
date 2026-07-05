const fs = require('fs');

let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

// 1. PresentationView: AreaChart (timelineData - received)
pv = pv.replace(
  '<AreaChart data={timelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>',
  '<AreaChart data={timelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"نامەکانی مانگی \" + m, data: baseFilteredData.filter(d => d.sentDate && d.sentDate.startsWith(m)), viewType: \"received\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 2. AreaChart (sentTimelineData)
pv = pv.replace(
  '<AreaChart data={sentTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>',
  '<AreaChart data={sentTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"نێردراوەکانی مانگی \" + m, data: baseFilteredSentData.filter(d => d.sentDate && d.sentDate.startsWith(m)), viewType: \"sent\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 3. AreaChart (incomingTimelineData)
pv = pv.replace(
  '<AreaChart data={incomingTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>',
  '<AreaChart data={incomingTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"هاتووەکانی مانگی \" + m, data: baseFilteredIncomingData.filter(d => d.sentDate && d.sentDate.startsWith(m)), viewType: \"incoming\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 4. BarChart (chartData)
pv = pv.replace(
  '<BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>',
  '<BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const dept = e.activePayload[0].payload.name; setDrillDown({ title: \"نامەکانی \" + dept, data: baseFilteredData.filter(d => d.departments?.includes(dept) || d.sender === dept), viewType: \"received\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 5. BarChart (sentDeptData)
pv = pv.replace(
  '<BarChart data={sentDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>',
  '<BarChart data={sentDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const dept = e.activePayload[0].payload.name; setDrillDown({ title: \"نێردراوەکانی \" + dept, data: baseFilteredSentData.filter(d => d.departments?.includes(dept) || d.sender === dept), viewType: \"sent\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 6. BarChart (incomingDeptData)
pv = pv.replace(
  '<BarChart data={incomingDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>',
  '<BarChart data={incomingDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const dept = e.activePayload[0].payload.name; setDrillDown({ title: \"هاتووەکانی \" + dept, data: baseFilteredIncomingData.filter(d => d.departments?.includes(dept) || d.sender === dept), viewType: \"incoming\" }); } }} style={{ cursor: \"pointer\" }}>'
);

// 7. typeData lists
pv = pv.replace(
  '{typeData.map((entry, index) => (\\n                  <div key={index} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors\">',
  '{typeData.map((entry, index) => (\\n                  <div key={index} onClick={() => setDrillDown({ title: entry.name, data: baseFilteredData.filter(d => d.letterType === entry.name), viewType: \"received\" })} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors cursor-pointer hover:scale-[1.02]\">'
);

// 8. sentTypeDataPres lists
pv = pv.replace(
  '{sentTypeDataPres.map((entry, index) => (\\n                  <div key={index} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors\">',
  '{sentTypeDataPres.map((entry, index) => (\\n                  <div key={index} onClick={() => setDrillDown({ title: entry.name, data: baseFilteredSentData.filter(d => d.letterType === entry.name), viewType: \"sent\" })} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors cursor-pointer hover:scale-[1.02]\">'
);

// 9. incomingTypeDataPres lists
pv = pv.replace(
  '{incomingTypeDataPres.map((entry, index) => (\\n                  <div key={index} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors\">',
  '{incomingTypeDataPres.map((entry, index) => (\\n                  <div key={index} onClick={() => setDrillDown({ title: entry.name, data: baseFilteredIncomingData.filter(d => d.letterType === entry.name), viewType: \"incoming\" })} className=\"flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5 hover:bg-slate-800/20 transition-colors cursor-pointer hover:scale-[1.02]\">'
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);

let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');

// 1. Prezi: BarChart barData
pz = pz.replace(
  '<BarChart data={barData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>',
  '<BarChart data={barData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const dept = e.activePayload[0].payload.name; setDrillDown({ title: \"داتاکانی \" + dept, data: (activeView === \"sent\" ? baseFilteredSentData : activeView === \"incoming\" ? baseFilteredIncomingData : baseFilteredData).filter(d => d.departments?.includes(dept) || d.sender === dept), viewType: activeView }); } }} style={{ cursor: \"pointer\" }}>'
);

// 2. Prezi: AreaChart timelineData
pz = pz.replace(
  '<AreaChart data={timelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>',
  '<AreaChart data={timelineData} margin={{ top: 30, right: 20, left: -20, bottom: 0 }} onClick={(e) => { if (e?.activePayload?.length > 0) { const m = e.activePayload[0].payload.date; setDrillDown({ title: \"مانگی \" + m, data: (activeView === \"sent\" ? baseFilteredSentData : activeView === \"incoming\" ? baseFilteredIncomingData : baseFilteredData).filter(d => d.sentDate && d.sentDate.startsWith(m)), viewType: activeView }); } }} style={{ cursor: \"pointer\" }}>'
);

// 3. Prezi: pieData list
pz = pz.replace(
  '{pieData.map((entry, index) => (\\n                  <div key={index} className=\"flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700 transition-all hover:scale-[1.02] hover:shadow-md\">',
  '{pieData.map((entry, index) => (\\n                  <div key={index} onClick={() => setDrillDown({ title: entry.name, data: (activeView === \"sent\" ? baseFilteredSentData : activeView === \"incoming\" ? baseFilteredIncomingData : baseFilteredData).filter(d => d.letterType === entry.name), viewType: activeView })} className=\"flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700 transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer\">'
);

fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Done mapping.');
