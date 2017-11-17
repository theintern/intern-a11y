import { statSync, unlinkSync } from 'fs';

export function cleanup(filename: string) {
	try {
		statSync(filename);
		unlinkSync(filename);
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

	return filename;
}

export function fileExists(filename: string) {
	try {
		return statSync(filename).isFile();
	} catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
		return false;
	}
}
