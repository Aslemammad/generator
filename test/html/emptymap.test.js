import { Generator } from '@jspm/generator';
import assert from 'assert';
import { SemverRange } from 'sver';

const generator = new Generator({
  rootUrl: new URL('./local', import.meta.url),
  env: ['production', 'browser']
});

const esmsPkg = await generator.traceMap.resolver.resolveLatestTarget({ name: 'es-module-shims', registry: 'npm', ranges: [new SemverRange('*')] }, false, generator.traceMap.installer.defaultProvider);
const esmsUrl = generator.traceMap.resolver.pkgToUrl(esmsPkg, generator.traceMap.installer.defaultProvider) + 'dist/es-module-shims.js';

assert.strictEqual(await generator.htmlGenerate(`<!DOCTYPE html>

<script type="importmap"></script>
`, { preload: true }), '<!DOCTYPE html>\n' +
'\n' +
'<!-- Generated by @jspm/generator - https://github.com/jspm/generator -->\n' +
`<script async src="${esmsUrl}" crossorigin="anonymous"></script>\n` +
'<script type="importmap">\n' +
'{}\n' +
'</script>\n');
