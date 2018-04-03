const contextMatcher = require("./context-matcher");

module.exports = (req, res, httpProxyMiddleware, proxyoptions) => {
    proxyoptions = dealProxyOptions(proxyoptions);

    const getProxyMiddleware = (proxyConfig) => {
        const context = proxyConfig.context || proxyConfig.path;

        if (proxyConfig.target) {
          return httpProxyMiddleware(context, proxyConfig);
        }
    };

    return new Promise((resolve, reject) => {
        proxyoptions.forEach((proxyConfigOrCallback) => {

            let proxyConfig;
            let proxyMiddleware;
    
            if (typeof proxyConfigOrCallback === 'function') {
                proxyConfig = proxyConfigOrCallback();
            } else {
                proxyConfig = proxyConfigOrCallback;
            }
    
            proxyMiddleware = getProxyMiddleware(proxyConfig);
    
            if (typeof proxyConfigOrCallback === 'function') {
                const newProxyConfig = proxyConfigOrCallback();
                if (newProxyConfig !== proxyConfig) {
                    proxyConfig = newProxyConfig;
                    proxyMiddleware = getProxyMiddleware(proxyConfig);
                }
            }
            const bypass = typeof proxyConfig.bypass === 'function';
            // eslint-disable-next-line
            const bypassUrl = bypass && proxyConfig.bypass(req, res, proxyConfig) || false;

            if (bypassUrl) {
                req.url = bypassUrl;
                return resolve(true);
            } else if (proxyMiddleware && shouldProxy(proxyConfig, req)) {
                proxyMiddleware(req, res, () => Promise.resolve(true));
                return reject(false);
            } else {
                return resolve(true)
            }
        })
    })
}



/**
 * Assume a proxy configuration specified as:
 * proxy: {
 *   'context': { options }
 * }
 * OR
 * proxy: {
 *   'context': 'target'
 * }
 */
function dealProxyOptions(proxy) {
    if (!Array.isArray(proxy)) {
        proxy = Object.keys(proxy).map((context) => {
            let proxyOptions;
            // For backwards compatibility reasons.
            const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

            if (typeof proxy[context] === 'string') {
                proxyOptions = {
                    context: correctedContext,
                    target: proxy[context]
                };
            } else {
                proxyOptions = Object.assign({}, proxy[context]);
                proxyOptions.context = correctedContext;
            }
            proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

            return proxyOptions;
        });
    }
    return proxy;
}


/**
 * Determine whether request should be proxied.
 *
 * @private
 * @return {Boolean}
 */
function shouldProxy(proxyConfig, req) {
    const context = proxyConfig.context || proxyConfig.path;
    var path = (req.originalUrl || req.url);
    return contextMatcher.match(context, path, req);
}