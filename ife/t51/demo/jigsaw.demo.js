window.onload = function(e){
	var init = 'http://goss1.asiacn.vcg.com/creative/vcg/800-bigwater/13789000/gic';
	var code = 13789837;

	var urls = [init + code + '.jpg'];
	for(var i = 1; i < 2; i++){
		urls.push(init + (code + i) + '.jpg');
	}
	/*
	var base = 'https://placehold.it/3500x1500';
	var urls = [];
	for(var i = 0; i < 2; i++){
		var w = Math.floor(Math.random() * 500);
		var h = Math.floor(Math.random() * 500);
		var url = 'https://placehold.it/' + w + 'x' + h;
		urls.push(url);
	}*/

	var gg = zGallery(document.querySelector('.container'));
	gg.setLayout(gg.LAYOUT.JIGSAW);
	gg.setGutter(15);
	gg.init();
	gg.setImage(urls);

	var btn = document.querySelector('button');
	var add = 1;
	btn.onclick = function(e){
		gg.addImage(init + (code + add) + '.jpg');
		add++;
	};
};