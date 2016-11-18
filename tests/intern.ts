// Import intern here to load the ambient declarations
// tslint:disable
import * as intern from 'intern';
// tslint:enable

export const capabilities = { name: 'intern-a11y' };

const isNode = typeof process !== 'undefined';

export const environments = [
	{ browserName: 'chrome', fixSessionCapabilities: false }
];

export const tunnel = 'SeleniumTunnel';

export const loaders = {
	'host-browser': 'node_modules/dojo/loader.js',
	'host-node': 'dojo/loader'
};

export const loaderOptions = {
	packages: [
		{ name: 'src', location: 'dist/src' },
		{ name: 'tests', location: 'dist/tests' }
	]
};

// Only load the unit test suites if we're in a Node environment
export const suites = isNode ? [ 'tests/unit/**', 'tests/integration/tenon' ] : [];

export const functionalSuites = [ 'tests/integration/axe' ];

export const excludeInstrumentation = /(?:node_modules|bower_components|tests)[\/]/;

export const filterErrorStack = true;
