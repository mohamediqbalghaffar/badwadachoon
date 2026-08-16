const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('useAnimation')) {
  code = code.replace(
    'import { motion } from "framer-motion";',
    'import { motion, useAnimation } from "framer-motion";'
  );
}

if (!code.includes('const filterControls = useAnimation()')) {
  code = code.replace(
    'export const Dashboard = () => {',
    'export const Dashboard = () => {\n  const filterControls = useAnimation();'
  );
}

code = code.replace(
  /dragConstraints=\{false\}\n\s*dragMomentum=\{false\}\n\s*onDragStart=\{\(\) => setIsDraggingFilter\(true\)\}\n\s*onDragEnd=\{\(\) => \{\n\s*setTimeout\(\(\) => setIsDraggingFilter\(false\), 150\);\n\s*\}\}/,
  `dragElastic={0}\n            dragMomentum={false}\n            animate={filterControls}\n            onDragStart={() => setIsDraggingFilter(true)}\n            onDragEnd={(e, info) => {\n              setTimeout(() => setIsDraggingFilter(false), 150);\n              const windowWidth = window.innerWidth;\n              const buttonRect = e.target.closest('button')?.getBoundingClientRect();\n              const btnWidth = buttonRect?.width || 64;\n              if (info.point.x < windowWidth / 2) {\n                filterControls.start({ x: -(windowWidth - btnWidth - 32) });\n              } else {\n                filterControls.start({ x: 0 });\n              }\n            }}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Fixed drag controls in Dashboard.tsx');
