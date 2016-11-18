/**
 * This module exports "private" functions and interfaces for testing purposes.
 * It is is not meant to be loaded directly by end users.
 */

import { A11yResults } from '../common';

export interface AxeCheck {
	id: string;
	impact: string;
	message: string;
	data: string;
	relatedNodes: {
		target: string[],
		html: string
	}[];
}

export interface AxeResult {
	description: string;
	help: string;
	helpUrl: string;
	id: string;
	impact: string;
	tags: string[];
	nodes: {
		html: string,
		impact: string,
		target: string[],
		any: AxeCheck[],
		all: AxeCheck[],
		none: AxeCheck[]
	}[];
}

export interface AxeResults {
	url: string;
	timestamp: string;
	passes: AxeResult[];
	violations: AxeResult[];
}

export function toA11yResults(axeResults: AxeResults): A11yResults {
	return {
		analyzer: 'axe',
		source: axeResults.url,
		violations: axeResults.violations.map(function (violation) {
			let standards: string[] = [];
			let wcagLevel = '';

			if (violation.tags.indexOf('wcag2a') !== -1) {
				wcagLevel = 'A';
			}
			else if (violation.tags.indexOf('wcag2aa') !== -1) {
				wcagLevel = 'AA';
			}
			else if (violation.tags.indexOf('wcag2aaa') !== -1) {
				wcagLevel = 'AAA';
			}

			violation.tags.forEach(function (tag) {
				if (/wcag\d+$/.test(tag)) {
					const section = tag.slice(4).split('').join('.');
					standards.push(`Web Content Accessibility Guidelines (WCAG) 2.0, Level ${wcagLevel}: ${section}`);
				}
				else if (/section508\..*/.test(tag)) {
					standards.push(`Section 508: 1194.${tag.slice('section508.'.length)}`);
				}
				else if (tag === 'best-practice') {
					standards.push('Best practice');
				}
				else {
					standards.push(tag[0].toUpperCase() + tag.slice(1));
				}
			});

			return {
				message: violation.help,
				snippet: violation.nodes[0].html,
				description: violation.description,
				target: violation.nodes[0].target[0],
				reference: violation.helpUrl,
				standards: standards
			};
		}),
		originalResults: axeResults
	};
}
