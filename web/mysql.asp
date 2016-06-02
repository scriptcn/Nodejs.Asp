<%
var Title = "Nodejs.Asp";
var Name = "Mysql";
%><!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{$Title} - <%=Name%></title>
<link type="text/css" rel="stylesheet" href="system/style.css" />
<style type="text/css">
.page {width:100%;background:#fafafa;line-height:50px;text-align:center;}
.page span {margin:2px;padding:5px;border:1px solid #ccc;}
.page a:link, #pageShow a:visited {text-decoration:none;}
.page a:hover {color:#cfcfcf;}
</style>
</head>
<body>
<!--include file="head.html"-->
<div class="main">
	<h2>DataList:</h2>
	<div class="pre">
<%
var mysql = require('mysql');
var conn = mysql.createConnection({

	'host' : 'localhost',
	'port' : '3306',
	'user' : 'root',
	'password' : 'root',
	'database' : 'xieli'
});
conn.connect();
var sync = new Sync();
conn.query("SELECT * FROM `article`", function(e, r, f) {
	sync.echo('<dl>');
	for(var i = 0; i < r.length; i ++) {
		sync.echo('<dd>%s,%s,%s,%s</dd>', r[i].ID, r[i].Title, r[i].Author, r[i].AddTime);
	}
	sync.echo('</dl>');
	sync.close();
});
conn.end();
%>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;").replace(/\r\n/g, '<br>').replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>