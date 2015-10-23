var multiparty = require('connect-multiparty');
var mid = multiparty();

module.exports = function(server) {
    server.use(mid);
}