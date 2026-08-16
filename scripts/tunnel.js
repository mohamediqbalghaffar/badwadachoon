const { spawn, exec } = require('child_process');
const fs = require('fs');

const cloudflaredPath = 'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe';

if (!fs.existsSync(cloudflaredPath)) {
  console.error('[!] Cloudflare executable not found at:', cloudflaredPath);
  process.exit(1);
}

console.log('Starting Cloudflare Tunnel to http://localhost:3000 ...\n');

const tunnel = spawn(cloudflaredPath, ['tunnel', '--url', 'http://localhost:3000']);

let foundUrl = false;

function processOutput(data) {
  const text = data.toString();
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !foundUrl) {
    foundUrl = true;
    const url = match[0];
    console.log('\n=============================================================');
    console.log('  🎉 YOUR BADWADACHOON ONLINE SERVER IS READY!');
    console.log('  🌐 ONLINE URL: ' + url);
    console.log('  (Share this link with anyone to access your system)');
    console.log('=============================================================\n');
    
    // Copy to clipboard
    try {
      exec(`echo ${url}| clip`);
      console.log('  📋 Link copied to your clipboard!');
    } catch (e) {}

    // Open automatically in browser
    try {
      exec(`start ${url}`);
    } catch (e) {}
  }
  process.stdout.write(text);
}

tunnel.stdout.on('data', processOutput);
tunnel.stderr.on('data', processOutput);

tunnel.on('close', (code) => {
  console.log(`Cloudflare tunnel exited with code ${code}`);
});
