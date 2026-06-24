const fs = require('fs');
const path = require('path');

const dir = 'd:/badwadachoon/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let totalReplaced = 0;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace department setFilters
  content = content.replace(
    /setFilters\(\s*\(?prev\)?\s*=>\s*\(\{\s*\.\.\.prev,\s*departments:\s*\[data\.name\s*as\s*string\]\s*\}\)\s*\);/g,
    `setFilters((prev) => {
                      const isSelected = prev.departments?.includes(data.name as string);
                      return { ...prev, departments: isSelected ? [] : [data.name as string] };
                    });`
  );

  // Replace letterType setFilters
  content = content.replace(
    /setFilters\(\s*\(?prev\)?\s*=>\s*\(\{\s*\.\.\.prev,\s*letterType:\s*\[data\.name\s*as\s*string\]\s*\}\)\s*\);/g,
    `setFilters((prev) => {
                      const isSelected = prev.letterType?.includes(data.name as string);
                      return { ...prev, letterType: isSelected ? [] : [data.name as string] };
                    });`
  );
  
  // Charts.tsx has `setFilters(prev => ({ ...prev, departments: [data.name as string] }));` without parens around prev
  content = content.replace(
    /setFilters\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*departments:\s*\[data\.name\s*as\s*string\]\s*\}\)\s*\);/g,
    `setFilters((prev) => {
                      const isSelected = prev.departments?.includes(data.name as string);
                      return { ...prev, departments: isSelected ? [] : [data.name as string] };
                    });`
  );
  
  content = content.replace(
    /setFilters\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*letterType:\s*\[data\.name\s*as\s*string\]\s*\}\)\s*\);/g,
    `setFilters((prev) => {
                      const isSelected = prev.letterType?.includes(data.name as string);
                      return { ...prev, letterType: isSelected ? [] : [data.name as string] };
                    });`
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
    totalReplaced++;
  }
}

console.log(`Total files updated: ${totalReplaced}`);
