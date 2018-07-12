//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({  
	data: {
	},
	onShow: function(){
	},
	agree:function(){ // 我同意
		wx.request({
			url: config.service.licenseUrl,
			data: {
				userkey: app.data.user && app.data.user.userKey
			},
			success: function(res) {
				console.log(res);
				if (res.data.resultCode == 0){
					wx.switchTab({
					  url: '/pages/bid/hall'
					})
				}
				else{
					wx.showToast({
					  title: res.data.msg || '系统繁忙，请稍后再试',
					  icon: 'none',
					  duration: 2000
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	}
})  
