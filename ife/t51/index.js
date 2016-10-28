window.onload = function(){
	var urls = [
			'https://placehold.it/350x150/b81d18',
			'https://placehold.it/300x150/202020'/*,
			'https://placehold.it/250x250/004687',
			'https://placehold.it/250x150/b6b6b6',
			'https://placehold.it/350x150/f0f0f0',
			'https://placehold.it/350x450/b6b6b6',
			'https://placehold.it/350x350/004687',
			'https://placehold.it/350x150/b81d18',
			'https://placehold.it/300x150/202020',
			'https://placehold.it/250x250/004687',
			'https://placehold.it/250x150/b6b6b6',
			'https://placehold.it/350x450/ff5a09',
			'https://placehold.it/350x250/b81d18',
			'https://placehold.it/350x400/202020',
			'https://placehold.it/350x450/ff5a09',
			'https://placehold.it/350x250/b81d18',
			'https://placehold.it/350x450/b6b6b6',
			'https://placehold.it/350x350/004687'*/];

	var gg = new g(document.querySelector('.z-gallery'));
	console.log(gg);
	gg.setImage(urls);
};