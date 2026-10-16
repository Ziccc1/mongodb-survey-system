// Maintenance helper: resolve direct versions from the existing reviewed lockfile.
import { readFileSync, writeFileSync } from 'node:fs';
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
for (const filename of ['package.json', 'apps/api/package.json', 'apps/web/package.json', 'packages/shared/package.json']) {
  const manifest = JSON.parse(readFileSync(filename, 'utf8'));
  for (const group of ['dependencies', 'devDependencies']) {
    for (const name of Object.keys(manifest[group] ?? {})) {
      if (name.startsWith('@survey/')) continue;
      const installed = lock.packages[`node_modules/${name}`];
      if (!installed?.version) throw new Error(`Missing locked package ${name}`);
      manifest[group][name] = installed.version;
    }
  }
  writeFileSync(filename, JSON.stringify(manifest, null, 2) + '\n');
}
console.log('Pinned direct dependency versions from package-lock.json');
