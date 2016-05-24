<%
var Title = "Nodejs.Asp";
var Name = "adodb";
%><!DOCTYPE html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{$Title} - <%=Name%></title>
<link type="text/css" rel="stylesheet" href="system/style.css" />
<style type="text/css">
.page {width:100%;background:#fafafa;line-height:50px;text-align:center;}
.page span {margin:2px;padding:5px;border:1px solid #ccc;}
.page a:link, .page a:visited {text-decoration:none;}
.page a:hover {color:#cfcfcf;}
</style>
</head>
<body>
<!--include file="head.html"-->
<div class="main">
	<h2>DataList:</h2>
	<div class="pre">
<%
var sync = new Sync();
var mdb = new adodb.page(Request.QueryString["page"], 10);
mdb.Query('SELECT * FROM `Idiom` WHERE ID < 1000 ORDER BY ID ASC', function(data, page) {
	//sync.echo(util.inspect(page));
	sync.echo('<div class="page">%s</div>', page);
	sync.echo('<dl>');
	for(var i = 0; i < data.length; i ++) {
		sync.echo('<dt data-id="%s">%s</dt><dd>%s</dd><dd>%s</dd><dd>%s</dd><dd>%s</dd>', data[i].ID, data[i].Title, data[i].Pinyin, data[i].Shiyi, data[i].From, data[i].Example);
	}
	sync.echo('</dl>');
	sync.echo('<div class="page">%s</div>', page);
	sync.close();
});

%>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;"));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>