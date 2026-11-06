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
