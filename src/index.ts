import * as axe from './services/axe';
import * as tenon from './services/tenon';

import A11yReporter = require('./A11yReporter');

export const services = {
	axe,
	tenon
};

export { A11yReporter };

export * from './common';
