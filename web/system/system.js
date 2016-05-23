$(function(){
	$('.code').html(function(){
		var i = 0;
		return '<table>' + $(this).html().replace(/([\w-]+)(\s*=+\s*['"]*)([^"';,{]+)/gi, function(a, b, c, d) {
			return "<font color='green'><b><i>" + b + "</i></b></font>" + c + "<font color='red'>" + d + "</font>";
		}).replace(/(\w+)\.(\w+)/gi, function(a, b, c) {
			return "<font color='blue'><b><i>" + b + "</i></b></font>.<font color='#000'><b>" + c + "</b></font>";
		}).replace(/(\w+)\(([^\)]+)/gi, function(a, b, c) {
			return "<font color='#c4c400'><b><i>" + b + "</i></b></font>(<font color='#af00ac'><b>" + c + "</b></font>";
		}).replace(/(\/\/.*?)(?=<br[^>]*>)/g, function(a, b) {
			return "<font color='#ccc'><i>" + b.replace(/<[^>]+>/g, '') + "</i></font>";
		}).replace(/(\/\*[\s\S]*?\*\/)/g, function(a, b) {
			return b.replace(/(.*?)(<br[^>]*>|$)/g, function(a, b, c) {
				return "<font color='#ccc'><i>" + b.replace(/<[^>]+>/g, '') + "</i></font>" + c;
			});
		}).replace(/(.*?)<br[^>]*>|(.+?)$/g, function(a, b, c) {
			return "<tr><th valign='top'>" + ++ i + "</th><td>" + (b || c || '') + "</td></tr>";
		}) + '</table>';
	});
});