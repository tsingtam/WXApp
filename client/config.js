/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://jx.lvdaniu.com';
// var host = 'https://uipxekai.qcloud.la';
// var host = 'https://559064535.lvdaniu.com';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 新闻
        newsUrl: `${host}/weapp/news`,
		
		// 新闻详情
		newsDetailUrl: `${host}/weapp/newsDetail`,

        // openId
        openId: `${host}/weapp/openId`,

        // 登录地址，用于建立会话
        loginUrl: `${host}/site/login`,
		
		// 获取手机验证码
		getVerfCodeUrl:`${host}/site/gen-verf-code`,
        
        // 用户协议
        licenseUrl:`${host}/client/view-license`,
		
		// 企业认证
		companyAuthUrl:`${host}/client/authenticate`,
		
		//企业识别码判断
		companyCodeUrl:`${host}/client/auth-required`,
		
		// 产品类别
		productTypeUrl:`${host}/product/get-search-label`,
		
		//产品列表(分类)
		productListUrl:`${host}/product/get-products`,
		
        //产品详情
        productDetailUrl:`${host}/product/detail`,
        
		//产品详情-联系卖方
		productDetailContactUrl:`${host}/product/sales`,
		
		//获取提货地
		getWareHouseUrl:`${host}/product/get-warehouses`,
		
		//加入购物车
		addCartUrl:`${host}/cart/add-goods-to-cart`,
		
		//修改购物车
		modifyCartUrl:`${host}/cart/modify-goods-in-cart`,
		
		//删除购物车
		removeCartUrl:`${host}/cart/del-goods-from-cart`,
		
		//获取购物车信息
		getCartInfoUrl:`${host}/cart/get-goods-in-cart`,
		
		//获取购物车数量
		getCartNumUrl:`${host}/cart/get-count-in-cart`,
		
		//提交订单
		submitOrderUrl:`${host}/order/save-order`,
		
		//立即下单
		immediateBuyUrl:`${host}/order/save-order-right`,
		
		//订单列表
		orderListUrl:`${host}/order/list`,
		
		//订单详情
		orderDetailUrl:`${host}/order/detail`,
		
		 // 管理-订单列表
        adminOrderListUrl:`${host}/mng/get-orders`,
        
        // 管理-订单详情
        adminOrderDetailUrl:`${host}/mng/get-order-detail`,
        
        // 管理-录入ERP
        adminOrderDealUrl:`${host}/mng/deal-order`,
        
        // 管理-销售列表
        adminOrderSalesUrl:`${host}/mng/get-sales`,
        
        // 管理-转单
        adminOrderTransferUrl:`${host}/mng/transfer`,
        
        // 管理-接单
        adminOrderReceiveUrl:`${host}/mng/receive`,
		
		// 管理-生成购销单
		adminOrderCreateUrl:`${host}/mng/create-confirmation-letter`,
		
		// 管理-取消订单
		adminOrderCancelUrl:`${host}/mng/cancel`,
		
        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`
    }
};

module.exports = config;
