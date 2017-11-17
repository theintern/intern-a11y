const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');
const { join } = require('path');
const tenon = require('@theintern/a11y/services/tenon');
const keyPresent = process.env['TENON_API_KEY'] != null;

registerSuite('tenon', {
	'external url'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return tenon.check({ source: 'http://tenon.io/documentation' });
	},

	'file name'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return tenon.check({ source: join(__dirname, 'data/page.html') });
	},

	'bad page'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return tenon.check({ source: join(__dirname, 'data/bad_page.html') });
	}
});
