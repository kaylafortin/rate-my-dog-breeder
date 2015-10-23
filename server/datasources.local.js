var url = require('url');
var mysql_url = process.env.CLEARDB_DATABASE_URL;
var parsed_url = url.parse(mysql_url);
var auth = parsed_url.auth.split(':');
var username = auth[0];
var password = auth[1];
var database = parsed_url.pathname.substring(1);
var key = process.env.AMAZON_KEY;
var keyId = process.env.AMAZON_KEY_ID;
var provider = "amazon"


module.exports = {
    CKCbreeders: {
        username: username,
        password: password,
        hostname: parsed_url.hostname,
        database: database
      },
    'rate-my-dog-breeder-review-images': {
        key: key,
        keyId: keyId,
        provider: provider
    }
};
