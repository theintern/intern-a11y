import { join, dirname } from 'path';
import { sync as mkdir } from 'mkdirp';
import { writeFile, writeFileSync } from 'fs';
import Test from 'intern/lib/Test';
import Suite from 'intern/lib/Suite';
import { Executor } from 'intern/lib/executors/Executor';
import { A11yResults, A11yViolation } from './common';

/**
 * A11yReporter writes test results to a file or a directory of files.
 */
export default class A11yReporter {
	executor: Executor;
	filename: string;
	console: Console;

	protected _report: string[] | undefined;
	protected _reportFiles: string[];

	/**
	 * WriteReport writes a set of A11yResults to a file
	 */
	static writeReport(filename: string, results: A11yResults, id: string) {
		return new Promise((resolve, reject) => {
			const content = renderResults(results, id);
			writeFile(filename, renderReport(content), error => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	}

	constructor(executor: Executor, options?: A11yReporterOptions) {
		this.executor = executor;

		options = options || {};
		this.filename = options.filename || 'a11y-report';
		this.console = options.console || console;

		const reportDir = dirname(this.filename);
		if (reportDir !== '.') {
			mkdir(reportDir);
		}

		if (/\.html$/.test(this.filename)) {
			// Filename is a single HTML file that will contain multiple
			// individual reports
			this._report = [];
			this._reportFiles = [this.filename];
		} else {
			this._reportFiles = [];

			// Filename is a directory that will store multiple reports, one
			// per file.
			mkdir(this.filename);
		}

		executor.on('runEnd', this.runEnd.bind(this));
		executor.on('suiteEnd', this.suiteEnd.bind(this));
		executor.on('testEnd', this.testEnd.bind(this));
	}

	testEnd(test: Test) {
		// We only care about failing tests
		if (!test.error) {
			return;
		}

		const error = test.error;
		let results: A11yResults = (<any>error).a11yResults;

		if (results) {
			const content = renderResults(results, test.id);

			if (this._report) {
				// Add this report to the reports list
				this._report.push(content);
			} else {
				// Write this report to a file
				const filename = join(
					this.filename,
					sanitizeFilename(test.id + '.html')
				);
				writeFileSync(filename, renderReport(content));
				this._reportFiles.push(filename);
			}
		}
	}

	runEnd() {
		if (this._reportFiles.length > 0) {
			this.console.log();
			for (const file of this._reportFiles) {
				this.console.log(`A11y report written to ${file}`);
			}
			this.console.log();
		}
	}

	suiteEnd(suite: Suite) {
		if (!suite.hasParent) {
			if (this._report) {
				writeFileSync(
					this.filename,
					renderReport(this._report.join(''))
				);
				this._reportFiles.push(this.filename);
			}
		}
	}
}

export interface A11yReporterOptions {
	console?: Console;
	filename?: string;
}

if (typeof intern !== 'undefined') {
	intern.registerPlugin('A11yReporter', options => {
		new A11yReporter(intern, options);
	});
}

function escape(str: string) {
	return String(str).replace(/</g, '&lt;');
}

function renderReport(body: string) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
		<title>Accessibility Report</title>
			<style>
				html { font-family:sans-serif; background:#eee; }
				body { width:800px; padding:1em; margin:0 auto; }

				section { border:solid 1px #ddd; border-radius:2px; background:white; padding:1em; margin-bottom:1em; overflow:hidden; }
				section:last-of-type { margin-bottom:0; }
				section > * { margin-bottom:1em; }
				section > *:last-child { margin-bottom:0; }

				h1 { margin:0; margin-bottom:0.5em; }
				h2 { margin:0; margin-bottom:0.25em; font-size:110%; }
				pre { border-radius:4px; padding:0.5em; margin:0; overflow:auto; color:#999; }

				.violation { border:solid 1px #e7e7e7; border-radius:2px; margin-bottom:1em; background:#f7f7f7; overflow:hidden; }
				.violation:last-child { margin-bottom:0; }

				.header > * { margin:1em 0.5em; }
				.header > *:first-child { margin-top:0.5em; }

				.description { color:#444; }

				.standards ul { margin:0; }

				.snippet { border-radius:0; background:#eee; }

				ul.meta { padding-left:0; }
				ul.meta li { list-style-type:none; }
				li .label { font-weight:bold; width:5em; display:inline-block; }
				li .label:after { content:':'; }

				.when-open { display:none; }
				.when-closed { display:block; }
				span.when-closed { display:inline; }
				.open .when-closed { display:none; }
				.open .when-open { display:block; }
				.open span.when-open { display:inline; }

				.raw-results pre { padding:0.5em; background:#f5f5f5; color:#444; margin-top:0.5em; }
			</style>
			<script>
				window.addEventListener('load', function () {
					document.body.addEventListener('click', function (event) {
						var target = event.target;
						while (target) {
							if (target.getAttribute('data-action') === 'toggle-open') {
								event.preventDefault();
								target.parentElement.classList.toggle('open');
								return false;
							}
							target = target.parentElement;
						}
					});
				});
			</script>
		</head>
		<body>
			${body}
		</body>
	</html>`;
}

function renderResults(results: A11yResults, id: string) {
	let out: string[] = ['<section class="results">'];

	out.push(`<h1>${id}</h1>`);
	out.push(`<ul class="meta">
		<li><span class="label">Analyzer</span> ${results.analyzer}</li>
		<li><span class="label">Source</span> ${results.source}</li>
	</ul>`);

	if (results.violations.length > 0) {
		out = out.concat(results.violations.map(renderViolation));
	} else {
		out = out.concat('<p>No violations</p>');
	}

	out.push(`<div class="raw-results">
		<button data-action="toggle-open"><span class="when-open">Hide</span><span class="when-closed">Show</span> raw results</button>
		<pre class="when-open">${escape(
			JSON.stringify(results.originalResults, null, '  ')
		)}</pre>
	</div>`);

	return out.concat('</section>').join('');
}

function renderViolation(violation: A11yViolation) {
	let target = escape(violation.target);
	if (violation.position) {
		target += ` (${violation.position.line}:${violation.position.column})`;
	}

	let standards = '';
	if (violation.standards && violation.standards.length > 0) {
		standards = `<div class="standards">
			<h2>Standards</h2>
			<ul>
				<li>${violation.standards.join('</li><li>')}</li>
			</ul>
		</div>`;
	}

	return `<div class="violation">
		<div class="header">
			<div class="target"><h2>Target</h2><span class="selector">${target}</span></div>
			<div class="message"><h2>Summary</h2><a href="${violation.reference}">${escape(
		violation.message
	)}</a></div>
			<div class="description"><h2>Description</h2>${escape(
				violation.description
			)}</div>
			${standards}
		</div>
		<pre class="snippet">${escape(violation.snippet)}</pre>
	</div>`;
}

function sanitizeFilename(filename: string) {
	return filename.replace(/[/?<>\\:*|"]/g, '_').replace(/[.\s]+$/, '');
}
