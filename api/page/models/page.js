const slugify = require("slugify");

// Our function to query for the parent page
// and generate the full slug for the current page
const generateFullSlug = async (id, slug) => {
  const parentPage = await strapi.query("page").findOne({ id: id });

  return parentPage.full_slug + "/" + slug;
};

// Function to accept current page data and
// manipulate values before saving/updating
const sanitizeData = async (data) => {
  // If the title has changed and there is no slug,
  // generate a new slug based on the title
  // otherwise if the slug has been manually changed
  // we slugify it to remove unfriendly characters
  if (data.title && !data.slug) {
    data.slug = slugify(data.title, {
      lower: true,
    });
  } else if (data.slug) {
    data.slug = slugify(data.slug, {
      lower: true,
    });
  }

  // Initially the full slug for any given page
  // will be the page slug itself - if the page
  // has been assigned a parent page, we
  // query for the parent page's full slug and
  // prepend it to the current page slug to
  // create the current page's full slug
  let fullSlug = data.slug;
  if (data.parent) {
    fullSlug = await generateFullSlug(data.parent, data.slug);
  }

  // Set the page's slug to whatever we
  // determined above
  data.full_slug = fullSlug;

  return data;
};

module.exports = {
  lifecycles: {
    beforeCreate: async (data) => {
      // On initial creation, we only need to sanitze
      // the data as it's not possible for this page to
      // be the parent page of another page just yet
      data = await sanitizeData(data);
    },
    beforeUpdate: async (params, data) => {
      // Check that this update function wasn't invoked
      // by out afterUpdate function below - if so, let the
      // full slug be set without any more processing
      if (data.updateChild) return;

      // Check that the user didn't select the current page
      // to be it's own parent, which would cause an infinite
      // loop in slug resolution
      if (parseInt(params.id) === data.parent) data.parent = null;

      data = await sanitizeData(data);
    },
    afterUpdate: async (params, data) => {
      // If we've updated a page, check to see if it
      // is the parent page of any other pages - if so
      // we need to update the children's full slugs
      // in case the parent's full slug has changed.
      // We pass "updateChildren" because the
      // strapi.query.update function will cause the beforeUpdate
      // function to run for each child page so we need to tell
      // it to skip the other logic for a regular page update
      const children = await strapi
        .query("page")
        .find({ parent: params.id });

      if (children.length) {
        children.map(async (page) => {
          strapi.query("page").update(
            { id: page.id },
            {
              updateChild: true,
              full_slug: params.full_slug + "/" + page.slug,
            }
          );
        });
      }
    },
  },
};
