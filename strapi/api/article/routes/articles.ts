export default {
    routes: [
      {
        method: 'GET',
        path: '/articles',
        handler: 'article.find',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'GET',
        path: '/articles/:id',
        handler: 'article.findOne',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };