import { check, createChecker } from '@theintern/a11y/services/axe';
import { join } from 'path';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

registerSuite('aXe', {
	'external page'() {
		return this.remote
			.get('http://google.com')
			.sleep(2000)
			.then(createChecker());
	},

	'file name'() {
		return check({
			remote: this.remote,
			source: join(__dirname, 'data', 'page.html')
		});
	},

	'bad page'() {
		return check({
			remote: this.remote,
			source: join(__dirname, 'data', 'bad_page.html')
		});
	}
});
