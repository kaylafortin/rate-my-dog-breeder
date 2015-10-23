function orderValidation(order) {
    if (order === 'name') {
        order = 'Breeder.name ASC, Litter.breedName IS NULL, Litter.breedName';
    }
    else if (order === 'kennel') {
        order = 'Breeder.kennel IS NULL, Breeder.kennel, Breeder.name';
    }
    else if (order === 'city') {
        order = 'Address.city, Address.province, Breeder.name';
    }
    else if (order === 'prov') {
        order = 'Address.province, Address.city, Breeder.name';
    }
    else if (order === 'breed') {
        order = 'Litter.breedName IS NULL, Litter.breedName, Breeder.name';
    }
    else {
        order = 'Breeder.name ASC, Litter.breedName IS NULL, Litter.breedName';
    }
    return order;
}

function filterResults(results) {
    var finalResults = [];
    var index = {};
    var litterIndex = {};
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
                breeds: []
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
    return finalResults;
}

function whereQuery(province, breed, where) {
    if (!where) {
        where = "";
    }
    if (province !== "all" && Number(breed) !== 0) {
        return ' WHERE Address.province=? AND Litter.breedId=?' + where;
    }
    else if (province !== "all") {
        return ' WHERE Address.province=?' + where;
    }

    else if (Number(breed) !== 0) {
        return ' WHERE Address.province != ? AND Litter.breedId=?' + where;
    }
    else if (where !== "") {
        return ' WHERE ' + where.substring(4);
    }
    else {
        return "";
    }
}


function buildQuery() {
    return "SELECT Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
        "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
        "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
        "Address.country as Address_country FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
        "Left JOIN Litter ON Litter.breederId = Breeder.id";
}

module.exports = function(Breeder) {

    Breeder.byProvAndBreed = function(province, breed, page, order, numEntries, cb) {
        
        // console.log(arguments.length)
        if (province == undefined || breed == undefined || page == undefined || order == undefined  || numEntries == undefined) {
            return cb(new Error('Invalid Request'), {
                    page: page,
                    offset: numEntries,
                    limit: numEntries,
                    results: []
                });
                
        }
        
        var queryWhere;
        var ds = Breeder.dataSource;
        var nextLimit = numEntries + 1;
        if (isNaN(numEntries)) {
            numEntries = 10;
        }
        if (isNaN(page)) {
            page = 0;
        }

        order = orderValidation(order);
        queryLimit = buildQuery();
        queryWhere = whereQuery(province, breed);
        queryLimit += queryWhere + ' GROUP BY Breeder.id';
        queryLimit += ' ORDER BY ' + order + " LIMIT " + page + "," + nextLimit;
        ds.connector.query(queryLimit, [province, Number(breed)], function(err, breederLimit) {

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
            if (!breederLimit.length) {
                return cb(new Error('Invalid Request') , {
                    page: page,
                    offset: numEntries,
                    limit: next,
                    results: []
                });
            }
            
            
            if (breederLimit.length > numEntries) {
                next = true;
            }
            if (breederLimit.length > 0) {
                getResults(next, breederLimit.splice(0, numEntries));
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

        function getResults(next, limit) {
            var whereIn = " AND Breeder.id IN ( ";

            for (var i = 0; i < limit.length; i++) {
                whereIn += limit[i].Breeder_id + ",";
            }

            var where = whereIn.substr(0, whereIn.length - 1) + ") ";
            var query = buildQuery();
            var whereInQuery = whereQuery(province, breed, where);

            query += whereInQuery + 'ORDER BY ' + order;

            ds.connector.query(query, [province, Number(breed)], function(err, results) {
                if (err) {
                    console.log(err);
                }

                cb(err, {
                    page: page,
                    offset: numEntries,
                    limit: next,
                    results: filterResults(results)
                });
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
            }],
            returns: {
                arg: 'data',
                type: ['Breeder'],
                root: true
            }
        }),

    Breeder.byName = function(name, page, order, numEntries, cb) {
        if (!name || !page || !order || !numEntries) {
            return cb(new Error('Invalid Request'), {
                    page: page,
                    offset: numEntries,
                    limit: numEntries,
                    results: []
                });
                
        }
        
        var nextLimit = numEntries + 1;
        var ds = Breeder.dataSource;
        var nameQueryLimit = buildQuery();
        order = orderValidation(order);

        if (isNaN(numEntries)) {
            numEntries = 10;
        }
        if (isNaN(page)) {
            page = 0;
        }


        nameQueryLimit += " WHERE Breeder.name LIKE CONCAT('%', ?, '%') OR Breeder.kennel LIKE CONCAT('%', ?, '%') " +
            "GROUP BY Breeder.id ORDER BY " + order + " LIMIT " + page + "," + nextLimit;


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
            var whereInQuery =  " WHERE (Breeder.name LIKE CONCAT('%', ?, '%') OR Breeder.kennel LIKE CONCAT('%', ?, '%') ) ";

            query += whereInQuery + where + 'ORDER BY ' + order;

            ds.connector.query(query, [name, name], function(err, results) {
                if (err) {
                    console.log(err);
                }

                cb(err, {
                    page: page,
                    offset: numEntries,
                    limit: next,
                    results: filterResults(results)
                });
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
            }],
            returns: {
                arg: 'data',
                type: ['Breeder'],
                root: true
            }
        });
};
