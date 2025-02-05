#!/usr/bin/env node

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

 This allows us to run CGI-Node directly from the source files without having to build them while in development mode.
*/

// Add required modules.
var FS = require('fs');

// The list of files to included
var code = '';
var dir = '../src/'
var files = ['CgiNodeConfig.js', 'CgiNodeContext.js', 'CgiNodeSession.js', 'CgiNodeResponse.js', 'CgiNodeRequest.js', 'CgiNodeParser.js', 'CgiNode.js'];

// Loop through the files and get the content.
for (var index = 0; index < files.length; index++) code += '\n\n' + FS.readFileSync( dir + files[index] );

// Run the source code.
eval(code);
