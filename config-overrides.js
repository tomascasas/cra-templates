const createMultipleEntryInjector = require('react-app-rewire-multiple-entry');

const multipleEntryInjector = createMultipleEntryInjector([{
  entry: 'src/rugs-usa.js',
  template: 'public/rugs-usa.html',
  outPath: 'rugs-usa.html'
}, {
  entry: 'src/lol.js',
  template: 'public/lol.html',
  outPath: 'lol.html'
}]);

module.exports = function(config, env) {
  multipleEntryInjector.addMultiEntry(config);
  return config;
};
