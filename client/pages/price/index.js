//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp();
var detailArr = [];
var totalPage = 1;

Page({
    data: {
		cartInfo:{
			list:[]
		},
		isNoMore:false,
		totalPrice:'0.00',
		disabledColor:false,
		allSelect:false,//全选
		delBtnWidth:120   //删除按钮宽度单位（rpx）
    },
	onLoad: function(){
		//this.onShow();
	},
	onShow: function(){
		var that = this;
		detailArr = [];
		that.setData({
			totalPrice:'0.00',
			allSelect:false
		});
		wx.request({ //获取购物车信息
			url: config.service.getCartInfoUrl,
			data: {
				userkey:app.data.user.userKey
			},
			success: function(res) {
				if(res.data.resultCode == 0){
					totalPage = 1;
					if(res.data.data.length == 0){
						that.setData({
							cartInfo:{
								list:res.data.data
							},
							isNoMore:false
						});
					}else{						
						that.setData({
							cartInfo:{
								list:res.data.data.goods
							},
							isNoMore:false
						});
					}
				}
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	onPullDownRefresh: function(){
        this.onShow();
		app.getCartNum(app.data.user.userKey);
    },
	onReachBottom: function(){
		var that = this;
		totalPage++;
		if(!that.data.isNoMore){
			wx.request({
				url: config.service.getCartInfoUrl,
				data: {
					userkey:app.data.user.userKey,
					page:totalPage
				},
				success: function(res) {
					if(res.data.resultCode == 0 && res.data.data && res.data.data.goods){
						that.setData({
							cartInfo:{
								list:that.data.cartInfo.list.concat(res.data.data.goods)
							}
						})
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
	toIndexPage: function(){
		wx.switchTab({
			url: '/pages/bid/hall'
		});
	},
	getAmount: function(e){ //修改购物车数量
		var that = this;
		var inputValue = e.detail.value;
		var product = e.currentTarget.dataset.item;		
		var amount = product.amount;
		if(!isNaN(inputValue)){
			if(inputValue > 0 && inputValue < 1){
				wx.showToast({
					title: '该商品的最小购买量为1吨！',
					icon: 'none',
					duration: 2000
				});
				that.setData({
					cartInfo:{
						list:that.data.cartInfo.list
					}
				});
			} else if(inputValue > 1000){
				wx.showToast({
					title: '该商品的最大购买量为1000吨！',
					icon: 'none',
					duration: 2000
				});
				that.setData({
					cartInfo:{
						list:that.data.cartInfo.list
					}
				});
			}else{
				if(parseFloat(inputValue*10000) > parseInt(amount*10000)){
					var addNum = parseFloat(inputValue*10000);
					var obj = {
							product_id:product.product_id,
							userkey:app.data.user.userKey,
							packing:product.packing,
							//deliver:e.currentTarget.dataset.item.delivery_type,
							deliver:'自提',
							warehouse:product.warehouse_id,
							amount:addNum/10000
						};
					that.addCart(obj);	
				}else if(parseFloat(inputValue*10000) < parseFloat(amount*10000)){
					var minusNum = parseFloat(inputValue*10000);
					if(minusNum > 0){
						var obj = {
							product_id:product.product_id,
							userkey:app.data.user.userKey,
							packing:product.packing,
							//deliver:e.currentTarget.dataset.item.delivery_type,
							deliver:'自提',
							warehouse:product.warehouse_id,
							amount:minusNum/10000
						};
						that.updateCart(obj);
					}else{
						that.deleteCart(product.product_id);
					}
				}
			}
		}
	},
	checkboxChangeT: function(e){ // 选择大类
		var that = this;
		var index = e.currentTarget.dataset.index;
		var list = that.data.cartInfo.list;
		var marks =0;
		if(index!=="" && index != null){
			list[parseInt(index)].checked = !list[parseInt(index)].checked ; 
			var firstArr = list[parseInt(index)].value;
			for(var j = 0,leng = firstArr.length;j<leng;j++){
				var secondArr = firstArr[j].value;
				if(list[parseInt(index)].checked && !list[parseInt(index)].value[parseInt(j)].checked){
					list[parseInt(index)].value[parseInt(j)].checked = !list[parseInt(index)].value[parseInt(j)].checked;
				}else if(!list[parseInt(index)].checked){
					list[parseInt(index)].value[parseInt(j)].checked = !list[parseInt(index)].value[parseInt(j)].checked;
				}
				for(var k = 0,lengt = secondArr.length;k<lengt;k++){
					var item = list[parseInt(index)].value[parseInt(j)].value[parseInt(k)];
					if(list[parseInt(index)].checked){
						item.checked = true;						
					}else if(!list[parseInt(index)].checked){
						item.checked = false;						
					}
								
					that.setData({
						cartInfo:{
							list:list
						}		
					});
					that.getTotal();
				}
			}
			list.forEach(function(i,o){ //判断是不是全选
				if(i.checked){
					marks++;					
				}
				if(marks == list.length){
					that.data.allSelect = true;
					that.setData({
						allSelect:that.data.allSelect
					})
				}else{
					that.data.allSelect = false;
					that.setData({
						allSelect:that.data.allSelect
					})
				}
			});
		}
	},
	checkboxChangeM: function(e){ // 选择小类
		var that = this;			
		var id = e.currentTarget.dataset.id;
		var cateType = e.currentTarget.dataset.type;
		var list = that.data.cartInfo.list;
		var times = 0;
		var secondItemTimes = 0;
		list.forEach(function(i,o){
			i.value.forEach(function(j,m){
				if(j.category == id){
					j.checked = !j.checked;
					j.value.forEach(function(k,n){
						if(!k.checked){
							k.checked = !k.checked;							
						}else if(!j.checked){
							k.checked = !k.checked;
						}						
						that.setData({
							cartInfo:{
								list:list
							}							
						});
					});
					that.getTotal();
				}
					if(j.checked && cateType == i.p_category){
						times++;
					}
					if(times == i.value.length && cateType == i.p_category){
						i.checked = !i.checked;	
						that.setData({
							cartInfo:{
								list:list
							}
						});
					}else if(times != i.value.length && i.checked && cateType == i.p_category){
						i.checked = !i.checked;					
						that.setData({
							cartInfo:{
								list:list
							}
						});
					}
			});
				if(i.checked){
					secondItemTimes++;
				}
				if(secondItemTimes == list.length){
					that.data.allSelect = true;
					that.setData({
						allSelect:that.data.allSelect
					})
				}else{
					that.data.allSelect = false;
					that.setData({
						allSelect:that.data.allSelect
					})
				}
		})
	},
	checkboxChangeB: function(e){ // 选择具体
		var that = this;			
		var id = e.currentTarget.dataset.id;		
		var list = that.data.cartInfo.list;
		var type = '';
		var category_id = e.currentTarget.dataset.category;
		var cateType = e.currentTarget.dataset.catetype;
		var selectTimes = 0;
		var total = 0;
		var secondItemTime = 0;
		var firstItemTime = 0;
		list.forEach(function(i,o){
			var bigType = i.p_category;
			i.value.forEach(function(j,n){
				var smallType = j.category;
				var objData = {
					category:'',
					value:[]
				};
				
				j.value.forEach(function(k,m){					
					if(k.product_id == id){
						type = j.category;
						category_id = k.product.category_id;
						objData.category = j.category;
						k.checked = !k.checked;				
						that.setData({
							cartInfo:{
								list:list
							},
						});
						that.getTotal();
					}
								
					if(k.checked && category_id == k.product.category_id){
						selectTimes++;
					}										
					if(selectTimes == j.value.length && type == j.category){
						j.checked = true;						
						that.setData({
							cartInfo:{
								list:list
							}
						});					
					}else if(selectTimes != j.value.length && type == j.category){
						j.checked = false;					
						that.setData({
							cartInfo:{
								list:list
							}
						});
					}
				});
				if(j.checked && cateType==i.p_category){
					secondItemTime++;
				}
				if(secondItemTime == i.value.length && cateType==i.p_category){
						i.checked = true;						
						that.setData({
							cartInfo:{
								list:list
							}
						});					
				}else if(secondItemTime != i.value.length && cateType==i.p_category){
						i.checked = false;					
						that.setData({
							cartInfo:{
								list:list
							}
						});
				}
			});
			if(i.checked){
				firstItemTime++;
			}
			if(firstItemTime == list.length){
						that.data.allSelect = true;						
						that.setData({
							allSelect:true
						});					
			}else if(firstItemTime != list.length){
						that.data.allSelect = false;						
						that.setData({
							allSelect:false
						});
			}
			
		});
			
	},
	checkboxChangeAll: function(e){ //全选
		var that = this;
		var list = that.data.cartInfo.list;
		that.data.allSelect = !that.data.allSelect;

		for(var i = 0,len = list.length;i < len;i++){
			if((!list[i].checked && that.data.allSelect) || (list[i].checked && !that.data.allSelect)){
				list[i].checked = !list[i].checked;
				var firstArr = list[i].value;
				for(var j = 0,leng = firstArr.length;j<leng;j++){
					var secondArr = firstArr[j].value;
					if(list[parseInt(i)].checked && !list[parseInt(i)].value[parseInt(j)].checked){
						list[parseInt(i)].value[parseInt(j)].checked = !list[parseInt(i)].value[parseInt(j)].checked;
					}else if(!list[parseInt(i)].checked){
						list[parseInt(i)].value[parseInt(j)].checked = !list[parseInt(i)].value[parseInt(j)].checked;
					}
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){
						var item = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)];
						if(list[parseInt(i)].checked && !item.checked){
							item.checked = !item.checked;					
						}else if(!list[parseInt(i)].checked){
							item.checked = !item.checked;						
						}						
						that.setData({
							cartInfo:{
								list:list
							}													
						});		
					}
				}
			}		
		}
		that.getTotal();
	},
	getTotal: function(){ //获取总价格
		var that = this;
		var total = 0;
		var list = that.data.cartInfo.list;
		list.forEach(function(m,n){
			m.value.forEach(function(w,f){
				w.value.forEach(function(t,k){
					if(t.checked){
						total+= parseFloat(t.amount)*t.price*10000;
					}
				})
			})
		})
		that.setData({
			totalPrice:(total/10000).toFixed(2)
		})
	},
	removeVlue: function(arr,val){ //删除小种类的数组
		for(var i=0; i<arr.length; i++) {
			if(arr[i].category == val) {
			  arr.splice(i, 1);
			  break;
			}
		}
	},
	removeVluep: function(arr,val){ //删除大种类的数组
		for(var i=0; i<arr.length; i++) {
			if(arr[i].p_category == val) {
			  arr.splice(i, 1);
			  break;
			}
		}
	},
	removeVlues: function(arr,val){
		for(var i=0; i<arr.length; i++) {
			if(arr[i].id == val) {
			  arr.splice(i, 1);
			  break;
			}
		}
	},
	removeCart: function(arr,val){ //删除购物车中具体的产品
		for(var i=0; i<arr.length; i++) {
			if(arr[i].product_id == val) {
			  arr.splice(i, 1);
			  break;
			}
		}
	},
	delItem: function(e){ // 购物车删除操作
		var that = this;
		console.log(e.currentTarget.dataset);
		var id = e.currentTarget.dataset.id;
		var product_id = e.currentTarget.dataset.pid;
		var bigCate = e.currentTarget.dataset.topcate;
		var smallCate = e.currentTarget.dataset.category;
		wx.showModal({
		  content: '是否确认删除此商品？',
		  success: function(res) {
			if (res.confirm) {
			  that.deleteCart(product_id,bigCate,smallCate);
			} else if (res.cancel) {
			  console.log('用户点击取消')
			}
		  }
		})
		//that.deleteCart(product_id);
	},
	deleteCart: function(id,p_category,category){ //删除购物车数量
		var that = this;
		var list = that.data.cartInfo.list;
		var total = 0;
		wx.request({
			url: config.service.removeCartUrl,
			data: {
				userkey:app.data.user.userKey,
				product_id:id
			},
			success: function(res) {
				if(res.data.resultCode == 0){
					list.forEach(function(i,o){			
						i.value.forEach(function(m,n){
							if(m.value.length > 1){
								that.removeCart(m.value,id);
							}else{
								if(m.category == category){
									if(i.value.length > 1){
										that.removeVlue(i.value,category);
									}else{
										that.removeVluep(list,p_category);
									}
								}
							}
						})
					});									
					that.setData({
						cartInfo:{
							list:list
						}						
					});	
					app.getCartNum(app.data.user.userKey);
					that.getTotal();
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
	},
    btnBuy: function(){ // 提交订单
		var that = this;
		var subArr = []; //提交的数组
		var list = that.data.cartInfo.list;
		list.forEach(function(i,o){
			i.value.forEach(function(d,k){
				var objData = {
					category:'',
					value:[]
				};
				if(d.checked){
					subArr.push(d);
				}else{
					d.value.forEach(function(m,p){
						if(m.checked){
							objData.category = d.category;
							objData.value.push(m);
						} 
					});
					if(objData.value.length > 0){
						subArr.push(objData);
					}
				}
			});
		});
		if(subArr.length > 0){
			wx.removeStorageSync('cartInfoSubmit');	
			wx.removeStorageSync('submitOrder');
			wx.setStorageSync('cartInfoSubmit',subArr);
			wx.navigateTo({
			  url: '/pages/price/submitOrder'
			})
		}else{
			wx.showToast({
				title: '请选择需要下单的产品！',
				icon: 'none',
				duration: 2000
			});
		}
    },
	minusTap: function(e){ //减操作
			var that = this;
			var id = e.currentTarget.dataset.id;
			var list = that.data.cartInfo.list;
			var amount = 0;			
			list.forEach(function(i,o){
				i.value.forEach(function(j,m){
					j.value.forEach(function(k,h){
						if(k.product_id == id){
							var num = k.amount;
							num = (num*10000 - 10000)/10000;
							if(num >= 1){
								k.amount = num.toFixed(4);
								amount = k.amount;								
								that.setData({
									cartInfo:{
										list:list
									}									
								});					
							}else{					
								wx.showToast({
									title: '该商品的最小购买量为1吨！',
									icon: 'none',
									duration: 2000
								});
								amount = 1;
								that.setData({
									cartInfo:{
										list:list
									}
								});						
							}
						}
					})
				})
			})
			var minusNum = amount;
			var options = {
					product_id:id,
					userkey:app.data.user.userKey,
					packing:e.currentTarget.dataset.item.packing,
					//deliver:e.currentTarget.dataset.item.delivery_type,
					deliver:'自提',
					warehouse:e.currentTarget.dataset.item.warehouse_id,
					amount:minusNum
				};
			console.log(minusNum,'minusNum');
			if(minusNum >= 1){
				that.updateCart(options);
			}else{				
				that.deleteCart(id);
			}
	},
	addTap: function(e){ //加操作
			var that = this;			
			var id = e.currentTarget.dataset.id;
			var list = that.data.cartInfo.list;
			var amount = 0;
			list.forEach(function(i,o){
				i.value.forEach(function(j,m){
					j.value.forEach(function(k,h){
						if(k.product_id == id){
							var num = k.amount;
							num = (num*10000 + 10000)/10000;
							if(num < 1000 || num == 1000){
								k.amount = num.toFixed(4);
								amount = k.amount;							
								that.setData({
									cartInfo:{
										list:list
									}
								});
							}else{					
								wx.showToast({
									title: '该商品的最大购买量为1000吨！',
									icon: 'none',
									duration: 2000
								});
								that.setData({
									cartInfo:{
										list:list
									}
								});						
							}
						}
					})
				})
			})
			var addNum = amount;
			var options = {
					product_id:id,
					userkey:app.data.user.userKey,
					packing:e.currentTarget.dataset.item.packing,
					//deliver:e.currentTarget.dataset.item.delivery_type,
					deliver:'自提',
					warehouse:e.currentTarget.dataset.item.warehouse_id,
					amount:addNum
				};
			if(addNum > 0){
				that.addCart(options);
			}
	},
	updateCart: function(options){
		var that = this;
		var list = that.data.cartInfo.list;
		var totalP = 0;
		wx.request({
				url: config.service.modifyCartUrl,
				data: options,
				success: function(res) {
						console.log(res)
					if(res.data.resultCode == 0){
						list.forEach(function(i,o){
							i.value.forEach(function(m,n){
								m.value.forEach(function(j,k){
									if(j.product_id == options.product_id){
										j.amount = parseFloat(options.amount).toFixed(4);									
									}						
								})
							})
						});
						that.setData({
							cartInfo:{
								list:list
							}
						});	
						that.getTotal();
					}
				},
				fail: function(res) {
					console.log('失败', res)
				}
			})
	},
	addCart: function(options){//增加购物车数量
		var that = this;
		var list = that.data.cartInfo.list;
		var total = 0;
		wx.request({
				url: config.service.addCartUrl,
				data: options,
				success: function(res) {			
					if(res.data.resultCode == 0){
						list.forEach(function(i,o){
							i.value.forEach(function(m,n){
								m.value.forEach(function(j,k){
									if(j.product_id == options.product_id){
										j.amount = parseFloat(options.amount).toFixed(4);								
									}					
								})
							})
						});						
						that.setData({
							cartInfo:{
								list:list
							}
						});	
						that.getTotal();
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
			var left = disX > delBtnWidth/3 ? "margin-left:-"+delBtnWidth+"rpx":"";
			var list = that.data.cartInfo.list;
			list.forEach(function(i,o){
				i.value.forEach(function(j,m){
					j.value.forEach(function(k,n){
						if(k.id == id){
							k.left = left;
						}else{
							k.left = '';
						}
					})
				})
			});
			that.setData({
				cartInfo:{
					list:list
				}
			});
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
			list.forEach(function(i,o){
				i.value.forEach(function(j,m){
					j.value.forEach(function(k,n){
						if(k.id == id){
							k.left = left;
						}else{
							k.left = '';
						}
					})
				})
			});
			//list[0].value[0].value[0].left = left;
			if(disX < delBtnWidth/3 || Math.random() > 0.7)
				return;
			that.setData({
				cartInfo:{
					list:list
				}
			});
		}
	}
})
