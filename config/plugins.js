 module.exports = ({ env }) => ({
  upload: {
    provider: 'cloudinary',
       providerOptions: {
           cloud_name: env('CLOUDINARY_NAME'),
           api_key: env('CLOUDINARY_KEY'),
           api_secret: env('CLOUDINARY_SECRET'),
         },
        actionOptions: {
            upload: {},
            delete: {},
      },
   },
   navigation: {
     additionalFields: ['audience'],
     allowedLevels: 2,
     contentTypesNameFields: {
       'blog_posts': ['altTitle'],
       'pages': ['title'],
     }
   },
   plugins: {
     navigation: {
       additionalFields: ['audience'],
       allowedLevels: 2,
       contentTypesNameFields: {
         'blog_posts': ['altTitle'],
         'pages': ['title'],
       }
     },
   },
});
