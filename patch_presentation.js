const fs = require('fs');

const path = 'd:/badwadachoon/src/components/PresentationView.tsx';
let content = fs.readFileSync(path, 'utf8');

const stateInjection = `
  type DataSourceType = 'received' | 'sent' | 'incoming';
  const [compSourceA, setCompSourceA] = useState<DataSourceType>('received');
  const [compSourceB, setCompSourceB] = useState<DataSourceType>('sent');

  const getSourceConfig = (type: DataSourceType) => {
    switch (type) {
      case 'received':
        return { id: 'received', data: baseFilteredData, name: 'پێویست بە وەڵام', color: '#3b82f6', gradientText: 'from-blue-600 to-blue-400', gradientBg: 'from-blue-500 to-blue-400', lightBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', glow: 'bg-blue-500/10 group-hover:bg-blue-500/20', borderOverlay: 'from-blue-500 to-transparent', icon: Inbox };
      case 'sent':
        return { id: 'sent', data: baseFilteredSentData, name: 'سەرجەم ڕەوانەکراوەکان', color: '#06b6d4', gradientText: 'from-cyan-500 to-teal-400', gradientBg: 'from-cyan-400 to-cyan-500', lightBg: 'bg-cyan-100 dark:bg-cyan-900/30', iconColor: 'text-cyan-600 dark:text-cyan-400', glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20', borderOverlay: 'from-cyan-500 to-transparent', icon: Send };
      case 'incoming':
        return { id: 'incoming', data: baseFilteredIncomingData, name: 'سەرجەم هاتووەکان', color: '#8b5cf6', gradientText: 'from-purple-600 to-purple-400', gradientBg: 'from-purple-500 to-purple-400', lightBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400', glow: 'bg-purple-500/10 group-hover:bg-purple-500/20', borderOverlay: 'from-purple-500 to-transparent', icon: ArrowDownToLine };
    }
  };

  const compConfigA = getSourceConfig(compSourceA);
  const compConfigB = getSourceConfig(compSourceB);
  const compCountA = compConfigA.data.length;
  const compCountB = compConfigB.data.length;

  const deptData = useMemo(() => {`;

content = content.replace("  const deptData = useMemo(() => {", stateInjection);

const timelineRegex = /const timelineDataComparison = useMemo\(\(\) => \{[\s\S]*?\}, \[baseFilteredData, baseFilteredSentData\]\);/;
const newTimeline = `const timelineDataComparison = useMemo(() => {
    const rByMonth: Record<string, number> = {};
    const sByMonth: Record<string, number> = {};
    compConfigA.data.forEach((d: any) => {
      if (d.sentDate) {
        const date = parseISO(d.sentDate);
        if (isValid(date)) {
          const monthStr = format(startOfMonth(date), 'yyyy-MM');
          rByMonth[monthStr] = (rByMonth[monthStr] || 0) + 1;
        }
      }
    });
    compConfigB.data.forEach((d: any) => {
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
  }, [compConfigA.data, compConfigB.data]);`;
content = content.replace(timelineRegex, newTimeline);

const deptRegex = /const deptComparisonData = useMemo\(\(\) => \{[\s\S]*?\}, \[baseFilteredData, baseFilteredSentData, hasSentData\]\);/;
const newDept = `const deptComparisonData = useMemo(() => {
    if (compCountA === 0 && compCountB === 0) return [];
    const depts = new Set<string>();
    const receivedCounts: Record<string, number> = {};
    const sentCounts: Record<string, number> = {};

    compConfigA.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          depts.add(dept);
          receivedCounts[dept] = (receivedCounts[dept] || 0) + 1;
        });
      } else if (d.sender) {
        depts.add(d.sender);
        receivedCounts[d.sender] = (receivedCounts[d.sender] || 0) + 1;
      }
    });

    compConfigB.data.forEach((d: any) => {
      if (Array.isArray(d.departments) && d.departments.length > 0) {
        d.departments.forEach((dept: string) => {
          depts.add(dept);
          sentCounts[dept] = (sentCounts[dept] || 0) + 1;
        });
      } else if (d.sender) {
        depts.add(d.sender);
        sentCounts[d.sender] = (sentCounts[d.sender] || 0) + 1;
      }
    });

    return Array.from(depts).map(name => {
      const received = receivedCounts[name] || 0;
      const sent = sentCounts[name] || 0;
      const total = received + sent;
      const cleanName = name.replace('بەشی ', '').replace('سێکتەری ', '');
      const words = cleanName.split(' ').filter(w => w.length > 1 && w !== 'و');
      const abbr = words.slice(0, 2).map(w => w.charAt(0)).join('.');
      return { name, received, sent, total, abbr: abbr || name.charAt(0) };
    }).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [compConfigA.data, compConfigB.data]);`;
content = content.replace(deptRegex, newDept);


const compSlideRegex = /\{\/\* ===================== COMPARISON SLIDES ===================== \*\/\}[\s\S]*?(?=\{\/\* ===================== SENT SLIDES ===================== \*\/\}|<\/AnimatePresence>)/;

