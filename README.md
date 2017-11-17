# a11y

Accessibility testing for [Intern](https://theintern.io/)

[![Intern](https://theintern.io/images/intern-v4.svg)](https://github.com/theintern/intern/)

## How it works

Accessibility testing works by having a scanner check a page or page fragment for rule violations. The most commonly used rules are defined in the W3C's [Web Content Accessibility Guidelines](https://www.w3.org/WAI/intro/wcag.php) (WCAG) and the GSA's [Section 508 Standards](https://www.section508.gov/summary-section508-standards). There are twelve general WCAG guidelines at three levels of success criteria: A, AA, and AAA. Scanners can check for violations at any of the levels, and can typically be configured to only check a subset of rules.

`a11y` is an addon for [Intern](https://github.com/theintern/intern) that lets users write tests targeting various accessibility testing systems. Currently it supports two scanners, [aXe](https://github.com/dequelabs/axe-core) and [Tenon](https://tenon.io). aXe is a JavaScript application that must be injected into the page being tested. The application is configured and executed, returning a report describing the test results. Tenon is a cloud-based testing service; a user requests that the service test a particular URL or page source, and the service returns a report of the results.

Both scanners are able to test entire pages and document fragments (or portions of a full page). In all cases, though, the scanners operate on a fully styled DOM. This means that if a user needs to test a single commponent in isolation, they'll need to create a test page with all the styles and supporting code required by the component, and use that page to run accessibility tests on the component.

Note that because aXe must be injected into a loaded page, it can only be used in functional test suites (i.e., those listed in `functionalSuites` in an Intern config). Tenon makes HTTP calls to an external service and can be used in unit or functional tests.

## Installation

The a11y module should be installed as a peer of Intern.

```
$ npm install intern --save-dev
$ npm install @theintern/a11y --save-dev
```

## Getting started

Using either the aXe or Tenon modules is straightforward. The service modules can be accessed from the `services` property on the `@theintern/a11y` module.

```js
import { services } from '@theintern/a11y';
const axe = services.axe;
```

or

```js
const axe = require('@theintern/a11y').services.axe;
```

The simplest Tenon test looks like:

```js
'check accessibility'() {
	return tenon.check({
		source: 'http://mypage.com'
	});
}
```

Similarly, the simplest aXe test looks like:

```js
'check accessibility'() {
	return aXe.check({
		// aXe tests must be run in functional test suites
		remote: this.remote,
		source: 'page.html'
	});
}
```

aXe may also be used inline in a Leadfoot Command chain:

```js
'check accessibility': function () {
	return this.remote
		.get('page.html')
		.then(aXe.createChecker());
}
```

In all cases, the check is asynchronous and Promise-based. If the check fails (i.e., accessibility violations are detected), the returned Promise is rejected.

## Examples

The repository contains two example projects that use `a11y`, one written in JavaScript and one written in TypeScript.

### JavaScript

1. cd into `examples/js`
2. Run `npm install`
3. Run `TENON_API_KEY=<your key> npm test`

### TypeScript

1. cd into `examples/ts`
2. Run `npm install`
2. Run `npm run build`
3. Run `TENON_API_KEY=<your key> npm test`

## API

Importing the `@theintern/a11y` module will return an object with a `services` property. This property value is an object with `tenon` and `axe` properties. You can also import the service modules directly:

```js
import { check } from '@theintern/a11y/services/axe';
```

### axe

The aXe checker must be injected into the page being analyzed, and therefore can only be used in functional test suites. The aXe checker provides two functions, `check` and `createChecker`.

#### check

The `check` function performs an accessibility analysis on a given URL using a given Command object (typically `this.remote`).

```typescript
check({
	/** LeadFoot Command object */
	remote: Command<any>,

	/** URL to load for testing */
	source: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number,

	/** A selector to confine analysis to */
	context?: string

	/** aXe-specific configuration */
	config?: Object,
}): PromiseLike<AxeResults>
```

The two required parameters are `remote` and `source`. `remote` is a Leadfoot Command object, generally `this.remote` in a test. `source` is the URL that will be analyzed.

There are three optional parameters. `waitFor` is a number of milliseconds to wait after a page has loaded before starting the accessibility analysis. `context` is a CSS selector (ID or class name) that can be used to confine analysis to a specific part of a page. The `config` paramter contains [aXe configuration options](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axeconfigure).

#### createChecker

The `createChecker` function returns a Leadfoot Command helper (a `then` callback). It assumes that a page has already been loaded and is ready to be tested, so it doesn't need a source or Command object.

```typescript
createChecker(config?: AxeTestOptions): Command<A11yResults>
```

### tenon

The Tenon checker works by making requests to a remote cloud service. It can be used in functional or unit test suites.

#### check

The tenon `check` function works the same way as the axe module's, and takes a similar argument object.

```typescript
check({
	/** An external URL, file name, or a data string */
	source: string,

	/** tenon.io API key */
	apiKey?: string,

	/** Number of milliseconds to wait before starting test */
	waitFor?: number,

	/** Tenon configuration options */
	config?: TenonConfig
}): PromiseLike<TenonResults>
```

### A11yReporter

The A11yReporter class is an Intern reporter that will write test failure detail reports to a file or directory. The `check` methods will fail if accessibility failures are present, regardless of whether the A11yReporter reporter is in use. This reporter simply outputs more detailed information for any failures that are detected.

The reporter is loaded as an Intern plugin. It can be configured with a filename, which may name an HTML file, in which case all test reports will be written to a single file, or a directory name, in which case test reports will be written to individual HTML files in the given directory.

```js
plugins: [
	{
		script: '@theintern/a11y/A11yReporter',

		options: {
			// If this is a filename, all failures will be written to the given
			// file. If it's a directory name (no extension), each test failure
			// report will be written to an individual file in the given directory.
			filename: 'somereport.html'
		}
	}
]
```

The A11yReporter class also exposes a `writeReport` static method. This method allows accessibility test results to be explicitly written to a file rather than relying on the reporter:

```js
return axe.check({ ... })
	.catch(error => {
		const results = axe.toA11yResults(error.results);
		return A11yReporter.writeReport('some_file.html', results);
	})
```

## Development

First, clone this repo. Then:

```
$ npm install
$ npm run build
```

Output will be generated in the `_build/` directory. To clean up, run 

```
$ npm run clean
```

To run tests:

```
$ TENON_API_KEY=<your key> npm test
```

You can provide standard Intern arguments like `grep=foo`.

Note that a Tenon API key must be provided to run Tenon self-tests. If no key is provided, the tests will be skipped.

<!-- start-github-only -->
## License

a11y is offered under the [New BSD license](LICENSE).

© [SitePen, Inc.](http://sitepen.com) and its [contributors](https://github.com/theintern/intern-a11y/graphs/contributors)
<!-- end-github-only -->

<!-- doc-viewer-config
{
    "api": "docs/api.json"
}
-->
