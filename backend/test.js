const path = require('path');
const fs = require('fs');
console.log(fs.readdirSync(path.join(__dirname)));

const dirPath = /snapshot/.test(__dirname) ? process.cwd(): process.cwd();
const BUILD_PATH = path.join(dirPath, '/build');
console.log(BUILD_PATH);
console.log(fs.readdirSync(BUILD_PATH));
