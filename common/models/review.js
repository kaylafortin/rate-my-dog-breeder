var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var app = require('../../server/server');
var secret = process.env.CAPTCHA_KEY;
var fs = require('fs');
var storage = app.datasources.reviewImages;


function postReview(review, cb) {
    request.post({
        url: "https://rate-my-dog-breeder-hennigk.c9.io/api/Reviews",
        form: review
    }, function(err, response, body) {
        if (err) {
            // cb({error: 'server', message: err});
            cb(err);
        }
        else {
            return;
        }
    });
}

function uploadImage(parsedData, req, cb) {
    if (req.files.fileUpload) {
        var bucket = "breeder-review-images";
        var randomDir = 'files_' + Math.random().toString(36);
        var file = req.files.fileUpload;
        var fileName = randomDir + '/' + file.originalFilename;

        var upStream = app.models.container.uploadStream(bucket, fileName, {
            'contentType': file.type
        });
        var fileStream = fs.createReadStream(file.path);

        var fileURL = "https://s3.amazonaws.com/" + bucket + "/" + fileName;
        if (file.type.indexOf('image') < 0) {
            cb(new Error("filetype"));
            // cb(new Error({error: 'type', message: "file is not an image"}));
        }
        if (file.size > 10485760) {
            cb(new Error("filesize"));
            // cb(new Error({error: 'size', message: "file is larger than 10MB"}));
        }
        upStream.on('finish', function() {
            parsedData.images = [{
                image: fileURL
            }];
            postReview(parsedData, cb);
            // cb(null, 'OK');
            cb(null, {success: true});
        });

        fileStream.pipe(upStream);
    }
    else {
        console.log(parsedData);
        postReview(parsedData, cb);
        // cb(null, 'OK');
        cb(null, {success: true});
    }

}


module.exports = function(Review) {

    Review.createNew = function(data, req, cb) {
        var parsedData = JSON.parse(data);

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