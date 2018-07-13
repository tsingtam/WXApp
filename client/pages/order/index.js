//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

var totalPage = 1;

Page({
    data: {
		order:{
			orderList:[]
		},
		isNoMore:false,
		allOrders:1,
		payOrders:0,
		sendOrders:0,
		receiveOrders:0,
		invoiceOrders:0
    },
	onLoad: function(){
		//this.onShow();
	},
	onShow: function(){
		this.getOrderList();
		if(wx.getStorageSync('cartNum') == '0'){
			wx.removeTabBarBadge({
				index: 1
			});
		}else{
			wx.setTabBarBadge({
				index:1,
				text:wx.getStorageSync('cartNum')
			});
		}
	},
	getOrderList: function(){
		var that = this;		
		wx.request({
			url: config.service.orderListUrl,
			data: {
				userkey:app.data.user.userKey				
			},
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data.length > 0){
					totalPage = 1;
					that.setData({
						order:{
							orderList:res.data.data
						},
						isNoMore:false
					});
				}
                wx.stopPullDownRefresh();
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	onPullDownRefresh: function(){
        this.getOrderList();
    },
	onReachBottom: function(){
		var that = this;
		totalPage++;
		if(!that.data.isNoMore){
			wx.request({
				url: config.service.orderListUrl,
				data: {
					userkey:app.data.user.userKey,
					page:totalPage
				},
				success: function(res) {
					if(res.data.resultCode == 0 && res.data.data.length > 0){
						that.setData({
							order:{
								orderList:that.data.order.orderList.concat(res.data.data)
							}
						});
					}else{
						that.setData({
							isNoMore:true
						});
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			});
		}
	},
	againBuy: function(){
        wx.switchTab({
            url:'/pages/bid/hall'
        })
    },
	check_detail: function(e){
		var id = e.currentTarget.dataset.index;
		wx.navigateTo({
			url:'../order/detail?id='+id
		})
	},
	allOrder: function(){
		var that = this;
		that.getOrderList();
		that.setData({
			allOrders:1,
			payOrders:0,
			sendOrders:0,
			receiveOrders:0,
			invoiceOrders:0
		})
	},
	wait_pay: function(){
		var that = this;
		that.setData({
			order:{
				orderList:[]
			},
			isNoMore:false,
			allOrders:0,
			payOrders:1,
			sendOrders:0,
			receiveOrders:0,
			invoiceOrders:0
		})
	},
	wait_send: function(){
		var that = this;
		that.setData({
			order:{
				orderList:[]
			},
			isNoMore:false,
			allOrders:0,
			payOrders:0,
			sendOrders:1,
			receiveOrders:0,
			invoiceOrders:0
		})
	},
	wait_receive: function(){
		var that = this;
		that.setData({
			order:{
				orderList:[]
			},
			isNoMore:false,
			allOrders:0,
			payOrders:0,
			sendOrders:0,
			receiveOrders:1,
			invoiceOrders:0
		})
	},
	wait_invoice: function(){
		var that = this;
		that.setData({
			order:{
				orderList:[]
			},
			isNoMore:false,
			allOrders:0,
			payOrders:0,
			sendOrders:0,
			receiveOrders:0,
			invoiceOrders:1
		})
	}
})