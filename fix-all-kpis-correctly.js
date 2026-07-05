const fs = require('fs');
let pv = fs.readFileSync('src/components/PresentationView.tsx', 'utf8');

// For Total Letters
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-blue-100.*?>[\s\S]*?<\/div>\s*<h3.*?mb-2\">.*?<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: "کۆی گشتی نامەکان", data: baseFilteredData, viewType: "received" })} variants={itemVariants} className="cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">$1'
);

// For Pending Letters
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-amber-100.*?>[\s\S]*?<\/div>\s*<h3.*?mb-2\">.*?<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: "هەڵپەسێردراو", data: baseFilteredData.filter((d: any) => !d.responseDate), viewType: "received" })} variants={itemVariants} className="cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">$1'
);

// For Avg Processing Time
pv = pv.replace(
  /<motion\.div variants=\{itemVariants\} className=\"glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white\/30 border-l border-l-white\/20 shadow-\[0_8px_30px_rgb\(0,0,0,0\.12\)\] relative overflow-hidden group hover:scale-\[1\.03\] transition-transform backdrop-blur-3xl\">(\s*<div.*?bg-emerald-100.*?>[\s\S]*?<\/div>\s*<h3.*?mb-2\">.*?<\/h3>)/,
  '<motion.div onClick={() => setDrillDown({ title: "تێکڕای کاتی وەڵامدانەوە", data: baseFilteredData.filter((d: any) => d.processingTime !== null && d.processingTime !== undefined), viewType: "received" })} variants={itemVariants} className="cursor-pointer glass p-8 rounded-3xl flex flex-col items-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative overflow-hidden group hover:scale-[1.03] transition-transform backdrop-blur-3xl">$1'
);

fs.writeFileSync('src/components/PresentationView.tsx', pv);

let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');

// For Prezi KPICards, replace them with onClick added
pz = pz.replace(
  /<KPICard icon=\{Layers\} label=".*?" value=\{totalLetters\} gradient="from-blue-600 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900\/20" borderLight="border-blue-100" borderDark="dark:border-blue-800\/50" delay=\{0\.1\} \/>/,
  '<KPICard icon={Layers} label="کۆی گشتی نامەکان" value={totalLetters} gradient="from-blue-600 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.1} onClick={() => setDrillDown({ title: "کۆی گشتی نامەکان", data: safeData, viewType: activeView as any })} />'
);

pz = pz.replace(
  /<KPICard icon=\{AlertTriangle\} label=".*?" value=\{pendingLetters\} gradient="from-amber-500 to-orange-500" bgLight="bg-amber-50" bgDark="dark:bg-amber-900\/20" borderLight="border-amber-100" borderDark="dark:border-amber-800\/50" delay=\{0\.25\} \/>/,
  '<KPICard icon={AlertTriangle} label="هەڵپەسێردراو" value={pendingLetters} gradient="from-amber-500 to-orange-500" bgLight="bg-amber-50" bgDark="dark:bg-amber-900/20" borderLight="border-amber-100" borderDark="dark:border-amber-800/50" delay={0.25} onClick={() => setDrillDown({ title: "هەڵپەسێردراو", data: safeData.filter((d: any) => !d.responseDate), viewType: activeView as any })} />'
);

pz = pz.replace(
  /<KPICard icon=\{Clock\} label=".*?" value=\{avgProcessingTime\.toFixed\(1\) \+ ' (?:ڕۆژ|\?\?\?)'\} gradient="from-emerald-500 to-teal-500" bgLight="bg-emerald-50" bgDark="dark:bg-emerald-900\/20" borderLight="border-emerald-100" borderDark="dark:border-emerald-800\/50" delay=\{0\.4\} \/>/,
  '<KPICard icon={Clock} label="تێکڕای کاتی وەڵامدانەوە" value={avgProcessingTime.toFixed(1) + \' ڕۆژ\'} gradient="from-emerald-500 to-teal-500" bgLight="bg-emerald-50" bgDark="dark:bg-emerald-900/20" borderLight="border-emerald-100" borderDark="dark:border-emerald-800/50" delay={0.4} onClick={() => setDrillDown({ title: "تێکڕای کاتی وەڵامدانەوە", data: safeData.filter((d: any) => d.processingTime !== null && d.processingTime !== undefined), viewType: activeView as any })} />'
);

// For Prezi Incoming
pz = pz.replace(
  /<KPICard icon=\{ArrowDownToLine\} label=".*?" value=\{baseFilteredIncomingData\.length\} gradient="from-purple-500 to-fuchsia-500" bgLight="bg-purple-50" bgDark="dark:bg-purple-900\/20" borderLight="border-purple-100" borderDark="dark:border-purple-800\/50" delay=\{0\.1\} \/>/,
  '<KPICard icon={ArrowDownToLine} label="کۆی هاتووەکان" value={baseFilteredIncomingData.length} gradient="from-purple-500 to-fuchsia-500" bgLight="bg-purple-50" bgDark="dark:bg-purple-900/20" borderLight="border-purple-100" borderDark="dark:border-purple-800/50" delay={0.1} onClick={() => setDrillDown({ title: "سەرجەم هاتووەکان", data: baseFilteredIncomingData, viewType: "incoming" })} />'
);

// For Prezi Received
pz = pz.replace(
  /<KPICard icon=\{Inbox\} label=".*?" value=\{baseFilteredData\.length\} gradient="from-blue-500 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900\/20" borderLight="border-blue-100" borderDark="dark:border-blue-800\/50" delay=\{0\.25\} \/>/,
  '<KPICard icon={Inbox} label="کۆی ناوخۆیی" value={baseFilteredData.length} gradient="from-blue-500 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.25} onClick={() => setDrillDown({ title: "سەرجەم ناوخۆییەکان", data: baseFilteredData, viewType: "received" })} />'
);

// For Prezi Sent
pz = pz.replace(
  /<KPICard icon=\{Send\} label=".*?" value=\{baseFilteredSentData\.length\} gradient="from-teal-500 to-emerald-500" bgLight="bg-teal-50" bgDark="dark:bg-teal-900\/20" borderLight="border-teal-100" borderDark="dark:border-teal-800\/50" delay=\{0\.4\} \/>/,
  '<KPICard icon={Send} label="کۆی نێردراوەکان" value={baseFilteredSentData.length} gradient="from-teal-500 to-emerald-500" bgLight="bg-teal-50" bgDark="dark:bg-teal-900/20" borderLight="border-teal-100" borderDark="dark:border-teal-800/50" delay={0.4} onClick={() => setDrillDown({ title: "سەرجەم نێردراوەکان", data: baseFilteredSentData, viewType: "sent" })} />'
);

fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);

console.log('Fixed Classic and Prezi KPI Cards correctly!');
