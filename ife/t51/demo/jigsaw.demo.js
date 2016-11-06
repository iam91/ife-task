window.onload = function(e){
	var init = 'http://goss1.asiacn.vcg.com/creative/vcg/800-bigwater/13789000/gic';
	var code = 13789837;

	var urls = [init + code + '.jpg'];

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