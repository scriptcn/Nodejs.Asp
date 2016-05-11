$(function(){
	$('.code').html(function(){
		return $(this).html().replace(/([\w-]+)(\s*=+\s*['"]*)([^"';,{]+)/gi, function(a, b, c, d) {
			return "<font color='green'><b><i>" + b + "</i></b></font>" + c + "<font color='red'>" + d + "</font>";
		}).replace(/(\w+)\.(\w+)/gi, function(a, b, c) {
			return "<font color='blue'><b><i>" + b + "</i></b></font>.<font color='#ff00ff'><b>" + c + "</b></font>";
		}).replace(/(\w+)\(([^\)]+)/gi, function(a, b, c) {
			return "<font color='#c4c400'><b><i>" + b + "</i></b></font>(<font color='#a6a6d2'><b>" + c + "</b></font>";
		});
	});
});