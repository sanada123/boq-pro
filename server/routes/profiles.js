import createEntityRouter from './_entityFactory.js';

export default createEntityRouter('engineer_profiles', {
  jsonFields: ['common_patterns', 'correction_history']
});
