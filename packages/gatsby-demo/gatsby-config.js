const isDev = process.env.NODE_ENV === 'development';

module.exports = {
    flags: {
        DEV_SSR: true,
        FAST_REFRESH: true,
        PRESERVE_WEBPACK_CACHE: true,
    },
    plugins: [
        'gatsby-plugin-keekijanai'
    ],
    proxy: [
        isDev && {
            prefix: '/api',
            url: 'http://localhost:3000',
        },
    ].filter(Boolean)
}