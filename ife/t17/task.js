/* 数据格式演示
var aqiSourceData = {
  "北京": {
    "2016-01-01": 10,
    "2016-01-02": 10,
    "2016-01-03": 10,
    "2016-01-04": 10
  }
};
*/

// 以下两个函数用于随机模拟生成测试数据
function getDateStr(dat) {
  var y = dat.getFullYear();
  var m = dat.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = dat.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}
function randomBuildData(seed) {
  var returnData = {};
  var dat = new Date("2016-01-01");
  var datStr = ''
  for (var i = 1; i < 92; i++) {
    datStr = getDateStr(dat);
    returnData[datStr] = Math.ceil(Math.random() * seed);
    dat.setDate(dat.getDate() + 1);
  }
  return returnData;
}

var aqiSourceData = {
  "北京": randomBuildData(500),
  "上海": randomBuildData(300),
  "广州": randomBuildData(200),
  "深圳": randomBuildData(100),
  "成都": randomBuildData(300),
  "西安": randomBuildData(500),
  "福州": randomBuildData(100),
  "厦门": randomBuildData(100),
  "沈阳": randomBuildData(500)
};

// 用于渲染图表的数据
var chartData = {};

// 记录当前页面的表单选项
var pageState = {
  nowSelectCity: -1,
  nowGraTime: "day"
}

var cityIndex = {'-1':null};

var formGraTime = document.getElementById('form-gra-time');
var citySelect = document.getElementById('city-select');
var formGraTime = document.getElementById('form-gra-time');
var aqiChartWrap = document.getElementById('aqi-chart-wrap');

/**
 * 渲染图表
 */
function renderChart(data) {
  aqiChartWrap.innerHTML = '';
  var numOfData = data.length;

  var parse = /(\d+)px/

  var widthTotal = parseInt(parse.exec(getStyle(aqiChartWrap, 'width'))[1]);
  var heightTotal = parseInt(parse.exec(getStyle(aqiChartWrap, 'height'))[1]);

  var max = data.reduce(function(a, b){
    return a[1] > b[1] ? a: b;
  })[1];

  var styleWidth = computeStyleWidth(numOfData, widthTotal);

  var inner = '';

  for(var i = 0; i < numOfData; i++){
    
    inner += '<a title="' + data[i][0] + ': ' + data[i][1] + '"'
          + ' class="bar"'
          + ' style="height: ' + computeStyleHeight(max, data[i][1], heightTotal) + ';'
          + ' width: ' + styleWidth +';'
          + ' background-color: #' + Math.floor(Math.random() * 0xFFFFFF).toString(16) + ';'
          + ' left: ' + i * 100 / numOfData + '%;"></a>';
  }
  aqiChartWrap.innerHTML = inner;
}
function computeStyleHeight(max, curr, heightTotal){
  return (heightTotal * curr / max) + 'px';
}
function computeStyleWidth(numOfData, widthTotal){
  return 'calc(' + (100 / numOfData) + '% - 5px)';
}

/**
 * 日、周、月的radio事件点击时的处理函数
 */
function graTimeChange() {
  // 确定是否选项发生了变化
  var radios = formGraTime.elements['gra-time'];
  var currSelected = radios['value'];
  if(currSelected !== pageState.nowGraTime){
    pageState.nowGraTime = currSelected;
    // 设置对应数据
    var data = chartData[cityIndex[pageState.nowSelectCity]][currSelected];
    // 调用图表渲染函数
    renderChart(data);
  }
}

/**
 * select发生变化时的处理函数
 */
function citySelectChange() {
  // 确定是否选项发生了变化
  var currSelected = citySelect.selectedIndex;
  if(currSelected !== pageState.nowSelectCity){
    pageState.nowSelectCity = currSelected;
    // 设置对应数据
    var data = chartData[cityIndex[pageState.nowSelectCity]][pageState.nowGraTime];
    // 调用图表渲染函数
    renderChart(data);
  }
}

/**
 * 初始化日、周、月的radio事件，当点击时，调用函数graTimeChange
 */
function initGraTimeForm() {
  addHandler(formGraTime, 'change', graTimeChange);
}

/**
 * 初始化城市Select下拉选择框中的选项
 */
function initCitySelector() {
  // 读取aqiSourceData中的城市，然后设置id为city-select的下拉列表中的选项
  var newOption = null;
  for(var city in aqiSourceData){
    newOption = document.createElement('option');
    newOption.innerHTML = city;
    citySelect.add(newOption, undefined);
    cityIndex[newOption.index] = city;
  }
  // 给select设置事件，当选项发生变化时调用函数citySelectChange
  addHandler(citySelect, 'change', citySelectChange);
}

/**
 * 初始化图表需要的数据格式
 */
function initAqiChartData() {
  // 将原始的源数据处理成图表需要的数据格式
  // 处理好的数据存到 chartData 中

  for(var city in aqiSourceData){
    var citySourceData = aqiSourceData[city];
    
    var cityChartMonthData = new Array();
    var cityChartWeekData = new Array();
    var cityChartDayData = new Array();

    var preMonth = null;
    var preWeek = 7;
    var preStartDay = null;
    var preMonthStr = null;

    var monthCnt = 0;
    var weekCnt = 0;

    var monthDataGroup = 0;
    var weekDataGroup = 0;

    for(var date in citySourceData){
      var d = new Date(date);

      //get day data
      cityChartDayData.push([date, citySourceData[date]]);

      //get month data
      if(preMonth !== d.getMonth()){
        if(monthCnt !== 0){
          monthDataGroup = Math.round(monthDataGroup / monthCnt);
          monthCnt = 0;
          cityChartMonthData.push([preMonthStr, monthDataGroup]);
        }
        preMonth = d.getMonth();
        preMonthStr = d.getFullYear() + '-' + d.getMonth();
        monthDataGroup = 0;
      }
      monthDataGroup += citySourceData[date];
      monthCnt++;

      //get week data
      if(preWeek > d.getDay()){
        if(weekCnt !== 0){
          weekDataGroup = Math.round(weekDataGroup / weekCnt);
          weekCnt = 0;
          cityChartWeekData.push([preStartDay, weekDataGroup]);
        }
        preStartDay = date;
        weekDataGroup = 0;
      }
      preWeek = d.getDay();
      weekDataGroup += citySourceData[date];
      weekCnt++;
    }

    //compute the average of the last group of data
    monthDataGroup = Math.round(monthDataGroup / monthCnt);
    cityChartMonthData.push([preMonthStr, monthDataGroup]);
    weekDataGroup = Math.round(weekDataGroup / weekCnt);
    cityChartWeekData.push([preStartDay, weekDataGroup]);

    //assemble data
    chartData[city] = {};

    /* TODO: add sorting */
    chartData[city]['month'] = cityChartMonthData;
    chartData[city]['week'] = cityChartWeekData;
    chartData[city]['day'] = cityChartDayData;
  }
}

/**
 * 初始化函数
 */
function init() {
  initGraTimeForm()
  initCitySelector();
  initAqiChartData();
}

init();