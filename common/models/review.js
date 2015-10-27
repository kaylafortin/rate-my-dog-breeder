var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var app = require('../../server/server');
var secret = process.env.CAPTCHA_KEY;
var fs = require('fs');
var storage = app.datasources.reviewImages;


function postReview(review, cb) {
    console.log(review)
    request.post({
        url: "https://rate-my-dog-breeder-hennigk.c9.io/api/Reviews",
        form: review
    }, function(err, response, body) {
        if (err) {
            // cb({error: 'server', message: err});
            cb(err);
        }
        else {
            cb(null, {success: true});
        }
    });
}

function uploadImage(parsedData, req, cb) {
    if (req.files) {
        parsedData.images = [];
        var files = req.files
        
        for (var key in files) {
            console.log(files[key])
            console.log(key)
            if (files[key].type.indexOf('image') < 0) {
                cb(new Error("filetype"));
                // cb(new Error({error: 'type', message: "file is not an image"}));
            }
            if (files[key].size > 5242880) {
                cb(new Error("filesize"));
            }
            var bucket = "breeder-review-images";
            var randomDir = 'files_' + Math.random().toString(36);
            
            var fileName = randomDir + '/' + files[key].originalFilename;
    
            var upStream = app.models.container.uploadStream(bucket, fileName, {
                'contentType': files[key].type
            });
        
            var fileStream = fs.createReadStream(files[key].path);
            var fileURL = "https://s3.amazonaws.com/" + bucket + "/" + fileName;
            parsedData.images.push(fileURL);
            console.log(parsedData)
            console.log(fileURL)
            
            upStream.on('finish', function() {
                console.log("return")
                return
            });
            fileStream.pipe(upStream);
        }
        postReview(parsedData, cb);
        // cb(null, {success: true});
    }
    else {
        postReview(parsedData, cb);
        // cb(null, 'OK');
        // cb(null, {success: true});
    }

}


module.exports = function(Review) {

    Review.createNew = function(data, req, cb) {
        var parsedData = JSON.parse(data);
        // console.log(req)
        request.post({
            url: "https://www.google.com/recaptcha/api/siteverify",
            form: {
                secret: secret,
                response: parsedData.captcha
            }
        }, function(err, response, body) {
            var parsed = (JSON.parse(body));
            if (err) {
                console.log(err);
                cb(err)
                // cb({error: 'server', message: err});
            }
            if (parsed.success) {
                delete parsedData.captcha;
                uploadImage(parsedData, req, cb);

            }
            else {
                // cb(new Error({error: 'captcha', message: "Invalid Captcha"}));
                cb(new Error('captcha'));
            }
        });
    };
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
        }
    });

};