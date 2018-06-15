//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')

Page({
    data: {
    },
    onShareAppMessage: function (res) {
        var that = this;
        if (res.from === 'button') {
          // 来自页面内转发按钮
          console.log(res.target, 'onShareAppMessage')
        }
        return {
          title: '铝大牛-撒牛币',
          path: 'pages/bid/hall?id=123',
          success: function(res) {
            // 转发成功
            var shareTicket = res.shareTickets[0]
            that.data.shareTicket = shareTicket;
            wx.getShareInfo({
                shareTicket: shareTicket,
                success: function(errMsg, encryptedData, iv){
                    console.log('getShareInfo success', encryptedData, iv);
                },
                fail: function(errMsg, encryptedData, iv){
                    console.log('getShareInfo fail', encryptedData, iv);
                }
            })
            console.log('转发成功');
          },
          fail: function(res) {
            // 转发失败
            console.log('转发失败');
          }
        }
    },
    onShow: function(){
        var that = this
        var app = getApp();
        that.setData({
            openGId: app.globalData.openGId,                 
        });
        if (!that.data.user){
            // wx.switchTab({
            //   url: '/pages/bid/hall'
            // });
            // wx.navigateTo({
            //     url: '../login/index'
            // });

            util.showBusy('正在登录')

            // 调用登录接口
            qcloud.login({
                success(result) {
                    if (result) {
                        util.showSuccess('登录成功')
                        that.setData({
                            userInfo: result,
                            logged: true
                        })
                    } else {
                        // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                        qcloud.request({
                            url: config.service.requestUrl,
                            login: true,
                            success(result) {
                                util.showSuccess('登录成功')
                                that.setData({
                                    user: result.data.data,
                                    logged: true
                                })
                                console.log(that.data);
                            },

                            fail(error) {
                                util.showModel('请求失败', error)
                                console.log('request fail', error)
                            }
                        })
                    }
                },

                fail(error) {
                    util.showModel('登录失败', error)
                    console.log('登录失败', error)
                }
            })
        }

        wx.showShareMenu({
          withShareTicket: true
        })

    },
    share: function(){
    }
})
