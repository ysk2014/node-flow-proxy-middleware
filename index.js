const fs = require('fs')
const path = require('path')
const tryRequire = require("./lib/try-require");
const main = require("./lib/main");


module.exports = (option) => {
    options = Object.assign({}, option);

    if (process.env.NODE_ENV != 'production') {

        let httpProxyMiddleware = tryRequire("http-proxy-middleware");
        if (!httpProxyMiddleware) {
            console.log("Please npm install --save-dev http-proxy-middleware");
            throw new Error(
                '[flow-proxy-middleware] proxy: true requires http-proxy-middleware ' +
                    'as a peer dependency.'
            );
            return false;
        }

        return async function(req, res, next) {
            let result = await main(req, res, httpProxyMiddleware, options);
            if (result) {
                next();
            }
        }
    } else {
        return function(req, res, next) {
            next();
        };
    }
}


