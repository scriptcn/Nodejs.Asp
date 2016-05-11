<div class="main">
<h2>什么是<label>Nodejs.Asp</label>？</h2>
<div class='pre'>
<label>Nodejs.Asp</label>是基于Nodejs开发的WEB服务器，支持或模拟大部分ASP（JScript.asp）的结构、语法风格。但绝不等同于Microsoft ASP。
</div>
<h2><label>Nodejs.Asp</label>如何构造文件结构？</h2>
<div class='pre'>
和大多Script后端语言一样，在工作目录建立.asp或.node文件即可，支持ssi，支持无后缀名映射，支持静态文件缓存。<br />
<pre style="font-size:16px;font-family:Fixedsys;line-height:16px;">
NODEJS.ASP
│
│  server.js
│  start.bat
│  tpl.js
│  
└─web
    │  favicon.ico
    │  foot.html
    │  form.node
    │  head.html
    │  index.asp
    │  list.node
    │  upload.asp
    │  
    ├─images
    │      logo.png
    │      
    ├─system
    │      form.js
    │      style.css
    │      system.js
    │      
    └─upfile
</pre>
</div>
<h2><label>Nodejs.Asp</label>如何编码？</h2>
<div class='pre'>
	<dl>
	<dt>include:</dt>
		<dd>&lt!--include file="inc.html"--&gt;</dd>
		<dd>或者自定义引用格式如：{#include(inc.html)}</dd>
	<dt>tag:</dt>
		<dd>&lt% Nodejs code %&gt;</dd>
		<dd>或者自定义引用格式如：&lt;? ... ?&gt;</dd>
	<dt>Application:</dt>
		<dd>Application(key, value);	//赋值</dd>
		<dd>Application(key);	//读取</dd>
		<dd>Application.del(key);	//删除</dd>
		<dd>Application.del();	//清空Application对象</dd>
	<dt>Session:</dt>
		<dd>Session(key, value);	//赋值</dd>
		<dd>Session(key);	//读取</dd>
		<dd>Session.del(key);	//删除</dd>
		<dd>Session.del();	//清空用户Session对象</dd>
	<dt>Cookie:</dt>
		<dd>Cookie(key, value);	//赋值</dd>
		<dd>Cookie(key);	//读取</dd>
		<dd>Cookie.del(key);	//删除</dd>
	<dt>Request:</dt>
		<dd>Request.QueryString是一个json对象，例如：{"action":"tpl","mode":"test"}</dd>
		<dd>Request.Form是一个json对象，例如：{"user":"访客 ","age":"38","live":["上网","编程"],"city":"武汉","content":"这家伙很懒，什么都没说！","addr":"127.0.0.1"}</dd>
		<dd>Request['addr'];	//客户端ip</dd>
		<dd>其它，可查询Nodejs Request标准对象</dd>
	<dt>Response:</dt>
		<dd>Response.Write(注意w大写)，输出内容，等同于echo(<label>Nodejs.Asp</label>内置输出函数)</dd>
		<dd>Response.Clear，清空缓冲区</dd>
		<dd>Response.End，终止输出</dd>
		<dd>Response.setHeaders，设置headers</dd>
		<dd>Response.writeHead、Response.write、Response.end等参考Nodejs Response标准对象</dd>
	<dt><label>Nodejs.Asp</label>内置方法</dt>
		<dd>echo("string%sNumber%s", 'a', 1);	//输出，支持%s变量替换</dd>
		<dd>clear();	//同Response.Clear</dd>
		<dd>exit();	//同Response.End</dd>
		<dd>Sys.date();	//服务器事件</dd>
		<dd>Sys.md5(str);	//md5</dd>
		<dd>Sys.guid();	//获取一个唯一值</dd>
		<dd>Sys.?更多扩展可参考源码</dd>
	<dt>Nodejs系统对象</dt>
		<dd>fs = require('fs')</dd>
		<dd>url = require('url')</dd>
		<dd>query = require('querystring')</dd>
		<dd>以上对象可以直接使用，如：</dd>
		<dd>fs.writeFile('log.txt', Str, function(err, data) {}</dd>
		<dd>可以在页面直接使用require方法，支持node_modules和.js扩展。如：</dd>
		<dd>var io = require('socket.io');</dd>
	<dt>Upload:</dt>
		<dd>无组件文件上传，支持多文件，可查看本站提供的<a href='upload'>DEMO页面</a></dd>
	</dl>
</div>
<h2><label>Nodejs.Asp</label>目前未实现的有哪些？</h2>
<div class='pre'>
	<label>Nodejs.Asp</label>不支持ActiveX控件，但Nodejs拥有强大的第三方node_modules的支持，足以弥补不支持ActiveX的遗憾。
	不支持异步调用回调函数输出到页面，支持console输出到控制台。建议使用同步操作。
</div>
<h3>感谢您的阅读！</h3>
biyuan
22775114@qq.com
2016.05.11 12:52
<div>
