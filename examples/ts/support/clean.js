var shell = require('shelljs');

if (process.argv[2] === 'all') {
	shell.exec('git clean -d -x -f -e "intern-local.ts"')
}
else {
	shell.rm('-f', 'tests/*.js');
	shell.rm('-f', 'a11y-report.html');
}
