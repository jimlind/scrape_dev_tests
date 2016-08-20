var dblite = require('dblite');
var database = dblite('/tmp/file.sqlite');

var dropCatalog = 'DROP TABLE IF EXISTS catalog';
database.query(dropCatalog);

var dropProducts = 'DROP TABLE IF EXISTS products';
database.query(dropProducts);

database.close();
