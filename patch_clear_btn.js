const fs = require('fs');

function patchFile(filePath, useDataMatch, searchBoxTarget) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add filters, setFilters to useData if missing
  const useDataRegex = new RegExp(useDataMatch.replace(/[.*+?^$\{()|[\]\\]/g, '\\$&'));
  if (useDataRegex.test(content) && !content.includes('filters, setFilters') && !content.includes('filters,') && !content.includes(', filters')) {
    const replacement = useDataMatch.replace('}', ', filters, setFilters }');
    content = content.replace(useDataMatch, replacement);
  } else if (!content.includes('filters') && useDataRegex.test(content)) {
     // fallback
     content = content.replace(useDataMatch, useDataMatch.replace('}', ', filters, setFilters }'));
  }

  const btnCode = `        <div className="flex items-center gap-4 w-full sm:w-auto">
          {(filters?.departments?.length > 0 || filters?.letterType?.length > 0 || filters?.slaStatus?.length > 0) && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, departments: [], letterType: [], slaStatus: [] }))}
              className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
              title="سڕینەوەی فلتەرەکان"
            >
              <X size={14} />
              سڕینەوەی فلتەر
            </button>
          )}`;

  if (content.includes(searchBoxTarget) && !content.includes('سڕینەوەی فلتەرەکان')) {
    // We want to replace the exact searchBoxTarget with the wrapper start + button + searchBoxTarget, 
    // and then we must find the closing `</div>` of the search container and add another `</div>` to close the wrapper.
    
    // Instead of doing complex regex, let's just use string replace.
    // The structure is:
    // <div className="relative w-full sm:w-72">
    //   <input ... />
    //   <Search ... />
    // </div>
    // So we replace the start `searchBoxTarget` with `btnCode + '\n' + searchBoxTarget`.
    // Then we replace the closing `</div>` of the header section.
    // Actually, it's easier to just do:
    content = content.replace(searchBoxTarget, btnCode + '\n' + searchBoxTarget);
    
    // Add the closing </div> for the wrapper. 
    // We know the searchBoxTarget is `        <div className="relative w-full sm:w-72">`.
    // We need to add `</div>` after its closing `</div>`.
    // Let's replace the block containing the search icon and the closing div:
    // `          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>`
    content = content.replace(
      '          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>',
      '          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>\n        </div>'
    );
    
    // Fallback for DataTable.tsx if it has different formatting:
    if (!content.includes('        </div>\n        </div>')) {
      content = content.replace(
        '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>',
        '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>\n        </div>'
      );
    }
    
    // Add X import if missing
    if (!content.includes('X } from "lucide-react"')) {
      content = content.replace('} from "lucide-react"', ', X } from "lucide-react"');
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Patched", filePath);
  }
}

// IncomingView.tsx
patchFile(
  'd:/badwadachoon/src/components/IncomingView.tsx',
  'const { filteredIncomingData, setSentData, incomingData } = useData();',
  '        <div className="relative w-full sm:w-72">'
);

// SentDashboard.tsx
patchFile(
  'd:/badwadachoon/src/components/SentDashboard.tsx',
  'const { filteredSentData, setSentData, sentData } = useData();',
  '        <div className="relative w-full sm:w-72">'
);

// DataTable.tsx
patchFile(
  'd:/badwadachoon/src/components/DataTable.tsx',
  'const { filteredData, setData, data } = useData();',
  '        <div className="relative w-full sm:w-72">'
);
