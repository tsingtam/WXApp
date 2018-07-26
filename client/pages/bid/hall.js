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
		windowHeight: 0,

		nav_centents:{}, //产品筛选
		productList:[], //产品列表
		productDetail:{}, //产品详情
		category: [], // 品种（可点击）
		uses: [], // 分类（可点击）
		childArr:[], //品种、用途 选择列表数组
		cateChildName:'', //品种名称
		useChildName:'', //用途名称
		usesName:'', //具体用途名称
		cateName:'', //具体品种名称
		categoryStr:'',
		usesStr:'',
		cate:'',
		use:'',
		selecthide:true, //筛选浮层
		isDisplay:true, //购物车浮层
		selectList:true, //产品列表
		buynumber:1, //购买量
		buynumbermin:1, //最小购买量
		buynumbermax:1000, //最大购买量
		
		selectZH:1, //综合
		selectJG:0, // 价格
		priceup:0,  // 价格升降
		selectXL:0, //销量
		selectSX:0, // 筛选
		
		productInfo:[], //具体产品信息
		isShow:false, //提货地显示
		isNoMore:false, //没有更多显示
		deliver:1, //发货方式（自提）
		deliverType:'',
		pack:'', //包装方式
		pack_size:[],
		price_list:[],
		packType:'',
		warehouse:[], //发货地
		companyName:'',
		company:0
	}, 
	onShareAppMessage: function (res) {
		return {
		  title: '全球最大的精细氧化铝销售平台',
		  path: '/pages/bid/hall',
		  imageUrl: '../../image/share.jpg'
		}
	},
    onPullDownRefresh: function(){
    	var that = this;
		var objData = {};
		if(wx.getStorageSync('selectUseName') != ''){
			objData.uses = wx.getStorageSync('selectUseName');
		}
		if(wx.getStorageSync('selectCateName') != ''){
			objData.category = wx.getStorageSync('selectCateName');
		}
		wx.request({
			url: config.service.productListUrl,
			data: objData,
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data.products){
					totalPage = 1;
					productList = res.data.data.products
					that.setData({
						productList:productList,
						category:[],
						uses:[],
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
			var objData={};
			var order = 1;
			if(that.data.priceup == 1){
				order = 1;
			}else if(that.data.priceup == 2){
				order = 2;
			}
			//价格、销量、综合 和 具体品类、用途的组合筛选
			if(that.data.selectJG == 1 && that.data.selectSX == 1){ 
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:3,
					order:order,
					page:totalPage
				}
			}else if(that.data.selectJG == 1 && that.data.selectSX != 1){
				objData = {
					category:'',
					uses:'',
					sort_type:3,
					order:order,
					page:totalPage
				}
			}else if(that.data.selectZH == 1 && that.data.selectSX == 1){
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:1,
					order:1,
					page:totalPage
				}
			}else if(that.data.selectXL == 1 && that.data.selectSX == 1){
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:2,
					order:2,
					page:totalPage
				}
			}else if(that.data.selectXL == 1 && that.data.selectSX != 1){
				objData = {
					category:'',
					uses:'',
					sort_type:2,
					order:2,
					page:totalPage
				}
			}else{
				objData = {
					category:'',
					uses:'',
					page:totalPage
				}
			}
	
			wx.request({
				url: config.service.productListUrl,
				data:objData,
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
    onReady: function(){
		app.login();
    },
	onLoad: function(query){		
		var that = this;

		// wx.navigateTo({
		// 	url:'/pages/user/auth'
		// });

		// 详情分享，根据id跳转
		if (query.id){
			setTimeout(function(){
				wx.navigateTo({
					url:'/pages/bid/detail?id=' + query.id
				});
			}, 1000);
		}

		wx.removeStorageSync('selectCateName');
		wx.removeStorageSync('selectUseName');
		wx.removeStorageSync('selectCate');
		wx.removeStorageSync('selectUse');
		wx.removeStorageSync('parentName');
		wx.removeStorageSync('cateName');
		wx.removeStorageSync('usesName');
		wx.removeStorageSync('childName');
		wx.request({
			url: config.service.productTypeUrl,
			data: {},
			success: function(res) {
				that.setData({
					nav_centents:res.data.data
				});
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
						productList:productList,
						category:[],
						uses:[],
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});

		// 获取屏幕高度，计算筛选浮层高度
		wx.getSystemInfo({
			success: function(e){
				that.setData({
					windowHeight: e.windowHeight
				});
			}
		});

		wx.showShareMenu({
		  withShareTicket: true
		});
	}, 
	onShow: function(){
		var that = this;
		that.setData({
			user: app.data.user,
			cateName:wx.getStorageSync('cateName'),
			usesName:wx.getStorageSync('usesName'),
			cateChildName:wx.getStorageSync('selectCateName'),
			useChildName:wx.getStorageSync('selectUseName')
		});
		if(app.data.user){
			app.getCartNum(that.data.user.userKey);
		}
	},
	click_nav_zh: function(){ //综合筛选
		var that = this;
		totalPage = 1;
		var objData={};
		that.setData({
			selectZH:1,
			cateName:that.data.cate,
			usesName:that.data.use,
			cateChildName:that.data.categoryStr,
			useChildName:that.data.usesStr,
			selecthide:true,
			selectList:true,
			isNoMore:false,
			selectJG:0,
			selectXL:0
		});
		wx.setStorageSync('selectCateName',that.data.categoryStr);
		wx.setStorageSync('selectUseName',that.data.usesStr);
		wx.setStorageSync('selectCate',that.data.categoryStr);
		wx.setStorageSync('selectUse',that.data.usesStr);
		if(that.data.selectSX == 1){
			objData = {
				category:that.data.categoryStr,
				uses:that.data.usesStr,
				sort_type:1,
				order:1
			};
		}else{
			objData = {
				category:'',
				uses:'',
				sort_type:1,
				order:1
			};
		}
		wx.request({
			url: config.service.productListUrl,
			data:objData,
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products
					that.setData({
						productList:productList,
						category:[],
						uses:[],
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	click_nav_xl: function(){ //销量筛选
		var that = this;
		totalPage = 1;
		that.setData({
			selectZH:0,
			cateName:that.data.cate,
			usesName:that.data.use,
			cateChildName:that.data.categoryStr,
			useChildName:that.data.usesStr,
			selecthide:true,
			selectList:true,
			isNoMore:false,
			selectJG:0,
			selectXL:1
		});
		wx.setStorageSync('selectCateName',that.data.categoryStr);
		wx.setStorageSync('selectUseName',that.data.usesStr);
		wx.setStorageSync('selectCate',that.data.categoryStr);
		wx.setStorageSync('selectUse',that.data.usesStr);
		var objData = {};
		if(that.data.selectSX == 1){
			objData = {
				category:that.data.categoryStr,
				uses:that.data.usesStr,
				sort_type:2,
				order:2
			};
		}else{
			objData = {
				category:'',
				uses:'',
				sort_type:2,
				order:2
			};
		}
		wx.request({
			url: config.service.productListUrl,
			data:objData,
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products
					that.setData({
						productList:productList,
						category:[],
						uses:[],
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	click_nav_jg: function(){ //价格筛选
		var that = this;
		totalPage = 1;
		that.setData({
			selectZH:0,
			selecthide:true,
			selectList:true,
			isNoMore:false,
			cateName:that.data.cate,
			usesName:that.data.use,
			cateChildName:that.data.categoryStr,
			useChildName:that.data.usesStr,
			selectJG:1,
			selectXL:0
		});
		wx.setStorageSync('selectCateName',that.data.categoryStr);
		wx.setStorageSync('selectUseName',that.data.usesStr);
		wx.setStorageSync('selectCate',that.data.categoryStr);
		wx.setStorageSync('selectUse',that.data.usesStr);
		if(that.data.priceup != 1){
			that.setData({
				priceup:1,
			});
		}else if(that.data.priceup == 1){
			that.setData({
				priceup:2,
			});
		}
		var order = 1;
		var objData = {};
		if(that.data.priceup == 1){
			order = 1;
		}else if(that.data.priceup == 2){
			order = 2;
		}
		if(that.data.selectSX == 1){
			objData = {
				category:that.data.categoryStr,
				uses:that.data.usesStr,
				sort_type:3,
				order:order
			};
		}else{
			objData = {
				category:'',
				uses:'',
				sort_type:3,
				order:order
			};
		}
		wx.request({
			url: config.service.productListUrl,
			data:objData,
			success: function(res) {
				if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
					productList = res.data.data.products
					that.setData({
						productList:productList,
						category:[],
						uses:[]
					});
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	click_nav_sx: function(){ //筛选
		var that = this;
		if(that.data.selecthide){
			that.setData({
				selecthide:false,
				selectList:false
			});
		}else{
			that.setData({
				selecthide:true,
				selectList:true
			});
		}
	},
	suretap:function(){ //确定筛选
		var that = this;
		var objData = {};
		var order = 1; //价格升降（1.升序 2.降序）
		if(that.data.priceup == 1){ 
			order = 1;
		}else if(that.data.priceup == 2){
			order = 2;
		}
		that.setData({
			categoryStr:wx.getStorageSync('selectCateName'),
			usesStr:wx.getStorageSync('selectUseName'),
			cate:wx.getStorageSync('cateName'),
			use:wx.getStorageSync('usesName'),
		});
		//if(wx.getStorageSync('selectCateName') != '' || wx.getStorageSync('selectUseName') != ''){
			//判断是否点击 销量 或者 价格 的筛选 
			if(that.data.selectXL == 1){
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:2,
					order:2
				};
			}else if(that.data.selectJG == 1){
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:3,
					order:order
				};
			}else{
				objData = {
					category:that.data.categoryStr,
					uses:that.data.usesStr,
					sort_type:1,
					order:1
				};
			}
		//}
			wx.request({
				url: config.service.productListUrl,
				data: objData,
				success: function(res) {
					if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
						productList = res.data.data.products
						that.setData({
							productList:productList,
							category:[],
							uses:[],
							selecthide:true,
						});
						if(that.data.categoryStr != '' || that.data.usesStr != ''){
							that.setData({
								selectSX:1,
								selectList:true,
							});
						}else{
							that.setData({
								selectSX:0,
								selectList:true
							});
						}

						// 重置翻页
						totalPage = 1;
						that.setData({
							isNoMore: false
						});
					}else if(res.data.resultCode != 0){
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
			});
	},
	resettap:function(){ //重置筛选
		var that = this;
		wx.removeStorageSync('selectCateName');
		wx.removeStorageSync('selectUseName');
		wx.removeStorageSync('selectCate');
		wx.removeStorageSync('selectUse');
		wx.removeStorageSync('parentName');
		wx.removeStorageSync('cateName');
		wx.removeStorageSync('usesName');
		wx.removeStorageSync('childName');
		that.setData({
			cateChildName:'',
			useChildName:'',
			usesName:'',
			cateName:''
		});

		setTimeout(function(){
			that.suretap();
		}, 500);
		// wx.request({
		// 	url: config.service.productListUrl,
		// 	data: {},
		// 	success: function(res) {
		// 		if(res.data.resultCode == 0 && res.data.data && res.data.data.products){
		// 			productList = res.data.data.products
		// 			that.setData({
		// 				productList:productList,
		// 				category:[],
		// 				uses:[],
		// 			});
		// 		}
		// 	},
		// 	fail: function(res) {
		// 		console.log('失败', res)
		// 	}
		// });
	},
	check_detail: function(e){ // 查看产品详情
		var id = e.currentTarget.dataset.index;
		wx.navigateTo({
			url:'../bid/detail?id='+id
		})
	},
	search_product: function(e){
        wx.showToast({
          title: '新功能即将开放，敬请期待！',
          icon: 'none',
          duration: 2000
        });
        return false;
		wx.navigateTo({
			url:'../search/search'
		});
	},
	selectTapCate: function(e){ //进入具体品种列表
		var that = this;
		console.log(e);
		var childArr = e.currentTarget.dataset.child;
		var cateName = e.currentTarget.dataset.name;
		var parentName = e.currentTarget.dataset.parentname;
		/*that.setData({
			cateName:cateName
		});*/
		wx.removeStorageSync('childName');
		wx.removeStorageSync('cateName');
		wx.removeStorageSync('parentName');
		wx.setStorageSync('parentName',parentName);
		wx.setStorageSync('cateName',cateName);
		wx.setStorageSync('childName',childArr);
		wx.navigateTo({
			url:'../bid/select'
		});
		
	},
	selectTapUse: function(e){ //进入具体用途列表
		var that = this;
		var childArr = e.currentTarget.dataset.child;
		var parentName = e.currentTarget.dataset.parentname;
		var usesName = e.currentTarget.dataset.name;
		/*that.setData({
			usesName:usesName
		});*/
		wx.removeStorageSync('childName');
		wx.removeStorageSync('parentName');
		wx.removeStorageSync('usesName');
		wx.setStorageSync('parentName',parentName);
		wx.setStorageSync('usesName',usesName);
		wx.setStorageSync('childName',childArr);
		wx.navigateTo({
			url:'../bid/select'
		})
	},
	deliverItemTap:function(e){ //选择交货方式
		var that = this;
		var index = e.currentTarget.dataset.index;
		var product_id = e.currentTarget.dataset.id;
		if(that.data.deliver != index){
			that.setData({
				//isShow:true,
				deliver:index,
				deliverType:index
			});
			price_list.forEach(function(i,o){
				if(that.data.deliverType == i.delivery_method){
					that.setData({
						warehouse:i.warehouses
					});
				}
			});
		}else{
			that.setData({
				//isShow:true,
				deliver:'',
				deliverType:''
			});
		}
	},
	companyItemTap:function(e){ //选择提货他
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
	lableItemTap:function(e){ //选择包装方式
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
	addCartTap:function(e){ // 购物车浮层
		var that = this;
		var index = e.currentTarget.dataset.index;
		if(app.data.user.auth){ //判断用户是否认证
			that.setData({
				productDetail:e.currentTarget.dataset.detail,
				productInfo:e.currentTarget.dataset.detail,
				isDisplay:false,
				buynumber:1
			});	
			wx.request({
				url: config.service.getWareHouseUrl,
				data: {
					product_id:index,
					userkey:app.data.user.userKey
				},
				success: function(res) {
					if(res.data.resultCode == 0){
						that.setData({
							isShow:false,
							deliver:1,
							pack_size:res.data.data.pack_size,
							price_list:res.data.data.price_list,
							warehouse:res.data.data.price_list[0].warehouses,
							deliverType:'自提'
						});
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
			});
		}else{
			wx.navigateTo({
			  url: '/pages/login/index'
			});
		}
		return false;
	},
	addGoodsTap:function(){ // 加入购物车
		var that = this;
		/*if(app.data.user.type != 1){
			wx.showToast({
				title: '管理人员不能进行加入购物车操作！',
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
				wx.request({
					url: config.service.addCartUrl,
					data: {
						product_id:that.data.productDetail.id,
						userkey:app.data.user.userKey,
						packing:that.data.packType,
						//deliver:that.data.deliverType,
						deliver:'自提',
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
							
							//获取购物车数量
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
		//}
	},
	closeModel:function(){ // 关闭购物车浮层
		this.setData({
			isDisplay:true,
			deliver:0,
			deliverType:'',
			company:0,
			isShow:true,
			companyName:'',
			warehouse:[],
			buynumber:1,
			packType:'',
			pack:0
		})
	},
	getAmount:function(e){ // 修改购买数量
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
	minusTap:function(){ //减操作
		var that = this;
		if(that.data.buynumber > that.data.buynumbermin){
			var currentNum = that.data.buynumber;
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
	plusTap:function(){ //加操作
		var that = this;
		if(that.data.buynumber < that.data.buynumbermax){
			var currentNum = that.data.buynumber;
			currentNum = (currentNum*10000 + 10000)/10000;
			that.setData({
				buynumber:currentNum
			});
		}else{
			wx.showToast({
				title: '该商品的最大购买量为1000吨！',
				icon: 'none',
				duration: 2000
			});
		}
	},
	goManage: function(){
		wx.navigateTo({
		  url: '/pages/user/admin'
		});
	},
	goCompany: function(){
		wx.navigateTo({
		  url: '/pages/company/index'
		});
	}
})  
