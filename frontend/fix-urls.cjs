const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/**/*.{js,jsx}');
files.forEach(file => {
  const fullPath = path.resolve(file);
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  if (content.includes("baseURL: '/api'")) {
    content = content.replace(/baseURL: '\/api'/g, "baseURL: import.meta.env.VITE_API_URL || '/api'");
    changed = true;
  }

  // Find occurrences of '/api/...' strings and replace them with `${import.meta.env.VITE_API_URL || '/api'}/...`
  const regex = /(['"\`])\/api\/(.*?)\1/g;
  if (regex.test(content) && !file.includes('services/api.js')) {
    content = content.replace(regex, "`${import.meta.env.VITE_API_URL || '/api'}/$2`");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', file);
  }
});
