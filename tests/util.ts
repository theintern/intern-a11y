import * as fs from 'intern/dojo/node!fs';

export function cleanup(filename: string) {
	try {
		fs.statSync(filename);
		fs.unlinkSync(filename);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return filename;
}

export function fileExists(filename: string) {
	try {
		return fs.statSync(filename).isFile();
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
		return false;
	}
}
