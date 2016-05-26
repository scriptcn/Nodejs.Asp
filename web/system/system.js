$(function(){
	$('.code').html(function(){
		var i = 0;
		return '<table>' + $(this).html().replace(/([\w-]+)(\s*=+\s*['"]*)([^"';,{\(\[]+)/gi, function(a, b, c, d) {
			return "<font color='green'><b><i>" + b + "</i></b></font>" + c + "<font color='red'>" + d + "</font>";
		}).replace(/(\w+)\.(\w+)/gi, function(a, b, c) {
			return "<font color='blue'><b><i>" + b + "</i></b></font>.<font color='#000'><b>" + c + "</b></font>";
		}).replace(/(\w+)\(([^\(\)]+)/gi, function(a, b, c) {
			return "<font color='#c4c400'><b><i>" + b + "</i></b></font>(<font color='#af00ac'><b>" + c + "</b></font>";
		}).replace(/(\/\/.*?)(?=<br>)/gi, function(a, b) {
			return "<font color='#ccc'><i>" + b.replace(/<[^>]+>/g, '') + "</i></font>";
		}).replace(/(\/\*[\s\S]*?\*\/)/g, function(a, b) {
			return b.replace(/(.*?)(<br>|$)/gi, function(a, b, c) {
				return "<font color='#ccc'><i>" + b.replace(/<[^>]+>/g, '') + "</i></font>" + c;
			});
		}).replace(/(.*?)<br>|(.+?)$/gi, function(a, b, c) {
			return "<tr><th valign='top'>" + ++ i + "</th><td>" + (b || c || '') + "</td></tr>";
		}) + '</table>';
	});
	$(window).on('scroll', function () {
		FloatDiv("#float1");
	});
});
function FloatDiv(o){
	var xtop = $(document).scrollTop();
	$(o).css('display', xtop > 10 ? 'block' : 'none');
	if(!-[1,] && !window.XMLHttpRequest){
		$(o).css('top', '100%');
		$(o).css('marginTop', parseFloat(xtop) - parseFloat($(o).height()) - 1 + "px");
	}
}