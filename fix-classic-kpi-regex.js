const fs = require('fs');
let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

pv = pv.replace(
  /<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">\?\?\? \?\?\?\? \?\?\?\?\?\?\?<\/h3>/g,
  '<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">کۆی گشتی نامەکان</h3>'
);

pv = pv.replace(
  /<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">\?\?\?\?\?\?\?\?\?\?\?\?<\/h3>/g,
  '<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">هەڵپەسێردراو</h3>'
);

pv = pv.replace(
  /<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">\?\?\?\?\?\? \?\?\?\? \?\?\?\?\?<\/h3>/g,
  '<h3 className=\"text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2\">تێکڕای کاتی وەڵامدانەوە</h3>'
);

// We must also replace the wrapping motion.div tags for these three specifically.
// The easiest way is to add onClick to ALL glass KPI cards that don't have it, but wait, the drill down data is specific!
// Total Letters:
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-blue-100.*?>[\s\S]*?<\/div>\s*<h3.*?کۆی گشتی نامەکان<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: \"کۆی گشتی نامەکان\", data: baseFilteredData, viewType: \"received\" })} variants={itemVariants} className=\"cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl\">'
);

// Pending Letters:
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-amber-100.*?>[\s\S]*?<\/div>\s*<h3.*?هەڵپەسێردراو<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: \"هەڵپەسێردراو\", data: baseFilteredData.filter((d: any) => !d.responseDate), viewType: \"received\" })} variants={itemVariants} className=\"cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl\">'
);

// Avg Processing Time:
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-emerald-100.*?>[\s\S]*?<\/div>\s*<h3.*?تێکڕای کاتی وەڵامدانەوە<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: \"تێکڕای کاتی وەڵامدانەوە\", data: baseFilteredData.filter((d: any) => d.processingTime !== null && d.processingTime !== undefined), viewType: \"received\" })} variants={itemVariants} className=\"cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl\">'
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);
console.log('Fixed Classic KPI Cards v2');
