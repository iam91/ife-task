window.onload = function(e){/*
	var init = 'http://goss1.asiacn.vcg.com/creative/vcg/800-bigwater/13789000/gic';
	var code = 13789837;

	var urls = [];
	var title = [];
	for(var i = 20; i < 35; i++){
		urls.push(init + (code + i) + '.jpg');
		title.push(String(code + i));
	}
	
	var appendUrls = [];
	var appendTitle = [];
	for(var i = 0; i < 20; i++){
		appendUrls.push(init + (code + i) + '.jpg');
		appendTitle.push(String(code + i));
	}*/

	var base = 'https://placehold.it/3500x1500';
	var urls = [];
	for(var i = 0; i < 20; i++){
		var w = Math.floor(100 + Math.random() * 200);
		var h = Math.floor(100 + Math.random() * 200);
		var url = 'https://placehold.it/' + w + 'x' + h;
		urls.push(url);
	}

	var gg = zGallery(document.querySelector('.container'));
	gg.setLayout(gg.LAYOUT.BRICK);
	gg.setGutter(15);
	gg.init();
	gg.setImage(urls);

	
	document.onscroll = function(e){
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		
		if(window.innerHeight + scrollTop >= document.body.clientHeight){
			gg.addImage(appendUrls, appendTitle);
		}
	};
};