const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Add Sun, Moon to lucide-react
code = code.replace(
  /import \{ MonitorPlay, X, Inbox, Send, GitCompareArrows, ArrowDownToLine, LogOut, User, ShieldCheck, Settings, Database, UploadCloud, Edit3, Filter \} from "lucide-react";/,
  'import { MonitorPlay, X, Inbox, Send, GitCompareArrows, ArrowDownToLine, LogOut, User, ShieldCheck, Settings, Database, UploadCloud, Edit3, Filter, Sun, Moon } from "lucide-react";'
);

// 2. Add useTheme import
code = code.replace(
  /import \{ parseFile \} from "\.\.\/utils\/parser";/,
  'import { parseFile } from "../utils/parser";\nimport { useTheme } from "next-themes";'
);

// 3. Add useTheme hook
code = code.replace(
  /export const Dashboard = \(\) => \{/,
  'export const Dashboard = () => {\n  const { theme, setTheme } = useTheme();'
);

// 4. Inject the button (Wrap the block in fragment)
code = code.replace(
  /\{isPresentationMode && \(\s*<button/,
  \{isPresentationMode && (
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
          <button\
);

// 5. Close the fragment
code = code.replace(
  /          <\/button>\s*\)\}/,
  '          </button>\n        </>\n      )}'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Done replacement');
