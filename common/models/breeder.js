module.exports = function(Breeder) {
    // Breeder.byProvAndBreed = function(province, cb) {
    Breeder.byProvAndBreed = function(province, breed, order, page, numEntries, cb) {
        // console.log(order);
        // var totalLimit;
        if (isNaN(numEntries)) {
            numEntries = 10;
        }
        if (isNaN(page)) {
            page = 0;
        }
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
        // console.log(order);
        var ds = Breeder.dataSource;
        var query = "SELECT Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
            "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
            "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
            "Address.country as Address_country FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
            "Left JOIN Litter ON Litter.breederId = Breeder.id";

        var queryLimit = "SELECT Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
            "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
            "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
            "Address.country as Address_country FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
            "Left JOIN Litter ON Litter.breederId = Breeder.id";



        // function getCount(){
        //     var count =  "SELECT Litter.breedName as Litter_breed, Litter.breedId as Litter_breedId, " +
        // "Litter.breederId as Litter_breederId, Breeder.name as Breeder_name, Breeder.kennel as Breeder_kennel, " +
        // "Breeder.id as Breeder_id, Address.city as Address_city, Address.province as Address_province, " +
        // "Address.country as Address_country, COUNT(*) as count FROM Breeder JOIN Address ON Address.breederId = Breeder.id " +
        // "Left JOIN Litter ON Litter.breederId = Breeder.id"
        // if (province !== "all" && Number(breed) !== 0) {
        //     count += ' WHERE Address.province=? AND Litter.breedId=? GROUP BY Breeder.id';
        // }
        // else if (province !== "all") {
        //     count += ' WHERE Address.province=? GROUP BY Breeder.id';
        // }

        // else if (Number(breed) !== 0) {
        //     count += ' WHERE Address.province != ? AND Litter.breedId=? GROUP BY Breeder.id';
        // }

        //   ds.connector.query(count, [province, Number(breed)], function(err, countTotal) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     console.log(countTotal)
        //     console.log(countTotal[0].count)
        //     getSelection()
        // })  
        // }
        // getCount()


        if (province !== "all" && Number(breed) !== 0) {
            queryLimit += ' WHERE Address.province=? AND Litter.breedId=? GROUP BY Breeder.id';
        }
        else if (province !== "all") {
            queryLimit += ' WHERE Address.province=? GROUP BY Breeder.id';
        }

        else if (Number(breed) !== 0) {
            queryLimit += ' WHERE Address.province != ? AND Litter.breedId=? GROUP BY Breeder.id';
        }
        else {
            queryLimit += ' GROUP BY Breeder.id';
        }

        // ds.connector.query(queryLimit, [province, Number(breed)], function(err, count) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     totalLimit = count.length;
        //     if (page < totalLimit) {
        //         getSelection()
        //     }
        //     else {
        //         cb(err, {limit: totalLimit})
        //     }
        // })
        var nextLimit = numEntries + 1
        // function getSelection(){
        queryLimit += ' ORDER BY ' + order + " LIMIT " + page + "," + nextLimit;
        // console.log(queryLimit)
        ds.connector.query(queryLimit, [province, Number(breed)], function(err, breederLimit) {
            var next;
            if (err) {
                console.log(err);
            }
            if (breederLimit.length > numEntries) {
                next = true;
            }
            else {
                next = false;
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
        // console.log(limit)
        // console.log(next)
        var whereIn = "AND Breeder.id IN ( ";

        for (var i = 0; i < limit.length; i++) {
            whereIn += limit[i].Breeder_id + ","
        }
        // console.log(whereIn)
        var where = whereIn.substr(0, whereIn.length - 1) + ") "

        if (province !== "all" && Number(breed) !== 0) {
            query += ' WHERE Address.province=? AND Litter.breedId=? ' + where + 'ORDER BY ' + order;
        }
        else if (province !== "all") {
            query += ' WHERE Address.province=? ' + where + 'ORDER BY ' + order;
        }

        else if (Number(breed) !== 0) {
            query += ' WHERE Address.province != ? AND Litter.breedId=? ' + where + 'ORDER BY ' + order;
        }
        else {
            query += ' WHERE ' + where.substring(4) + 'ORDER BY ' + order;
        }
        // query += ' GROUP BY Breeder.id;';

        // console.log(query)
        ds.connector.query(query, [province, Number(breed)], function(err, results) {
            if (err) {
                console.log(err);
            }
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
            cb(err, {
                page: page,
                offset: numEntries,
                limit: next,
                results: finalResults
            });
        })
    }
};
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
            arg: 'order',
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
