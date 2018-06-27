//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function (e) {
    	var that = this;
    	console.log(e, 'launch...');
        // qcloud.setLoginUrl(config.service.loginUrl)

        that.login();
    },
	onShow: function (e) {
		var that = this;
		console.log('App Show')
        console.log(e);
        /*
		wx.getShareInfo({
			shareTicket: e.shareTicket,
			success: function(res){
					console.log(res);
					// wx.getUserInfo({
					// 	success: function(data){
					// 		console.log('getUserInfo', data);
					// 	}
					// });
				  wx.login({
				    success: function(data) {
				      console.log('login', data)
				      wx.request({
				        url: config.service.openId,
				        data: {
				          code: data.code,
				          encryptedData: res.encryptedData,
				          iv: res.iv
				        },
				        success: function(res) {
				          // console.log('拉取openid成功', res)
				          // console.log(res.data);
				          if (res.data.code == 0){
				          	that.globalData.openGId = res.data.data.openGId
				          	console.log('get openGId', res.data.data.openGId);
				          }
				        },
				        fail: function(res) {
				          console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
				        }
				      })
			          // wx.request({
			          //   url: openIdUrl,
			          //   method: 'POST',
			          //   header: {
			          //     'content-type': 'application/x-www-form-urlencoded'
			          //   },
			          //   data: {
			          //     code: data.code,
			          //     data: res.encryptedData,
			          //     iv: res.iv,
			          //     sharing: 'false'
			          //   },
			          //   success: function (res) {
			          //   	console.log(res);
			          //   }
			          // });
				    },
				    fail: function(err) {
				      console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
				      callback(err)
				    }
				  })
			}
		});
		*/
	},
	onHide: function (e) {
		console.log('App Hide')
	},
	data: {
		user: null,
		hasLogin: false,
		openGId: '',
		openid: null,
		cartNum:0,
		newsContent: {}
	},
	login: function(){ // 登录
		var that = this;
	    wx.login({
	      success: function(res) {
	        if (res.code) {
	          wx.request({
	            url: config.service.loginUrl,
	            data: {
	              jscode: res.code
	            },
	            success: function(res){
	            	console.log(res, 'login success');
	            	if (res.data.resultCode == 0){
		            	that.data.user = res.data.data;
						var userkey = res.data.data.userKey;
						that.getCurrentPage().setData({
							user: res.data.data
						});
						wx.request({ //获取购物车数量
							url: config.service.getCartNumUrl,
							data: {
								userkey:userkey
							},
							success: function(res) {				
								if(res.data.resultCode == 0){
									if(res.data.data.count > 0){
										//that.setData({
										that.data.cartNum = parseInt(res.data.data.count);
										//});
										wx.setStorageSync('cartNum', res.data.data.count);
										wx.setTabBarBadge({
											index: 1,
											text: res.data.data.count
										});									
									}
								}
							},
							fail: function(res) {
								console.log('失败', res)
							}
						});
	            	}
	            	else {

	            	}
	            }
	          })
	          // wx.request({
	          //   url: config.service.productTypeUrl,
	          //   data: {
	              
	          //   },
	          //   success: function(res){
	          //   	console.log(res, '__product__');
	          //   }
	          // })
	        } else {
	          console.log('登录失败！' + res.errMsg)
	        }
	      }
	    });
	},
	getCartNum: function(userKey){//获取购物车数量
		wx.request({ 
			url: config.service.getCartNumUrl,
			data: {
				userkey:userKey
			},
			success: function(res) {				
				if(res.data.resultCode == 0){
					wx.setStorageSync('cartNum', res.data.data.count);
					if(res.data.data.count > 0){
						wx.setTabBarBadge({
							index: 1,
							text: res.data.data.count
						});									
					}else{
						wx.removeTabBarBadge({
							index:1
						});
					}
				}
				wx.stopPullDownRefresh();
			},
			fail: function(res) {
				console.log('失败', res)
			}
		});
	},
	// lazy loading openid
	getUserOpenId: function(callback) {
		var self = this

		if (self.globalData.openid) {
		  callback(null, self.globalData.openid)
		} else {
		  wx.login({
		    success: function(data) {
		      wx.request({
		        url: openIdUrl,
		        data: {
		          code: data.code
		        },
		        success: function(res) {
		          console.log('拉取openid成功', res)
		          self.globalData.openid = res.data.openid
		          callback(null, self.globalData.openid)
		        },
		        fail: function(res) {
		          console.log('拉取用户openid失败，将无法正常使用开放接口等服务', res)
		          callback(res)
		        }
		      })
		    },
		    fail: function(err) {
		      console.log('wx.login 接口调用失败，将无法正常使用开放接口等服务', err)
		      callback(err)
		    }
		  })
		}
	}
})