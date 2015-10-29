var app = require('../../server/server');
var ds = app.datasources.CKCbreeders

function orderValidation(order, sort) {
    if (order === 'name') {
        order = 'Breeder.name ' + sort + ', Litter.breedName IS NULL, Litter.breedName';
    }
    else if (order === 'kennel') {
        order = 'Breeder.kennel IS NULL, Breeder.kennel ' + sort + ' , Breeder.name';
    }
    else if (order === 'city') {
        order = 'Address.city ' + sort + ' , Address.province, Breeder.name';
    }
    else if (order === 'prov') {
        order = 'Address.province ' + sort + ' , Address.city, Breeder.name';
    }
    else if (order === 'breed') {
        order = 'Litter.breedName IS NULL, Litter.breedName ' + sort + ' , Breeder.name';
    }
    else if (order === 'rating') {
        order = 'AVG(Review.rating) IS NULL, AVG(Review.rating) ' + sort + ' , Breeder.name';
    }
    else {
        order = 'Breeder.name ' + sort + ' , Litter.breedName IS NULL, Litter.breedName';
    }
    return order;
}

function filterResults(results, limit, cb,  next, page, numEntries) {
    var finalResults = [];
    var index = {};
    var litterIndex = {};
    // var ratingIndex = {};
    results.forEach(function(result) {
        var breeder = index[result.Breeder_id];
        if (!breeder) {
            breeder = {
                breederId: result.Breeder_id,
                name: result.Breeder_name,
                kennel: result.Breeder_kennel,
                city: result.Address_city,
                province: result.Address_province,
                country: result.Address_country,
                // images: [],
                breeds: [],
            };
            index[result.Breeder_id] = breeder;
            finalResults.push(breeder);
            litterIndex[result.Breeder_id] = {};
        }
        var litter = litterIndex[result.Breeder_id];
        if (litter) {
            litter = litterIndex[result.Breeder_id][result.Litter_breedId];
        }
        if (!litter) {
            litter = {
                breedId: result.Litter_breedId,
                breedName: result.Litter_breed
            };
            breeder.breeds.push(litter);
            litterIndex[result.Breeder_id][result.Litter_breedId] = true;
        }
    });
    if (page !== undefined) {
        cb(null, {
            page: page,
            offset: numEntries,
            limit: next,
            results: averageRating(finalResults, limit)
        });
    }
    else {
       cb(null, averageRating(finalResults, limit));
    }
}

function averageRating(query, ordered) {
    var completeResults = [];
    for (var i = 0; i < ordered.length; i++) {
        for (var j = 0; j < query.length; j++) {
            if (ordered[i].Breeder_id == query[j].breederId) {
                query[j].averageRating = ordered[i].Review_averageRating;
                if (ordered[i].images){
                    query[j].images = ordered[i].images
                }
                completeResults.push(query[j]);
            }
        }
    }
    return completeResults;
}


function whereQuery(province, breed, where) {
    if (!where) {
        where = "";
    }
    
    // ds.connector.client.initialize()
    
    if (province !== "all" && Number(breed) !== 0) {
        return ' WHERE Address.province=' + ds.connector.client.escape(province) + ' AND Litter.breedId=' + ds.connector.client.escape(breed) + where;
    }
    else if (province !== "all") {
        return ' WHERE Address.province=' + ds.connector.client.escape(province) + where;
    }

    else if (Number(breed) !== 0) {
        return ' WHERE Address.province != ' + ds.connector.client.escape(breed) + ' AND Litter.breedId=' + ds.connector.client.escape(breed) + where;
    }
    else if (where !== "") {
        return ' WHERE ' + where.substring(4);
    }
    else {
        return "";
    }
}


function buildQuery() {
    return "SELECT Review.rating as Review_rating, Review.id as Review_id, Review.breederId as Review_breederId, Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
        "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
        "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
        "Address.country as Address_country FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
        "Left JOIN Litter ON Litter.breederId = Breeder.id LEFT JOIN Review ON Review.breederId = Breeder.id";
}

