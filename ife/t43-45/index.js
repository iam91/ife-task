window.onload = function(){
	var g = document.querySelector('.z-jigsaw');
	var params = {
		count: 1,
		urls: [
			/*'https://placehold.it/350x150/b81d18',
			'https://placehold.it/350x150/202020',
			'https://placehold.it/350x150/004687',
			'https://placehold.it/350x150/b6b6b6',*/
			'https://placehold.it/350x150/f0f0f0',
			'https://placehold.it/350x150/ff5a09']
	};
	var z = new zj(g, params);
};