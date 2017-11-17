const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const { join } = require('path');
const axe = require('@theintern/a11y/services/axe');

registerSuite('aXe', {
	'external page'() {
		// This test is expected to fail
		return this.remote
			.get('http://google.com')
			.sleep(2000)
			.then(axe.createChecker());
	},

	'file name'() {
		return axe.check({
			remote: this.remote,
			source: join(__dirname, 'data/page.html')
		});
	},

	'bad page'() {
		// This test is expected to fail
		return axe.check({
			remote: this.remote,
			source: join(__dirname, 'data/bad_page.html')
		});
	}
});
