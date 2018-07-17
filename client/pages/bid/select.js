//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({  
	data: {
		selectList:[],
		haveActive:false,
		cateName:'',
		parentName:'',
		useName:'',
		commonName:''
	},
	onLoad:function(query){
		var that = this;
		that.setData({
			selectList:wx.getStorageSync('childName'),
			cateName:wx.getStorageSync('cateName'),
			useName:wx.getStorageSync('usesName'),
			parentName:wx.getStorageSync('parentName')
		});
		
	},
	onShow:function(){
		var that = this;
		if(wx.getStorageSync('parentName') == '品种'){
			that.setData({
				commonName: wx.getStorageSync('selectCate')
			});
		}else{
			that.setData({
				commonName: wx.getStorageSync('selectUse')
			});
		}
		if(that.data.parentName != '' && that.data.commonName == ''){
			that.setData({
				haveActive:true
			});
		}else{
			that.setData({
				haveActive:false
			});
		}
		/*if((that.data.parentName == '品种' && that.data.cateName == '')||(that.data.parentName == '用途' && that.data.useName == '')){
			that.setData({
				haveActive:true
			});
		}else if((that.data.parentName == '品种' && that.data.cateName != '') || (that.data.parentName == '用途' && that.data.useName != '')){
			that.setData({
				haveActive:false
			});
		}*/
	},
	selecter: function(e){
		var that = this;
		var name = e.currentTarget.dataset.name;
		if(wx.getStorageSync('parentName') == '品种'){
			wx.removeStorageSync('selectCateName');
			wx.removeStorageSync('selectCate');
			wx.setStorageSync('selectCateName',name);
			wx.setStorageSync('selectCate',name);
		}else if(wx.getStorageSync('parentName') == '用途'){
			wx.removeStorageSync('selectUseName');
			wx.removeStorageSync('selectUse');
			wx.setStorageSync('selectUseName',name);
			wx.setStorageSync('selectUse',name);
		}
		wx.navigateBack({
		  delta: 1
		});
	}
})  
