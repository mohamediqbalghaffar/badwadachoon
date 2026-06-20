const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'PresentationView.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update slideCount and add sent/comparison hooks
const searchSlideCount = `  // --- Sent Data Calculations ---
  const hasSentData = sentData.length > 0;
  const slideCount = hasSentData ? 9 : 7;
  
  const totalSent = baseFilteredSentData.length;`;

const replaceSlideCount = `  // --- Sent Data Calculations ---
  const hasSentData = sentData.length > 0;
  const { activeView } = useData();
  
  const slideCount = useMemo(() => {
    if (activeView === 'sent') return 4;
    if (activeView === 'comparison') return 3;
    return 7;
  }, [activeView]);
  
  const totalSent = baseFilteredSentData.length;

  const sentTimelineData = useMemo(() => {
    const counts = {};
    baseFilteredSentData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          counts[monthStr] = (counts[monthStr] || 0) + 1;
        }
      }
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [baseFilteredSentData]);

  const sentDeptData = useMemo(() => {
    const counts = {};
    baseFilteredSentData.forEach((d) => counts[d.department] = (counts[d.department] || 0) + 1);
    return Object.entries(counts).map(([name, count]) => {
         const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
         const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
         const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
         return { name, count, abbr: abbr || name.charAt(0) };
    }).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [baseFilteredSentData]);

  const sentTypeDataPres = useMemo(() => {
    const counts = {};
    baseFilteredSentData.forEach((d) => counts[d.letterType] = (counts[d.letterType] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [baseFilteredSentData]);

  const timelineDataComparison = useMemo(() => {
    const rByMonth = {};
    const sByMonth = {};
    baseFilteredData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          rByMonth[monthStr] = (rByMonth[monthStr] || 0) + 1;
        }
      }
    });
    baseFilteredSentData.forEach((d) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          sByMonth[monthStr] = (sByMonth[monthStr] || 0) + 1;
        }
      }
    });
    const allMonths = new Set([...Object.keys(rByMonth), ...Object.keys(sByMonth)]);
    return Array.from(allMonths).sort((a, b) => a.localeCompare(b)).map((month) => ({
      date: month, received: rByMonth[month] || 0, sent: sByMonth[month] || 0,
    }));
  }, [baseFilteredData, baseFilteredSentData]);`;

content = content.replace(searchSlideCount, replaceSlideCount);
// fallback for \r\n
content = content.replace(searchSlideCount.replace(/\n/g, '\\r\\n'), replaceSlideCount);


// 2. Change {activeSlide === X && ( to {activeView === 'received' && activeSlide === X && (
for (let i = 0; i < 7; i++) {
  content = content.split(`{activeSlide === ${i} && (`).join(`{activeView === 'received' && activeSlide === ${i} && (`);
}

// 3. Replace Slide 8 and 9 completely with new Sent and Comparison slides
const slide8Start = content.indexOf('{/* SLIDE 8: Sent Summary */}');
const slideEnd = content.indexOf('      </div>\r\n\r\n      {/* Slide Navigation Hints */}');
if (slideEnd === -1) {
    const slideEnd2 = content.indexOf('      </div>\n\n      {/* Slide Navigation Hints */}');
    if (slideEnd2 !== -1) {
        replaceSlides(slide8Start, slideEnd2);
    } else {
        console.log("Could not find end of slides");
    }
} else {
    replaceSlides(slide8Start, slideEnd);
}

