"use strict";

var fs = require('fs'),
	url = require('url'),
	crypto = require('crypto'),
	query = require('querystring'),
	path = require('path'),
	_PAGE_ = {
		'cache' : {},
		'sess' : {},
		'memory' : {}
	};
	
//tpl
function tpl(_req, _res) {
	var req = _req, res = _res, sys, callBack, file, _this = this, sys = Sys;
	var cfg = {
		'rootPath' 	: './',
		'upfilePath'	: './upfile/',
		'serverName'	: 'BiyuanWebserver',
		'minSource'	: false,
		'indexPage'	: '/index.asp',
		'notSuffix'	: '.asp',
		'contentMax'	: 2 * 1024 * 1024,
		'scriptTag' 	: new Array('<%', '%>'),
		'includeTag'	: new Array('<!--include file=', '-->'),
		'scriptFolder'	: new RegExp('^(manage\\\\)?\\w+\\.(asp|node)$', 'i'),//linux is '\/'
		'cacheSuffix'	: new RegExp('\\.(css|jpg|gif|png)$', 'i'),
		'upfileSuffix'	: new RegExp('^(rar|zip|jpg|jpeg|gif|png)$', 'i'),
		'upfileNotCode'	: false	//new RegExp('(eval|execute|function|form|querystring)', 'i')
	};
	var header = {
		'code' : 404,
		'head' : {'Content-Type' : 'text/html', 'Server' : cfg.serverName}
	};
	
	function _SetHeader(input) {
		header.code = input.code || header.code;
		if(input.head) {
			for(var i in input.head) {
				header.head[i] = input.head[i];
			}
		}
	}
	
	function _Output(input) {
		_SetHeader(input);
		if(header.code != 200) {
			Sys.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, input.body);
		}
		res.writeHead(header.code, header.head);
		res.end(input.body);
		return callBack(true);
	}
	
	this.Init = function(_callBack) {
		callBack = _callBack;
		var urls = url.parse(req.url, true);
		file = urls.pathname == '/' ? cfg.indexPage : urls.pathname;
		file == '/favicon.ico' && res.end();
		/^\/([^\/]+\/)?(\w+)$/.test(file) && (file += cfg.notSuffix);
		file = Sys.realPath(cfg.rootPath, file);
		req.QueryString = urls.query;
		if(req.method == 'POST') {
			if(req.headers['content-length'] > cfg.contentMax) {
				req.Form = {'error' : 'Information is too long'}
				return _LoadPage(function(rBody) {
					req.destroy();
					Sys.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, req.Form.error);
					return _Output(rBody);
				});
			} else {
				if(/^multipart\/form-data; boundary=(.+)$/.test(req.headers['content-type'])) {
					var isDestroy = false;
					var upload = new Upload(RegExp.$1, cfg, function(rbody){
						isDestroy = rbody;	
					});
					function _onEnd() {
						req.Form = isDestroy || upload.Form;
						upload = null;
						return _LoadPage(function(rBody) {
							Sys.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, req.Form);
							return _Output(rBody);
						});
					}
					req.on('data', function(chunk){
						if(isDestroy) {
							return _onEnd();
						}
						upload.SaveFile(chunk);
					});
					req.on('end', _onEnd);
				} else {
					var postdata = "";
					req.on("data", function(chunk){
						postdata += chunk;
					});
					req.on("end", function(){
						req.Form = query.parse(postdata);
						return _LoadPage(function(rBody) {
							return _Output(rBody);
						});
					});
				}
			}
		} else {
			return _LoadPage(function(rBody) {
				return _Output(rBody);
			});
		}
	}
	
	function _LoadPage(_callBack) {
		if(_PAGE_.cache[file]) {
			return _callBack({
				'code' : 200,
				'head' : {'Content-Type' : Sys.type(file)},
				'body' : _PAGE_.cache[file]
			});
		}
		if(/[^\w]+$/.test(file)) {
			return _callBack({
				'body' : '404: File Not Found'
			});
		}
		fs.readFile(file, function(err, data) {
			if(err) {
				return _callBack({
					'body' : '404: File Not Found'
				});
			}
			if(cfg.scriptFolder.test(file)) {
				Sys.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, req.method);
				return _Parse(data.toString(), function(re) {
					return _callBack({
						'code' : 200, 
						'head' : {'Content-Type' : Sys.type(file), 'cache-Control' : 'no-cache'},
						'body' : re
					});
				});	
			} else {
				if(cfg.cacheSuffix.test(file)) {
					_PAGE_.cache[file] = data;
				}
				return _callBack({
					'code' : 200, 
					'head' : {'Content-Type' : Sys.type(file)},
					'body' : data
				});
			}
		});
	}
	
	function _Parse(data, callBack) {
		var re = [], sTag = cfg.scriptTag, iTag = cfg.includeTag, print;
		var Request = req, Response = res, head = {};
		Response.setHeaders = function(setHead) {
			if(setHead['Set-Cookie']) {
				head['Set-Cookie'] = head['Set-Cookie'] || [];
				head['Set-Cookie'] = head['Set-Cookie'].concat(setHead['Set-Cookie']);
			} else {
				head = setHead;
			}
		}
		var Application = _Application;
		Application.del = function(k) { return Application(k, '', 'del');}
		var Cookies = Request.Cookies = new _Cookies(Response);
		Cookies.del = function(k) {return Cookies(k, 'del');}
		var Session = new _Session(Cookies);
		Session.del = function(k) {return Session(k, null, 'del');}
		Request['addr'] = Sys.addr(req);
		Response.Write = print = echo;
		Response.Clear = clear;
		Response.End = exit;
		var endLine = '#' + Sys.md5(Sys.guid()) + '#';
		
		function clear() {
			re.length = 0;
		}
		function exit(str) {
			if(str) re.push(str);
			re.push(endLine);
		}
		function echo () {
			var args = arguments, i = 0;
			return re.push(args.length == 1 ? args[0] : args[0].replace(/%s/g, function() {
				return args[++ i];
			}));
		}
		function aSync () {
			var k = Sys.md5(Sys.guid());
			aSync[k] = re.push('') - 1;
			this.echo = function () {
				var args = arguments, i = 0;
				try {
					re[aSync[k]] += (args.length == 1 ? args[0] : args[0].replace(/%s/g, function() {
						return args[++ i];
					}) + '\r\n');
				} catch(e) {
					return console.log('re is error!');
				}
			}
			this.close = function () {
				//process.nextTick
				//return setImmediate(function () {
					delete aSync[k];
				//});
			}
		}
		function reIsOver(){
			for(var i in aSync) {
				return false;
			}
			if(re[re.length - 1].indexOf('</html>') === -1) {
				return false;
			}
			return true;
		}
		try {
			eval(data.replace(new RegExp(iTag[0] + '(\'|")([^\'"]+)\\1;?' + iTag[1], 'gi'), function(a, b, c){
				return fs.readFileSync(Sys.realPath(cfg.rootPath, c));
			}).replace(new RegExp(sTag[0] + '=([^;%]+);?' + sTag[1] + '|{\\$([^;}]+);?}', 'g'), function(a, b, c) {
				return "<%echo(" + (b || c) + ");%>";
			}).replace(new RegExp('(^|' + sTag[1] + ')([\\s\\S]*?)[\\r\\n]*(' + sTag[0] + '|$)', 'g'), function(a, b, c) {
				return !c ? '' : 'echo("' + c.replace(/"/g, '\\"').replace(/\r\n/g, '\\r\\n') + '");';
			}));
		} catch(e) {
			re = ['Page error!', Request.url, e.name, e.message];
			return callBack(re.join('\r\n'));
		}
		
		var outTime = new Date();
		var intVal = setInterval(function(){
			if(!reIsOver()){
				if(new Date() - outTime > 5000) {
					clearInterval(intVal);
					return callBack('Request timeout!');
				}
				console.log(new Date());
			} else {
				clearInterval(intVal);
				re = re.join('');
				_SetHeader({'head' : head});
				return callBack((cfg.minSource ? re.replace(/\r\n|\t/g, '') : re).split(endLine)[0]);
			}
		}, 10);
	}
	
	function _Cookies(Res) {
		return function(k, v) {
			k = k ? escape(k) : '', v = v ? escape(v) : '';
			var re = {}, cookie = req.headers.cookie || '';
			cookie.replace(/(^|\s)([^=]+)=([^;]*)(;|$)/g, function(a, b, c, d) {
				re[c] = unescape(d);
			});
			if(k && !v) { return re[k] || '';}
			if(v) {
				v = v == 'del' ? '' : v;
				Res.setHeaders({'Set-Cookie' : [k + '=' + v]});
			}
			return k ? (re[k] || '') : re;
		}
	}
	
	function _Session(_Cookies) {
		var id = _Cookies('SessionID') || _Cookies('SessionID', Sys.md5(Sys.guid()));
		_PAGE_.sess[id] = _PAGE_.sess[id] || {};
		return function(k, v, d) {
			if(d == 'del') {
				return k ? (delete _PAGE_.sess[id][k]) : (delete _PAGE_.sess[id], _Cookies('SessionID', '', 'del'));
			}
			if(!v) {
				return _PAGE_.sess[id][k];
			} else {
				_PAGE_.sess[id][k] = v;
			}
		}
	}

	function _Application(k, v, d) {
		if(d == 'del') {
			return k ? delete _PAGE_.memory[k] : _PAGE_.memory = {};
		}
		if(!v) {
			return _PAGE_.memory[k];
		} else {
			_PAGE_.memory[k] = v;
		}
	}
}
//upload
function Upload (spt, cfg, callBack) {
	var spt = spt, path = cfg.upfilePath, 
		notFix = cfg.upfileSuffix, notCode = cfg.upfileNotCode, callBack = callBack,
		nowFilePath, listKey = {}, _this = this;
	this.Form = {};

	function _Form(headStr) {
		var keyName = headStr.match(/name="([^"]+)"/)[1];
		var fileRegx = new RegExp('filename=".*?([^\\/\\\\]*?)\\.(\\w+)"\\r');
		if(keyName in _this.Form) {
			listKey[keyName] = true;
		} else {
			_this.Form[keyName] = [];
		}
		if(fileRegx.test(headStr)) {
			var fileName = headStr.match(fileRegx);
			if(!notFix.test(fileName[2])) {
				callBack({'error' : 'Upload is error{002}'});
				return false;
			}
			var saveFileName = Sys.md5(Sys.guid());
			nowFilePath = Sys.realPath(path, saveFileName + "." + fileName[2]);
			_this.Form[keyName].push({
				'FileName' : fileName[1],
				'Suffix' : fileName[2],
				'Content-Type' : headStr.match(/Content-Type:\s([\w\/]+)/)[1],
				'saveFileName' : saveFileName,
				'FilePath' : nowFilePath
			});
		} else {
			nowFilePath = keyName;
		}
		return true;
	}
	
	function _End() {
		for(var i in _this.Form) {
			if('FileName' in _this.Form[i][0]) {
				break;
			}
			if(_this.Form[i].length > 1) {
				if(listKey[i]) {
					for(var j = 0; j < _this.Form[i].length; j ++) {
						_this.Form[i][j] = _this.Form[i][j].toString();	
					}
				} else {
					var totalLength = 0, listArray = [];
					for(var j = 0; j < _this.Form[i].length; j ++) {
						totalLength += _this.Form[i][j].length;
						listArray.push(_this.Form[i][j]);
					}
					_this.Form[i] = Buffer.concat(listArray, totalLength).toString();
				}
			} else {
				_this.Form[i] = _this.Form[i].toString();
			}		
		}
	}
	
	function _Write(chunk) {
		if(/^[\w-]+$/.test(nowFilePath)) {
			return _this.Form[nowFilePath].push(chunk);
		} else {
			if(notCode && notCode.test(chunk.toString())) {
				callBack({'error' : 'Upload is error{009}'});
				return false;
			}
			return fs.appendFileSync(nowFilePath, chunk);
		}
	}
	
	this.SaveFile = function(chunk) {
		var StartNum = chunk.indexOf('--' + spt + '\r');
		if(StartNum !== -1) {
			if(StartNum !== 0) {
				_Write(chunk.slice(0, StartNum - 2));
				chunk = chunk.slice(StartNum - 2);
				StartNum = 0;
			}
			var HeadEndNum = chunk.indexOf('\r\n\r\n');
			if(HeadEndNum !== -1) {
				var headStr = chunk.slice(StartNum, HeadEndNum).toString();
				if(_Form(headStr)) {
					return this.SaveFile(chunk.slice(HeadEndNum + 4));
				} else {
					return false;
				}
			}
		}
		var EndNum = chunk.indexOf('--' + spt + '--');
		if(EndNum !== -1) {
			_Write(chunk.slice(0, EndNum - 2));
			return _End();
		} else {
			return _Write(chunk);
		}
	}
}
//sys
var Sys = {
	'addr' : function(req) {
		var headers = req.headers, ipAddress;
		var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
		forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
		return ipAddress || req.connection.remoteAddress;
	},
	
	'date' : function() {
		return new Date().toLocaleString();
	},

	'md5' : function(s) {
		return crypto.createHash('md5').update(s).digest('hex');
	},

	'guid' : function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				 v = c == 'x' ? r : (r & 0x3 | 0x8);
			 return v.toString(16);
		}).toUpperCase();
	},
	
	'realPath' : function(rootPath, filePath) {
		return path.join(rootPath, path.normalize(filePath.replace(/\.\./g, '')));
	},
	
	'log' : function() {
		var args = arguments, i = 0;
		var s = !args[1] ? args[0] : args[0].replace(/%s/g, function() {
			return args[++ i];
		});
		//fs.writeFile('../tpl.log', s + '\r\n', {'flag' : 'a'}, function(e, r) {
			return console.log(s);
		//});
	},
	
	'type' : function(s) {
		var types = {
			'js' : 'application/x-javascript',
			'swf' : 'application/x-shockwave-flash',
			'xhtml' : 'application/xhtml+xml',
			'zip' : ['application/x-zip', 'application/zip', 'application/x-zip-compressed'],
			'rar' : 'application/x-rar-compressed',
			'mp3' : ['audio/mpeg', 'audio/mpg', 'audio/mpeg3', 'audio/mp3'],
			'bmp' : ['image/bmp', 'image/x-windows-bmp'],
			'gif' : 'image/gif',
			'jpeg' : ['image/jpeg', 'image/pjpeg'],
			'jpg' : ['image/jpeg', 'image/pjpeg'],
			'jpe' : ['image/jpeg', 'image/pjpeg'],
			'png' : ['image/png', 'image/x-png'],
			'css' : 'text/css',
			'html' : 'text/html; charset=utf-8',
			'nd' : 'text/html; charset=utf-8',
			'htm' : 'text/html; charset=utf-8',
			'shtml' : 'text/html; charset=utf-8',
			'asp' : 'text/html; charset=utf-8',
			'node' : 'text/html; charset=utf-8',
			'txt' : 'text/plain',
			'text' : 'text/plain',
			'log' : ['text/plain', 'text/x-log'],
			'xml' : 'text/xml',
			'xsl' : 'text/xml',
			'doc' : 'application/msword',
			'docx' : ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip'],
			'xlsx' : ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip'],
			'word' : ['application/msword', 'application/octet-stream'],
			'xl' : 'application/excel',
			'ico' : 'application/octet-stream',
			'json' : ['application/json', 'text/json']
		};
		var rex = /[^\.]*\.(\w+)$/;
		return types[rex.test(s) ? (RegExp.$1 || 'html') : 'html'];
	}
}
module.exports = tpl;