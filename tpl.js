"use strict";

var fs = require('fs'),
	url = require('url'),
	crypto = require('crypto'),
	query = require('querystring'),
	__PageData__ = {
		'cache' : {},
		'sess' : {},
		'memory' : {}
	};
//tpl
function tpl(_req, _res) {
	var req = _req, res = _res, sys, callBack, file, _this = this, sys = Sys;
	var cfg = {
		'rootPath' 	: '.\\',
		'upfilePath'	: '.\\upfile\\',
		'serverName'	: 'BiyuanWebserver',
		'minSource'	: false,
		'indexPage'	: '/index.asp',
		'notSuffix'	: '.asp',
		'contentMax'	: 100 * 1024 * 1024,
		'scriptTag' 	: new Array('<%', '%>'),
		'includeTag'	: new Array('<!--include file=', '-->'),
		'scriptFolder'	: new RegExp('^(\\/|\\/manage\\/)\\w+\\.(asp|node)$', 'i'),
		'cacheSuffix'	: new RegExp('\\.(jpg|gif|png)$', 'i'),
		'upfileSuffix'	: new RegExp('^(rar|zip|jpg|jpeg|gif|png)$', 'i'),
		'upfileNotCode'	: new RegExp('(eval|execute|function|form|querystring)', 'i')
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
			console.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, input.body);
		}
		res.writeHead(header.code, header.head);
		res.end(input.body);
		return callBack(true);
	}
	
	this.Init = function(_callBack) {
		callBack = _callBack;
		var urls = url.parse(req.url, true);
		file = urls.pathname == '/' ? cfg.indexPage : urls.pathname;
		/^\/([^\/]+\/)?(\w+)$/.test(file) && (file += cfg.notSuffix);
		if(req.headers['content-length'] > cfg.contentMax) {
			return _Output({
				'code' : 200,
				'body' : 'Information is too long'
			});
		}
		req.QueryString = urls.query;
		if(req.method == 'POST') {
			if(/^multipart\/form-data; boundary=(.+)$/.test(req.headers['content-type'])) {
				var isDestroy = false;
				var upload = new Upload(RegExp.$1, cfg, function(rbody){
					isDestroy = rbody;	
				});
				req.on('data', function(chunk){
					/*
					if(isDestroy) {
						return _Output({
							'code' : 200,
							'body' : isDestroy
						});
					} else {
					*/
						upload.SaveFile(chunk);
					//}
				});
				req.on('end', function(){
					if(isDestroy) {
						req.Form = isDestroy;	
					} else {
						req.Form = upload.Form;	
					}
					upload = null;
					return _LoadPage(function(rBody) {
						return _Output(rBody);
					});
				});
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
		} else {
			return _LoadPage(function(rBody) {
				return _Output(rBody);
			});
		}
	}
	
	function _LoadPage(_callBack) {
		if(__PageData__.cache[file]) {
			return _callBack({
				'code' : 200,
				'head' : {'Content-Type' : Sys.type(file)},
				'body' : __PageData__.cache[file]
			});
		}
		fs.readFile(cfg.rootPath + file, function(err, data) {
			if(err) {
				return _callBack({
					'body' : '404: File Not Found'
				});
			}
			if(cfg.scriptFolder.test(file)) {
				console.log("%s\t%s\t%s\t%s", Sys.date(), Sys.addr(req), req.url, req.method);
				data = _Parse(data.toString());	
			}
			if(cfg.cacheSuffix.test(file)) {
				__PageData__.cache[file] = data;
			}
			return _callBack({
				'code' : 200, 
				'head' : {'Content-Type' : Sys.type(file), '__PageData__.cache-Control' : 'no-__PageData__.cache'},
				'body' : data
			});
		});
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
				Res.setHeader({'Set-Cookie' : [k + '=' + v]});
			}
			return k ? (re[k] || '') : re;
		}
	}
	
	function _Session(_Cookies) {
		var id = _Cookies('SessionID') || _Cookies('SessionID', Sys.md5(Sys.guid()));
		__PageData__.sess[id] = __PageData__.sess[id] || {};
		return function(k, v, d) {
			if(d == 'del') {
				return k ? (delete __PageData__.sess[id][k]) : (delete __PageData__.sess[id], _Cookies('SessionID', '', 'del'));
			}
			if(!v) {
				return __PageData__.sess[id][k];
			} else {
				__PageData__.sess[id][k] = v;
			}
		}
	}

	function _Application(k, v, d) {
		if(d == 'del') {
			return k ? delete __PageData__.memory[k] : __PageData__.memory = {};
		}
		if(!v) {
			return __PageData__.memory[k];
		} else {
			__PageData__.memory[k] = v;
		}
	}
	
	function _Parse(data) {
		var re = [], sTag = cfg.scriptTag, iTag = cfg.includeTag;
		var Request = req, Response = res, head = {};
		Response.setHeader = function(setHead) {
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
		Response.Write = echo;
		Response.Clear = clear;
		Response.End = exit;
		
		function clear() {
			re.length = 0;
		}
		function exit(str) {
			if(str) re.push(str);
			re.push("{{{{end}}}}");	//这个地方还需要斟酌
		}
		function echo () {
			var args = arguments, i = 0;
			return re.push(!args[1] ? args[0] : args[0].replace(/%s/g, function() {
				return args[++ i];
			}));
		}
		try {
			eval(data.replace(new RegExp(iTag[0] + '(\'|")([^\'"]+)\\1;?' + iTag[1], 'gi'), function(a, b, c){
				return fs.readFileSync(cfg.rootPath + c);
			}).replace(new RegExp(sTag[0] + '=([^;%]+);?' + sTag[1] + '|{\\$([^;}]+);?}', 'g'), function(a, b, c) {
				return "<%echo(" + (b || c) + ");%>";
			}).replace(new RegExp('(^|' + sTag[1] + ')([\\s\\S]*?)(' + sTag[0] + '|$)', 'g'), function(a, b, c) {
				return !c ? '' : 'echo("' + c.replace(/"/g, '\\"').replace(/\r\n/g, '\\r\\n') + '");';
			}));
		} catch(e) {
			re = ['Page error!', Request.url, e.name, e.message];
		}
		re = re.join('');
		_SetHeader({'head' : head});
		return (cfg.minSource ? re.replace(/\r\n|\t/g, '') : re).split("{{{{end}}}}")[0];
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
				callBack({'error' : 'Upload is error{002}!'});
				//return false;
			}
			var saveFileName = Sys.md5(Sys.guid());
			nowFilePath = path + saveFileName + "." + fileName[2];
			_this.Form[keyName].push({
				'FileName' : fileName[1],
				'Suffix' : fileName[2],
				'Content-Type' : headStr.match(/Content-Type:\s([\w\/-]+)/)[1],
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
			if(notCode.test(chunk.toString())) {
				callBack({'error' : 'Upload is error{009}!'});
				//return false;
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
	
	'type' : function(s) {
		var types = {
			'js' : 'application/x-javascript',
			'swf' : 'application/x-shockwave-flash',
			'xhtml' : 'application/xhtml+xml',
			'zip' : ['application/x-zip', 'application/zip', 'application/x-zip-compressed'],
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
			'json' : ['application/json', 'text/json']
		};
		var rex = /[^\.]*\.(\w+)$/;
		return types[rex.test(s) ? (RegExp.$1 || 'html') : 'html'];
	}
}
module.exports = tpl;
