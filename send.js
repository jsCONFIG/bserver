/**
 * send 数据发送，非chunked模式
 * @param  {[type]} res         [description]
 * @param  {[type]} content     [description]
 * @param  {[type]} contentType [description]
 * @return {[type]}             [description]
 */
module.exports = function ( res, content, contentType ) {
        var srcContent = content || ' ';

        // 头信息设置
        var headSettings = {};
        headSettings['Content-Length']   = Buffer.byteLength( srcContent );
        headSettings['Content-Type']     = contentType;

        // 实际发送处理
        res.writeHead( 200, headSettings );
        res.end(srcContent);
    };