const fs = require('fs');
const path = 'd:/badwadachoon/src/components/PresentationView.tsx';
let content = fs.readFileSync(path, 'utf8');

// For rec-slide-3
const regex3 = /(key="rec-slide-3"[\s\S]*?)(\n\s*<\/motion\.div>\s*\)\})/;
const block3 = `
            {showInsights && typeData.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-blue-500/10 to-blue-400/10 border border-blue-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-blue-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-blue-600 dark:text-blue-400">شیکاری هۆشمەند: </strong> 
                  زۆرترین جۆری نامە پێکهاتووە لە <strong className="text-blue-500">{[...typeData].sort((a,b)=>b.value-a.value)[0].name}</strong> بە ڕێژەی بەرچاو.
                </p>
              </motion.div>
            )}`;

if (regex3.test(content)) {
  content = content.replace(regex3, '$1' + block3 + '$2');
  console.log("Patched rec-slide-3");
}

// For rec-slide-5
const regex5 = /(key="rec-slide-5"[\s\S]*?)(\n\s*<\/motion\.div>\s*\)\})/;
const block5 = `
            {showInsights && mostPendingDepts.length > 0 && (
              <motion.div variants={itemVariants} className="mt-6 p-5 bg-gradient-to-r from-emerald-500/10 to-emerald-400/10 border border-emerald-500/20 rounded-2xl w-full flex items-center gap-4">
                <Lightbulb className="text-emerald-500 shrink-0" size={28} />
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-emerald-600 dark:text-emerald-400">شیکاری هۆشمەند: </strong> 
                  بەشی <strong className="text-emerald-500">{[...mostPendingDepts].sort((a,b)=>b.count-a.count)[0].name}</strong> زۆرترین نامەی هەڵپەسێردراوی هەیە.
                </p>
              </motion.div>
            )}`;

if (regex5.test(content)) {
  content = content.replace(regex5, '$1' + block5 + '$2');
  console.log("Patched rec-slide-5");
}

fs.writeFileSync(path, content, 'utf8');
