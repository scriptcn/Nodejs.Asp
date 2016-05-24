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
var flist = new Sync();
(function showFlist(path, callBack, finish) {
	flist.echo('<dl>');
	fs.readdir(path, function(e, r){
		(function Next(i) {
			if(i < r.length) {
				var newPath = path + '/' + r[i ++];
				fs.stat(newPath, function(e, sv) {
					if(sv.isDirectory()) {
						flist.echo('<dt>%s</dt>', newPath);
						showFlist(newPath, callBack, function() {
							Next(i);
						});
					} else {
						flist.echo('<dt>%s</dt>', newPath);
						flist.echo('<dd>isDirectory:%s,isFile:%s,size:%s</dd>', sv.isDirectory(), sv.isFile(), sv.size);
						callBack(function() {
							Next(i);
						});
					}
				});
			} else {
				finish && finish();
			}
		})(0);
	});
})('.', function(callBack) {
	callBack();
}, function() {
	flist.echo('</dl>');
	flist.close();
});

fs.readdir('./system/', function(e, r){
	callFunc(r);
});

function callFunc(r) {
	echo(r.join(','));
%>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;"));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>
<%}%>