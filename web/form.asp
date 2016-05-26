<%
var Title = "Nodejs.Asp";
var Name = "表单";

if(Request.method == "POST") {
	Request.Form.addr = Request['addr'];
	Request.Form.time = Sys.date();
	//fs.writeFileSync("log.txt", JSON.stringify(Request.Form) + "\r\n", {'flag' : 'a'});
	Response.Clear();
	Response.Write(JSON.stringify(Request.Form));
	Response.End();
}
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{$Title} - <%=Name%></title>
<link type="text/css" rel="stylesheet" href="system/style.css" />
</head>
<body>
<!--include file="head.html"-->
<script type="text/javascript" src="system/form.js"></script>
<div class="main">
<h2>Form:</h2>
<div class="pre">
	<form method="post" onsubmit="return PostForm(this);">
		<ul>
			<li><input type="text" name="user" value="访客" /></li>
			<li><input type="text" name="age" value="38" /></li>
			<li><input type="radio" name="sex" value="男" />男
				<input type="radio" name="sex" value="女" />女</li>
			<li><input type="checkbox" name="live" value="购物" />购物
				<input type="checkbox" name="live" value="上网" checked="checked" />上网
				<input type="checkbox" name="live" value="体育" />体育
				<input type="checkbox" name="live" value="编程" checked="checked" />编程</li>
			<li><select name="city">
				<option value="武汉">武汉</option>
				<option value="北京">北京</option></select></li>
			<li><textarea name="content" rows="3" cols="70">这家伙很懒，什么都没说！</textarea></li>
			<li><input type="submit" value="Submit" /></li>
		</ul>
	</form>
</div>
<h2>Cookies&Session&Application:</h2>
<div class="pre">
	Cookies('key') : {$Cookies('key');}<br />
	Cookies('SessionID') : {$Cookies('SessionID');}<br />
	Session('login') : {$Session('login');}<br />
	Session('author') : {$Session('author');}<br />
	Application('login') : {$Application('login');}<br />
	{$Application('test') || 'notestapp';}
</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;").replace(/\r\n/g, '<br>').replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>