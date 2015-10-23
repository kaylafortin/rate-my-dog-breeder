var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var app = require('../../server/server');
var secret = process.env.CAPTCHA_KEY;
// var multiparty = require('multiparty');
// var loopback = require('loopback');
var fs = require('fs');
var storage = app.datasources.reviewImages;

function checkCaptch(parsedData, cb) {
    request.post({
        url: "https://www.google.com/recaptcha/api/siteverify",
        form: {
            secret: secret,
            response: parsedData.captcha
        }
    }, function(err, response, body) {
        var parsed = (JSON.parse(body));
        console.log(parsed)
        if (err) {
            console.log(err);
        }
        if (parsed.success) {
            delete parsedData.captcha;
            return
        }
        else {
            cb(new Error('Invalid Captcha'));
        }
    });
}

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';

    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

// Review.observe('before save', function postReview(ctx, next){
//     if (ctx.instance){
//     request.post({url: "https://www.google.com/recaptcha/api/siteverify", form: {secret: secret, response: ctx.instance.captcha}}, function(err,response,body){
//         var parsed = (JSON.parse(body));
//         if (err){
//             console.log(err);
//         }
//         if (parsed.success){
//             ctx.instance.unsetAttribute('captcha');
//             next();
//         }
//         else {
//             next(new Error('Invalid Captcha'));
//         }
//     });
//     }


module.exports = function(Review) {

        Review.createNew = function(data, req, cb) {
            var randomDir = 'files_' + Math.random().toString(36);
            var file = req.files.fileUpload;
            var fileName = randomDir + '/' + file.originalFilename;
            var upStream = app.models.container.uploadStream('breeder-review-images', fileName, {});
            var fileStream = fs.createReadStream(file.path);
            
            upStream.on('finish', function() {
                // THIS IS WHERE YOU CREATE THE REVIEW :)
                cb(null, 'OK');
            })
            fileStream.pipe(upStream);
            
        }

        Review.remoteMethod('createNew', {
            http: {
                verb: 'post',
                path: '/createNew'
            },
            accepts: [{
                arg: 'data',
                type: 'string',
                http: {
                    source: 'form'
                }
            }, {
                arg: 'req',
                type: 'object',
                http: {
                    source: 'req'
                }
            }],
            returns: {
                arg: 'status',
                type: 'string'
                // root: true
            }
        });

};
        // else {
        //   request.post({url: "https://www.google.com/recaptcha/api/siteverify", form: {secret: secret,response: ctx.data.captcha}}, function(err,response,body){
        //     var parsed = (JSON.parse(body));
        //     if (err){
        //         console.log(err);
        //     }
        //     if (parsed.success){
        //         delete ctx.data.captcha;
        //         next();
        //     }
        //     else {
        //         next(new Error('Invalid Captcha'));
        //     }
        //   }); 
        // }
        // console.log(JSON.parse(response))

        // return response
        //     })   
        // };
