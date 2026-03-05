import createEntityRouter from './_entityFactory.js';

export default createEntityRouter('projects', {
  jsonFields: ['work_categories', 'floors', 'quantities_data']
});
