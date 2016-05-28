<%
var Title = "Nodejs.Asp";
var Name = "Mongodb";
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
var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {auto_reconnect : true});
var db = new mongodb.Db('nodejs', server);

var sync = new Sync();
db.open(function(r, db) {
	//db.authenticate('root', 'root', function(){
		db.createCollection('users', function(e, cln) {
			cln.insert({'name' : Sys.guid(), 'age' : Math.random()});
			cln.find().sort({_id : -1}).toArray(function(e, r) {
				sync.echo('<dl>');
				for(var i = 0; i < r.length; i ++) {
					if(i == r.length - 1) {
						cln.remove({_id : r[i]._id});
					} else {
						sync.echo("<dd>%s,%s,%s</dd>", r[i]._id, r[i].name, r[i].age);
					}
				}
				sync.echo('</dl>');
				sync.close();
			});
		});
	//});
});

%>
	</div>
	<h2>Source:</h2>
	<div class="pre code"><%echo(fs.readFileSync(file).toString().replace(/</g, "&lt;").replace(/\r\n/g, '<br>').replace(/\t/g, Array(8).join("&nbsp;")));%></div>
</div>
<!--include file="foot.html"-->
</body>
</html>