function buildLimitQuery() {
    return "SELECT Review.rating as Review_rating, AVG(Review.rating) as Review_averageRating, Review.id as Review_id, " + 
        "Review.breederId as Review_breederId, Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
        "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
        "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
        "Address.country as Address_country FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
        "Left JOIN Litter ON Litter.breederId = Breeder.id LEFT JOIN Review ON Review.breederId = Breeder.id";
}
module.exports = function(Breeder) {

    Breeder.byProvAndBreed = function(province, breed, page, order, numEntries, sort, cb) {
            if (sort !== 'ASC' && sort !== 'DESC') {
                sort = "ASC";
            }
            if (province == undefined) {
                province = 'all';
            }
            if (breed == undefined) {
                breed = 0;
            }
            if (order == undefined) {
                order = "name";
            }
            if (isNaN(numEntries)) {
                numEntries = 10;
            }
            if (isNaN(page)) {
                page = 0;
            }

            var queryLimit;
            var queryWhere;
            var ds = Breeder.dataSource;
            var nextLimit = numEntries + 1;


            queryLimit = buildLimitQuery();
            order = orderValidation(order, sort);

            queryWhere = whereQuery(province, breed);
            queryLimit += queryWhere + ' GROUP BY Breeder.id';
            queryLimit += ' ORDER BY ' + order + " LIMIT " + ds.connector.client.escape(page) + "," + ds.connector.client.escape(nextLimit);
            ds.connector.query(queryLimit, function(err, breederLimit) {
                var next = false;
                if (err) {
                    console.log(err);
                    return cb(err, {
                        page: page,
                        offset: numEntries,
                        limit: next,
                        results: []
                    });
                }
                // if (!breederLimit.length) {
                //     return cb(new Error('Invalid Request'), {
                //         page: page,
                //         offset: numEntries,
                //         limit: next,
                //         results: []
                //     });
                // }
                if (breederLimit.length > numEntries) {
                    next = true;
                }
                if (breederLimit.length > 0) {
                    return getResults(next, breederLimit.splice(0, numEntries), numEntries);
                }
                else {
                    cb(err, {
                        page: page,
                        offset: numEntries,
                        limit: next,
                        results: []
                    });
                }
            });

            function getResults(next, limit, numEntries) {
                var whereIn = " AND Breeder.id IN ( ";

                for (var i = 0; i < limit.length; i++) {
                    whereIn += limit[i].Breeder_id + ",";
                }

                var where = whereIn.substr(0, whereIn.length - 1) + ") ";
                var query = buildQuery();
                var whereInQuery = whereQuery(province, breed, where);
                if (order.indexOf("AVG(Review.rating)") >= 0) {
                    query += whereInQuery;
                }
                else {
                    query += whereInQuery + 'ORDER BY ' + order;
                }
                ds.connector.query(query, function(err, results) {
                    if (err) {
                        console.log(err);
                        cb(err);
                    }

                    else {
                        return filterResults(results, limit, cb, next, page, numEntries);
                    }
                });
            }


        },
        Breeder.remoteMethod(
            'byProvAndBreed', {
                http: {
                    path: '/search',
                    verb: 'get'
                },
                description: 'Get list of breeders by province and/or breed',
                accepts: [{
                    arg: 'province',
                    type: 'string',
                    http: {
                        source: 'query'
                    }
                }, {
                    arg: 'breed',
                    type: 'number',
                    http: {
                        source: 'query'
                    }
                }, {
                    arg: 'page',
                    type: 'number',
                    http: {
                        source: 'query'
                    }
                }, {
                    arg: 'order',
                    type: 'string',
                    http: {
                        source: 'query'
                    }
                }, {
                    arg: 'limit',
                    type: 'number',
                    http: {
                        source: 'query'
                    }
                }, {
                    arg: 'sort',
                    type: 'string',
                    http: {
                        source: 'query'
                    }
                }],
                returns: {
                    arg: 'data',
                    type: ['Breeder'],
                    root: true
                }
            }),

        Breeder.byName = function(name, page, order, numEntries, sort, cb) {
            if (sort !== 'ASC' && sort !== 'DESC') {
                sort = "ASC";
            }
            if (name == undefined) {
                name = ' ';
            }
            if (order == undefined) {
                order = "name";
            }
            if (isNaN(numEntries)) {
                numEntries = 10;
            }
            if (isNaN(page)) {
                page = 0;
            }

            var nextLimit = numEntries + 1;
            var ds = Breeder.dataSource;
            var nameQueryLimit = buildLimitQuery();
            order = orderValidation(order, sort);

            nameQueryLimit += " WHERE Breeder.name LIKE CONCAT('%', ?, '%') OR Breeder.kennel LIKE CONCAT('%', ?, '%') " +
                "GROUP BY Breeder.id ORDER BY " + ds.connector.client.escape(order) + " LIMIT " + ds.connector.client.escape(page) + "," + ds.connector.client.escape(nextLimit);


            ds.connector.query(nameQueryLimit, [name, name], function(err, nameLimit) {
                var next = false;
                if (err) {
                    console.log(err);
                }
                if (nameLimit.length > numEntries) {
                    next = true;
                }
                if (nameLimit.length > 0) {
                    getNameResults(next, nameLimit.splice(0, numEntries));
                }
                else {
                    cb(err, {
                        page: page,
                        offset: numEntries,
                        limit: next,
                        results: []
                    });
                }
            });

            function getNameResults(next, limit) {
                var whereIn = "AND Breeder.id IN (";

                for (var i = 0; i < limit.length; i++) {
                    whereIn += limit[i].Breeder_id + ",";
                }

                var where = whereIn.substr(0, whereIn.length - 1) + ") ";
                var query = buildQuery();
                var whereInQuery = " WHERE (Breeder.name LIKE CONCAT('%', ?, '%') OR Breeder.kennel LIKE CONCAT('%', ?, '%') ) ";

                query += whereInQuery + where + 'ORDER BY ' + order;

                ds.connector.query(query, [name, name], function(err, results) {
                    if (err) {
                        console.log(err);
                    }
                    filterResults(results, limit, cb, next, page, numEntries);
                });
            }
        };
    Breeder.remoteMethod(
        'byName', {
            http: {
                path: '/inputsearch',
                verb: 'get'
            },
            description: 'Get list of breeders by name or kennel name',
            accepts: [{
                arg: 'name',
                type: 'string',
                http: {
                    source: 'query'
                }
            }, {
                arg: 'page',
                type: 'number',
                http: {
                    source: 'query'
                }
            }, {
                arg: 'order',
                type: 'string',
                http: {
                    source: 'query'
                }
            }, {
                arg: 'limit',
                type: 'number',
                http: {
                    source: 'query'
                }
            }, {
                arg: 'sort',
                type: 'string',
                http: {
                    source: 'query'
                }
            }],
            returns: {
                arg: 'data',
                type: ['Breeder'],
                root: true
            }
        });
        Breeder.topBreeders = function(limit, cb) {
            if (isNaN(limit)) {
                limit = 3;
            }
            var ds = Breeder.dataSource;
            var topBreederQuery = buildLimitQuery();
            topBreederQuery += " GROUP BY Breeder.id ORDER BY AVG(Review.rating) DESC LIMIT " + ds.connector.client.escape(limit);
            ds.connector.query(topBreederQuery, function(err, breederLimit) {
                if (err) {
                    console.log(err);
                    cb(err);
                }
                getBreederResults(breederLimit);
            });

            function getBreederResults(limit) {
                var whereIn = " WHERE Breeder.id IN (";

                for (var i = 0; i < limit.length; i++) {
                    whereIn += limit[i].Breeder_id + ",";
                    limit[i].images = [];
                }

                var where = whereIn.substr(0, whereIn.length - 1) + ") ";
                
                var reviewQuery = "SELECT Review.images, Review.breederId, Breeder.id FROM Breeder " +
                    "LEFT JOIN Review on Review.breederId = Breeder.id" + where + "AND images IS NOT NULL"; 
                    ds.connector.query(reviewQuery, function(err, results) {
                        if (err) {
                            console.log(err);
                            cb(err);
                        }
                        if (results) {
                            for (var j = 0; j < results.length; j++) {
                                for (var k = 0; k < limit.length; k++) {
                                    if (results[j].breederId === limit[k].Breeder_id) {
                                        var imageString = results[j].images.replace(/\"|\[|\]/g, "");
                                        var imageArray = imageString.split(",");
                                        for (var i = 0; i < imageArray.length; i++) {
                                            limit[k].images.push(imageArray[i]);
                                        }
                                    }
                                }
                            }
                            getRatings(limit)
                        }
                    });
                
                function getRatings(limit){
                    var query = buildQuery();
    
                    query += where
                    ds.connector.query(query, function(err, results) {
                        if (err) {
                            console.log(err);
                            cb(err);
                        }
                        filterResults(results, limit, cb);
                    });
                }
            }
        };
    Breeder.remoteMethod(
        'topBreeders', {
            http: {
                path: '/topBreeders',
                verb: 'get'
            },
            description: 'Get the top ranked breeders',
            accepts: [{
                arg: 'limit',
                type: 'number',
                http: {
                    source: 'query'
                }
            }],
            returns: {
                arg: 'data',
                type: ['Breeder'],
                root: true
            }
        });
};
