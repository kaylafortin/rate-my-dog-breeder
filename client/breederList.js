var Promise = require("bluebird");
var request = Promise.promisify(require("request"));

function clientError(e) {
    return e.code >= 400 && e.code < 500;
}

function trim1(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}


function getBreederName(breederContents) {
    var breederHeaderTag = '<div id="breederheader">';
    var headerTagStart = '<h1>';
    var headerTagStartLength = headerTagStart.length;
    var headerTagEnd = '</h1>';

    var breederHeaderTagIndex = breederContents.indexOf(breederHeaderTag);
    var breederNameStart = breederContents.indexOf(headerTagStart, breederHeaderTagIndex);
    var breederNameEnd = breederContents.indexOf(headerTagEnd, breederNameStart);
    var breederName = trim1(breederContents.substring(breederNameStart + headerTagStartLength, breederNameEnd));

    if (breederNameStart >= 0) {
        // console.log(breederName);
        return breederName;
    }
}

function getBreederDetails(breederDetails) {
    var breederDetailsTag = '<div id="breederdetails" style="">';
    var kennelTagStart = '<h2>Kennel(s):';
    var kennelTagStartLength = kennelTagStart.length;
    var kennelTagEnd = '</h2>';

    var breederDetailsTagIndex = breederDetails.indexOf(breederDetailsTag);
    var kennelNameStart = breederDetails.indexOf(kennelTagStart, breederDetailsTagIndex);
    var kennelNameEnd = breederDetails.indexOf(kennelTagEnd, kennelNameStart);
    var kennelName = trim1(breederDetails.substring(kennelNameStart + kennelTagStartLength, kennelNameEnd));

    if (kennelNameStart >= 0 && kennelName) {
        // console.log(kennelName);
        return (kennelName);
    }
}

function getBreederLocationDate(breederLocation, breederId) {
    var breederLocationTag = '<div id="breederlocationdate">';
    var locationTagStart = 'Location:';
    var locationTagStartLength = locationTagStart.length;
    var locationTagEnd = '<br />';
    // var breederOfTagStart = 'Breeder of: ';
    // var breederOfTagStartLength = breederOfTagStart.length;
    // var breederOfTagEnd = '<br />';

    var breederLocationTagIndex = breederLocation.indexOf(breederLocationTag);
    var locationStart = breederLocation.indexOf(locationTagStart, breederLocationTagIndex);
    var locationEnd = breederLocation.indexOf(locationTagEnd, locationStart);
    var location = trim1(breederLocation.substring(locationStart + locationTagStartLength, locationEnd));

    // var breederOfStart = breederLocation.indexOf(breederOfTagStart, breederLocationTagIndex);
    // var breederOfEnd = breederLocation.indexOf(breederOfTagEnd, breederOfStart);
    // var breederOf = breederLocation.substring(breederOfStart + breederOfTagStartLength, breederOfEnd);

    if (locationStart >= 0) {
        var city = location.substring(0, location.indexOf(","))
        var province = location.substring(location.indexOf(", ") + 2);

        var country = "CANADA"
        if (province.indexOf(" ") >= 0) {
            country = province.substr(province.indexOf(" ") + 1)
            province = province.substr(0, province.indexOf(" "))

        }
        var addressObject = {
            city: city,
            province: province,
            country: country,
            breederId: breederId
        }

        // console.log(addressObject);
        postAddress(addressObject);
    }
}

function getBreeder(breederResults, breederId) {
    var name = getBreederName(breederResults);
    var kennel = getBreederDetails(breederResults);

    var breeder = {
        name: name,
        id: breederId
    }

    if (kennel) {
        breeder.kennel = kennel;
    }
    // console.log(breeder);
    postBreeder(breeder);
}

