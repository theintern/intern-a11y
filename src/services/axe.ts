import * as fs from 'fs';
import * as Command from 'leadfoot/Command';
import { A11yResults, A11yError } from '../common';
import { AxeResults, toA11yResults } from './_axe';

export interface AxeTestOptions {
	config?: {
		branding?: {
			brand?: string,
			application?: string
		},
		reporter?: 'v1' | 'v2',
		checks?: {
			id: string,
			evaluate: Function,
			after?: Function,
			options?: Object,
			matches?: string,
			enabled?: boolean
		}[],
		rules?: {
			id: string,
			selector?: string,
			excludeHidden?: boolean,
			enabled?: boolean,
			pageLevel?: boolean,
			any?: string[],
			all?: string[],
			none?: string[],
			tags?: string[],
			matches?: string
		}[]
	};

	/**
	 * The scope to be analyzed (i.e., a selector for a portion of a
	 * document); defaults to the entire document
	 */
	context?: string;
}

export interface AxeRunTestOptions extends AxeTestOptions {
	/** LeadFoot Command object */
	remote: Command<any>;

	/** URL to load for testing */
	source: string;

	/** Number of milliseconds to wait before starting test */
	waitFor?: number;
}

export function createChecker(options?: AxeTestOptions) {
	return function (this: Command<any>) {
		options = options || {};
		const axePath = require.resolve('axe-core/axe.min');
		const axeScript = fs.readFileSync(axePath, { encoding: 'utf8' });
		const axeContext = options.context;

		const config = options.config;
		let axeConfig: AxeConfig = null;

		if (config) {
			axeConfig = {
				branding: config.branding,
				reporter: config.reporter,
				rules: config.rules
			};
			if (config.checks) {
				axeConfig.checks = config.checks.map(function (check) {
					return {
						id: check.id,
						evaluate: check.evaluate.toString(),
						after: check.after ? check.after.toString() : undefined,
						options: check.options,
						matches: check.matches,
						enabled: check.enabled
					};
				});
			}
		}

		return this.parent
			.getExecuteAsyncTimeout()
			.then(function (this: Command<any>, timeout: number) {
				return this.parent
					.setExecuteAsyncTimeout(30000)
					.execute(axeScript, [])
					.executeAsync(`return (function (config, context, done) {
						if (config) {
							if (config.checks) {
								config.checks.forEach(function (check) {
									eval('check.evaluate = ' + check.evaluate);
									if (check.after) {
										eval('check.after = ' + check.after);
									}
								});
							}
							axe.configure(config);
						}
						if (!context) {
							context = document;
						}
						axe.a11yCheck(context, function(results) {
							done(results);
						});
					}).apply(this, arguments)`, [ axeConfig, axeContext ])
					.then(function (results: AxeResults) {
						const a11yResults = toA11yResults(results);

						const numViolations = (results.violations && results.violations.length) || 0;
						let error: A11yError;
						if (numViolations === 1) {
							error = new A11yError('1 a11y violation was logged', a11yResults);
						}
						if (numViolations > 1) {
							error = new A11yError(numViolations + ' a11y violations were logged', a11yResults);
						}

						if (error) {
							throw error;
						}

						return a11yResults;
					})
					.then(
						function (this: Command<void>, results: A11yResults) {
							return this.parent
								.setExecuteAsyncTimeout(timeout)
								.then(function () {
									return results;
								});
						},
						function (this: Command<void>, error: Error) {
							return this.parent
								.setExecuteAsyncTimeout(timeout)
								.then(function () {
									throw error;
								});
						}
					);
			});
	};
}

export function check(options?: AxeRunTestOptions) {
	if (options.remote == null) {
		return Promise.reject(new Error('A remote is required when calling check()'));
	}

	let chain = options.remote.get(options.source);

	if (options.waitFor) {
		chain = chain.sleep(options.waitFor);
	}

	return chain.then(createChecker(options));
}

interface AxeConfig {
	branding?: {
		brand?: string,
		application?: string
	};
	reporter?: 'v1' | 'v2';
	checks?: {
		id: string,
		evaluate: string,
		after?: string,
		options?: Object,
		matches?: string,
		enabled?: boolean
	}[];
	rules?: {
		id: string,
		selector?: string,
		excludeHidden?: boolean,
		enabled?: boolean,
		pageLevel?: boolean,
		any?: string[],
		all?: string[],
		none?: string[],
		tags?: string[],
		matches?: string
	}[];
}
