var url = require('url');
var http = require('http');
var request = require('request');

function post(opts, data) {
    return new Promise ((resolve, reject) => {

        console.log(opts);
		request.post(opts, data, function (error, response, body) {
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
	// var data = 1;
	// request('http://www.lvdaniu.com/news/sync-get-news-list', function (error, response, body) {
	//   console.log('error:', error); // Print the error if one occurred
	//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	//   console.log('body:', body); // Print the HTML for the Google homepage.
	//   data = JSON.stringify(response);
	// })

    // ctx.state.data = data
    var news
    var price
    var query = url.parse(ctx.url, true).query;
    console.log(query);

    if (query.type == 'price') {
        news = await post('http://www.lvdaniu.com/news/sync-get-news-list')
        price = await post('http://www.lvdaniu.com/quotations/index?period=w')

        ctx.state.data = {
            news: news,
            price: price
        }
    }
    else {
        news = await post('http://www.lvdaniu.com/news/sync-get-news-list', {
            form: query
        })

        ctx.state.data = {
        	news: news
        }
    }
}
