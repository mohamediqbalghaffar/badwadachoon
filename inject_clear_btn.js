const fs = require('fs');

function patchFile(filePath, useDataStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add filters, setFilters to useData if missing
  if (content.includes(useDataStr) && !content.includes('filters, setFilters') && !content.includes('filters,')) {
    const replacement = useDataStr.replace('}', ', filters, setFilters }');
    content = content.replace(useDataStr, replacement);
  } else if (!content.includes('filters') && content.includes(useDataStr)) {
     content = content.replace(useDataStr, useDataStr.replace('}', ', filters, setFilters }'));
  }

  // Define the exact HTML to replace
  const targetHTML = `<div className="relative w-full sm:w-72">
          <input
            type="text"`;
            
  const targetHTMLFallback = `<div className="relative w-full sm:w-72">\r\n          <input\r\n            type="text"`;

  const btnHTML = `<div className="flex items-center gap-4 w-full sm:w-auto">
          {(filters?.departments?.length > 0 || filters?.letterType?.length > 0 || filters?.slaStatus?.length > 0) && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, departments: [], letterType: [], slaStatus: [] }))}
              className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
              title="سڕینەوەی فلتەرەکان"
            >
              <X size={14} />
              سڕینەوەی فلتەر
            </button>
          )}
          <div className="relative w-full sm:w-72">
          <input
            type="text"`;

  // We need to inject the wrapper start, but we also need to close it.
  // The structure ends with:
  // <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
  // </div>
  
  if (content.includes(targetHTML) && !content.includes('سڕینەوەی فلتەرەکان')) {
    content = content.replace(targetHTML, btnHTML);
    // Now close the wrapper
    content = content.replace(
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>',
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\n        </div>\n        </div>'
    );
    content = content.replace(
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\r\n        </div>',
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\r\n        </div>\r\n        </div>'
    );
  } else if (content.includes(targetHTMLFallback) && !content.includes('سڕینەوەی فلتەرەکان')) {
    content = content.replace(targetHTMLFallback, btnHTML);
    content = content.replace(
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\r\n        </div>',
      '<Search className="absolute left-3 top-2.5 text-slate-400" size={16} />\r\n        </div>\r\n        </div>'
    );
  }

  // Add X import if missing
  if (!content.includes('X } from "lucide-react"')) {
    content = content.replace('} from "lucide-react"', ', X } from "lucide-react"');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully patched", filePath);
  } else {
    console.log("No changes made to", filePath);
  }
}

patchFile(
  'd:/badwadachoon/src/components/IncomingView.tsx',
  'const { filteredIncomingData, setSentData, incomingData } = useData();'
);
patchFile(
  'd:/badwadachoon/src/components/SentDashboard.tsx',
  'const { filteredSentData, setSentData, sentData } = useData();'
);
patchFile(
  'd:/badwadachoon/src/components/DataTable.tsx',
  'const { filteredData, setData, data } = useData();'
);
