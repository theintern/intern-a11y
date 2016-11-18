export interface A11yViolation {
	message: string;
	snippet: string;
	description: string;
	target: string;
	reference: string;
	standards: string[];
	position?: {
		line: number,
		column: number
	};
}

export interface A11yResults {
	analyzer: string;
	source: string;
	violations: A11yViolation[];
	originalResults: any;
}

export class A11yError extends Error {
	a11yResults: A11yResults;

	constructor(message: string, results: A11yResults) {
		super(message);
		(<any> Error).captureStackTrace(this, this.constructor);
		this.message = message;
		this.a11yResults = results;
	}
}
