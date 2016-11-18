define([
	'require',
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/node!intern-a11y'
], function (
	require,
	registerSuite,
	assert,
	a11y
) {
	var tenon = a11y.services.tenon;

	registerSuite({
		name: 'tenon',

		'external url': function () {
			return tenon.check({ source: 'http://google.com' })
				.catch(function (error) {
					// we expect this to fail
					assert.match(error.message, /a11y violation/);
				});
		},

		'file name': function () {
			return tenon.check({ source: require.toUrl('./data/page.html') });
		}
	});
});
