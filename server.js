var fs        = require('fs')
  , path      = require('path')
  //, XmlStream = require('xml-stream')
  , util = require('util')
  , jQuery = require('jquery')
  , jsdom = require("jsdom")
  , request = require('request')
  , XMLSplitter = require('xml-splitter')
  , eyes = require('eyes')
  , xml2js = require('xml2js')
  , statistics = require('simple-statistics')
  , sylvester = require('sylvester')
  , express = require('express')
  , connect = require('connect')
  , serveStatic = require('serve-static')
  , XRegExp = require('xregexp').XRegExp
  , bodyParser = require('body-parser')
  , Entities = require('html-entities').AllHtmlEntities
  , entities = new Entities()
  , models = require('./models')
  , querystring = require('querystring')
  , _ = require('lodash')
  ;

var log = console.log;
var see = function(obj) { eyes.inspect(obj); return obj; };
var erreur = function erreur(err){
    if(err)log('Erreur : '+err);
}

var refresh = {
    result: "load",
    connect: "history"
};

eval(fs.readFileSync(__dirname +'/statistiques.js')+'');

eval(fs.readFileSync(__dirname +'/variables.js')+'');

var seuil = 0.3;

var M,
    variables,
    observations,
    centrenorme;

var debutExec = new Date().getTime();

