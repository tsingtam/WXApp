var url = require('url');
var http = require('http');
var request = require('request');
var WXBizDataCrypt = require('../tools/WXBizDataCrypt')
const qcloud = require('../qcloud')
const config = require('../config')

function post(opts) {
    return new Promise ((resolve, reject) => {
        // console.log(opts.code);
        // return http({
        //     url: 'https://api.weixin.qq.com/sns/jscode2session',
        //     method: 'GET',
        //     params: {
        //         appid: appid,
        //         secret: appsecret,
        //         js_code: opts.code,
        //         grant_type: 'authorization_code'
        //     }
        // }).then(res => {
        //     res = res.data
        //     console.log(res);
        //     if (res.errcode || !res.openid || !res.session_key) {
        //         debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res.errmsg)
        //         throw new Error(`${ERRORS.ERR_GET_SESSION_KEY}\n${JSON.stringify(res)}`)
        //     } else {
        //         debug('openid: %s, session_key: %s', res.openid, res.session_key)
        //         return res
        //     }
        // })
		request(opts, function (error, response, body) {
            if(!error && response.statusCode == 200){
                if(body!=='null'){
                    results=JSON.parse(body);
                    resolve(results);
                }
            }
		});
    });
}


module.exports = async (ctx, next) => {
    const appid = config.appId
    const appsecret = config.appSecret

    var query = url.parse(ctx.url, true).query;

    // var sessionKey = '991d5883ae0636ac4ac79c28e434bc8300046af0'
    var code = query.code
    var encryptedData = query.encryptedData
    var iv = query.iv
    
    const getSessionKey = await post({
        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + appsecret + '&js_code=' + code + '&grant_type=authorization_code'
    })
    // console.log(getSessionKey);

    // var sessionKey = query.sessionKey

    var pc = new WXBizDataCrypt(appid, getSessionKey.session_key)

    // var data
    // console.log(qcloud);
    var data = pc.decryptData(encryptedData , iv)

    // console.log(appId, query, sessionKey, qcloud, data);

    ctx.state.data = data
}
