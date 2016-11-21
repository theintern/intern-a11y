define([ 'intern' ], function (intern) {
	var isNode = typeof process !== 'undefined';

	return {
		environments: [ { browserName: 'chrome', fixSessionCapabilities: false } ],

		tunnel: 'SeleniumTunnel',

		loaderOptions: {
			packages: [ { name: 'app', location: '.' } ]
		},

		suites: isNode ? [ 'app/tests/tenon' ] : [],

		functionalSuites: [ 'app/tests/axe' ],

		excludeInstrumentation: /^(?:tests|node_modules)\//,

		filterErrorStack: true,

		reporters: [
			{
				id: 'dojo/node!intern-a11y/src/A11yReporter',
				filename: 'a11y-report.html'
			},
			intern.mode === 'client' ? 'Console' : 'Runner'
		]
	};
});
