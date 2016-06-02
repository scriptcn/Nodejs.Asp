"use strict";

var http = require('http'),
	tpl = require('./tpl');
	
process.chdir('./web/');

http.createServer(function(req, res) {
	var tpls = new tpl(req, res);
	return tpls.Init(function(re){
		return tpls = null;
	});
}).listen(70, '0.0.0.0');
console.log("Server start!");