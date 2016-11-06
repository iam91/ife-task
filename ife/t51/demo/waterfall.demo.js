window.onload = function(e){
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
	}

	var gg = zGallery(document.querySelector('.container'));
	gg.setLayout(gg.LAYOUT.WATERFALL);
	gg.setGutter(15);
	gg.init({colCount: 5});
	gg.setImage(urls, title);

	
	document.onscroll = function(e){
		var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		
		if(window.innerHeight + scrollTop >= document.body.clientHeight){
			gg.addImage(appendUrls, appendTitle);
		}
	};
};