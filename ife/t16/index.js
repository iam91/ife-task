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
 * viewRefer，存储数据对应节点
 * 示例格式：
 * viewRefer = {
 *    "北京": node,
 *    "上海": node
 * };
 */
var viewRefer = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
var aqiCityInput = document.getElementById('aqi-city-input');
var aqiValueInput = document.getElementById('aqi-value-input');
var aqiTable = document.getElementById('aqi-table');

function addAqiData() {

	var trim = /\s+/g;

	var cityRaw = aqiCityInput.value.replace(trim, '');
	var valueRaw = aqiValueInput.value.replace(trim, '');

	var cityNorm = /^[\u4e00-\u9fa5, a-z, A-Z]+$/;
	var valueNorm = /^\d+$/;

	if(!cityNorm.test(cityRaw)){
		alert('City can only be English or Chinese characters!');
		return null;
	}
	else if(!valueNorm.test(valueRaw)){
		alert('Value can only be an integer!');
		return null;
	}
	else{
		var value = parseInt(valueRaw);
		if(value < 0 || value > 500){
			alert('Value can only be an integer from 0 to 500!');
			return null;
		}
		else{
			aqiData[cityRaw] = value;
			return cityRaw;
		}
	}
}

function render(city, isDelete){
	if(isDelete){
		//delete data
		aqiTable.removeChild(viewRefer[city]);
  		delete aqiData[city];
  		delete viewRefer[city];
	}
	else{
		//add data
		//create new node for new data
		var newRow = document.createElement('tr');
		var value = aqiData[city];
		newRow.innerHTML = '<td>' + city + '</td><td>' + value + '</td><td><button>删除</button></td>';

		var old = viewRefer[city];
		//render
		if(old){
			aqiTable.replaceChild(newRow, old);
		}
		else{
			aqiTable.appendChild(newRow);
			viewRefer[city] = newRow;
		}
	}
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  var dataIndex = addAqiData();
  if(dataIndex !== null){
  	render(dataIndex, false);
  }
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
  	render(city, true);
  }
}

function init() {
  var addBtn = document.getElementById('add-btn');
  var aqiTable = document.getElementById('aqi-table');
  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数
  addHandler(addBtn, 'click', addBtnHandle);
  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  addHandler(aqiTable, 'click', delBtnHandle);
}

init();