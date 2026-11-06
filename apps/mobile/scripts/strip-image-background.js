/**
 * postinstall workaround for NativeWind v4 + ImageBackground.
 *
 * NativeWind's `react-native-css-interop` runtime maps className/style props onto
 * ImageBackground via `remapProps`. In this app that remapping renders ImageBackground
 * backgrounds incorrectly, so we strip that single remapProps call from the compiled
 * runtime file after install.
 *
 * This is a version-fragile patch: it edits a file inside node_modules by matching a
 * specific source layout. It targets `react-native-css-interop` as shipped by
 * `nativewind@^4.2.1`. When upgrading NativeWind / css-interop:
 *   1. Re-check that ImageBackground still renders incorrectly without this patch.
 *   2. If it does, verify the regex below still matches the new source layout.
 *   3. If NativeWind fixes the mapping upstream, remove this script and the
 *      `postinstall` entry in package.json.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '../node_modules/react-native-css-interop/dist/runtime/components.js',
);

if (!fs.existsSync(file)) process.exit(0);

const source = fs.readFileSync(file, 'utf8');
const next = source.replace(
  /\(0, api_1\.remapProps\)\(react_native_1\.ImageBackground, \{\s*className: "style",\s*imageClassName: "imageStyle",\s*\}\);\r?\n/,
  '',
);

if (next !== source) fs.writeFileSync(file, next);
