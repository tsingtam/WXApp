//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

var app = getApp();  
var index;  
var nav_centent_list =[];
var productList = [];
var totalPage = 1;  
Page({
	data: {
		user: null,

		nav_title:['品种','用途'],  
		shownavindex: null,  
		nav_centent: null,
		productList:[],
		productDetail:{},
		isDisplay:true,
		selectList:true,
		buynumber:0.05,
		buynumbermin:0.05,
		buynumbermax:1000,
		
		productInfo:[],
		isShow:true,
		isNoMore:false,
		deliver:0,
		deliverType:'',
		pack:0,
		packType:'',
		warehouse:[],
		companyName:'',
		company:0
	}, 
    onPullDownRefresh: function(){
    	var that = this;
		wx.request({
			url: config.service.productListUrl,
			data: {},
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data.products){
					totalPage = 1;
					productList = res.data.data.products
					that.setData({
						productList:productList,
						isNoMore:false
					})
				}
				wx.stopPullDownRefresh();
			},
			fail: function(res) {
				console.log('失败', res)
			}
		}) 
    },
    onReachBottom: function(){
		var that= this;
		totalPage++;
		if(!that.data.isNoMore){
			wx.request({
				url: config.service.productListUrl,
				data: {
					page:totalPage
				},
				success: function(res) {				
					if(res.data.resultCode == 0 && res.data.data && res.data.data.products){					
						productList = res.data.data.products
						that.setData({
							productList:that.data.productList.concat(productList)
						})
					}else if(res.data.resultCode == 0 && res.data.data.length == 0){					
						that.setData({
							isNoMore: true
						});
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			});
		}
    },
	onLoad: function(){		
		var that = this;
		// wx.navigateTo({
		//   url: '/pages/login/index'
		// });

        // wx.showModal({
        //     title: '用户协议',
        //     content: '弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内弹窗内容，告知当前状态、信息和解决方法，描述文字尽量控制在三行内',
        //     confirmText: "我知道了",
        //     confirmColor: "#366ec8",
        //     showCancel: false,
        //     success: function (res) {
        //         console.log(res);
        //         if (res.confirm) {
        //             console.log('用户点击主操作')
        //         }else{
        //             console.log('用户点击辅助操作')
        //         }
        //     }
        // });

		that.setData({
			user: app.data.user
		});

		wx.request({
			url: config.service.productTypeUrl,
			data: {},
			success: function(res) {
				nav_centent_list[0] = res.data.data.categories
				nav_centent_list[1] = res.data.data.uses
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
		wx.request({
			url: config.service.productListUrl,
			data: {},
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products
					that.setData({
						productList:productList
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		}) 
	}, 
	click_nav: function (e) {
		if (index == e.currentTarget.dataset.index && this.data.nav_centent != null && !this.data.selectList){ 
			index = e.currentTarget.dataset.index; 
			this.setData({  
				nav_centent: null,  
				shownavindex: null,  
			})
			this.setData({
				selectList:true
			});
		}else if (index == e.currentTarget.dataset.index && this.data.nav_centent != null && this.data.selectList){
			index = e.currentTarget.dataset.index; 
			this.setData({  
				nav_centent: nav_centent_list[Number(index)],  
				shownavindex: index,  
			})
			this.setData({
				selectList:false
			});
		} else if (this.data.nav_centent == null) { 
			index = e.currentTarget.dataset.index;
			this.setData({  
				shownavindex: index,  
				nav_centent: nav_centent_list[Number(index)]  
			})
			this.setData({
				selectList:false
			});
		} else {
			index = e.currentTarget.dataset.index;
			this.setData({  
				shownavindex: index,  
				nav_centent: nav_centent_list[Number(index)]  
			})
			this.setData({
				selectList:false
			});	
		}  
	},
	check_detail: function(e){
		var id = e.currentTarget.dataset.index;
		wx.navigateTo({
			url:'../bid/detail?id='+id
		})
	},
	check_all: function(e){
		var that = this;
		var objData = {};
		if(e.currentTarget.dataset.name == '全部' && that.data.shownavindex == 0){
			that.data.nav_title[Number(that.data.shownavindex)] = '品种';
		}else{
			that.data.nav_title[Number(that.data.shownavindex)] = '用途';
		}
		that.setData({
			nav_title:that.data.nav_title
		});
		if(that.data.nav_title[0] != '品种'){
			objData.category = that.data.nav_title[0];
		}
		if(that.data.nav_title[1] != '用途'){
			objData.uses = that.data.nav_title[1]; 
		}
		wx.request({
			url: config.service.productListUrl,
			data: objData,
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products;
					totalPage = 1;
					that.setData({
						productList:productList,
						isNoMore:false,
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		}) 
	},
	select_type: function(e){
		var that = this;
		that.data.nav_title[Number(that.data.shownavindex)] = e.currentTarget.dataset.name;
		that.setData({
			nav_title:that.data.nav_title
		});
		if(that.data.nav_title[0] === '品种'){
			var category = '';
		}else{
			var category = that.data.nav_title[0];
		}
		if(that.data.nav_title[1] === '用途'){
			var uses = '';
		}else{
			var uses = that.data.nav_title[1]; 
		}
		wx.request({
			url: config.service.productListUrl,
			data: {
				category:category,
				uses:uses
			},
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products;
					totalPage = 1;
					that.setData({
						productList:productList,
						isNoMore:false,
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	selecthide: function(){
		this.setData({
			shownavindex:null,
			selectList:true
		});
	},
	search_product: function(e){
		wx.navigateTo({
			url:'../search/search'
		})
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
					console.log(res.data.data,'warehouse');
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
	addCartTap:function(e){
		var that = this;
		var index = e.currentTarget.dataset.index;
		if(app.data.user.auth){
			that.setData({
				productDetail:e.currentTarget.dataset.detail,
				productInfo:e.currentTarget.dataset.detail
			});
			that.setData({
				isDisplay:false,
				buynumber:0.05
			});			
		}else{
			wx.navigateTo({
			  url: '/pages/login/index'
			});
		}
		return false;
	},
	addGoodsTap:function(){
		var that = this;
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
							pack:0
						});
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
		}
	},
	closeModel:function(){
		this.setData({
			isDisplay:true,
			deliver:0,
			deliverType:'',
			company:0,
			isShow:true,
			companyName:'',
			warehouse:[],
			buynumber:0.05,
			packType:'',
			pack:0
		})
	},
	getAmount:function(e){
		var that = this;
		var val = e.detail.value;
		if(!isNaN(val)){
			if(val > that.data.buynumbermin && val < that.data.buynumbermax){
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
		var that = this;
		if(that.data.buynumber > that.data.buynumbermin){
			var currentNum = that.data.buynumber;
			currentNum = (currentNum*10000 - 500)/10000;
			if(currentNum < that.data.buynumbermin){
				currentNum = that.data.buynumbermin;
			}
			this.setData({
				buynumber:currentNum
			});
		}
	},
	plusTap:function(){
		var that = this;
		if(that.data.buynumber < that.data.buynumbermax){
			var currentNum = that.data.buynumber;
			currentNum = (currentNum*10000 + 500)/10000;
			that.setData({
				buynumber:currentNum
			});
		}
	},
	goManage: function(){
		wx.navigateTo({
		  url: '/pages/user/admin'
		});
	}
})  
