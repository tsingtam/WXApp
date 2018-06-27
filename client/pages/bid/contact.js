//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({  
	data: {
	},
	onLoad:function(query){
	},
    calling: function(e){ // 拨打电话
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        });
    }
})  
