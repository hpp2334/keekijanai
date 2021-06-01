
module.exports = {
    flags: {
        DEV_SSR: true,
        PRESERVE_WEBPACK_CACHE: true,
    },
    plugins: [
        {
            resolve: 'gatsby-plugin-keekijanai',
            options: {
                route: {
                    root: '/api/blog-common'
                }
            }
        },
    ],
}