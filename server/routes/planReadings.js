import createEntityRouter from './_entityFactory.js';

export default createEntityRouter('plan_readings', {
  jsonFields: [
    'title_info', 'elements', 'legend', 'sections_cuts',
    'reinforcement_details', 'tables', 'text_annotations',
    'unclear_items', 'user_corrections'
  ],
  projectScoped: true
});
