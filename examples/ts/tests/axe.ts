import { services } from 'intern-a11y';
import Test = require('intern/lib/Test');
import { join } from 'path';
import { assert } from 'chai';
import { TestModuleInit } from './interfaces';
import { IRequire } from 'dojo/loader';

const axe = services.axe;

declare const require: IRequire;

export const init: TestModuleInit = function (registerSuite) {
	registerSuite({
		name: 'aXe',

		'external page'(this: Test) {
			return this.remote
				.get('http://google.com')
				.sleep(2000)
				.then(axe.createChecker())
				.catch(function (error) {
					assert.match(error.message, /a11y violation/);
				});
		},

		'file name'(this: Test) {
			return axe.check({
				remote: this.remote,
				source: join(__dirname, 'data', 'page.html')
			});
		}
	});
}
