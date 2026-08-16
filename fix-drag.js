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
  /drag\\s+dragConstraints=\{false\}\\s+dragMomentum=\{false\}\\s+onDragStart=\{\(\) => setIsDraggingFilter\(true\)\}\\s+onDragEnd=\{\(\) => \{\\s+setTimeout\(\(\) => setIsDraggingFilter\(false\), 150\);\\s+\}\}/,
  \drag
            dragElastic={0}
            dragMomentum={false}
            animate={filterControls}
            onDragStart={() => setIsDraggingFilter(true)}
            onDragEnd={(e, info) => {
              setTimeout(() => setIsDraggingFilter(false), 150);
              const windowWidth = window.innerWidth;
              const buttonRect = e.target.closest('button')?.getBoundingClientRect();
              const btnWidth = buttonRect?.width || 64;
              
              if (info.point.x < windowWidth / 2) {
                filterControls.start({ x: -(windowWidth - btnWidth - 32) });
              } else {
                filterControls.start({ x: 0 });
              }
            }}\
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Fixed drag controls in Dashboard.tsx');