function replaceSlides(startIdx, endIdx) {
    const newSlides = `
        {/* ===================== SENT SLIDES ===================== */}
        {/* SENT SLIDE 0: Summary */}
        {activeView === 'sent' && activeSlide === 0 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <Send className="text-teal-500" size={32} />
                  سەرجەم نووسراوە ڕەوانەکراوەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ئاماری گشتی نامە ڕەوانەکراوەکان</span>
              </div>
              <div className="flex flex-col items-end bg-white/5 dark:bg-slate-900/40 p-4 rounded-xl border border-white/10">
                <span className="text-4xl font-black text-teal-600 dark:text-teal-400">
                  {totalSent}
                </span>
                <span className="text-sm text-slate-500 font-medium">کۆی نامەکان</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{totalSent}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </div>
          </div>
        )}

        {/* SENT SLIDE 1: Timeline Trend */}
        {activeView === 'sent' && activeSlide === 1 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <TrendingUp className="text-teal-500" size={32} />
                هەڵکشان و داکشانی نامە ڕەوانەکراوەکان
              </h2>
            </div>
            <div className="w-full h-[380px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sentTimelineData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTimelineSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorTimelineSent)" dot={{ r: 6, stroke: '#06b6d4', strokeWidth: 3, fill: '#fff' }}>
                    <LabelList dataKey="count" position="top" offset={12} fill="#06b6d4" fontSize={14} fontWeight="bold" />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SENT SLIDE 2: Depts */}
        {activeView === 'sent' && activeSlide === 2 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-teal-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <Building2 className="text-teal-500" size={32} />
                لایەنە سەرەکییەکان بەپێی نامەی ڕەوانەکراو
              </h2>
            </div>
            <div className="w-full h-[380px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentDeptData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} formatter={(value, name, props) => [value, props.payload.name]} labelFormatter={(abbr) => { const entry = sentDeptData.find(d => d.abbr === abbr); return entry ? entry.name : abbr; }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    <LabelList dataKey="count" position="top" offset={8} fill="#94a3b8" fontSize={12} fontWeight="bold" />
                    {sentDeptData.map((entry, index) => <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* SENT SLIDE 3: Types */}
        {activeView === 'sent' && activeSlide === 3 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <PieIcon className="text-purple-500" size={32} />
                جۆری نامە ڕەوانەکراوەکان
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10">
              <div className="h-[300px]" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentTypeDataPres} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                      {sentTypeDataPres.map((entry, index) => <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4" dir="rtl">
                {sentTypeDataPres.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/10 dark:bg-slate-850/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400">{entry.value} نامە</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== COMPARISON SLIDES ===================== */}
        {/* COMP SLIDE 0: Summary */}
        {activeView === 'comparison' && activeSlide === 0 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <GitCompareArrows className="text-indigo-500" size={32} />
                  بەراوردکردنی نامەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">ڕێژەی ئەو نامانەی پێویستیان بە وەڵامە لە کۆی گشتی نامە ڕەوانەکراوەکان</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <Layers className="text-blue-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{totalLetters}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">پێویست بە وەڵام</span>
                <span className="text-sm font-bold text-blue-500 mt-2">{totalSent > 0 ? Math.round((totalLetters / Math.max(totalLetters, totalSent)) * 100) : 0}%</span>
              </div>
              <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
                <Send className="text-teal-500 mb-4 relative z-10" size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{Math.max(totalLetters, totalSent)}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">سەرجەم ڕەوانەکراوەکان</span>
                <span className="text-sm font-bold text-teal-500 mt-2">100%</span>
              </div>
            </div>
          </div>
        )}

        {/* COMP SLIDE 1: Comparison Chart */}
        {activeView === 'comparison' && activeSlide === 1 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <GitCompareArrows className="text-indigo-500" size={32} />
              بەراوردی قەبارەی کارەکان بەپێی بەشەکان
            </h2>
            
            <div className="w-full h-[350px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                  />
                  <Bar dataKey="received" name="پێویست بە وەڵام" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sent" name="سەرجەم ڕەوانەکراوەکان" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#3b82f6]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">پێویست بە وەڵام</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm bg-[#06b6d4]"></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">سەرجەم ڕەوانەکراوەکان</span>
              </div>
            </div>
          </div>
        )}

        {/* COMP SLIDE 2: Timeline */}
        {activeView === 'comparison' && activeSlide === 2 && (
          <div className="w-full max-w-5xl flex flex-col animate-fade-in">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <TrendingUp className="text-purple-500" size={32} />
              بەراوردکردنی هەڵکشان و داکشان بەپێی کات
            </h2>
            
            <div className="w-full h-[350px] bg-white/5 dark:bg-slate-900/40 rounded-2xl p-6 border border-white/10" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineDataComparison} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} />
                  <Area type="monotone" dataKey="received" name="پێویست بە وەڵام" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="sent" name="سەرجەم ڕەوانەکراوەکان" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
`;

    content = content.substring(0, startIdx) + newSlides + content.substring(endIdx);
    fs.writeFileSync(filePath, content);
    console.log("Updated successfully!");
}
