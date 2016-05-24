<%
var Title = "Nodejs.Asp";
var Name = "上传";
if(Request.method == "POST") {
	Request.Form.addr = Request['addr'];
	Request.Form.time = Sys.date();
	Response.setHeaders({"Content-Type" : sys.type('.html')});
	Response.Clear();
	Response.Write("<script type='text/javascript'>parent.callBack('" + JSON.stringify(Request.Form).replace(/'/g, "\\'") + "');</script>");
	Response.End();
}
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link type="text/css" rel="stylesheet" href="system/style.css" />
<title>{$Title} - <%=Name%></title>
<style type="text/css">
iframe {width:0;height:0;border:0;display:none;}
</style>
</head>
<body>
<!--include file="head.html"-->
<div class="main">
<h2>Upload:</h2>
<div class="pre">
	<form method="post" enctype="multipart/form-data" target="ifr">
		<ul>
			<li><input type="text" name="title" value="123456" /></li>
			<li><input type="text" name="author" value="\d/%^&*($#~{};[;':',><>?" /></li>
			<li><input type="checkbox" name="live" value="购物" />购物
				<input type="checkbox" name="live" value="上网" checked="checked" />上网
				<input type="checkbox" name="live" value="体育" />体育
				<input type="checkbox" name="live" value="编程" checked="checked" />编程</li>
			<li><textarea name="content" rows="3" cols="70"><%echo(new Array(10).join(Math.random()));%></textarea></li>
			<li><input type="file" name="file" multiple="multiple" />支持多选</li>
			<li><input type="submit" value="Submit" /></li>
		</ul>
	</form>
	<iframe src="about:blank" name="ifr" frameborder="0"></iframe>
</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;"));%></div>
</div>
<!--include file='foot.html'-->
<script type="text/javascript">
$('form').submit(function(){
	$('input[type=submit]').val('loading...').attr('disabled', 'disabled');
});
function callBack(re) {
	$('input[type=submit]').val('Submit').removeAttr('disabled');
	return alert(re);
}
</script>
</body>
</html>