import * as https from 'https';
import * as querystring from 'querystring';
import * as fs from 'fs';
import { A11yError, A11yResults } from '../common';
import { TenonResults, toA11yResults, fileExists } from './_tenon';

export interface TenonConfig {
	certainty?: 0 | 20 | 40 | 60 | 80 | 100;
	projectID?: string;
	docID?: string;
	priority?: 0 | 20 | 40 | 60 | 80 | 100;
	level?: 'A' | 'AA' | 'AAA';
	fragment?: 0 | 1;
	store?: 0 | 1;
	uaString?: string;
	viewPortHeight?: number;
	viewPortWidth?: number;
}

export interface TenonTestOptions {
	/** An external URL, file name, or a data string */
	source: string;

	/** tenon.io API key */
	apiKey?: string;

	/** Number of milliseconds to wait before starting test */
	waitFor?: number;

	/** Tenon configuration options */
	config?: TenonConfig;
}

export function check(options: TenonTestOptions) {
	return new Promise(function (resolve, reject) {
		let apiKey = process.env['TENON_API_KEY'];
		if (!apiKey && options.apiKey) {
			apiKey = options.apiKey;
		}
		if (!apiKey) {
			throw new Error('tenon requires an API key');
		}

		let queryData: TenonQuery = {
			key: apiKey
		};

		// Copy user config into queryData
		for (let key in options.config) {
			(<any> queryData)[key] = (<any> options.config)[key];
		}

		const source = options.source;

		if (/^https?:\/\/\S+$/.test(source)) {
			// source is a URL
			queryData.url = source;
		}
		else if (fileExists(source)) {
			// source is a file name
			queryData.src = fs.readFileSync(source, { encoding: 'utf8' });
		}
		else {
			// source is raw data
			queryData.src = source;
		}

		const data = querystring.stringify(queryData);

		const request = https.request({
			host: 'tenon.io',
			path: '/api/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': Buffer.byteLength(data)
			}
		}, function (response) {
			let responseData: string[] = [];
			response.setEncoding('utf8');
			response.on('data', function (chunk: string) {
				responseData.push(chunk);
			});
			response.on('end', function () {
				if (response.statusCode !== 200) {
					reject(new Error((<any> response).statusMessage));
				}
				else {
					resolve(JSON.parse(responseData.join('')));
				}
			});
			response.on('error', function (error: Error) {
				reject(error);
			});
		});

		request.write(data);
		request.end();
	}).then(function (results: TenonResults): A11yResults {
		const a11yResults = toA11yResults(results);
		const totalErrors = results.resultSummary.issues.totalErrors;
		let error: A11yError;

		if (totalErrors === 1) {
			error = new A11yError('1 a11y violation was logged', a11yResults);
		}
		if (totalErrors > 1) {
			error = new A11yError(totalErrors + ' a11y violations were logged', a11yResults);
		}

		if (error) {
			throw error;
		}

		return a11yResults;
	});
}

interface TenonQuery extends TenonConfig {
	key: string;
	src?: string;
	url?: string;
}
