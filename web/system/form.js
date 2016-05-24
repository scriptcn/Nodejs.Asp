function PostForm(o) {
	try {
		$.post('', $(o).serialize(), function(re){
			alert(re);
		}, "text");
	} catch(e) {
		console.log(e);
	}
	return false;
}