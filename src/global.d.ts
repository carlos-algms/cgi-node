declare namespace NodeJS {
	interface Process {}

	interface ProcessEnv {
		readonly NODE_ENV: 'development' | 'production' | 'test';
		readonly PATH_TRANSLATED: string;
	}
}

declare const VM: typeof import('vm');
declare const FS: typeof import('fs');
declare const URL: typeof import('url');
declare const Path: typeof import('path');
declare const Crypto: typeof import('crypto');
declare const QueryString: typeof import('querystring');

declare interface Script {
	id: number;
	path: string;
	script?: null | string;
	code: string;
	content: any[];
}

declare interface NodeCgiServerVariables {
	/**
	 * /home1/hostUser00/public_html/cgi-bin/
	 */
	context_document_root: string;

	/**
	 * /home1/hostUser00/public_html
	 */
	document_root: string;

	https: 'on' | 'off';

	/**
	 * /magic/index.mjs
	 */
	path_info: string;

	/**
	 * /home1/hostUser00/public_html/magic/index.mjs
	 */
	path_translated: string;

	/**
	 * name=kyara&age=7
	 */
	query_string: any;

	/**
	 * user's IP
	 */
	remote_addr: string;

	remote_port: string;

	unique_id?: string;

	request_method: 'GET' | 'POST' | 'PUT' | 'DELETE';

	request_scheme: 'http' | 'https';

	/**
	 * /cgi-bin/cgi-node.js/magic/index.mjs
	 */
	request_uri: string;

	/**
	 * /cgi-bin/cgi-node.js
	 */
	script_name: string;

	/**
	 * https://domain.com/cgi-bin/cgi-node.js/magic/index.mjs
	 */
	script_uri: string;

	/**
	 * /cgi-bin/cgi-node.js/magic/index.mjs
	 */
	script_url: string;

	/**
	 *  www.domain.com
	 */
	server_name: string;

	/**
	 * 80, 443, etc
	 */
	server_port: string;

	/**
	 * America/Fortaleza
	 */
	tz: string;

	server_protocol: string;

	content_type?: string;

	content_length?: number;
}

declare interface NodeCgiRequestHeaders {
	[key: string]: any;

	accept: string;

	accept_encoding: string;

	accept_language: string;

	authorization: string;

	content_length: number;

	content_type: string;

	cookie: string;

	host: string;

	user_agent: string;

	x_https: 1 | 0;
}

declare interface NodeCgiCookies {
	[key: string]: string;

	'CGI-NODE-SESSIONID': string;
}

declare interface NodeCgiPost {
	form: Record<string, undefined | any>;
	files: Record<string, any>;
	parts: Record<string, any>;
	isMultiPart: boolean;
	data: string;
}

interface NodeCgiSession {
	[key: string]: any;

	cookies: Record<string, NodeCgiSessionCookie>;

	data: Record<string, string | undefined>;

	id: string;

	ipAddress: string;

	path: string;
}

declare interface NodeCgiSessionCookie {
	name: string;
	value: string;
	httpOnly: boolean;
	server: boolean;
	/**
	 * Hack to not send the same cookie twice, it is deleted manually
	 */
	notSent?: boolean;
	domain?: string;
	path?: string;
	expires?: Date;
}
