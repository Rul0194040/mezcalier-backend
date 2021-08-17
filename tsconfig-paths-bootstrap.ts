import * as path from 'path';
import * as moduleAlias from 'module-alias';

moduleAlias.addAliases({
  '@mezcal': path.resolve(__dirname + '/src'),
});
