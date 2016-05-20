<%
var Title = "Nodejs.Asp";
var Name = "异步";
/*
异步还是存在一些问题，目前只能做到输出
*/
%><!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{$Title} - <%=Name%></title>
<link type="text/css" rel="stylesheet" href="system/style.css" />
</head>
<body>
<!--include file="head.html"-->
<div class="main">
	<h2>FileList:</h2>
	<div class="pre">
<%
echo('<dl>');
var flist = new aSync();
fs.readdir('./', function(e, r){
	r.forEach(function(v, k) {
		console.log('加上这一句就好了，为何？');
		fs.stat('./' + v, function(e, sv) {
			flist.echo('<dt>./%s</dt>', v);
			flist.echo('<dd>isDirectory:%s,isFile:%s,size:%s</dd>', sv.isDirectory(), sv.isFile(), sv.size);
			if(r.length - 1 === k) {
				flist.close();
			}
		});
	});
});
echo('</dl>');
echo('<dl>');
var slist = new aSync();
fs.readdir('./system/', function(e, r){
	r.forEach(function(v, k) {
		console.log('加上这一句就好了，为何？');
		fs.stat('./system/' + v, function(e, sv) {
			slist.echo('<dt>./system/%s</dt>', v);
			slist.echo('<dd>isDirectory:%s,isFile:%s,size:%s</dd>', sv.isDirectory(), sv.isFile(), sv.size);
			if(r.length - 1 === k) {
				//这里有BUG
				slist.close();
			}
		});
	});
});
echo('</dl>');
%>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync('async.asp').toString().replace(/</g, "&lt;").replace(/\r\n/g, "<br />").replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>