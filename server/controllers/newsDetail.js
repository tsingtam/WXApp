var url = require('url');
var http = require('http');
var request = require('request');

function post(opts) {
    return new Promise ((resolve, reject) => {
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
    const data = await post({
        url: 'http://www.lvdaniu.com/news/sync-get-news',
        body: url.parse(ctx.url).query
    })

    // console.log(url.parse(ctx.url, true).query, next);

    ctx.state.data = data
}
