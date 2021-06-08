
module.exports = {
  flags: {
    DEV_SSR: true,
    PRESERVE_WEBPACK_CACHE: true,
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-keekijanai',
      options: {
        core: {
          route: {
            root: '/api/blog-common',
          },
        },
        authModal: {
          enableLegacyAuth: true,
        },
      }
    },
  ],
}