function getLitterResults(litterResults, breederId) {
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
        var litterBreed = trim1(litterResults.substring(litterBreedStart + litterBreedTagLength, litterBreedEnd));

        var litterBirthStart = litterResults.indexOf(litterBirthTagStart, litterResultTagIndex);
        var litterBirthEnd = litterResults.indexOf(litterResultsEndTag, litterBirthStart);
        var litterBirthDate = trim1(litterResults.substring(litterBirthStart + litterBirthTagStartLength, litterBirthEnd));

        var litterMaleStart = litterResults.indexOf(litterMaleTagStart, litterResultTagIndex);
        var litterMaleEnd = litterResults.indexOf(" Female", litterMaleStart);
        var litterMale = trim1(litterResults.substring(litterMaleStart + litterMaleTagLength, litterMaleEnd));

        var litterFemaleStart = litterResults.indexOf(litterFemaleTagStart, litterResultTagIndex);
        var litterFemaleEnd = litterResults.indexOf(litterResultsEndTag, litterFemaleStart);
        var litterFemale = trim1(litterResults.substring(litterFemaleStart + litterFemaleTagLength, litterFemaleEnd));

        // var litterResultArray.push(resultArray);
        // console.log(litterBreed)
        var litter = {};
        litter.breederId = breederId

        if (litterBreedStart >= 0) {
            if (litterBreed === "St. Bernard"){
                litterBreed = "Saint Bernard"
            }
            if (litterBreed === "Irish Red & White Setter"){
                litterBreed = "Irish Red and White Setter"
            }
            if(litterBreed === "Dutch Sheepdog"){
                litterBreed = "Schapendoes"
            }
            // console.log(litterBreed)
            getBreedId(litterBreed)
            .then(function(breedObj) {
                    if(!breedObj){
                        console.log("Error: ", breederId )
                        return
                    }
                    // console.log('>>>', breedObj);
                    litter.breedName = breedObj.breedName;
                    litter.breedId = breedObj.id;
                    if (litterBirthStart >= 0) {
                        // console.log(litterBirthDate);
                        litter.birthDate = litterBirthDate
                    }
                    if (litterMale >= 0) {
                        // console.log(litterMale);
                        litter.malePupCount = litterMale
                    }
                    if (litterFemale >= 0) {
                        // console.log(litterFemale);
                        litter.femalePupCount = litterFemale
                    }

                    postLitter(litter);
                    var litterResultsSubstring = litterResults.substring(litterResultTagIndex + litterResultsTagLength);

                    // console.log(litter)
                        // resultArray.push(litter);
                        // console.log(resultArray)
                    getLitterResults(litterResultsSubstring, breederId);

                })
        }
    }
    return;
}




function getRequest(id) {
    // console.log("\n" + id)
    var breederId = id;
    request("http://www.ckc.ca/Choosing-a-Dog/PuppyList/Breeder.aspx?id=" + id).then(
        function(result) {
            var content = result[1];
            getBreeder(content, breederId);
            getBreederLocationDate(content, breederId);
            getLitterResults(content, breederId);
            return id;
        }).catch(clientError, function(e) {
        console.log("error: " + e);
    }).then(
        function(id) {
            if (id < 5) {
                getRequest(id + 1)
            }
        })
}




function postBreeder(breederObj) {
    // var formData = {
    //   "breedName": breedName
    // };

    request.post({
            url: 'https://rate-my-dog-breeder-hennigk.c9.io/api/Breeders',
            form: breederObj
        },
        function(err, httpResponse, body) {
            console.log(err, body);
        });
}

function postAddress(addressObj) {
    request.post({
            url: 'https://rate-my-dog-breeder-hennigk.c9.io/api/Addresses',
            form: addressObj
        },
        function(err, httpResponse, body) {
            console.log(err, body);
        });
}

function postLitter(litterObj) {
    request.post({
            url: 'https://rate-my-dog-breeder-hennigk.c9.io/api/Litters',
            form: litterObj
        },
        function(err, httpResponse, body) {
            console.log(err, body);
        });
}

function getBreedId(breedName) {
    return request("https://rate-my-dog-breeder-hennigk.c9.io/api/Breeds/?filter[where][breedName]=" + breedName)
        .spread(function(response, body) {
            var breedObj = JSON.parse(body)[0]
            // console.log('>', breedObj)
            return breedObj;
        });
}

getRequest(1)

// getBreedId("Pug")
