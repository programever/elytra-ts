// Post-processes the build output.
//
// 1. Marks each output tree with its module system, so Node resolves dist/esm
//    as ESM and dist/cjs as CommonJS regardless of the root "type".
// 2. Adds the `.js` extension to relative specifiers in the ESM output. Node's
//    ESM loader requires fully-specified paths, but we keep the *source*
//    extensionless; tsc does not rewrite specifiers, so we do it here. Only
//    dist/esm needs this — CommonJS resolution is happy without extensions.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RELATIVE_SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]*?)\2/g;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

function addJsExtensions(dir) {
  let rewritten = 0;
  for (const file of walk(dir)) {
    if (!/\.(js|d\.ts)$/.test(file)) continue;
    const before = readFileSync(file, 'utf8');
    const after = before.replace(RELATIVE_SPECIFIER, (match, prefix, quote, spec) =>
      /\.[cm]?js$/.test(spec) ? match : `${prefix}${quote}${spec}.js${quote}`
    );
    if (after !== before) {
      writeFileSync(file, after);
      rewritten += 1;
    }
  }
  return rewritten;
}

writeFileSync(join('dist', 'cjs', 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
writeFileSync(join('dist', 'esm', 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n');

const count = addJsExtensions(join('dist', 'esm'));
console.info(`postbuild: added .js extensions in ${count} ESM file(s)`);
