var execSync = require('child_process').execSync;
execSync('git clean -d -x -f -e "intern-local.ts" -e "node_modules/"');
