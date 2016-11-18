// This module must be loaded by an AMD loader

import * as registerSuite from 'intern!object';
import { TestModule } from './interfaces';
import { IRequire } from 'dojo/loader';

declare const require: IRequire;

export function load(id: string, pluginRequire: IRequire, callback: Function) {
	if (typeof process !== 'undefined') {
		pluginRequire([ 'dojo/node!' + require.toUrl('./' + id) ], function (module: TestModule) {
			module.init(registerSuite);
			callback(module);
		});
	}
	else {
		callback();
	}
};
