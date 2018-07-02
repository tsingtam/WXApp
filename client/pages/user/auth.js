//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp();

var interval = null; //倒计时函数

Page({
    data: {
		time:'获取验证码',
		disabled:false,
		currentTime:60,
		mobile:'' //获取手机验证码的手机号
    },
	getTimer: function (options) {
		var that = this;
		var currentTime = that.data.currentTime
		interval = setInterval(function () {
			currentTime--;
			that.setData({
				time: currentTime + '秒'
			})
			if (currentTime <= 0) {
				clearInterval(interval)
				that.setData({
					time: '重新获取',
					currentTime: 60,
					disabled: false
				})
			}
		}, 1000)
	},
    bindPickerChange: function(e) {
        this.setData({
            index: e.detail.value
        })
    },
	getMobile:function(e){
		this.setData({
			mobile:e.detail.value
		});
	},
	getCode: function(e){
		var that = this;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
		if(!myreg.test(that.data.mobile)){
			wx.showToast({
				title: '手机号有误',
				icon: 'none',
				duration: 1500
			})
		}else if(that.data.mobile.length == 0){
			wx.showToast({
				title: '手机号不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(that.data.mobile.length != 11){
			wx.showToast({
				title: '手机号长度有误',
				icon: 'none',
				duration: 1500
			})
		}else{
			wx.request({
				url: config.service.getVerfCodeUrl,
				data: {
					mobile:that.data.mobile
				},
				success: function(res) {	
					console.log(res);
					if(res.data.resultCode == 0){
						that.getTimer();
						that.setData({
							disabled:true
						})
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
		}
	},
    formSubmit: function(e){
    	var that = this;
		var Data = e.detail.value;
		if(app.data.user.userKey){
			Data.userKey = app.data.user.userKey;
		}
		Data.authType = '2';
		if(Data.mobile == ''){
			wx.showToast({
				title: '手机号不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(Data.smsVerfCode == ''){
			wx.showToast({
				title: '手机验证码不能为空',
				icon: 'none',
				duration: 1500
			})
		}else{
			wx.request({
				url: config.service.companyAuthUrl,
				data: Data,
				success: function(res) {
					console.log(res);
					if(res.data.resultCode == 0){
						wx.showToast({
						  title: '认证成功',
						  icon: 'success',
						  duration: 2000
						});
						setTimeout(function(){
							app.login();
							// wx.navigateBack();
							wx.switchTab({
							  url: '/pages/bid/hall'
							});
						}, 2000);
					}else{
						wx.showToast({
						  title: res.data.msg,
						  icon: 'none',
						  duration: 2000
						});
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
		}
    }
})
