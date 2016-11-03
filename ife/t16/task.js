/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
	var aqiCityInput = document.getElementById('aqi-city-input');
	var aqiValueInput = document.getElementById('aqi-value-input');

	var trim = /\s+/g;

	var cityRaw = aqiCityInput.value.replace(trim, '');
	var valueRaw = aqiValueInput.value.replace(trim, '');

	var cityNorm = /^[\u4e00-\u9fa5, a-z, A-Z]+$/;
	var valueNorm = /^\d+$/;

	if(!cityNorm.test(cityRaw)){
		alert('City can only be English or Chinese characters!');
	}
	else if(!valueNorm.test(valueRaw)){
		alert('Value can only be an integer!');
	}
	else{
		var value = parseInt(valueRaw);
		if(value < 0 || value > 500){
			alert('Value can only be an integer from 0 to 500!');
		}
		else{
			aqiData[cityRaw] = value;
		}
	}
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
	
	var aqiTable = document.getElementById('aqi-table');
	var inner = '<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>';
	for(var city in aqiData){
		inner +=  '<tr><td>' + city + '</td><td>' + aqiData[city] + '</td><td><button>删除</button></td></tr>';
	}
	aqiTable.innerHTML = inner;
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  addAqiData();
  renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(event) {
  // do sth.
  var target = event.target;
  if(target.nodeName === 'BUTTON'){
  	var city = target.parentNode.parentNode.firstChild.innerHTML;
  	delete aqiData[city];
  }
  renderAqiList();
}

/**
 * function for adding event handler
 */
function addHandler(elem, type, handler){
	if(elem.attachEvent){
		elem.attachEvent('on' + type, handler);
	}
	else if(elem.addEventListener){
		elem.addEventListener(type, handler, false);
	}
	else{
		elem['on' + type] = handler;
	}
}

function init() {

  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
  var addBtn = document.getElementById('add-btn');
  var aqiTable = document.getElementById('aqi-table');
  addHandler(addBtn, 'click', addBtnHandle);
  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  addHandler(aqiTable, 'click', delBtnHandle);
}

init();