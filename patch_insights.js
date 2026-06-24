const fs = require('fs');
const path = 'd:/badwadachoon/src/components/PresentationView.tsx';
let content = fs.readFileSync(path, 'utf8');

const slidesToPatch = [
  {
    key: "rec-slide-3",
    color: "blue",
    condition: "typeData.length > 0",
    insight: `زۆرترین جۆری نامە پێکهاتووە لە <strong className="text-blue-500">{[...typeData].sort((a,b)=>b.value-a.value)[0].name}</strong> بە ڕێژەی بەرچاو.`
  },
  {
    key: "rec-slide-4", // Wait, earlier I said rec-slide-5! Actually SLA is rec-slide-4. Let me fix this to rec-slide-4 since activeSlide === 4 is rec-slide-4. Wait, line 764 says key="rec-slide-4". Wait! Slide 5 (SLA) HAS no insight block! Let's check. Slide 6 (Dept Insights) is rec-slide-5 and DOES NOT HAVE insight block. Let me verify later. For now let's just patch them all.
    color: "emerald",
    condition: "slaEnhancedData.data.length > 0",
    insight: `خێراترین بەش لە وەڵامدانەوە پێکهاتووە لە <strong className="text-emerald-500">{[...slaEnhancedData.data].sort((a,b)=>a.avgProcessingTime-b.avgProcessingTime)[0].name}</strong> بە تێکڕای <strong className="text-emerald-500">{[...slaEnhancedData.data].sort((a,b)=>a.avgProcessingTime-b.avgProcessingTime)[0].avgProcessingTime} ڕۆژ</strong>.`
  },
  {
    key: "rec-slide-5", // Department Insights
    color: "emerald",
    condition: "deptSlaData.length > 0",
    insight: `بەشی <strong className="text-emerald-500">{[...deptSlaData].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین نامەی ئاراستە کراوە.`
  },
  {
    key: "sent-slide-0",
    color: "teal",
    condition: "true",
    insight: `سەرجەم نامە ڕەوانەکراوەکان گەیشتوونەتە <strong className="text-teal-500">{totalSent}</strong> نامە، کە ئەمەش پیشاندەری ئاستی کارایی و خێرایی بەشەکانە.`
  },
  {
    key: "sent-slide-1",
    color: "teal",
    condition: "timelineDataSent.length >= 2",
    insight: `لووتکەی نامە ڕەوانەکراوەکان لە مانگی <strong className="text-teal-500">{[...timelineDataSent].sort((a,b)=>b.count-a.count)[0].date}</strong> دا بووە بە بڕی <strong className="text-teal-500">{[...timelineDataSent].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.`
  },
  {
    key: "sent-slide-2",
    color: "cyan",
    condition: "sentDeptData.length > 0",
    insight: `بەشی <strong className="text-cyan-500">{[...sentDeptData].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین ڕێژەی نامەی ڕەوانەکراوی هەیە بە <strong className="text-cyan-500">{[...sentDeptData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.`
  },
  {
    key: "sent-slide-3",
    color: "cyan",
    condition: "sentTypeDataPres.length > 0",
    insight: `جۆری <strong className="text-cyan-500">{[...sentTypeDataPres].sort((a,b)=>b.value-a.value)[0].name}</strong> بەربڵاوترین جۆری نامەی ڕەوانەکراوە بە <strong className="text-cyan-500">{[...sentTypeDataPres].sort((a,b)=>b.value-a.value)[0].value}</strong> نامە.`
  },
  {
    key: "incoming-slide-0",
    color: "purple",
    condition: "true",
    insight: `ژمارەی نامە هاتووەکان گەیشتووەتە <strong className="text-purple-500">{totalIncoming}</strong> نامە، کە پێویستیان بە ڕێکخستن و وەڵامدانەوەیە.`
  },
  {
    key: "incoming-slide-1",
    color: "fuchsia",
    condition: "timelineDataIncoming.length >= 2",
    insight: `زۆرترین نامەی هاتوو لە مانگی <strong className="text-fuchsia-500">{[...timelineDataIncoming].sort((a,b)=>b.count-a.count)[0].date}</strong> دا تۆمارکراوە بە بڕی <strong className="text-fuchsia-500">{[...timelineDataIncoming].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.`
  },
  {
    key: "incoming-slide-2",
    color: "purple",
    condition: "incomingDeptData.length > 0",
    insight: `بەشی <strong className="text-purple-500">{[...incomingDeptData].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین نامەی ئاراستە کراوە بە <strong className="text-purple-500">{[...incomingDeptData].sort((a,b)=>b.count-a.count)[0].count}</strong> نامە.`
  },
  {
    key: "incoming-slide-3",
    color: "purple",
    condition: "incomingTypeDataPres.length > 0",
    insight: `سەرەکیترین جۆری نامەی هاتوو بریتییە لە <strong className="text-purple-500">{[...incomingTypeDataPres].sort((a,b)=>b.value-a.value)[0].name}</strong> بە بڕی <strong className="text-purple-500">{[...incomingTypeDataPres].sort((a,b)=>b.value-a.value)[0].value}</strong> نامە.`
  },
  {
    key: "comp-slide-0",
    color: "indigo",
    condition: "compCountA > 0 || compCountB > 0",
    insight: `ڕێژەی <strong className="text-indigo-500">{compCountA + compCountB > 0 ? Math.round((compCountA / (compCountA + compCountB)) * 100) : 0}%</strong>ی کارەکان پەیوەستە بە <strong className="text-indigo-500">{compConfigA.name}</strong> بەرامبەر بە <strong className="text-indigo-500">{compCountA + compCountB > 0 ? Math.round((compCountB / (compCountA + compCountB)) * 100) : 0}%</strong> بۆ <strong className="text-indigo-500">{compConfigB.name}</strong>.`
  },
  {
    key: "comp-slide-1",
    color: "indigo",
    condition: "deptComparisonData.length > 0",
    insight: `بەشی <strong className="text-indigo-500">{[...deptComparisonData].sort((a,b)=>b.total-a.total)[0].name}</strong> گەورەترین قەبارەی کاری هەیە لەنێوان هەردوو سەرچاوەی بەراوردکراودا.`
  },
  {
    key: "comp-slide-2",
    color: "indigo",
    condition: "timelineDataComparison.length >= 2",
    insight: `ئەم بەراوردکارییە دەریدەخات کە چۆن گۆڕانکارییەکان بەپێی کات کاریگەرییان هەبووە لەسەر قەبارەی کار لە هەردوو سەرچاوەکەدا.`
  }
];

let replacedCount = 0;

for (let s of slidesToPatch) {
  // Check if it already has showInsights
  const existingRegex = new RegExp('key="' + s.key + '"[\\s\\S]*?showInsights');
  if (existingRegex.test(content)) {
    console.log("Already has insights:", s.key);
    continue;
  }

  // Find the LAST </motion.div> before the )}
  const regex = new RegExp('(key="' + s.key + '"[\\s\\S]*?)(\\n\\s*<\\/motion\\.div>\\s*\\)\\})');
  
  const block = `
            {showInsights && ${s.condition} && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-${s.color}-500/10 to-${s.color}-400/10 border border-${s.color}-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-${s.color}-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-${s.color}-600 dark:text-${s.color}-400">شیکاری هۆشمەند: </strong> 
                  ${s.insight}
                </p>
              </motion.div>
            )}`;

  if (regex.test(content)) {
    content = content.replace(regex, '$1' + block + '$2');
    replacedCount++;
  } else {
    console.log("Failed to match:", s.key);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log(`Replaced ${replacedCount} slides successfully!`);
