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

/**
 * This object contains all the information about the process and the HTTP request sent by the client.
 * The information is all parsed and easily accessible.
 */
function CgiHttpRequest() {
	const self = this;

	/**
	 * This is a URL object as defined by node.js API for URL found here: http://nodejs.org/api/url.html
	 * The URL is passed in as part of the environment variables 'request_uri'
	 * @type {import('url').UrlWithParsedQuery | null}
	 */
	this.url = null;

	/**
	 * The HTTP request method. Could be 'POST' or 'GET' (in upper-case).
	 * Passed in as environment variable 'request_method'
	 * @type {NodeCgiServerVariables['request_method'] | undefined}
	 */
	this.method;

	/**
	 * Not sure if anyone ever uses this, but it is the HTTP version pass sent by the client.
	 * Passed in as environment variable 'server_protocol'
	 * @type {string}
	 */
	this.httpVersion;

	/**
	 * The parsed URL query string if any where provided. This is the same as getting it from the 'request.url.query'.
	 * See URL object for more information: http://nodejs.org/api/url.html
	 * In general (but not necessary), the query is a key/value pair of GET form.
	 * @type {import('url').UrlWithParsedQuery['query']}
	 */
	this.query;

	/**
	 * This is the post object that holds all the different parts of the post data.
	 * form: The parsed post form data of name/value. If the POST is multi-part then any part with 'Content-Disposition: form-data;' is stored here.
	 * files: A list of uploaded files. The file object format is: {name: '', filename: '', contentType: '', data: ''}
	 * isMultiPart: true if content-type contains 'multipart/form-data' within it, otherwise false.
	 * @type {NodeCgiPost}
	 */
	this.post = { form: {}, files: [], parts: [], data: '', isMultiPart: false };

	/**
	 * This is the server environment variables as provided by 'process.env'
	 * except all 'HTTP_' prefixed variables have been removed and all names are in lower-case.
	 * @type {NodeCgiServerVariables}
	 */
	// @ts-ignore
	this.server = {};

	/**
	 * These are the HTTP request headers sent by the client. All the names are lower case and all '-' is replaced by '_'.
	 * These are extracted from the environment variables, they are passed in with a prefix 'HTTP_' which is stripped out.
	 * @type {NodeCgiRequestHeaders}
	 */
	// @ts-ignore
	this.headers = {};

	/**
	 * These are the cookies that are found within the request header.
	 * Example: request.cookies.name or request.cookies['name']
	 * @type {NodeCgiCookies}
	 */
	// @ts-ignore
	this.cookies = {};

	/**
	 * This object is a concatenation of all the GET (query) and POST form object information.
	 * This is helpful to access all form field values without having to check if the method is a POST or GET.
	 */
	this.form = {};

	/**
	 * Initializes the HTTP response variables as passed in by the process throw the environment variables
	 * and the input stream for the post data.
	 */
	this.init = () => {
		// Start by parsing the out the environment variables and HTTP headers.
		CgiParser.environmentVariablesAndHeaders(process.env, self.server, self.headers);

		// User the server variables to get the rest of the information about the request.
		self.method = self.server.request_method;
		self.httpVersion = self.server.server_protocol;

		// The content type and length is stored in the server and does not contain the 'http_' prefix.
		// Therefore we are going to manually copy them over.
		self.headers.content_type = self.server.content_type ?? '';
		self.headers.content_length = self.server.content_length ?? 0;

		// Parse any set cookies into the request.
		if (self.headers.cookie) {
			self.cookies = CgiParser.cookies(self.headers.cookie);
		}

		// Create the URL object passing it the request URL and then get the get query object from it.
		self.url = URL.parse(self.server.request_uri, true);
		self.query = self.url.query;

		// Finally determine if the method is post and if it is multi-part post data.
		self.post.isMultiPart = self.headers.content_type.toLowerCase().includes('multipart/form-data');

		// TODO: we could also parse out the boundary of a multi-part post.
		// TODO: parse the post data if they exist.
	};

	/**
	 * Reads all the post data from the standard stream.
	 * @param {() => any} onFinishedRead
	 */
	this.readPost = (onFinishedRead = () => null, parseData = true) => {
		// Read any post data before executing the script.
		process.stdin.on('data', (data) => {
			self.post.data += data;
		});

		// When all the data have been read then invoke the given call back method.
		process.stdin.on('end', () => {
			// If we need to parse the post data before invoking the call back method then do so.
			if (parseData) {
				self.parsePost();
			}

			onFinishedRead();
		});
	};

	/**
	 * Parses the post data and populates the request post object with the data.
	 */
	this.parsePost = () => {
		// If the content type is multi-part then use the CGI parser to parse it.
		if (self.post.isMultiPart) {
			CgiParser.multiPart(self.post.data, self.post);
		} else {
			// Otherwise use the standard query string parser to the parse the post data.
			self.post.form = QueryString.parse(self.post.data);
		}
	};

	// Call the constructor.
	this.init();
}
