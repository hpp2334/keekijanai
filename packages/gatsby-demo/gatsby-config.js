const proxy = require("http-proxy-middleware")

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    flags: {
        DEV_SSR: true,
        FAST_REFRESH: true,
        PRESERVE_WEBPACK_CACHE: true,
    },
    plugins: [
        'gatsby-plugin-keekijanai',
    ],
    proxy: [
    ].filter(Boolean),
    developMiddleware: app => {
        app.use(
            "/api",
            proxy({
                target: "http://localhost:3000",
                hostRewrite: true,
            })
        )
    },
}