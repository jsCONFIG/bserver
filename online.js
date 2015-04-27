var http = require('http');
var dns = require('dns');

// 从线上获取相关数据
module.exports = function (req, res, srcPath, cbk, cf) {
    if (!srcPath) {
        cbk && cbk('No path!');
        return;
    }

    var reqHost = req.headers.host,
        // dns解析获取数据，避免受本地host干扰
        serverHost;

    dns.resolve4( reqHost, function(err, addresses) {
        // 临时内容存储，针对多次"data"事件的内容拼合
        // var tmpContent = [],
        //     contentType;

        serverHost = (addresses && addresses[0]) || req.headers.host;

        var headersCopy = JSON.parse(JSON.stringify(req.headers));

        // 用于指定Host
        var aliasHost = cf && cf['ALIAS_HOST'] && cf['ALIAS_HOST'][reqHost];

        headersCopy['accept-encoding'] = '*';

        var reqParam = {
            // 配置的别名host优先
            'host': aliasHost || serverHost || req.headers.host,
            'port': 80,
            'path': req.url,
            'method': req.method,
            'headers': headersCopy,
            'agent': false
        };

        var proxyReq = http.request(reqParam, function( proxyRes ) {
            var tmpContent = [],
                contentType;

            // 代理返回的content-type值
            contentType = proxyRes.headers['content-type'];

            // 无数据
            if( proxyRes.statusCode == '404' ) {
                console.log( 'Error: 404 not found for ' + srcPath );
                res.end('404 not found!');
                return;
            }

            proxyRes.on( 'data', function ( chunk ) {
                res.write(chunk);
            });

            proxyRes.on( 'end', function () {
                // 结束请求
                res.end();
            });
        });

        proxyReq.on('error', function(e) {
            console.log(e);
        });

        // 启动
        req.pipe( proxyReq );
        
    });
};