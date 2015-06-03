/**
 * staticParse 提供对combie的静态资源进行拆分
 * 支持将拆分后的数据划分到相应的本地目录中，之后走本地缓存
 * 支持直接从本地开发路径下提取资源
 * 支持额外直接走线上资源src配置
 * 支持额外走本地缓存资源src配置
 * !!!!!不支持https请求！！
 * @type {[type]}
 */
var http = require('http');
var path = require('path');
var url  = require('url');
var ctype = require('./mime');
var fs = require('fs');
var online = require('./online');
var local = require('./local');
var send = require('./send');

// 读配置信息
var CONFIG = require('./config.json');

var reg = {
    file: /^.*\.([a-zA-Z\_0-9]+)$/
};

var getCtype = function (fPath) {
    var matchArr = fPath.match(reg.file);
    console.log(fPath);
    if (matchArr) {
        return ctype[matchArr[1]];
    }
    return false;
};

// 辅助过滤器检查方法
var checkList = function (listArr, pathStr) {
    var flag = false;

    listArr.forEach( function (listItem, listIndex) {
        if(!flag) {
            var pos = pathStr.indexOf(listItem);
            if (pos != -1) {
                flag = true;
                return false;
            }
        }
    });

    return flag;
};

// 判断当前路径是否需要监听，需要则返回true，否则返回false
var isNeedToLocal = function (pathStr, myHost){
    var flag = false;

    // 判断是否全走本地
    if (CONFIG.ALL_TO_LOCAL) {
        return true;
    }

    // 判断该Host是否走本地
    if (CONFIG.TO_LOCAL_HOST) {
        flag = (CONFIG.TO_LOCAL_HOST || []).indexOf(myHost) != -1;
    }

    // 判断该路径是否走本地
    if (!flag && CONFIG.TO_LOCAL_PATH && CONFIG.TO_LOCAL_PATH.length) {
        flag = checkList(CONFIG.TO_LOCAL_PATH, pathStr);
    }

    return flag;
};

console.log('Bserver started.');

// 创建服务器
http.createServer(function ( req, res ){
        // 实际返回内容
    var srcContent = '',

        // 当前url的parse信息
        urlInfo = url.parse( req.url );

    // send(res, JSON.stringify(urlInfo));
    // console.log(req);
    // return;

    var currentHost = req.headers.host,
        srcPath = (currentHost + (urlInfo.path || '')),
        localPath = isNeedToLocal(srcPath, currentHost);


    var cType = getCtype(srcPath);
    if (!cType) {
        cType = ctype['html'];
    }

    if (localPath) {
            local(res, CONFIG.LOCAL_DIR + (urlInfo.path || ''), cType, CONFIG);
            return;
    }

    online(req, res, srcPath, function (content) {
        send(res, content);
    }, CONFIG);
    
}).listen(80, '0.0.0.0');