const newSlides = `{/* ===================== COMPARISON SLIDES ===================== */}

        {/* Dynamic Selector for Comparison Slides */}
        {activeView === 'comparison' && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200/20 shadow-lg">
            <select 
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-bold text-sm px-2 cursor-pointer"
              value={compSourceA}
              onChange={(e) => setCompSourceA(e.target.value as DataSourceType)}
            >
              <option className="text-slate-900" value="received" disabled={compSourceB === 'received'}>پێویست بە وەڵام</option>
              <option className="text-slate-900" value="sent" disabled={compSourceB === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
              <option className="text-slate-900" value="incoming" disabled={compSourceB === 'incoming'}>سەرجەم هاتووەکان</option>
            </select>
            <GitCompareArrows className="text-slate-400" size={20} />
            <select 
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none font-bold text-sm px-2 cursor-pointer"
              value={compSourceB}
              onChange={(e) => setCompSourceB(e.target.value as DataSourceType)}
            >
              <option className="text-slate-900" value="received" disabled={compSourceA === 'received'}>پێویست بە وەڵام</option>
              <option className="text-slate-900" value="sent" disabled={compSourceA === 'sent'}>سەرجەم ڕەوانەکراوەکان</option>
              <option className="text-slate-900" value="incoming" disabled={compSourceA === 'incoming'}>سەرجەم هاتووەکان</option>
            </select>
          </div>
        )}

        {/* COMP SLIDE 0: Summary */}
        {activeView === 'comparison' && activeSlide === 0 && (
          <motion.div key="comp-slide-0" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.div variants={itemVariants} className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                  <GitCompareArrows className="text-indigo-500" size={32} />
                  بەراوردکردنی نامەکان
                </h2>
                <span className="text-sm text-slate-400 mt-2 block">بەراوردی قەبارەی کارەکان لەنێوان دوو سەرچاوەی دیاریکراو</span>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 mt-4">
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className={\`absolute inset-0 transition-colors \${compConfigA.glow}\`} />
                <compConfigA.icon className={\`mb-4 relative z-10 \${compConfigA.iconColor.split(' ')[0]}\`} size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{compCountA}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">{compConfigA.name}</span>
                <span className="text-sm font-bold mt-2" style={{ color: compConfigA.color }}>{compCountA + compCountB > 0 ? Math.round((compCountA / (compCountA + compCountB)) * 100) : 0}%</span>
              </div>
              <div className="glass p-10 rounded-3xl flex flex-col items-center justify-center text-center border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className={\`absolute inset-0 transition-colors \${compConfigB.glow}\`} />
                <compConfigB.icon className={\`mb-4 relative z-10 \${compConfigB.iconColor.split(' ')[0]}\`} size={48} />
                <span className="text-5xl font-black text-slate-800 dark:text-white mb-2 relative z-10">{compCountB}</span>
                <span className="text-lg text-slate-500 font-bold relative z-10">{compConfigB.name}</span>
                <span className="text-sm font-bold mt-2" style={{ color: compConfigB.color }}>{compCountA + compCountB > 0 ? Math.round((compCountB / (compCountA + compCountB)) * 100) : 0}%</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* COMP SLIDE 1: Comparison Chart */}
        {activeView === 'comparison' && activeSlide === 1 && (
          <motion.div key="comp-slide-1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-indigo-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <GitCompareArrows className="text-indigo-500" size={32} />
              بەراوردی قەبارەی کارەکان بەپێی بەشەکان
            </motion.h2>
            
            <motion.div variants={itemVariants} className="w-full h-[350px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="abbr" tick={{ fontSize: 13, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                    formatter={(value, name) => [value, name === 'received' ? compConfigA.name : compConfigB.name]}
                  />
                  <Bar dataKey="received" name="received" fill={compConfigA.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="sent" name="sent" fill={compConfigB.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: compConfigA.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: compConfigB.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigB.name}</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* COMP SLIDE 2: Timeline */}
        {activeView === 'comparison' && activeSlide === 2 && (
          <motion.div key="comp-slide-2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-5xl flex flex-col pt-12">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10 -z-10" />
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200 mb-8 flex items-center gap-3">
              <TrendingUp className="text-purple-500" size={32} />
              بەراوردکردنی هەڵکشان و داکشان بەپێی کات
            </motion.h2>
            
            <motion.div variants={itemVariants} className="w-full h-[350px] glass rounded-3xl p-6 border-t border-t-white/30 border-l border-l-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-3xl" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineDataComparison} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={compConfigA.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={compConfigA.color} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={compConfigB.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={compConfigB.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#475569" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 13, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff' }} 
                    formatter={(value, name) => [value, name === 'received' ? compConfigA.name : compConfigB.name]}
                  />
                  <Area type="monotone" name="received" dataKey="received" stroke={compConfigA.color} strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" dot={{ r: 4, stroke: compConfigA.color, strokeWidth: 2, fill: '#fff' }} />
                  <Area type="monotone" name="sent" dataKey="sent" stroke={compConfigB.color} strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" dot={{ r: 4, stroke: compConfigB.color, strokeWidth: 2, fill: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap gap-x-8 gap-y-2 justify-center" dir="rtl">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: compConfigA.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigA.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 h-1 rounded-sm" style={{ backgroundColor: compConfigB.color }}></span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{compConfigB.name}</span>
              </div>
            </motion.div>
          </motion.div>
        )}

`;
content = content.replace(compSlideRegex, newSlides);

fs.writeFileSync(path, content, 'utf8');
console.log("Replaced presentation code successfully!");
