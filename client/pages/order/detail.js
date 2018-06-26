//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp()

Page({
    data: {
		orderDetail:{}
    },
    onLoad: function (query) {
		var that = this;
		var order_id = query.id;
		wx.request({
			url: config.service.orderDetailUrl,
			data: {
				userkey:app.data.user.userKey,
				order_id:order_id
			},
			success: function(res) {
				console.log(res.data.data);
				that.setData({
					orderDetail:res.data.data					
				});
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
    }
})
