var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

module.exports = function(Review) {
    Review.observe('before save', function postReview(ctx, next){
    if (ctx.instance){
    request.post({url: "https://www.google.com/recaptcha/api/siteverify", form: {secret: "6LdWQA8TAAAAAHt2XQyWkGpL3p-7wDeDjZN8UsBB",response: ctx.instance.captcha}}, function(err,response,body){
        var parsed = (JSON.parse(body));
        if (err){
            console.log(err);
        }
        if (parsed.success){
            ctx.instance.unsetAttribute('captcha');
            next();
        }
        else {
            next(new Error('Invalid Captcha'));
        }
    });
    }
    else {
       request.post({url: "https://www.google.com/recaptcha/api/siteverify", form: {secret: "6LdWQA8TAAAAAHt2XQyWkGpL3p-7wDeDjZN8UsBB",response: ctx.data.captcha}}, function(err,response,body){
        var parsed = (JSON.parse(body));
        if (err){
            console.log(err);
        }
        if (parsed.success){
            delete ctx.data.captcha;
            next();
        }
        else {
            next(new Error('Invalid Captcha'));
        }
       }); 
    }
        // console.log(JSON.parse(response))
      
        // return response
    })   
};
