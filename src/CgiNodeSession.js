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
 * This is a session manager that automatically creates a new session when a user first hits the site.
 * This class will also automatically loads the same session for every required form the same user and provides
 * a clean up method to clean expired session files.
 * @param {CgiHttpRequest} request
 * @param {CgiHttpResponse} response
 */
function CgiHttpSession(request, response) {
	const self = this;

	/**
	 * The unique session ID for the current user.
	 * @type {string}
	 */
	this.id;

	/**
	 * The full file path of the session file where the data will saved and restored.
	 * @type {string}
	 */
	this.path;

	/**
	 * The IP address of the user, this is used as a simple check to ensure the request is coming from the original IP addresses
	 * that created this session. If the IP address changed then the session will no longer be accessible.
	 * @type {string}
	 */
	this.ipAddress;

	/**
	 * Server side cookies that are saved and loaded with the session.
	 * This is an object of name:  {
	 * 	name: <string>,
	 * 	value: <string>,
	 * 	expires: <date>,
	 * 	domain: <string>,
	 * 	path: <string>,
	 * 	httpOnly: <boolean>,
	 * 	secure: <boolean>
	 * }
	 * @type {NodeCgiSession['cookies']}
	 */
	this.cookies = {};

	/**
	 * This is the suer stored session data. Users can store anything they want there and accesses it at every request.
	 * For example: session.data.userId = 10;
	 * @type {Record<string, string | undefined>}
	 */
	this.data = {};

	/**
	 * Performs the session operations of loading the session or creating a new if it does not exist.
	 */
	this.init = () => {
		// Set the session within the request object and response object, these objects need access to the session.
		response.session = self;

		// Get the session ID from the cookies. If there is no session ID stored then create a new ID and create a new file.
		self.id = request.cookies[CgiNodeConfig.SessionCookie] || self.create();
		let path = Path.join(CgiNodeConfig.SessionPath, self.id);

		// If the file does not exist then create another ID.
		if (!FS.existsSync(path)) {
			self.id = self.create();
		}

		path = Path.join(CgiNodeConfig.SessionPath, self.id);

		// Load the session information.
		// TODO: handle exceptions, if occurs create new session.
		/**
		 * @type {NodeCgiSession}
		 */
		const session = JSON.parse(FS.readFileSync(path, { encoding: 'utf8' }));

		// Ensure the session is actually the requester's session.
		// TODO: create new session if this occurs. Don't throw exception.
		if (session.ipAddress != request.server.remote_addr) {
			throw new Error('Invalid session ID!');
		}

		// Copy the session object data into this object.
		self.id = session.id;
		self.path = session.path;
		self.ipAddress = session.ipAddress;
		self.cookies = session.cookies;
		self.data = session.data;

		// TODO: At this point the client has already sent it's cookies as well. We can merge the client cookies into the session cookies.
	};

	/*
	 Saves the session data back to the file.
	*/
	this.save = () => {
		/**
		 * @type {NodeCgiSession}
		 */
		const session = {
			id: self.id,
			path: self.path,
			ipAddress: self.ipAddress,
			cookies: self.cookies,
			data: self.data,
		};

		// Write the session back to the
		FS.writeFileSync(self.path, JSON.stringify(session));
	};

	/*
	 Creates a new session with a new ID and saves the empty session to file.
	 Uses the client's IP address, port and current time + random number to generate a new session ID.
	 Stores the current client IP address within the session ID. This is used as extra check.
	*/
	this.create = () => {
		/** @type {string} */
		let id;
		let i = 0;

		do {
			if (i >= 10) {
				throw new Error('Unable to generate a new session ID');
			}

			i++;

			// Generate a new ID based on some fixed and random factors.
			const idString = [
				request.server.remote_addr,
				request.server.remote_port,
				request.server.unique_id,
				Date.now(),
				Math.random(),
				i,
			].join('');

			id = Crypto.createHash('md5').update(idString, 'utf8').digest('hex');
		} while (FS.existsSync(Path.join(CgiNodeConfig.SessionPath, id)));

		/**
		 * @type {NodeCgiSession}
		 */
		const session = {
			id: id,
			path: Path.join(CgiNodeConfig.SessionPath, id),
			ipAddress: request.server.remote_addr,
			cookies: {},
			data: {},
		};

		// Add the session ID cookie to it. {name: <string>, value: <string or array>, expires: <date>, domain: <string>, path: <string>, httpOnly: <boolean>, secure: <boolean>}
		session.cookies[CgiNodeConfig.SessionCookie] = {
			name: CgiNodeConfig.SessionCookie,
			value: id,
			httpOnly: true,
			notSent: true,
			server: true,
		};

		// Save the session to file.
		FS.writeFileSync(session.path, JSON.stringify(session));

		// Return the session ID.
		return session.id;
	};

	/*
	 Deletes all expired sessions from the server. This should occur at the end of a request after everything is done and
	 the process is about to exist.

	 TODO: handle exceptions.
	*/
	this.cleanUp = () => {
		// Current time used to check if a session has expired.
		const time = Date.now();

		// Get the time out in milliseconds.
		const timeOut = CgiNodeConfig.SessionTimeOut;

		// Get the list of files within the sessions folder.
		const sessions = FS.readdirSync(CgiNodeConfig.SessionPath);

		for (let index = 0; index < sessions.length; index++) {
			// Build the path and the file information.
			const path = Path.join(CgiNodeConfig.SessionPath, sessions[index]);
			const stats = FS.statSync(path);

			// If the session has expired then delete the session file.
			if (stats.mtime.getTime() + timeOut < time) {
				FS.unlinkSync(path);
			}
		}
	};

	// Call the constructor.
	self.init();
}
