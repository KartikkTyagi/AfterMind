const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath, query);
      }
    } else {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`Found "${query}" in:`, fullPath);
      }
    }
  }
}

console.log("Searching for postgresql connection strings...");
searchDir(path.join(__dirname, '..'), 'postgresql:');
searchDir(path.join(__dirname, '..'), 'postgres:');

console.log("Searching for database passwords...");
searchDir(path.join(__dirname, '..'), 'db_password');
searchDir(path.join(__dirname, '..'), 'db-password');
