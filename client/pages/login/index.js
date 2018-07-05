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
        index: 0,
        array: ['请选择地区','山东地区', '华北地区', '华东地区', '西南地区', '西北地区', '华南地区', '华中地区']
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
    formSubmit: function(e){
    	var that = this;
		var Data = e.detail.value;
		var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
		if(app.data.user.userKey){
			Data.userKey = app.data.user.userKey;
		}
		if(Data.comName == ''){
			wx.showToast({
				title: '公司名不能为空',
				icon: 'none',
				duration: 1500
			})
		}else if(Data.area == 0){
			wx.showToast({
				title: '请选择地区',
				icon: 'none',
				duration: 1500
			})
		}else{
			wx.request({
				url: config.service.companyCodeUrl,
				data: Data,
				success: function(res) {
					if(res.data.resultCode == 0){
						wx.setStorageSync('companyCode',res.data.data);
						wx.setStorageSync('firstStepData',Data);
						wx.navigateTo({
						  url: '/pages/login/auth'
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
    }
})
