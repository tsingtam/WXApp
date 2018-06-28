//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var WxParse = require('../../wxParse/wxParse.js')
var app=getApp();

Page({
    data: {
		order:{},
		cartOrderList:[],
		cartId:[],
		totalP:0
    },
	onLoad: function(){
		var that = this;		
		that.setData({
			order:wx.getStorageSync('submitOrder'),
			cartOrderList:wx.getStorageSync('cartInfoSubmit'),
		})
	},
	onShow: function(){
		var that = this;
		var amount = 0;
		var idArray = [];
		var total = parseFloat(that.data.order.price)*parseFloat(that.data.order.amount);
		if(that.data.cartOrderList.length > 0){
			that.data.cartOrderList.forEach(function(i,o){			
				i.value.forEach(function(n,f){				
					amount += parseFloat(n.amount)* parseFloat(n.price)*10000;
					idArray.push(parseInt(n.id));				
				});
			});	
			var total = amount/10000;
		}
		that.setData({
			totalP:total.toFixed(2),
			cartId:idArray
		});
	},
	btnBuy: function(){
		var that = this;
		if(that.data.cartOrderList.length == 0){
			wx.request({
				url: config.service.immediateBuyUrl,
				data: {
					userkey:app.data.user.userKey,
					amount:that.data.order.amount,
					packing:that.data.order.packing,
					warehouse_id:that.data.order.warehouse,
					delivery_type:'1', //自提
					product_id:that.data.order.product.id
				},
				success: function(res) {
					if(res.data.resultCode == 0){
						wx.removeStorageSync('submitOrder');
						wx.showToast({
							title: '下单成功',
							icon: 'success',
							duration: 2000
						});
						wx.switchTab({
						  url: '/pages/order/index'
						})
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			});
		}else{			
			wx.request({
				url: config.service.submitOrderUrl,
				data: {
					userkey:app.data.user.userKey,
					carts_ids:that.data.cartId.join(',')
				},
				/*method:'POST',
				header: {
					'content-type': 'application/x-www-form-urlencoded'
				},*/
				success: function(res) {
					if(res.data.resultCode == 0){
						wx.removeStorageSync('cartInfoSubmit');						
						wx.showToast({
							title: '下单成功',
							icon: 'success',
							duration: 2000
						});
						app.getCartNum(app.data.user.userKey);
						wx.switchTab({
						  url: '/pages/order/index'
						})
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			});
		}
		
	}
})
