var Promise = require("bluebird");
var request = Promise.promisify(require("request"));
var apiUrl = "https://rate-my-dog-breeder-hennigk.c9.io/api/"

function clientError(e) {
    return e.code >= 400 && e.code < 500;
}

function trim1(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}


function getBreederName(breederContents){
    var breederHeaderTag = '<div id="breederheader">';
    var headerTagStart = '<h1>';
    var headerTagStartLength = headerTagStart.length;
    var headerTagEnd = '</h1>';
    
    var breederHeaderTagIndex = breederContents.indexOf(breederHeaderTag);
    var breederNameStart = breederContents.indexOf(headerTagStart, breederHeaderTagIndex);
    var breederNameEnd = breederContents.indexOf(headerTagEnd, breederNameStart);
    var breederName = breederContents.substring(breederNameStart + headerTagStartLength, breederNameEnd);
    
    if (breederNameStart >= 0) {
        console.log(trim1(breederName));
    }
    // return trim1(breederName);
}

function getBreederDetails(breederDetails){
    var breederDetailsTag = '<div id="breederdetails" style="">';
    var kennelTagStart = '<h2>Kennel(s):';
    var kennelTagStartLength = kennelTagStart.length;
    var kennelTagEnd = '</h2>';
    
    var breederDetailsTagIndex = breederDetails.indexOf(breederDetailsTag);
    var kennelNameStart = breederDetails.indexOf(kennelTagStart, breederDetailsTagIndex);
    var kennelNameEnd = breederDetails.indexOf(kennelTagEnd, kennelNameStart);
    var kennelName = trim1(breederDetails.substring(kennelNameStart + kennelTagStartLength, kennelNameEnd));
    
    if (kennelNameStart >=0 && kennelName) {
        console.log(kennelName);
    }
    // return trim1(kennelName);
}

function getBreederLocationDate(breederLocation){
    var breederLocationTag = '<div id="breederlocationdate">';
    var locationTagStart = 'Location:';
    var locationTagStartLength = locationTagStart.length;
    var locationTagEnd = '<br />';
    var breederOfTagStart = 'Breeder of: ';
    var breederOfTagStartLength = breederOfTagStart.length;
    var breederOfTagEnd = '<br />';
    
    var breederLocationTagIndex = breederLocation.indexOf(breederLocationTag);
    var locationStart = breederLocation.indexOf(locationTagStart, breederLocationTagIndex);
    var locationEnd = breederLocation.indexOf(locationTagEnd, locationStart);
    var location = breederLocation.substring(locationStart + locationTagStartLength, locationEnd);
    
    var breederOfStart = breederLocation.indexOf(breederOfTagStart, breederLocationTagIndex);
    var breederOfEnd = breederLocation.indexOf(breederOfTagEnd, breederOfStart);
    var breederOf = breederLocation.substring(breederOfStart + breederOfTagStartLength, breederOfEnd);
    
    if (locationStart >= 0){
        console.log(trim1(location));
    }
    if (breederOfStart >=0) {
        console.log(trim1(breederOf));
    }
}

function getLitterResults(litterResults) {
    var litterResultsTag = '<div class="breedName">';
    var litterResultsTagLength = litterResultsTag.length;
    var litterBreedTagStart = 'Breed: ';
    var litterBreedTagLength = litterBreedTagStart.length;
    var litterBirthTagStart = 'Birth Date:';
    var litterBirthTagStartLength = litterBirthTagStart.length; 
    var litterMaleTagStart = 'Male: ';
    var litterMaleTagLength = litterMaleTagStart.length;
    var litterFemaleTagStart = 'Female: ';
    var litterFemaleTagLength = litterFemaleTagStart.length;
    var litterResultsEndTag = '</div>';
    
    var litterResultTagIndex = litterResults.indexOf(litterResultsTag);
    
    if (litterResultTagIndex >= 0) {
        var litterBreedStart = litterResults.indexOf(litterBreedTagStart, litterResultTagIndex);
        var litterBreedEnd = litterResults.indexOf(litterResultsEndTag, litterBreedStart);
        var litterBreed = litterResults.substring(litterBreedStart + litterBreedTagLength, litterBreedEnd);
        
        var litterBirthStart = litterResults.indexOf(litterBirthTagStart, litterResultTagIndex);
        var litterBirthEnd = litterResults.indexOf(litterResultsEndTag, litterBirthStart);
        var litterBirthDate = litterResults.substring(litterBirthStart + litterBirthTagStartLength, litterBirthEnd);
        
        var litterMaleStart = litterResults.indexOf(litterMaleTagStart, litterResultTagIndex);
        var litterMaleEnd = litterResults.indexOf(" Female", litterMaleStart);
        var litterMale = litterResults.substring(litterMaleStart + litterMaleTagLength, litterMaleEnd);
        
        var litterFemaleStart = litterResults.indexOf(litterFemaleTagStart, litterResultTagIndex);
        var litterFemaleEnd = litterResults.indexOf(litterResultsEndTag, litterFemaleStart);
        var litterFemale = litterResults.substring(litterFemaleStart + litterFemaleTagLength, litterFemaleEnd);
        
        if (litterBreedStart >=0){
            console.log(litterBreed);
        }
        if (litterBirthStart >=0){
            console.log(litterBirthDate);
        }
        if (litterMale >=0){
            console.log(litterMale);
        }
        if (litterFemale >=0){
            console.log(litterFemale);
        }
        var litterResultsSubstring = litterResults.substring(litterResultTagIndex + litterResultsTagLength);
        
        getLitterResults(litterResultsSubstring);
    }
    else{
        return;
    }
}




function getRequest(id){
    console.log("\n" + id)
    request("http://www.ckc.ca/Choosing-a-Dog/PuppyList/Breeder.aspx?id=" + id).then(
        function(result) {
            var content = result[1];
            getBreederName(content);
            getBreederDetails(content);
            getBreederLocationDate(content);
            getLitterResults(content);
            return id
        }).catch(clientError, function(e) {
        console.log("error: " + e);
    }).then(
        function(id){
        if (id < 655){
            getRequest(id + 1)
        }
    })
}

//getRequest(635)

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