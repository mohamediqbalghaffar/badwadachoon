const fs = require('fs');
let code = fs.readFileSync('src/components/OmniFilter.tsx', 'utf8');

// 1. Update the container classes
code = code.replace(
  'absolute top-[105%] right-0 left-0 z-50',
  'absolute top-[105%] right-0 min-w-full w-max z-50'
);

// 2. Update the option text classes
code = code.replace(
  '<span className="truncate pl-2 select-none">{opt}</span>',
  '<span className="pl-2 select-none whitespace-nowrap">{opt}</span>'
);

fs.writeFileSync('src/components/OmniFilter.tsx', code);
console.log('Fixed OmniFilter.tsx');
