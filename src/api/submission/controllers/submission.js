'use strict';

/**
 * submission controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::submission.submission', ({ strapi }) => ({
  // Create a new draft submission
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a submission');
    }

    // Set the author to the current user and status to draft
    ctx.request.body.data = {
      ...ctx.request.body.data,
      author: user.id,
      status: 'draft'
    };

    const response = await super.create(ctx);
    return response;
  },

  // Get user's own submissions
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Filter to only show user's own submissions (unless editor)
    if (user.role?.type !== 'editor') {
      ctx.query.filters = {
        ...ctx.query.filters,
        author: user.id
      };
    }

    return await super.find(ctx);
  },

  // Submit for review
  async submitForReview(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const submission = await strapi.entityService.findOne('api::submission.submission', id, {
      populate: ['author']
    });

    if (!submission) {
      return ctx.notFound('Submission not found');
    }

    if (submission.author?.id !== user.id) {
      return ctx.forbidden('You can only submit your own work');
    }

    if (submission.status !== 'draft') {
      return ctx.badRequest('Only drafts can be submitted for review');
    }

    const updated = await strapi.entityService.update('api::submission.submission', id, {
      data: {
        status: 'submitted',
        submittedAt: new Date()
      }
    });

    return { data: updated };
  },

  // Editor: Accept submission
  async accept(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user || user.role?.type !== 'editor') {
      return ctx.forbidden('Only editors can accept submissions');
    }

    const updated = await strapi.entityService.update('api::submission.submission', id, {
      data: {
        status: 'accepted',
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    return { data: updated };
  },

  // Editor: Reject submission  
  async reject(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const { feedback } = ctx.request.body;

    if (!user || user.role?.type !== 'editor') {
      return ctx.forbidden('Only editors can reject submissions');
    }

    const updated = await strapi.entityService.update('api::submission.submission', id, {
      data: {
        status: 'rejected',
        feedback: feedback,
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    return { data: updated };
  },

  // Editor: Request revision
  async requestRevision(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const { feedback } = ctx.request.body;

    if (!user || user.role?.type !== 'editor') {
      return ctx.forbidden('Only editors can request revisions');
    }

    const updated = await strapi.entityService.update('api::submission.submission', id, {
      data: {
        status: 'revision_requested',
        feedback: feedback,
        reviewedBy: user.id,
        reviewedAt: new Date()
      }
    });

    return { data: updated };
  }
}));
