var args = process.argv.slice(2);
var spawn = require('child_process').spawnSync
var mode = 'node';

function run(runner, config, userArgs) {
	spawn('node', [
		'node_modules/intern/' + runner,
		'config=tests/' + config + '.js'
	].concat(userArgs), { stdio: 'inherit' });
}

var modes = {
	all: function () {
		run('client', 'intern', args);
		run('runner', 'intern', args);
	},
	node: function () {
		run('client', 'intern', args);
	},
	webdriver: function () {
		run('runner', 'intern', args);
	}
}

if (args[0] in modes) {
	mode = args[0];
	args = args.slice(1);
}

modes[mode]();
