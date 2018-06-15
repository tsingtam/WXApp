//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp();

Page({
    data: {
		cartInfo:{
			list:[]
		},
		items:{},
		delBtnWidth:120   //删除按钮宽度单位（rpx）
    },
	onLoad: function(){
		this.onShow();
	},
	onShow: function(){
		var that = this;
		wx.request({
			url: config.service.getCartInfoUrl,
			data: {
				userkey:app.data.user.userKey
			},
			success: function(res) {
				that.setData({
					cartInfo:{
						list:res.data.data.goods
					}
				})
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	getAmount: function(e){
		var that = this;
		var product = e.currentTarget.dataset.item;		
		var amount = product.amount;
		if(parseInt(e.detail.value) > parseInt(amount)){
			var addNum = parseInt(e.detail.value) - parseInt(amount);
			var obj = {
					product_id:product.product_id,
					userkey:app.data.user.userKey,
					packing:product.packing,
					//deliver:e.currentTarget.dataset.item.delivery_type,
					deliver:'自提',
					warehouse:product.warehouse_id,
					amount:addNum
				};
			that.addCart(obj);	
		}else{
			var minusNum =parseInt(amount) - parseInt(e.detail.value);
			if(minusNum > 0){
				that.deleteCart(product.product_id,minusNum.toFixed(2));
			}else{
				that.deleteCart(product.product_id);
			}
		}		
	},
    btnBuy: function(){
    	wx.navigateTo({
		  url: '/pages/price/submitOrder'
		})
    },
	minusTap: function(e){ //减操作
		console.log(e.currentTarget.dataset);
			var that = this;
			var id = e.currentTarget.dataset.id;
			var list = that.data.cartInfo.list;
			var amount = 0;
			for(var i = 0,len = list.length;i < len;i++){
				var firstArr = list[i].value;
				for(var j = 0,leng = firstArr.length;j<leng;j++){
					var secondArr = firstArr[j].value;	
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){		
						var item = secondArr[k];
						if(item.product_id == id){
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount--;
							amount = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount;
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}			
					}
				}
			}
			var minusNum = parseInt(e.currentTarget.dataset.item.amount) - amount;
			if(minusNum > 0){
				that.deleteCart(id,minusNum.toFixed(2));
			}else{
				that.deleteCart(id);
			}
	},
	addTap: function(e){ //加操作
			var that = this;			
			var id = e.currentTarget.dataset.id;
			var list = that.data.cartInfo.list;
			var amount = 0;
			for(var i = 0,len = list.length;i < len;i++){
				var firstArr = list[i].value;
				for(var j = 0,leng = firstArr.length;j<leng;j++){
					var secondArr = firstArr[j].value;	
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){		
						var item = secondArr[k];
						if(item.product_id == id){
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount++;
							amount = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount;
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}			
					}
				}
			}
			var addNum = amount - e.currentTarget.dataset.item.amount;
			var options = {
					product_id:id,
					userkey:app.data.user.userKey,
					packing:e.currentTarget.dataset.item.packing,
					//deliver:e.currentTarget.dataset.item.delivery_type,
					deliver:'自提',
					warehouse:e.currentTarget.dataset.item.warehouse_id,
					amount:addNum
				};	
			that.addCart(options);
	},
	delItem: function(e){
		var that = this;
		var id = e.currentTarget.dataset.id;
		var product_id = e.currentTarget.dataset.pid;
		that.deleteCart(product_id);
	},
	deleteCart: function(id,amount){ //删除购物车数量
		var that = this;
		var getData = {};
		if(amount){
			getData = {
				userkey:app.data.user.userKey,
				product_id:id,
				amount:amount
			}
		}else{
			getData = {
				userkey:app.data.user.userKey,
				product_id:id				
			}
		}
		wx.request({
			url: config.service.removeCartUrl,
			data: getData,
			success: function(res) {
				if(res.data.resultCode == 0){
					wx.request({
						url: config.service.getCartInfoUrl,
						data: {
							userkey:app.data.user.userKey
						},
						success: function(res) {
							if(res.data.resultCode == 0){
								that.setData({
									cartInfo:{
										list:res.data.data.goods
									}
								})
							}
						},
						fail: function(res) {
							console.log('失败', res)
						}
					});			
					app.getCartNum(app.data.user.userKey);
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	addCart: function(options){//增加购物车数量
		wx.request({
				url: config.service.addCartUrl,
				data: options,
				success: function(res) {			
					if(res.data.resultCode == 0){					
						wx.request({
							url: config.service.getCartInfoUrl,
							data: {
								userkey:app.data.user.userKey
							},
							success: function(res) {
								if(res.data.resultCode == 0){
									that.setData({
										cartInfo:{
											list:res.data.data.goods
										}
									})
								}
							},
							fail: function(res) {
								console.log('失败', res)
							}
						});	
						app.getCartNum(app.data.user.userKey);
									
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
	},
	touchE:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		var id = e.currentTarget.dataset.id;	
		if(e.changedTouches.length==1){
			var endX = e.changedTouches[0].clientX;
			var disX = this.data.startX - endX;
			var delBtnWidth = this.data.delBtnWidth;
			//如果距离小于删除按钮的1/2，不显示删除按钮
			var left = disX > delBtnWidth/2 ? "margin-left:-"+delBtnWidth+"rpx":"margin-left:0px";
			var list = that.data.cartInfo.list;
			for(var i = 0,len = list.length;i < len;i++){
				var firstArr = list[i].value;
				for(var j = 0,leng = firstArr.length;j<leng;j++){
					var secondArr = firstArr[j].value;	
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){		
						var item = secondArr[k];
						if(item.id == id){
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].left = left;
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}else{
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].left = '';
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}
						
					}
				}
			}
		   
		}
	},
	touchS:function(e){
		if(e.touches.length==1){
		  this.setData({
			startX:e.touches[0].clientX
		  });
		}
	},
	touchM:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		var id = e.currentTarget.dataset.id;

		if(e.touches.length==1){
			var moveX = e.touches[0].clientX;
			var disX = this.data.startX - moveX;
			var delBtnWidth = this.data.delBtnWidth;
			var left = "";
			if(disX == 0 || disX < 0){//如果移动距离小于等于0，container位置不变
				left = "margin-left:0px";
			}else if(disX > 0 ){//移动距离大于0，container left值等于手指移动距离
				left = "margin-left:-"+disX+"rpx";
				if(disX>=delBtnWidth){
					left = "left:-"+delBtnWidth+"rpx";
				}
			}
			var list = that.data.cartInfo.list;
			for(var i = 0,len = list.length;i < len;i++){
				var firstArr = list[i].value;
				for(var j = 0,leng = firstArr.length;j<leng;j++){
					var secondArr = firstArr[j].value;	
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){		
						var item = secondArr[k];
						if(item.id == id){
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].left = left;
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}else{
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].left = '';
							that.setData({
								cartInfo:{
									list:list
								}
							});
						}
						
					}
				}
			}
		}
	}
})
