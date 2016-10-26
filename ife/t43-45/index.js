window.onload = function(){
	var g = document.querySelector('.z-jigsaw');
	var w = document.querySelector('.z-waterfall');
	var b = document.querySelector('.z-brick');
	var params = {
		urls: [
			'https://placehold.it/350x150/b81d18',
			'https://placehold.it/300x150/202020',
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
			'https://placehold.it/350x350/004687']
	};
	var z = new zj(g, params);
	var zz = new zw(w, params);
	var zzz = new zb(b, params);
	zzz.fetchPic();
	/*
	document.onscroll = function(e){
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		
		if(window.innerHeight + scrollTop >= document.body.clientHeight){
			if(zz.allLoaded()){
				zz.loadMore(params.urls);
			}
		}
	};*/
};