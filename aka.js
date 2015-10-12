var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

function postAKA(){
        // var headers = headers: {'content-type' : 'application/x-www-form-urlencoded'},
        
        var formData = {
            calling_app:"PUPPYLANDING",
            http_referer:"http://www.akc.org/dog-breeds/",
            search_by:3,
            breed:633,
            text_postal_code:"",
            radius:"",
            search_type:"",
            state:"",
            gender:"",
            title:"",
            useraction:"results1",
            certify:"yes"
            
        }
        
        request.post({
                url: 'https://www.apps.akc.org/apps/classified/search/index.cfm',
                formData: formData
            },
            function (err, httpResponse, body) {
                // console.log(Object.keys(httpResponse));
                var searchTag = httpResponse.body.indexOf("<h2>Search Results</h2>");
                var bTag = httpResponse.body.indexOf("<b>", searchTag);
                var bEndTag = httpResponse.body.indexOf("</b>", bTag);
                var numberOfBreeders = httpResponse.body.substring(bTag + 3, bEndTag);
                
                console.log(numberOfBreeders)
                console.log(httpResponse.body.indexOf("CH Aspencove's Good Vibrations"))
            });
}

postAKA()


// request("https://www.apps.akc.org/apps/classified/search/index.cfm").then(
//     function (contents){
//         console.log(contents[0])
//         console.log(contents[1])
//     })

