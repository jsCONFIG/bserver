/**
 * 读取本地文件返回
 * @return {[type]} [description]
 */
var send = require('./send');
var fs = require('fs');

module.exports = function (res, filePath, cType, cf) {
    var content = '';
    if (cf && cf.LOCAL_DIR) {
        filePath = cf.LOCAL_DIR + filePath;
    }

    fs.readFile( filePath, function( err, data ){
        if( !err ) {
            content = data.toString( 'utf-8' );
        }
        else {
            content = "Can't find the file " + filePath;
        }

        send(res, content, cType);
    });

    
};