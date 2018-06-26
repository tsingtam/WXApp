//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({  
	data: {
		isDisplay:true,
		productDetail:{},
		productInfo:{},
		
		addCart:0,
		submitOrder:0,
		
		isShow:true,
		deliver:0,
		deliverType:'',
		pack:0,
		packType:'',
		warehouse:[],
		companyName:'',
		company:0,
		
		cartNum:0,
		buynumber:1,
		buynumbermin:0.05,
		buynumbermax:10000,
		phoneNum:'18500880000'
	},
	onLoad:function(query){
		var that = this;
		var product_id = query.id;
		that.setData({
			cartNum:wx.getStorageSync('cartNum')
		});
		wx.request({
			url: config.service.getWareHouseUrl,
			data: {
				product_id:product_id
			},
			success: function(res) {
				that.setData({
					warehouse:res.data.data.warehouses
				});
				console.log(res.data.data,'warehouse');
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
		wx.request({
			url: config.service.productDetailUrl,
			data: {
				product_id:product_id
			},
			success: function(res) {
				console.log(res.data.data);
				that.setData({
					productDetail:res.data.data					
				});
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	phoneCall:function(e){
		var that = this;
		wx.makePhoneCall({
			phoneNumber: that.data.phoneNum
		});
	},
	deliverItemTap:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		var product_id = e.currentTarget.dataset.id;
		if(index == 1 &&  that.data.deliver == 0){
			wx.request({
				url: config.service.getWareHouseUrl,
				data: {
					product_id:product_id
				},
				success: function(res) {
					that.setData({
						isShow:false,
						deliver:index,
						warehouse:res.data.data.warehouses,
						deliverType:e.currentTarget.dataset.name
					});
				},
				fail: function(res) {
					console.log('失败', res)
				}
			});
		}else{
			that.setData({
				isShow:true,
				deliver:0,
				deliverType:''
			});
		}
	},
	companyItemTap:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		for(var i = 0,len = that.data.warehouse.length;i<len;i++){
			if(that.data.warehouse[i].w_id == index){
				that.setData({
					productInfo:{
						price:that.data.warehouse[i].price
					}
				})				
			}
		}
		if(that.data.company != index){
			that.setData({
				company:index,
				companyName:e.currentTarget.dataset.name
			});
		}else{
			that.setData({
				company:0,
				companyName:''
			});
		}
	},
	lableItemTap:function(e){
		var index = e.currentTarget.dataset.index;
		if(this.data.pack != index){
			this.setData({
				pack:index,
				packType:e.currentTarget.dataset.name
			});
		}else{
			this.setData({
				pack:0,
				packType:''
			});
		}
	},
	selectType:function(){ // 添加购物车
		if(app.data.user.auth){
			this.setData({
				addCart:1,
				productInfo:this.data.productDetail,
				isDisplay:false
			});
		}else{
			wx.navigateTo({
			  url: '/pages/login/index'
			});
		}
	},
	buyTap:function(){ //立即购买
		if(app.data.user.auth){
			this.setData({
				submitOrder:1,
				isDisplay:false
			});
		}else{
			wx.navigateTo({
			  url: '/pages/login/index'
			});
		}
	},
	closeModel:function(){
		this.setData({
			isDisplay:true,
			deliver:0,
			deliverType:'',
			company:0,
			submitOrder:0,
			addCart:0,
			isShow:true,
			companyName:'',
			warehouse:[],
			buynumber:1,
			productInfo:this.data.productDetail,
			packType:'',
			pack:0
		})
	},
	addGoodsTap:function(){
		var that = this;
		if(that.data.deliver == 0 || that.data.pack == 0 || that.data.company == 0){			
			wx.showToast({
				title: '请选择商品规格！',
				icon: 'none',
				duration: 2000
			});
		}else{
			if(that.data.addCart == 1){
				wx.request({
					url: config.service.addCartUrl,
					data: {
						product_id:that.data.productDetail.id,
						userkey:app.data.user.userKey,
						packing:that.data.packType,
						deliver:that.data.deliverType,
						warehouse:that.data.company,
						amount:that.data.buynumber
					},
					success: function(res) {			
						if(res.data.resultCode == 0){					
							wx.showToast({
							  title: '加入购物车成功',
							  icon: 'success',
							  duration: 2000
							});
							
							app.getCartNum(app.data.user.userKey);
							
							that.setData({
								isDisplay:true,
								deliver:0,
								deliverType:'',
								company:0,
								isShow:true,
								companyName:'',
								buynumber:1,
								packType:'',					
								pack:0,
								addCart:0,
								cartNum:wx.getStorageSync('cartNum')
							});						
						}
					},
					fail: function(res) {
						console.log('失败', res)
					}
				})
			}else if(that.data.submitOrder == 1){
				var orderData = {
					product:that.data.productDetail,					
					packing:that.data.packType,
					deliver:that.data.deliverType,
					warehouse:that.data.company,
					price:that.data.productInfo.price,
					amount:that.data.buynumber
				};
				wx.setStorageSync('submitOrder',orderData);
				that.setData({
					submitOrder:0,
				});
				wx.navigateTo({
				  url: '/pages/price/submitOrder'
				});
			}
		}
	},
	minusTap:function(){
		if(this.data.buynumber > this.data.buynumbermin){
			var currentNum = this.data.buynumber;
			currentNum--;
			this.setData({
				buynumber:currentNum
			});
		}
	},
	plusTap:function(){
		if(this.data.buynumber < this.data.buynumbermax){
			var currentNum = this.data.buynumber;
			currentNum++;
			this.setData({
				buynumber:currentNum
			});
		}
	}
})  
