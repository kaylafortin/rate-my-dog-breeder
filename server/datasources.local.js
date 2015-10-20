var url = require('url');
var mysql_url = process.env.CLEARDB_DATABASE_URL;
var parsed_url = url.parse(mysql_url);
var auth = parsed_url.auth.split(':');
var username = auth[0];
var password = auth[1];
var database = parsed_url.pathname.substring(1);

module.exports = {
    CKCbreeders: {
        username: username,
        password: password,
        hostname: parsed_url.hostname,
        database: database
      }
};