const fs = require('fs');
let pz = fs.readFileSync('src/components/PreziPresentationView.tsx', 'utf8');

pz = pz.replace(
  '<KPICard icon={Layers} label="??? ???? ???"',
  '<KPICard icon={Layers} label="کۆی گشتی نامەکان" onClick={() => setDrillDown({ title: "کۆی گشتی نامەکان", data: safeData, viewType: activeView })}'
);

pz = pz.replace(
  '<KPICard icon={Layers} label="??? ???? ???????" value={totalLetters} gradient="from-blue-600 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.1} />',
  '<KPICard icon={Layers} label="کۆی گشتی نامەکان" value={totalLetters} gradient="from-blue-600 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.1} onClick={() => setDrillDown({ title: "کۆی گشتی نامەکان", data: safeData, viewType: activeView as any })} />'
);

pz = pz.replace(
  '<KPICard icon={AlertTriangle} label="????????????" value={pendingLetters} gradient="from-amber-500 to-orange-500" bgLight="bg-amber-50" bgDark="dark:bg-amber-900/20" borderLight="border-amber-100" borderDark="dark:border-amber-800/50" delay={0.25} />',
  '<KPICard icon={AlertTriangle} label="هەڵپەسێردراو" value={pendingLetters} gradient="from-amber-500 to-orange-500" bgLight="bg-amber-50" bgDark="dark:bg-amber-900/20" borderLight="border-amber-100" borderDark="dark:border-amber-800/50" delay={0.25} onClick={() => setDrillDown({ title: "هەڵپەسێردراو", data: safeData.filter((d: any) => !d.responseDate), viewType: activeView as any })} />'
);

pz = pz.replace(
  '<KPICard icon={Clock} label="?????? ???? ?????" value={avgProcessingTime.toFixed(1) + \' ???\'} gradient="from-emerald-500 to-teal-500" bgLight="bg-emerald-50" bgDark="dark:bg-emerald-900/20" borderLight="border-emerald-100" borderDark="dark:border-emerald-800/50" delay={0.4} />',
  '<KPICard icon={Clock} label="تێکڕای کاتی وەڵامدانەوە" value={avgProcessingTime.toFixed(1) + \' ڕۆژ\'} gradient="from-emerald-500 to-teal-500" bgLight="bg-emerald-50" bgDark="dark:bg-emerald-900/20" borderLight="border-emerald-100" borderDark="dark:border-emerald-800/50" delay={0.4} onClick={() => setDrillDown({ title: "تێکڕای کاتی وەڵامدانەوە", data: safeData.filter((d: any) => d.processingTime !== null && d.processingTime !== undefined), viewType: activeView as any })} />'
);

pz = pz.replace(
  '<KPICard icon={ArrowDownToLine} label="??? ?????????" value={baseFilteredIncomingData.length} gradient="from-purple-500 to-fuchsia-500" bgLight="bg-purple-50" bgDark="dark:bg-purple-900/20" borderLight="border-purple-100" borderDark="dark:border-purple-800/50" delay={0.1} />',
  '<KPICard icon={ArrowDownToLine} label="کۆی هاتووەکان" value={baseFilteredIncomingData.length} gradient="from-purple-500 to-fuchsia-500" bgLight="bg-purple-50" bgDark="dark:bg-purple-900/20" borderLight="border-purple-100" borderDark="dark:border-purple-800/50" delay={0.1} onClick={() => setDrillDown({ title: "سەرجەم هاتووەکان", data: baseFilteredIncomingData, viewType: "incoming" })} />'
);

pz = pz.replace(
  '<KPICard icon={Inbox} label="?????? ?? ?????" value={baseFilteredData.length} gradient="from-blue-500 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.25} />',
  '<KPICard icon={Inbox} label="کۆی ناوخۆیی" value={baseFilteredData.length} gradient="from-blue-500 to-cyan-500" bgLight="bg-blue-50" bgDark="dark:bg-blue-900/20" borderLight="border-blue-100" borderDark="dark:border-blue-800/50" delay={0.25} onClick={() => setDrillDown({ title: "سەرجەم ناوخۆییەکان", data: baseFilteredData, viewType: "received" })} />'
);

pz = pz.replace(
  '<KPICard icon={Send} label="??? ??????????????" value={baseFilteredSentData.length} gradient="from-teal-500 to-emerald-500" bgLight="bg-teal-50" bgDark="dark:bg-teal-900/20" borderLight="border-teal-100" borderDark="dark:border-teal-800/50" delay={0.4} />',
  '<KPICard icon={Send} label="کۆی نێردراوەکان" value={baseFilteredSentData.length} gradient="from-teal-500 to-emerald-500" bgLight="bg-teal-50" bgDark="dark:bg-teal-900/20" borderLight="border-teal-100" borderDark="dark:border-teal-800/50" delay={0.4} onClick={() => setDrillDown({ title: "سەرجەم نێردراوەکان", data: baseFilteredSentData, viewType: "sent" })} />'
);

fs.writeFileSync('src/components/PreziPresentationView.tsx', pz);
console.log('Fixed Prezi KPI Cards');
