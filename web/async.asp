<%
var Title = "Nodejs.Asp";
var Name = "异步";
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
var flist = new aSync('flist');
fs.readdir('./', function(e, r){
	r.forEach(function(v, k) {
		fs.stat('./' + v, function(e, sv) {
			flist.echo('<dt>./%s</dt>', v);
			for(var i in sv) {
				flist.echo('<dd>%s:%s</dd>', i, sv[i]);
			}
			if(r.length - 1 === k) {
				flist.end();
			}
		});
	});
});
echo('</dl>');
echo('<dl>');
var slist = new aSync('slist');
fs.readdir('./system/', function(e, r){
	r.forEach(function(v, k) {
		fs.stat('./system/' + v, function(e, sv) {
			slist.echo('<dt>./system/%s</dt>', v);
			for(var i in sv) {
				slist.echo('<dd>%s:%s</dd>', i, sv[i]);
			}
			if(r.length - 1 === k) {
				slist.end();
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