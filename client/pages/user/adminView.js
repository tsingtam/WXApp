//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
    data: {
        index: 0,
        array: ['王迪 18810371663', '王迪哈 18810371663', '王中迪 18810371663', '王先迪 18810371663', '王吃迪 18810371663', '王去迪 18810371663']
    },
    onLoad: function () {
        wx.previewImage({
          current: 'https://pro.modao.cc/uploads3/images/1940/19401098/raw_1524634700.png', // 当前显示图片的http链接
          urls: ['https://pro.modao.cc/uploads3/images/1940/19401098/raw_1524634700.png'] // 需要预览的图片http链接列表
        })
    },
    bindPickerChange: function(e) {
        this.setData({
            index: e.detail.value
        })
    }
})
