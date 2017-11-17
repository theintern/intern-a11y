import { check } from '@theintern/a11y/services/tenon';
import { join } from 'path';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

const keyPresent = process.env['TENON_API_KEY'] != null;

registerSuite('tenon', {
	'external url'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return check({ source: 'http://tenon.io/documentation' });
	},

	'file name'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return check({ source: join(__dirname, 'data', 'page.html') });
	},

	'bad page'() {
		if (!keyPresent) {
			this.skip('missing Tenon API key');
		}
		return check({ source: join(__dirname, 'data', 'bad_page.html') });
	}
});
