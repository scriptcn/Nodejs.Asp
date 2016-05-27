<%
var Title = "Nodejs.Asp";
var Name = "sqlite";

function _unhtml(str) {
	return !str ? '' : str.replace(/([<|>| ])/g, function(a, b) {
		return "&#" + b.charCodeAt(0) + ";";
	});
}
function _hideIP(str) {
	return str.replace(/(\.\d+\.\d+)$/, function(a, b) {
		return b.replace(/\d/g, '*');
	});
}
if(Request.method == "POST") {
	var username = Request.Form['user'];
	var content = Request.Form['content'];
	var timer = Sys.date();
	var addr = Request['addr'];
	var add = new Sync();
	add.clear();
	//sqlite.conn.run("DELETE FROM `Message` WHERE `ID` IN (4, 5)");
	if(!/^\S{2,10}$/.test(username)) {
		return add.exit("名称限制为2-10位字符");
	}
	if(!/^[\s\S]{3,500}$/.test(content)) {
		return add.exit("内容限制为3-500位字符");
	}
	sqlite.conn.run("INSERT INTO `Message`(`Username`, `Timer`, `IPAddr`, `Content`) VALUES(?, ?, ?, ?);", [_unhtml(username), timer, addr, _unhtml(content)], function(e, r) {
		if(this.lastID) {
			sqlite.conn.get("SELECT * FROM `Message` WHERE `ID` = ?", [this.lastID], function(e, r) {
				return add.exit(JSON.stringify(r));
			});
		} else {
			return add.exit('留言失败');
		}
	});
}
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
<script type="text/javascript">
function PostForm(o) {
	$.post('', $(o).serialize(), function(re){
		if(re.indexOf('{') !== -1) {
			alert(re);
			location.reload();
		} else {
			alert(re);
		}
	}, "text");
	return false;
}
</script>
<div class="main">
	<h2>Message:</h2>
	<div class="pre">
<%
var sync = new Sync();
sync.echo('<dl>');
var db3 = new sqlite.page(Request.QueryString["page"], 10);
db3.Query('SELECT * FROM `Message` ORDER BY `ID` DESC', function(data, page) {
	sync.echo('<dl>');
	for(var i = 0; i < data.length; i ++) {
		sync.echo("<dt data-ID='%s'>网友<font color='blue'>%s</font>来自:%s,发表于:%s</dt><dd>%s</dd>", data[i].ID, data[i].Username, _hideIP(data[i].IPAddr), data[i].Timer, data[i].Content.replace(/\r\n/gi, '<br />'));
	}
	sync.echo('</dl>');
	sync.echo('<div class="page">%s</div>', page);
	sync.close();
});
%>
	</div>
	<h2>PostMessage:</h3>
	<div class='pre'>
		<form method="post" onsubmit="return PostForm(this);">
			<ul>
				<li>Username:</li>
				<li><input type="text" name="user" value="" /></li>
				<li>Message:</li>
				<li><textarea name="content" rows="3" cols="70"></textarea></li>
				<li><input type="submit" value="Submit" /></li>
			</ul>
		</form>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;").replace(/\r\n/g, '<br>').replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>