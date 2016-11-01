window.onload = function(){
	/////////////////
	
	var urls = [];
	for(var i = 1; i <= 22; i++){
		urls.push(i + '.png');
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
	gg.setImage(urls);/*
	function fun(){
		var t = gg.getImageElements();
		//gg.removeImage(t[0]);
		gg.addImage(urls[1]);
	};

	setTimeout(fun, 5000);*/

	//gg.addImage(urls);
/*
	var img = new Array(urls.length);

	for(var i = 0; i < img.length; i++){
		var ig = {img: new Image(), w: 0, h: 0};
		ig.img.src = urls[i];
		img[i] = ig;
		ig.img.onload = function(e){
			console.log('onload: ' + e.target.width + ',' + e.target.height + ',' + (new Date()).getTime());
		};	
	}
	var onready = function(e){
		for(var i = 0; i < img.length; i++){
			if(img[i].img.width != img[i].w){
				console.log('onready: ' + img[i].img.width + ',' + img[i].img.height + ',' + (new Date()).getTime());
				img.splice(i, 1);
				if(img.length == 0){
					clearInterval(timer);
				}
			}
		}
	};
	var timer = setInterval(onready, 40);
*/
};