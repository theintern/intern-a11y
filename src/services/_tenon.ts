/**
 * This module exports "private" functions and interfaces for testing purposes.
 * It is is not meant to be loaded directly by end users.
 */

import { A11yResults } from '../common';
import * as fs from 'fs';

export interface TenonResults {
	apiErrors: any[];
	documentSize: number;
	globalStats: {
		errorDensity: string,
		warningDensity: string,
		allDensity: string,
		stdDev: string
	};
	message: string;
	request: {
		url: string,
		ref: string,
		importance: string,
		responseID: string,
		userID: string,
		uaString: string,
		projectID: string,
		docID: string,
		level: string,
		certainty: number,
		priority: number,
		waitFor: string,
		fragment: number,
		store: number,
		viewport: {
			height: number,
			width: number
		}
	};
	responseExecTime: string;
	responseTime: string;
	resultSet: {
		bpID: number,
		certainty: number,
		errorDescription: string,
		errorSnippet: string,
		errorTitle: string,
		issueID: string,
		position: {
			line: number,
			column: number
		};
		priority: number,
		ref: string,
		resultTitle: string,
		signature: string,
		standards: string[],
		tID: number,
		viewPortLocation: {
			'bottom-right': {
				x: number,
				y: number
			},
			'top-left': {
				x: number,
				y: number
			},
			height: number,
			width: number
		},
		xpath: string
	}[];
	resultSummary: {
		density: {
			allDensity: number,
			errorDensity: number,
			warningDensity: number
		},
		issues: {
			totalErrors: number,
			totalIssues: number,
			totalWarnings: number
		},
		issuesByLevel: {
			A: {
				count: number,
				pct: number
			},
			AA: {
				count: number,
				pct: number
			}
			AAA: {
				count: number,
				pct: number
			}
		},
		tests: {
			failing: number,
			passing: number,
			total: number
		}
	};
	sourceHash: string;
	status: number;
	urlHttpCode: number;
	clientScriptErrors: {
		message: string,
		stacktrace: any[]
	};
	code: string;
	moreInfo: string;
}

export function toA11yResults(tenonResults: TenonResults): A11yResults {
	let source = tenonResults.request.url;
	if (/tenon\.io\/api\/file.php/.test(tenonResults.request.url)) {
		source = `${tenonResults.request.docID} (uploaded)`;
	}

	return {
		analyzer: 'tenon',
		source: source,
		violations: tenonResults.resultSet.map(function (result) {
			return {
				message: result.errorTitle,
				snippet: result.errorSnippet,
				description: result.errorDescription,
				target: result.xpath,
				reference: result.ref,
				standards: result.standards,
				position: {
					line: result.position.line,
					column: result.position.column
				}
			};
		}),
		originalResults: tenonResults
	};
}

export function fileExists(filename: string) {
	try {
		return fs.statSync(filename).isFile();
	}
	catch (error) {
		if (error.code === 'ENOENT') {
			return false;
		}
		throw error;
	}
}
