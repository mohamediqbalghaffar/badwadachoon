const { execSync } = require('child_process');
const fs = require('fs');

const commit = 'bf9180e';

try {
  const pv = execSync('git show ' + commit + ':src/components/PresentationView.tsx', { encoding: 'utf8' });
  fs.writeFileSync('temp_pv.tsx', pv);
  console.log('Saved PresentationView from bf9180e');
} catch(e) {
  console.log(e.message);
}
