<%
var Title = "Nodejs.Asp";
var Name = "模版";
%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link type="text/css" rel="stylesheet" href="system/style.css" />
<title>{$Title} - <%=Name%></title>
</head>
<body>
<!--include file="head.html"-->
<div class="main">
<h2>Output:</h2>
<div class="pre">
	<div style="color:red;">{$JSON.stringify(Request.QueryString);}</div>
<%
	echo(require("os").platform());
	echo("<br />");
	Cookies('key', '中文汉字');
	Cookies('key2', 'value');
	echo("cookies:%s", JSON.stringify(Cookies()));
	echo("<br />");

	Session('login', 'admin');
	Session('author', 'biyuan');
	echo(Session('login'));
	echo('<br />');
	echo(Session.del('login'));
	echo('<br />');

	Application('sys', 'application');
	Application('login', 'applogin');

	var list = {a : 1, b : 2, c : 3};
%>
	<ul>
<%
for(var i in list) {
	print("<li>%s+" + i + ":" + list[i] + "</li>", Cookies('key'));
}
Response.Write(Application('sys'));
Application.del('sys');
echo("<br />");
echo(Application('sys') || "no");
%>
	</ul>
<%
	if(Name == '模版') {
		Response.Write("<div>%s</div>", Name);
	} else if(Name == 'rimifon') {
		Response.Write("<div>{Name}</div>");
	} else {
		echo("<div>false</div>");
	}
%>

<%for(var i = 0; i < 5; i ++) {%>
	<div>{$i}
<%
	Response.Write("this %s : %s</div>", 'is', i);
}
%>
</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;").replace(/\r\n/g, '<br>').replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>