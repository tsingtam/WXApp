//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var WxSearch = require('../../wxSearch/search.js');

Page({
  data: {},

  // 搜索栏
  onLoad: function () {
    var that = this;
    WxSearch.init(
      that,  // 本页面一个引用
      ['低钠微晶原粉', '中钠普通原粉', "中钠普通原粉", "中钠普通原粉", '中钠普通原粉', '中钠普通原粉'], // 热点搜索推荐，[]表示不使用
      ['中钠普通原粉', '中钠普通原粉', '中钠普通原粉', "中钠普通原粉"],// 搜索匹配，[]表示不使用
      that.searchProduct, // 搜索回调函数
      that.goback // 取消
    );
  },
  wxSearchInput: WxSearch.wxSearchInput,  // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  // 点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, // 删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear,  // 清空函数

  searchProduct: function (value) {
	console.log(value,'value'); 
	//搜索产品接口操作
  },

  // 返回回调函数
  goback: function (e) {
    // 跳转
	console.log(e,'1111');
    wx.navigateTo({
      url: '../bid/hall'  
    })
  }

})
