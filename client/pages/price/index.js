//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var app = getApp();
var detailArr = [];
var total = 0;

Page({
    data: {
		cartInfo:{
			list:[]
		},
		cartId:[],
		isNoMore:true,
		testArr:[],
		totalPrice:0,
		disabledColor:false,
		allSelect:false,//全选
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
	onPullDownRefresh: function(){
        this.onShow();
		app.getCartNum(app.data.user.userKey);
    },
	toIndexPage: function(){
		wx.switchTab({
			url: '/pages/bid/hall'
		});
	},
	getAmount: function(e){
		var that = this;
		var inputValue = e.detail.value;
		var product = e.currentTarget.dataset.item;		
		var amount = product.amount;
		if(parseInt(inputValue) < 0){
			console.log(inputValue,'inputValue');

		}
		if(inputValue < 0.05){
			that.setData({
				disabledColor:true,
			});
		}
		if(parseFloat(e.detail.value*10000) > parseInt(amount*10000)){
			var addNum = parseFloat(e.detail.value*10000) - parseInt(amount*10000);
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
		}else if(parseFloat(e.detail.value*10000) < parseInt(amount*10000)){
			var minusNum =parseInt(amount*10000) - parseFloat(e.detail.value*10000);
			if(minusNum > 0){
				that.deleteCart(product.product_id,minusNum/10000);
			}else{
				that.deleteCart(product.product_id);
			}
		}		
	},
	checkboxChangeT: function(e){ // 选择大类
		var that = this;
		var index = e.currentTarget.dataset.index;
		var list = that.data.cartInfo.list;
		var idArr = that.data.cartId;
		var marks =0;
		if(index!=="" && index != null){
			list[parseInt(index)].checked = !list[parseInt(index)].checked ; 
			var firstArr = list[parseInt(index)].value;
			for(var j = 0,leng = firstArr.length;j<leng;j++){
				var secondArr = firstArr[j].value;
				var objData = {
					category:list[parseInt(index)].value[parseInt(j)].category,
					value:[]
				};
				if(list[parseInt(index)].checked && !list[parseInt(index)].value[parseInt(j)].checked){
					list[parseInt(index)].value[parseInt(j)].checked = !list[parseInt(index)].value[parseInt(j)].checked;
				}else if(!list[parseInt(index)].checked){
					list[parseInt(index)].value[parseInt(j)].checked = !list[parseInt(index)].value[parseInt(j)].checked;
				}
				for(var k = 0,lengt = secondArr.length;k<lengt;k++){
					var item = list[parseInt(index)].value[parseInt(j)].value[parseInt(k)];
					console.log(list[parseInt(index)].value[parseInt(j)].category);
					if(list[parseInt(index)].checked && !item.checked){
						item.checked = !item.checked;						
						objData.value.push(item);
					}else if(!list[parseInt(index)].checked){
						item.checked = !item.checked;
						that.removeVlue(objData.value,item.id);
					}
					if(item.checked){
						total+= parseFloat(item.amount)*item.price*10000;
					}else{
						total = total - parseFloat(item.amount)*item.price*10000;
					}
					that.setData({
						cartInfo:{
							list:list
						},			
						totalPrice:(total/10000).toFixed(2)
					});		
				}				
				idArr.push(objData);
				that.setData({
					cartId:idArr
				});
			}
			list.forEach(function(i,o){
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
		var idArr = that.data.cartId;
		list.forEach(function(i,o){

			i.value.forEach(function(j,m){

				var objData = {
					category:'',
					value:[]
				};
				if(j.category == id){
					j.checked = !j.checked;
					objData.category = j.category;
					j.value.forEach(function(k,n){
						if(!k.checked){
							k.checked = !k.checked;
							//idArr.push(item);
							objData.value.push(k);
						}else if(!j.checked){
							k.checked = !k.checked;
							that.removeVlue(idArr,j.category);
						}						
						if(j.checked){
							total+= parseFloat(k.amount)*k.price*10000;
						}else{
							total = total - parseFloat(k.amount)*k.price*10000;
						}
						console.log(list,'list');
						that.setData({
							cartInfo:{
								list:list
							},
							//cartId:idArr,
							totalPrice:parseFloat(total/10000).toFixed(2)
						});
					});
					if(objData.value.length > 0){
						idArr.push(objData);
						that.setData({
							cartId:idArr,
						});
					}
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
		/*for(var i = 0,len = list.length;i < len;i++){
			var firstArr = list[i].value;
			for(var j = 0,leng = firstArr.length;j<leng;j++){
				var secondArr = firstArr[j].value;
				var secondArrItem = firstArr[j];
				var obj = list[parseInt(i)].value[parseInt(j)];
				var objData = {
					category:'',
					value:[]
				};
				if(firstArr[j].category == id){
					list[parseInt(i)].value[parseInt(j)].checked = !list[parseInt(i)].value[parseInt(j)].checked;
					objData.category = obj.category;
					for(var k = 0,lengt = secondArr.length;k<lengt;k++){
						var item = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)];
						if(!item.checked){
							item.checked = !item.checked;
							//idArr.push(item);
							objData.value.push(item);
						}else if(!list[parseInt(i)].value[parseInt(j)].checked){
							item.checked = !item.checked;
							that.removeVlue(idArr,obj.category);
						}
						if(item.checked){
							total+= parseFloat(item.amount)*item.price*10000;
						}else{
							total = total - parseFloat(item.amount)*item.price*10000;
						}
						that.setData({
							cartInfo:{
								list:list
							},
							//cartId:idArr,
							totalPrice:parseFloat(total/10000).toFixed(2)
						});		
					}
					if(objData.value.length > 0){
						idArr.push(objData);
						that.setData({
							cartId:idArr,
						});
					}
					if(obj.checked){
						times++;
					}
					if(times == firstArr.length){
						list[parseInt(i)].checked = !list[parseInt(i)].checked;	
						that.setData({
							cartInfo:{
								list:list
							}
						});
					}else if(times != firstArr.length && list[parseInt(i)].checked){
						list[parseInt(i)].checked = !list[parseInt(i)].checked;					
						that.setData({
							cartInfo:{
								list:list
							}
						});
					}
				}
				if(secondArrItem.checked){
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
			}
		}*/
	},
	checkboxChangeB: function(e){ // 选择具体
		var that = this;			
		var id = e.currentTarget.dataset.id;		
		var list = that.data.cartInfo.list;
		var type = '';
		var category_id = e.currentTarget.dataset.category;
		var cateType = e.currentTarget.dataset.catetype;
		var selectTimes = 0;
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
						if(k.checked){	
							objData.value.push(k);
							if(detailArr.length > 0){								
								detailArr.forEach(function(t,o){
									if(t.category == type){
										detailArr[o].value.push(k);																			
									}else if(JSON.stringify(detailArr).indexOf(type) == -1){
										detailArr.push(objData);										
									}
								})															
							}else{
								detailArr.push(objData);								
							}						
							total = (that.data.totalPrice*1000 + parseFloat(k.amount)*k.price*1000)/1000
						}else{					
						
							detailArr.forEach(function(p,o){							
								if(p.category == type && p.value.length > 1){
									that.removeVlues(p.value,k.id);									
								}
								else{
									that.removeVlue(detailArr,type);									
								}
							})
							total = (that.data.totalPrice*1000 - parseFloat(k.amount)*k.price*1000)/1000
						}						
						that.setData({
							cartInfo:{
								list:list
							},
							cartId:detailArr,
							totalPrice:total.toFixed(2)
						});
					}
								
					if(k.checked && category_id == k.product.category_id){
						selectTimes++;
					}					
					console.log(selectTimes);					
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
		var total = 0;
		var idArr = [];	
		that.data.allSelect = !that.data.allSelect;
		if(that.data.allSelect){
			list.forEach(function(i,o){
				i.value.forEach(function(a,b){
					idArr.push(a);
				})
			});
		}else{
			idArr = []
		}
		that.setData({
			cartId:idArr
		});
		for(var i = 0,len = list.length;i < len;i++){
			if(!list[i].checked && that.data.allSelect || list[i].checked && !that.data.allSelect){
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
						if(item.checked){
							total+= parseFloat(item.amount)*item.price*1000;
						}
						that.setData({
							cartInfo:{
								list:list
							},						
							totalPrice:(total/1000).toFixed(2)
						});		
					}
				}
			}
				
		}
	},
	removeVlue: function(arr,val){
		for(var i=0; i<arr.length; i++) {
			if(arr[i].category == val) {
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
    btnBuy: function(){ // 提交订单
		var that = this;
		if(that.data.cartId.length > 0){
			wx.setStorageSync('cartInfoSubmit',that.data.cartId);
			wx.navigateTo({
			  url: '/pages/price/submitOrder'
			})
		}else{
			wx.showModal({
			  title: '提示',
			  content: '请选择结算的订单！',
			  showCancel: false
			});
		}
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
							//list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount--;
							var a = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount;
							a = (a*10000 - 10000)/10000;							
							if(a > 0){
								list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount = a.toFixed(4);
							}
							amount = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount;
							if(amount < 0.05){
								that.setData({
									disabledColor:true,
								});
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
							//list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount++;
							var a = list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount;
							a = (a*10000 + 10000)/10000;
							list[parseInt(i)].value[parseInt(j)].value[parseInt(k)].amount = a.toFixed(4);							
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
		var that = this;
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
