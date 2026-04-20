const fs = require('node:fs');
const path = require('node:path');

const routesDir = path.join(__dirname, 'apps', 'api', 'src', 'routes');
const files = fs.readdirSync(routesDir);

for (const file of files) {
  if (!file.endsWith('.ts')) continue;
  if (file === 'health.ts') continue;
  
  const fp = path.join(routesDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const base = file.replace('.ts', '');
  
  const regex1 = new RegExp(`(app\\.(get|post|patch|put|delete))\\("\\/${base}"`, 'g');
  const regex2 = new RegExp(`(app\\.(get|post|patch|put|delete))\\("\\/${base}\\/`, 'g');
  
  content = content.replace(regex1, '$1("/"');
  content = content.replace(regex2, '$1("/');
  
  fs.writeFileSync(fp, content);
}
console.log("Routes fixed");
