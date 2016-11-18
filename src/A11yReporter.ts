import * as Test from 'intern/lib/Test';
import * as path from 'path';
import * as fs from 'fs';
import { A11yResults, A11yViolation } from './common';

class A11yReporter {
	config: any;

	filename: string;

	report: string[];

	constructor(config: any) {
		this.config = config;
		this.filename = this.config.filename;

		if (!this.filename) {
			this.filename = 'a11y-report';
		}

		if (/\.html$/.test(this.filename)) {
			this.report = [];
		}
		else {
			// ReporterManager will already have created dirname(this.config.filename)
			try {
				fs.mkdirSync(this.filename);
			}
			catch (error) {
				if (error.code !== 'EEXIST') {
					throw error;
				}
			}
		}
	}

	testFail(test: Test) {
		const error = test.error;
		let results: A11yResults = (<any> error).a11yResults;

		if (results) {
			const content = renderResults(results, test.id);

			if (this.report) {
				this.report.push(content);
			}
			else {
				const filename = path.join(this.filename, sanitizeFilename(test.id + '.html'));
				fs.writeFileSync(filename, renderReport(content));
			}
		}
	}

	runEnd() {
		if (this.report) {
			fs.writeFileSync(this.filename, renderReport(this.report.join('')));
		}
	}

	static writeReport(filename: string, results: A11yResults, id: string) {
		return new Promise(function (resolve, reject) {
			const content = renderResults(results, id);
			fs.writeFile(filename, renderReport(content), function (error) {
				if (error) {
					reject(error);
				}
				else {
					resolve(results);
				}
			});
		});
	}
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
	let out: string[] = [ '<section class="results">' ];

	out.push(`<h1>${id}</h1>`);
	out.push(`<ul class="meta">
		<li><span class="label">Analyzer</span> ${results.analyzer}</li>
		<li><span class="label">Source</span> ${results.source}</li>
	</ul>`);

	if (results.violations.length > 0) {
		out = out.concat(results.violations.map(renderViolation));
	}
	else {
		out = out.concat('<p>No violations</p>');
	}

	out.push(`<div class="raw-results">
		<button data-action="toggle-open"><span class="when-open">Hide</span><span class="when-closed">Show</span> raw results</button>
		<pre class="when-open">${escape(JSON.stringify(results.originalResults, null, '  '))}</pre>
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
			<div class="message"><h2>Summary</h2><a href="${violation.reference}">${escape(violation.message)}</a></div>
			<div class="description"><h2>Description</h2>${escape(violation.description)}</div>
			${standards}
		</div>
		<pre class="snippet">${escape(violation.snippet)}</pre>
	</div>`;
}

function sanitizeFilename(filename: string) {
	return filename
		.replace(/[/?<>\\:*|"]/g, '_')
		.replace(/[.\s]+$/, '');
}

// Use TS default export for improved CJS interop
export = A11yReporter;
