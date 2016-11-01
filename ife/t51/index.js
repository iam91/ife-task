window.onload = function(){
	/////////////////
	/*
	var urls = [];
	for(var i = 1; i <= 22; i++){
		urls.push(i + '.png');
	}
	*/
	/////////////////
	var init = 'http://goss1.asiacn.vcg.com/creative/vcg/800-bigwater/13789000/gic';
	var code = 13789837;
	var urls = [];
	var title = [];
	for(var i = 0; i < 20; i++){
		urls.push(init + (code + i) + '.jpg');
		title.push(String(code + i));
	}
	var appendUrls = [];
	var appendTitle = [];
	for(var i = 20; i < 35; i++){
		appendUrls.push(init + (code + i) + '.jpg');
		appendTitle.push(String(code + i));
	}
	/////////////////
	/*
	var urls = [
			'https://placehold.it/2500x2500/004687',
			'https://placehold.it/2500x1500/b6b6b6',
			'https://placehold.it/3500x4500/ff5a09',
			'https://placehold.it/3500x2500/b81d18',
			'https://placehold.it/2500x2500/004687',
			'https://placehold.it/2500x1500/b6b6b6',
			'https://placehold.it/3500x4500/ff5a09',
			'https://placehold.it/3500x2500/b81d18',
			'https://placehold.it/3500x1500/b81d18',
			'https://placehold.it/3500x1500/f0f0f0',
			'https://placehold.it/3500x4500/b6b6b6',
			'https://placehold.it/3500x3500/004687',
			'https://placehold.it/3500x1500/b81d18',
			'https://placehold.it/3000x1500/202020',
			'https://placehold.it/2500x2500/004687',
			'https://placehold.it/2500x1500/b6b6b6',
			'https://placehold.it/3000x1500/202020',
			'https://placehold.it/3500x1500/f0f0f0',
			'https://placehold.it/3500x4500/b6b6b6',
			'https://placehold.it/3500x3500/004687',
			'https://placehold.it/3500x1500/b81d18',
			'https://placehold.it/3500x4000/202020',
			'https://placehold.it/3500x4500/ff5a09',
			'https://placehold.it/3500x2500/b81d18',
			'https://placehold.it/3500x4500/b6b6b6',
			'https://placehold.it/3500x3500/004687'];*/
	var gg = new g(document.querySelector('.z-gallery'));
	console.log(gg);
	console.log(urls.length)
	//gg.setLayout(gg.LAYOUT.JIGSAW);
	//gg.setLayout(gg.LAYOUT.WATERFALL);
	gg.setLayout(gg.LAYOUT.BRICK);
	gg.setGutter(5);
	gg.init({colCount: 5});
	gg.setImage(urls, title);

	document.onscroll = function(e){
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		
		if(window.innerHeight + scrollTop >= document.body.clientHeight){
			gg.addImage(appendUrls, appendTitle);
		}
	};
};