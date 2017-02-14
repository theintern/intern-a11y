var fs = require('fs');
try {
	fs.unlinkSync('a11y-report.html');
}
catch (error) {
	// ignore
}
