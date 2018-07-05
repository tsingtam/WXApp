//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

var app = getApp();

Page({
    data: {
        orderList: null, // 列表数据
        count: 0, // 待处理数量
        stat: 1, // Tab页卡
        lastId: '', // 最后一条的id
        timeDate: '', // 时间分割线
        isNoMore: false, // 是否加载完了
        sales: [], // 显示用
        salesList: [], // 原始数据
        tabs: ['待处理订单', '已处理订单'],
        activeIndex: 0, // 页卡类型索引
        sliderOffset: 0,
        sliderLeft: 0
    },
    onPullDownRefresh: function(){
        this.getList(this.data.stat);
    },
    onReachBottom: function(){
        if (!this.data.isNoMore){
            this.getList(this.data.stat, this.data.lastId);
        }
    },
    onShow: function () {
        var that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });

        that.setData({
            isNoMore: false
        });
        this.getList(that.data.stat);
    },
    onReady: function(){
        var that = this;
        that.setData({
            userType: app.data.user.type
        });
        wx.setNavigationBarTitle({
            title: (app.data.user.type == 2 ? '部门经理' : '业务员') + '管理'
        });

        // 业务员列表
        wx.request({
            url: config.service.adminOrderSalesUrl,
            data: {
                // order_id: app.data.orderDetailId,
                userkey: app.data.user && app.data.user.userKey
            },
            success: function(res) {
                if (res.data.resultCode == 0 && res.data.data){
                    var sales = [];
                    res.data.data.forEach(function(o, i){
                        sales.push(o.real_name + ' ' + o.mobile);
                    });
                    that.setData({
                        sales: sales,
                        salesList: res.data.data
                    });
                }
            },
            fail: function(res) {
                console.log('失败', res)
            }
        });
    },
    calling: function(e){ // 拨打电话
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        });
    },
    catch: function(){ // 阻止冒泡

    },
    receive: function(e){ // 接单
        var that = this,
            id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '确认接单？',
            content: '接单后将确认订单归属人',
            confirmText: "确认",
            confirmColor: "#366ec8",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    wx.request({
                        url: config.service.adminOrderReceiveUrl,
                        data: {
                            order_id: id,
                            userkey: app.data.user && app.data.user.userKey
                        },
                        success: function(res) {
                            if (res.data.resultCode == 0 && res.data.data){
                                wx.showToast({
                                  title: '接单成功',
                                  icon: 'success',
                                  duration: 2000
                                });
                                // setTimeout(function(){
                                //     wx.navigateBack();
                                // }, 2000);
                                var orderList = that.data.orderList;
                                orderList.forEach(function(o, i){
                                    if(o.order_id == id){
                                        o.order_status = 1;
                                    }
                                    delete o.timeDate;
                                });
                                that.setData({
                                    timeDate: ''
                                });
                                that.doTimeDate(orderList);
                                that.setData({
                                    orderList: orderList
                                });
                                // that.setData({
                                //     'detail.order_status' : 1
                                // });
                                // that.getDetail();
                            }
                            else {
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
                }
            }
        });
    },
    create: function(e){ // 生成购销单
        var that = this,
            id = e.currentTarget.dataset.id;

        wx.showToast({
          title: '新功能即将开放，敬请期待！',
          icon: 'none',
          duration: 2000
        });
        return;

        wx.request({
            url: config.service.adminOrderCreateUrl,
            data: {
                order_id: id,
                userkey: app.data.user && app.data.user.userKey
            },
            success: function(res) {
                if (res.data.resultCode == 0 && res.data.data){
                    wx.showToast({
                      title: '生成购销单成功',
                      icon: 'success',
                      duration: 2000
                    });
                    // setTimeout(function(){
                    //     wx.navigateBack();
                    // }, 2000);
                }
                else {
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
    deal: function(e){ // 完成ERP
        var that = this,
            id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '确认已录入ERP？',
            content: '',
            confirmText: "确认",
            confirmColor: "#366ec8",
            cancelText: "取消",
            success: function (res) {
                console.log(res);
                if (res.confirm) {
                    wx.request({
                        url: config.service.adminOrderDealUrl,
                        data: {
                            order_id: id,
                            userkey: app.data.user && app.data.user.userKey
                        },
                        success: function(res) {
                            if (res.data.resultCode == 0 && res.data.data){
                                wx.showToast({
                                  title: '完成ERP成功',
                                  icon: 'success',
                                  duration: 2000
                                });
                                var orderList = that.data.orderList;
                                orderList.forEach(function(o, i){
                                    if(o.order_id == id){
                                        that.data.orderList.splice(i, 1);
                                    }
                                    delete o.timeDate;
                                });
                                that.setData({
                                    timeDate: ''
                                });
                                that.doTimeDate(orderList);
                                that.setData({
                                    orderList: orderList
                                });
                                // setTimeout(function(){
                                //     wx.navigateBack();
                                // }, 2000);
                            }
                            else {
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
                }
            }
        });
    },
    bindPickerChange: function(e) { // 转单
        var that = this,
            id = e.currentTarget.dataset.id;
        
        that.setData({
            index: e.detail.value
        });
        
        if (that.data.salesList[e.detail.value]){
            wx.showModal({
                title: '确认转给其他业务员？',
                content: '',
                confirmText: "确认",
                confirmColor: "#366ec8",
                cancelText: "取消",
                success: function (res) {
                    console.log(res);
                    if (res.confirm) {
                        wx.request({
                            url: config.service.adminOrderTransferUrl,
                            data: {
                                order_id: id,
                                sale_id: that.data.salesList[e.detail.value].id,
                                userkey: app.data.user && app.data.user.userKey
                            },
                            success: function(res) {
                                if (res.data.resultCode == 0 && res.data.data){
                                    wx.showToast({
                                      title: '转单成功',
                                      icon: 'success',
                                      duration: 2000
                                    });
                                    var orderList = that.data.orderList;
                                    orderList.forEach(function(o, i){
                                        if(o.order_id == id){
                                            that.data.orderList.splice(i, 1);
                                        }
                                        delete o.timeDate;
                                    });
                                    that.setData({
                                        timeDate: ''
                                    });
                                    that.doTimeDate(orderList);
                                    that.setData({
                                        orderList: orderList
                                    });
                                    // setTimeout(function(){
                                    //     wx.navigateBack();
                                    // }, 2000);
                                }
                                else {
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
                    }
                }
            });
        }
        // else {
        //     wx.showToast({
        //       title: '请选择业务员',
        //       icon: 'none',
        //       duration: 2000
        //     });
        // }
    },
    doTimeDate: function(data){
        var that = this;
        data.forEach(function(o, i){
            var time = o.create_time.slice(0, 10).split('-'),
                date = time[0] + '年' + time[1] + '月' + time[2] + '日';
            if (date != that.data.timeDate){
                that.data.timeDate = date;
                o.timeDate = date;
            }
            if (i == data.length - 1){
                that.data.lastId = o.order_id;
            }
        })
    },
    getList: function(stat, lastId){
        var that = this;
        if (!lastId){
            that.setData({
                isNoMore: false
            });
        }
        wx.request({
            url: config.service.adminOrderListUrl,
            data: {
                stat: stat,
                last_id: (lastId ? lastId : ''),
                userkey: app.data.user && app.data.user.userKey
            },
            success: function(res) {
                if (res.data.resultCode == 0 && res.data.data && res.data.data.data){
                    // 数据预处理
                    if (!lastId){
                        that.setData({
                            timeDate: ''
                        });
                    }
                    that.doTimeDate(res.data.data.data);

                    that.setData({
                        orderList: (lastId ? that.data.orderList.concat(res.data.data.data) : res.data.data.data),
                        count: res.data.data.count,
                        tabs: ['待处理订单' + (res.data.data.count ? ' (' + res.data.data.count + ')' : ''), '已处理订单']
                    });
                    console.log(res.data.data, util.formatTime, 1111111111);
                    
                    if (res.data.data.data.length == 0 && lastId){ // 加载完了
                        that.setData({
                            isNoMore: true
                        });
                    }
                }
                wx.stopPullDownRefresh();
            },
            fail: function(res) {
                console.log('失败', res)
            }
        })
    },
    view: function(e){
        var that = this;
        app.data.orderDetailId = e.currentTarget.dataset.id || '';
        app.data.orderActiveIndex = that.data.activeIndex;
        wx.navigateTo({
            url: '/pages/user/adminView'
        });
    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });

        this.data.stat = 1 + parseInt(e.currentTarget.id);

        this.getList(this.data.stat);
    }
})
