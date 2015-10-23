var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var app = require('../../server/server');
var secret = process.env.CAPTCHA_KEY;
// var multiparty = require('multiparty');
// var loopback = require('loopback');

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

        Review.createNew = function(data, req, res, cb) {
            // console.log(req)
            // Review.createNew = function(req, res, cb) {
            // console.log("before parse: ", req)
            
            // var form = new multiparty.Form();
            
            // form.parse(req);
            // var ds = Review.app.models.container.dataSource
            
            // console.log(data)
            // console.log("req")
            // console.log(req)
            // console.log(req.files.type)
            // var datasources = Review.dataSource;
            // console.log(req.files.fileUpload)
            var parsedData = JSON.parse(data);
            
            // console.log("data")
            // console.log(parsedData)
            // console.log(parsedData.fileUpload)
            // var storageService = new StorageService()
            // var Container = app.models.container;
            // console.log(Container)
            // console.log(parsedData)
            // checkCaptch(parsedData, cb);
            // parsedData.images = [];
            // console.log(req)
            // console.log(req.files.fileUpload)
            // console.log(req.length)
            // if (req.files.fileUpload.type.indexOf('image') < 0) {
            //     cb(new Error("file is not an image"));
            // }
            // if (req.files.fileUpload.size > 10485760) {
            //     cb(new Error("file is larger than 10MB"));
            // }

            // req.files.fileUpload.name = randomString();
            // console.log(app.datasources['rate-my-dog-breeder-review-images'])
            // console.log(Object.keys(app.datasources['rate-my-dog-breeder-review-images']))
            // app.datasources['rate-my-dog-breeder-review-images']
            
        
            app.datasources.rateMyDogBreederReviewImages.connector.client.upload(req, res, {container: 'xxxx'}, function(err, result) {
                        // ds.upload(req, res, {container: 'xxxx'}, function(err, result) {

                console.log('---------', err, result);
            })
            
            
            
            //  var Container = Review.app.models.container;
            // //  console.log(Container)
            // //  console.log("req files")
            // //  console.log(req.files.fileUpload.headers)
            // //  req.files.fileUpload.headers.headers = req.headers
            // //  console.log(req.files.fileUpload)
            //  Container.getContainer({name:'breeder-review-container-test'},function(err,c) {
            //     //  console.log(c.name)
             
            // //  Container.getContainer({container: "rate-my-dog-breeder-review-images"},function(err,c) {
            // Container.upload(req, res,{container: 'breeder-review-container-test'}, function(err, res) {
            //     console.log('-----------', arguments);
            //     if (err) {
            //         cb(err);
            //     }
            //     else {
            //         cb();
            //     }
            // })
            //  })
            //     });
            // }
            //     Container.upload(req,res,{container: c.name},cb)
            // });
            //  var storage     =   require('loopback-component-storage');
            // var storageService  = storage.StorageService({provider: 'filesystem', root: '/tmp'});
                // Container.createContainer({name:'breeder-review-images-1'},function(err,c) {
                // Container.upload(req, res, {container: "rate-my-dog-breeder-review-images"}, cb)
                // function(err, response) {

                //  Container.upload(req,res,{container: c.name},cb)
                // });
            // Container['rate-my-dog-breeder-review-images'].upload(req, res, {container: 'breeder-review-images'}, function(err, response) {
                // if (err) {
                //     console.log(err)
                //     return cb(new Error("upload Error: " + err))
                // }

                // console.log(response);



                // // if (app.datasources['fkwehfkw'].provider === 'amazon') {
                // //     decodedData.images.push('http://s3.blabla/' + containerName + '/' + fileName);
                // // }
                // // else if (app.datasource['fkehfke'].provider === 'local') {
                // //     decodeddata.images.push('/images/' + fileName);
                // // }
                // Review.create(parsedData, cb);
            // });
                // });
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
            }, {
                arg: 'res',
                type: 'object',
                http: {
                    source: 'res'
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
