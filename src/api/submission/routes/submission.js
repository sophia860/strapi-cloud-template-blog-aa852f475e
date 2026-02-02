'use strict';

/**
 * submission router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::submission.submission');

// Custom routes for submission workflow
const customRoutes = [
  {
    method: 'POST',
    path: '/submissions/:id/submit',
    handler: 'submission.submitForReview',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/submissions/:id/accept',
    handler: 'submission.accept',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/submissions/:id/reject',
    handler: 'submission.reject',
    config: {
      policies: [],
      middlewares: [],
    },
  },
  {
    method: 'POST',
    path: '/submissions/:id/request-revision',
    handler: 'submission.requestRevision',
    config: {
      policies: [],
      middlewares: [],
    },
  },
];

module.exports = {
  routes: [...customRoutes, ...defaultRouter.routes],
};
