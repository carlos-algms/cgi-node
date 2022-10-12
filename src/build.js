/*
The MIT License (MIT)

Copyright (c) 2014 UeiRicho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

@Author: Uei Richo
@Email: Uei.Richo@gmail.com
*/

// Add the required modules.
const FS = require('fs');
const Path = require('path');
const { minify } = require('terser');

/**
 * The build class is responsible for concatenating all the source code into one file and optimizing it if specified.
 * This will help greatly reduce the file size and optimize performance.
 */
function CgiNodeBuilder() {
	const self = this;

	/**
	 * Gets the content for all the given files, concatenates them and returns them.
	 * NOTE: The order of the files does matter, make sure they are in the right order.
	 * @param {string[]} files
	 */
	this.getSourceCode = (files) => {
		let code = '';
		self.progress('Reading file content...');

		// Loop through the files and get the content.
		for (let index = 0; index < files.length; index++) {
			const file = Path.resolve(__dirname, files[index]);
			self.progress('Reading: ' + file);
			code += '\n\n' + FS.readFileSync(file);
		}

		// Finally return the code for all the files.
		return code;
	};

	/**
	 * Minimize the code
	 * @param {string} code
	 */
	this.optimize = async (code) => {
		self.progress('Optimizing Code');

		let minifyResult = await minify(code, {
			sourceMap: false,
			ecma: 2020,
			format: {
				max_line_len: 400,
			},
		});

		return minifyResult.code || '';
	};

	/**
	 * Outputs the given code to the specified path.
	 * @param {string} code
	 * @param {string} outputPath
	 */
	this.output = (code, outputPath) => {
		self.progress('Writing output file: ' + outputPath);
		// Write the file to the destination location.
		FS.writeFileSync(outputPath, code, { encoding: 'utf8', flag: 'w' });
	};

	/**
	 * Runs the build on the given files and saves the output to the given output path.
	 * @param {string[]} files
	 * @param {string} outputPath
	 * @param {string} nodeExecPath
	 */
	this.run = async (files, outputPath, nodeExecPath) => {
		self.progress('Starting build...');

		// Get the code from the files.
		const code = [nodeExecPath, self.getSourceCode(files)].join('\n\n');

		// Write the standard, non-compressed/optimized code to file.
		self.output(code, outputPath + '.js');

		// Optimize the code then write it to file.
		const optimizedCode = await self.optimize(code);

		// Write the optimized compressed code to file.
		self.output(optimizedCode, outputPath + '.min.js');
	};

	/**
	 * Formats the given progress message to HTML and writes it to the output stream.
	 * @param {string} message
	 */
	this.progress = (message) => {
		process.stdout.write(message + '\n');
	};
}

// Specifies the path to where node executable exists. NOTE: windows machines require the double quotes.
const nodeExecPathLinux = '#!/usr/bin/env node';
// const nodeExecPathWindows = '#!"D:/Programs/nodejs/node.exe"';

// The list of files to build in the correct order.
const files = [
	'CgiNodeConfig.js',
	'CgiNodeContext.js',
	'CgiNodeSession.js',
	'CgiNodeResponse.js',
	'CgiNodeRequest.js',
	'CgiNodeParser.js',
	'CgiNode.js',
];

// The output path and file name.
const output = Path.resolve(__dirname, '../cgi-bin/cgi-node');

// Create the build class and run it.
const build = new CgiNodeBuilder();
build.run(files, output, nodeExecPathLinux);