if(refresh.result == 'refresh')
{
    if(refresh.connect == "logs")
    {
        models.logs.aggregate(
        {
            $group:
            {
                _id: {
                    msd: "$msd",
                    when: "$when",
                    network: "$network",
                    pds: "$pds",
                    webapp: "$webapp",
                    mw: "$mw",
                },
                nb: { $sum: 1 }
            }
        },
        {
            $group:
            {
                _id: "$_id.msd",
                vect: { $push: { when: "$_id.when", nb: "$nb" } },
                network: { $first: "$_id.network" },
                pds: { $first: "$_id.pds" },
                webapp: { $first: "$_id.webapp" },
                mw: { $first: "$_id.mw" },
            }
        }).exec(function(err, res) {
            see(res[0]);
            see(res.length);
            fs.writeFile('result.js', 'var res = ' + JSON.stringify(res) + '; console.log("results loaded");', function (err) {
                    if(err) console.log(err);
                });
            var fin = new Date().getTime();
            log('Temps d\'exécution de la requête : '+ (debutExec - fin) + 'ms');
        });

    } else if(refresh.connect == "history") {

        models.history.aggregate([
        { $match: { $and: [
            { msd: { $gte: "24925400095" } },
            { msd: { $lte: "24925679095" } }
                ]
            }
        },
        { $unwind: "$server_time_timestamp" },
        { $match: { server_time_timestamp: { $gte: 1409060400 } } },
        { $group: {
            _id : {
                msd: "$msd",
                when: "$when"
                },
                nb: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: "$_id.msd",
                vect: {
                    $push: {
                        when: "$_id.when",
                        nb: "$nb"
                        }   
                    }
                
                }
            }

        ]).exec(function(err, res) {
            see(res[0]);
            see(res.length);
            fs.writeFile('resultHistory.js', 'var res = ' + JSON.stringify(res) + '; console.log("results loaded");', function (err) {
                    if(err) console.log(err);
                });
            var fin = new Date().getTime();
            log('Temps d\'exécution de la requête : '+ (fin - debutExec) + 'ms');
        });
    }
}
else if(refresh.result == 'load')
{
    if(refresh.connect == "logs")
        eval(fs.readFileSync(__dirname +'/result.js')+'');
    else if (refresh.connect == "history")
        eval(fs.readFileSync(__dirname +'/resultHistory.js')+'');




    var debutProc = new Date().getTime();

    variables = {};
    observations = [];

    for (var i = names.length - 1; i >= 0; i--) {
        variables[ names[i] ] = [];
    };

    for (var i = res.length - 1; i >= 0; i--) {

        var vecteur = {};
        observations[i] = { msd: res[i]._id };

        // format the results in { propi: nb }
        for (var j = res[i].vect.length - 1; j >= 0; j--) {
            vecteur[res[i].vect[j].when] = res[i].vect[j].nb;
        };

        // aggregate and complete with zeros
        for (var k = whens.length - 1; k >= 0; k--) {

            // var obj = {};

            // if(vecteur.hasOwnProperty(whens[k]))
            //     obj[res[i]._id] = vecteur[ whens[k] ]; // { msd: nb }
            // else obj[res[i]._id] = 0;

            // variables[ whens[k] ] // variable.propj
            // .push( obj );

            if(vecteur.hasOwnProperty(whens[k]))
            {
                variables[ whens[k] ].push( { value: vecteur[ whens[k] ], msd: res[i]._id } );
                observations[i][whens[k]] = vecteur[ whens[k] ];
            }
            else
            {
                variables[ whens[k] ].push( { value: 0, msd: res[i]._id });
                observations[i][whens[k]] = 0;
            }
        };

        for(var key in stateVariables)
        {
            // see(key)
            for (var k = stateVariables[key].length - 1; k >= 0; k--) {
                // see(stateVariables[key][k])
                if(res[i][key] == stateVariables[key][k])
                {
                    variables[ stateVariables[key][k] ].push({ value: 1, msd: res[i]._id });
                    observations[i][ stateVariables[key][k] ] = 1;
                }
                else 
                {
                    variables[ stateVariables[key][k] ].push({ value: 0, msd: res[i]._id });
                    observations[i][ stateVariables[key][k] ] = 0;
                }
            };
        }
    };

    see(observations[10]);
    // see(observations[18]);

    var means = {},
        sigmas = {};
    for( var key in variables) {
        means[key] = mean(variables[key]);
        sigmas[key] = sigma(variables[key]);
    }
    log(means,sigmas);

    centrenorme = _.map(observations,function(X,i){
        return divide( substract(X, means), sigmas);
    });
    see(centrenorme[10])


    M = [[]];

    for (var i = 1; i <= n-1; i++) {
        M[i] = [];
        for (var j = 0; j < i; j++) {
            // if(i==1&&j==0)
            //     log(whens[i],whens[j]);
            M[i][j] = capToOne(cor(variables[names[i]], variables[names[j]] ));
        };
    };
    for (var i = 0; i < n; i++) {
        M[i][i] = 1;
    };
    for (var i = 0; i <= n-1; i++) {
        for (var j = i+1; j < n; j++) {
            M[i][j] = M[j][i];
        };
    };
    // see(M);

    var liens = [];

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < i; j++) {
            if(isLink(M,i,j,seuil))
            {
                log(names[i]+' est correllé à '+names[j]+' avec c = '+M[i][j]);
                liens.push([i,j]);
            }
        };
    };
    // see(liens);




    see(isSymmetric(M));
    see(res.length);
    var fin = new Date().getTime();
    log('Temps d\'exécution de la requête : '+ (debutProc - debutExec) + 'ms');
    log('Temps d\'exécution du traitement : '+ (fin - debutProc) + 'ms');



    var app = express();

    var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', "*");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    }

    app
    .use( allowCrossDomain )
    .use( express.static(__dirname ) )
    .use( bodyParser.json() )

    .get('/correlations', function(req, res) {
        res.json(M);
    })
    .get('/variables/:var1/:var2', function(req,res){

        var obj = {};
        obj[req.params.var1] = variables[req.params.var1].map(function(e){
            if(sigmas[req.params.var1])
                return { value: (e.value-means[req.params.var1])/sigmas[req.params.var1], msd: e.msd };
            else return 0;
        });
        obj[req.params.var2] = variables[req.params.var2].map(function(e){
            if(sigmas[req.params.var2])
                return { value: (e.value-means[req.params.var2])/sigmas[req.params.var2], msd: e.msd };
            else return 0;
        });
        // see(obj)
        res.json(obj);

    })
    .get('/kmeans', function(req,res){
        res.json(observations);
    })
    .get('/centrenorme', function(req,res){
        res.json(centrenorme);
    })
    .get('/noeud/:noeud', function(req,res){
        // (variables[req.params.noeud])
        var obj = { means: means, sigmas: sigmas };
        obj[req.params.noeud] = variables[req.params.noeud];
        obj.zap = variables.zap;
        res.json(obj);
    });

    app.listen(1234);

}




// db.logsGaspard.aggregate(
// {
//     $group:
//     {
//         _id: {
//             when: "$when"
//         }
//     }
// },
// {
//     $group:
//     {
//         _id: 1,
//         vect: { $push: "$_id.when" }
//     }
// })

// db.logs.aggregate(
// {
//     $match: {
//         $and: [
//             { msd: { $gte: "926044897"} },
//             { msd: { $lte: "926045010"} },
//         ]

//     }
// },
// {
//     $group:
//     {
//         _id: {
//             when: "$when",
//             msd: "$msd"
//         },
//         nb: { $sum: 1 }
//     }
// })




















