//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp()

Page({  
	data: {
		isDisplay:true,
		id: null, // 产品id
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
		
		contact: [], // 联系卖家
		array: [],
		index: 0,
		userAuth: false, // 用户是否认证
		isPicker: false, // 是否下拉

		cartNum:0,
		buynumber:1,
		buynumbermin:1,
		buynumbermax:1000,
	
	},
	onShow: function(){
		var that = this;
		that.setData({
			isPicker: false
		});
		wx.request({
			url: config.service.productDetailContactUrl,
			data: {
				product_id: that.data.id,
				userkey: app.data.user && app.data.user.userKey
			},
			success: function(res) {
				if (res.data.resultCode == 0 && res.data.data && res.data.data.length){
					that.setData({
						contact:res.data.data
					});
					var contact = [];
					res.data.data.forEach(function(o, i){
						contact.push(o.contact + ' ' + o.mobile);
					});
					that.setData({
						array:contact
					});
					if (contact.length > 1){
						that.setData({
							isPicker: true
						});
					}
					console.log(res.data.data, contact, 'contact...');
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	onLoad:function(query){
		var that = this;
		var product_id = query.id;
		that.setData({
			cartNum:wx.getStorageSync('cartNum'),
			userAuth:app.data.user.auth,
			id: query.id
		});
		wx.request({
			url: config.service.getWareHouseUrl,
			data: {
				product_id:product_id,
				userkey: app.data.user && app.data.user.userKey
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
				product_id:product_id,
				userkey: app.data.user && app.data.user.userKey
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
		wx.showShareMenu({
		  withShareTicket: true
		});
	},
	// phoneCall:function(e){ // 拨打电话
	// 	var that = this;
	// 	wx.makePhoneCall({
	// 		phoneNumber: that.data.phoneNum
	// 	});
	// },
	contact:function(e){ // 联系卖方
		// wx.navigateTo({
		// 	url: '/pages/bid/contact'
		// });

		var contact = this.data.contact[0];
		if (contact){
			if (this.data.userAuth){
				wx.makePhoneCall({
					phoneNumber: contact.mobile
				});
			}
			else {
				wx.navigateTo({
					url: '/pages/login/index'
				});
			}
		}
		else {
			wx.showToast({
				title: '暂无联系方式',
				icon: 'none',
				duration: 2000
			});
		}
	},
	bindPickerChange: function(e){
        var index = e.detail.value,
        	contact = this.data.contact[index];
        this.setData({
            index: index
        });
        if (contact){
			wx.makePhoneCall({
				phoneNumber: contact.mobile
			});
        }
	},
	deliverItemTap:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		var product_id = e.currentTarget.dataset.id;
		if(index == 1 &&  that.data.deliver == 0){
			wx.request({
				url: config.service.getWareHouseUrl,
				data: {
					product_id:product_id,
					userkey:app.data.user.userKey
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
				companyName:'',
				productInfo:{
					price:that.data.productDetail.price
				}
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
				isDisplay:false,
				buynumber:1
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
				productInfo:this.data.productDetail,
				isDisplay:false,
				buynumber:1
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
		/*if(app.data.user.type != 1 && that.data.addCart == 1){
			wx.showToast({
				title: '管理人员不能进行加入购物车操作！',
				icon: 'none',
				duration: 2000
			});
		}else if(app.data.user.type != 1 && that.data.submitOrder == 1){
			wx.showToast({
				title: '管理人员不能进行下单操作！',
				icon: 'none',
				duration: 2000
			});
		}else{*/
			if(that.data.deliver == 0){	
				wx.showToast({
					title: '请选择商品交货方式！',
					icon: 'none',
					duration: 2000
				});
			}else if(that.data.company == 0){
				wx.showToast({
					title: '请选择商品提货地！',
					icon: 'none',
					duration: 2000
				});
			}else if(that.data.pack == 0){
				wx.showToast({
					title: '请选择商品包装规格！',
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
								//app.getCartNum(app.data.user.userKey);
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
									addCart:0			
								});
								wx.request({ 
									url: config.service.getCartNumUrl,
									data: {
										userkey:app.data.user.userKey
									},
									success: function(res) {				
										if(res.data.resultCode == 0){
											wx.setStorageSync('cartNum', res.data.data.count);
											if(res.data.data.count > 0){
												wx.setTabBarBadge({
													index: 1,
													text: res.data.data.count
												});
												that.setData({
													cartNum:res.data.data.count
												});
											}else{
												wx.removeTabBarBadge({
													index:1
												});
											}
										}								
									},
									fail: function(res) {
										console.log('失败', res)
									}
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
					wx.removeStorageSync('cartInfoSubmit');	
					wx.removeStorageSync('submitOrder');	
					wx.setStorageSync('submitOrder',orderData);
					that.setData({
						submitOrder:0,
					});
					wx.navigateTo({
					  url: '/pages/price/submitOrder'
					});
				}
			}
		//}
	},
	getAmount:function(e){
		var that = this;
		var val = e.detail.value;
		if(!isNaN(val)){
			if(val > that.data.buynumbermin && val <= that.data.buynumbermax){
				val = val;
			}else{
				val = that.data.buynumbermin;
			}
		}else{
			val = that.data.buynumber;
		}
		this.setData({
			buynumber:val
		});
	},
	minusTap:function(){
		if(this.data.buynumber > this.data.buynumbermin){
			var currentNum = this.data.buynumber;
			currentNum = (currentNum*10000 - 10000)/10000;
			if(currentNum < that.data.buynumbermin){
				currentNum = that.data.buynumbermin;
			}
			this.setData({
				buynumber:currentNum
			});
		}else{
			wx.showToast({
				title: '该商品的最小购买量为1吨！',
				icon: 'none',
				duration: 2000
			});
		}
	},
	plusTap:function(){
		if(this.data.buynumber < this.data.buynumbermax){
			var currentNum = this.data.buynumber;
			currentNum = (currentNum*10000 + 10000)/10000;
			this.setData({
				buynumber:currentNum
			});
		}else{
			wx.showToast({
				title: '该商品的最大购买量为1000吨！',
				icon: 'none',
				duration: 2000
			});
		}
	}
})  
