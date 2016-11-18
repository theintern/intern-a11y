var shell = require('shelljs');
var exec = require('child_process').execSync;
var path = require('path');
var glob = require('glob');
var buildDir = 'dist';

exec('node ./node_modules/.bin/tsc', { stdio: 'inherit' });

[ 'README.md', 'LICENSE', 'package.json' ].forEach(function (filename) {
	shell.cp(filename, buildDir);
});

if (process.argv[2] === 'dist') {
	shell.rm('-rf', path.join(buildDir, 'tests'));
}
else {
	glob.sync('tests/**/*.{html,json}').forEach(function (resource) {
		var dst = path.join(buildDir, resource);
		var dstDir = path.dirname(dst);
		if (!shell.test('-d', dstDir)) {
			shell.mkdir(dstDir);
		}
		shell.cp(resource, dst);
	});
}
