const fs = require('fs')
const path = require('path')
const tryRequire = require("./lib/try-require");
const main = require("./lib/main");


module.exports = (option) => {
    options = Object.assign({}, option);

    if (process.env.NODE_ENV != 'production') {

        const SSRBuilder = tryRequire("flow-build");
        if (!SSRBuilder) {
            console.log("Please npm install --save-dev flow-build");
            throw new Error(
                '[flow-proxy-middleware] SSRBuilder: true requires flow-build ' +
                  'as a peer dependency.'
            );
            return false;
        }

        let flowConfig = tryRequire(path.resolve(process.cwd(),'./flow.config.js'));

        if (!flowConfig) {
            throw new Error(
                '[flow-proxy-middleware] proxy: true requires flow.config.js'
            );
            return false;
        }

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
            let result = await main(req, res, httpProxyMiddleware, flowConfig.dev.proxy);
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


