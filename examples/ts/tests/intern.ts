import * as intern from 'intern';

export const capabilities = {};

export const environments = [ { browserName: 'chrome', fixSessionCapabilities: false } ];

export const maxConcurrency = 1;

export const tunnel = 'SeleniumTunnel';

export const loaderOptions = {
	packages: [ { name: 'app', location: '.' } ]
};

export const suites = [ 'app/tests/nodeSuite!tenon' ];

export const functionalSuites = [ 'app/tests/nodeSuite!axe' ];

export const excludeInstrumentation = /^(?:tests|node_modules)\//;

export const cleanupErrorStack = true;

export const reporters = [
	{
		id: 'dojo/node!intern-a11y/src/A11yReporter',
		filename: 'a11y-report.html'
	},
	intern.mode === 'client' ? 'Console' : 'Runner'
]
