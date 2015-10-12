var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

function getBreedList(){
    request("http://www.ckc.ca/en/Choosing-a-Dog/Choosing-a-Breed/All-Dogs").then(
        function(body){
            var content = body[1];
            return content;
        }).then(
            function getBreed(results){
                var breedTag = results.indexOf('<div class="post clearfix breedPost" style="">');
                var breedStartTag = results.indexOf('<h3><a', breedTag);
                var breedStart = results.indexOf('>', breedStartTag + 6);
                var breedEnd = results.indexOf('</a></h3>', breedStart);
                var breedName = results.substring(breedStart + 1, breedEnd);
            
                if (breedName.indexOf("(") >=0 ){
                    var subTypeStart = breedName.indexOf("(");
                    var subTypeEnd = breedName.indexOf(")");
                    var subtype = breedName.substring(subTypeStart + 1, subTypeEnd);
                    breedName = subtype + " " + breedName.substring(0, subTypeStart - 1);
                }
                
                if (breedName.indexOf("-") >=0 ){
                    var toUpper = breedName.indexOf("-");
                    var sub = (breedName.substring(toUpper + 1, toUpper + 2)).toUpperCase();
                    breedName = breedName.substring(0, toUpper + 1) + sub + breedName.substring(toUpper + 2)
                }
                console.log(breedName);
                postBreeds(breedName)
                var resultsSubstring = results.substring(breedEnd);
                if (resultsSubstring.indexOf('<div class="post clearfix breedPost" style="">') >=0) {
                    getBreed(resultsSubstring);
                }
                else {
                    return;
                }
            });
}



function postBreeds(breedName){
        var formData = {
           "breedName": breedName
        };
    
        request.post({
                url: 'https://rate-my-dog-breeder-hennigk.c9.io/api/Breeds',
                form: formData
            },
            function (err, httpResponse, body) {
                console.log(err, body);
            });
}


getBreedList();