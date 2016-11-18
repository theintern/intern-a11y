var shell = require('shelljs');

if (process.argv[2] === 'all') {
	shell.exec('git clean -d -x -f -e "intern-local.ts"')
}
else {
	shell.rm('-rf', 'dist');
	shell.rm('-f', 'tenon*.json');
	shell.rm('-f', 'tenon*.html');
	shell.rm('-f', 'axe*.json');
	shell.rm('-f', 'axe*.html');
	shell.rm('-f', 'intern-a11y*.tgz');
}
