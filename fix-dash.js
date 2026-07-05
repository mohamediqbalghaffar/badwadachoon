const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Add Sun, Moon to lucide-react
code = code.replace(
  'import { MonitorPlay, X, Inbox, Send, GitCompareArrows, ArrowDownToLine, LogOut, User, ShieldCheck, Settings, Database, UploadCloud, Edit3, Filter } from "lucide-react";',
  'import { MonitorPlay, X, Inbox, Send, GitCompareArrows, ArrowDownToLine, LogOut, User, ShieldCheck, Settings, Database, UploadCloud, Edit3, Filter, Sun, Moon } from "lucide-react";'
);

// 2. Add useTheme import
code = code.replace(
  'import { parseFile } from "../utils/parser";',
  'import { parseFile } from "../utils/parser";\nimport { useTheme } from "next-themes";'
);

// 3. Add useTheme hook
code = code.replace(
  'export const Dashboard = () => {\n  const { data,',
  'export const Dashboard = () => {\n  const { theme, setTheme } = useTheme();\n  const { data,'
);

// 4. Inject the button
const targetBlock = {isPresentationMode && (
        <button
          onClick={() => setIsPresentationMode(false)};

const replacementBlock = {isPresentationMode && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:top-8 z-50">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-lg hover:scale-110 flex items-center gap-2 group border border-slate-300 dark:border-slate-700"
              title="دۆخی ڕووناکی / تاریک"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
          <button
            onClick={() => setIsPresentationMode(false)};

code = code.replace(targetBlock, replacementBlock);

// 5. Close the fragment
const targetEndBlock =         </button>
      )}

      {!isPresentationMode ? (;

const replacementEndBlock =         </button>
        </>
      )}

      {!isPresentationMode ? (;

code = code.replace(targetEndBlock, replacementEndBlock);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Script completed.');
