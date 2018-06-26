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
    onLoad: function () {
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
        this.getList(1);
    },
    onReady: function(){
        wx.setNavigationBarTitle({
            title: (app.data.user.type == 2 ? '部门经理' : '业务员') + '管理'
        });
    },
    calling: function(e){ // 拨打电话
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.phone
        });
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
                    that.setData({
                        timeDate: ''
                    });
                    res.data.data.data.forEach(function(o, i){
                        var time = o.create_time.slice(0, 10).split('-'),
                            date = time[0] + '年' + time[1] + '月' + time[2] + '日';
                        if (date != that.data.timeDate){
                            that.data.timeDate = date;
                            o.timeDate = date;
                        }
                        if (i == res.data.data.data.length - 1){
                            that.data.lastId = o.order_id;
                        }
                    });

                    that.setData({
                        orderList: (lastId ? that.data.orderList.concat(res.data.data.data) : res.data.data.data),
                        count: res.data.data.count,
                        tabs: ['待处理订单' + (res.data.data.count ? ' (' + res.data.data.count + ')' : ''), '已处理订单']
                    });
                    console.log(res.data.data, util.formatTime, 1111111111);
                }
                else if (res.data.resultCode == 0 && res.data.data && res.data.data.length == 0 && lastId){ // 加载完了
                    that.setData({
                        isNoMore: true
                    });
                }
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
