import { ExactPackage, LatestPackageTarget, PackageConfig } from "../install/package.js";
import { SemverRange } from 'sver';
import { resolveLatestTarget as resolveLatestTargetJspm, pkgToUrl as pkgToUrlJspm } from './jspm.js';
import { Install } from "../generator.js";

export const nodeBuiltinSet = new Set<string>([
  '_http_agent',         '_http_client',        '_http_common',
  '_http_incoming',      '_http_outgoing',      '_http_server',
  '_stream_duplex',      '_stream_passthrough', '_stream_readable',
  '_stream_transform',   '_stream_wrap',        '_stream_writable',
  '_tls_common',         '_tls_wrap',           'assert',
  'assert/strict',       'async_hooks',         'buffer',
  'child_process',       'cluster',             'console',
  'constants',           'crypto',              'dgram',
  'diagnostics_channel', 'dns',                 'dns/promises',
  'domain',              'events',              'fs',
  'fs/promises',         'http',                'http2',
  'https',               'inspector',           'module',
  'net',                 'os',                  'path',
  'path/posix',          'path/win32',          'perf_hooks',
  'process',             'punycode',            'querystring',
  'readline',            'repl',                'stream',
  'stream/promises',     'string_decoder',      'sys',
  'timers',              'timers/promises',     'tls',
  'trace_events',        'tty',                 'url',
  'util',                'util/types',          'v8',
  'vm',                  'wasi',                'worker_threads',
  'zlib'
]);

export function pkgToUrl (pkg: ExactPackage, layer: string): `${string}/` {
  if (pkg.registry !== 'node')
    return pkgToUrlJspm(pkg, layer);
  return `node:${pkg.name}/`;
}

export function resolveBuiltin (specifier: string, env: string[]): string | Install | undefined {
  const builtin = specifier.startsWith('node:') ? specifier.slice(5) : nodeBuiltinSet.has(specifier) ? specifier : null;
  if (!builtin)
    return;

  if (env.includes('deno'))
    return {
      target: {
        pkgTarget: { registry: 'deno', name: 'std', ranges: [new SemverRange('*')], unstable: true },
        installSubpath: `./node/${builtin}`
      },
      alias: builtin
    };
  
  if (env.includes('node'))
    return `node:${builtin}`;

  return {
    target: {
      pkgTarget: { registry: 'npm', name: '@jspm/core', ranges: [new SemverRange('*')], unstable: true },
      installSubpath: `./nodelibs/${builtin}`
    },
    alias: builtin
  };
}

// Special "." export means a file package (not a folder package)
export async function getPackageConfig (): Promise<PackageConfig> {
  return {
    exports: {
      ".": "."
    }
  };
}

export async function resolveLatestTarget (target: LatestPackageTarget, layer: string, parentUrl: string): Promise<ExactPackage | null> {
  if (target.registry !== 'npm' || target.name !== '@jspm/core')
    return null;
  return resolveLatestTargetJspm.call(this, {
    registry: 'npm',
    name: '@jspm/core',
    range: new SemverRange('*'),
    unstable: true
  }, layer, parentUrl);
}

// export function parsePkg (pkg: string): { pkg: ExactPackage, subpath: null | `.${string}` } {

// }

export function parseUrlPkg (url: string): ExactPackage | undefined {
  if (!url.startsWith('node:'))
    return;
  let name = url.slice(5);
  if (name.endsWith('/'))
    name = name.slice(0, -1);
  return { registry: 'node', name, version: '' };
}
