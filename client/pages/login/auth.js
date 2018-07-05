//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

var interval = null //倒计时函数

Page({
    data: {
		time:'获取验证码',
		disabled:false,
		currentTime:60,
		
		mobile:'',//获取手机验证码的手机号
		codeShow:true,
        index: 0,
        array: ['请选择地区','山东地区', '华北地区', '华东地区', '西南地区', '西北地区', '华南地区', '华中地区']
    },
	onShow: function(){
		var that = this;
		that.setData({
			codeShow:wx.getStorageSync('companyCode')
		});
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
					}else{
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
			})
		}
	},
    formSubmit: function(e){
    	var that = this;
		var firstStep = wx.getStorageSync('firstStepData');
		var Data = e.detail.value;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
		if(app.data.user.userKey){
			Data.userKey = app.data.user.userKey;
			Data.comName = firstStep.comName;
			Data.area = firstStep.area;
		}
		if(Data.comName == ''){
			wx.showToast({
				title: '公司名不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(Data.comIdCode == '' && that.data.codeShow){
			wx.showToast({
				title: '企业识别码不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(Data.mobile == ''){
			wx.showToast({
				title: '手机号不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(!myreg.test(Data.mobile)){
			wx.showToast({
				title: '手机号有误',
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
							app.data.user.auth = true;
							app.login();
							wx.navigateBack({
								delta:2
							});
						}, 2000);
					}else{
						wx.showToast({
						  title: res.data.msg || '系统繁忙，请稍后再试',
						  icon: 'none',
						  duration: 2000
						});
						/*setTimeout(function(){
							wx.navigateBack();
						}, 2000);*/
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
		}
    }
})
