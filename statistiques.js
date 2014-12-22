
/*
    The following code is tedious and lame,
    though it tries to implement interesting statistical concepts that can be found here :

    http://en.wikipedia.org/wiki/Correlation_and_dependence

    http://en.wikipedia.org/wiki/Covariance_matrix
        http://fr.wikipedia.org/wiki/Iconographie_des_corrélations

    http://en.wikipedia.org/wiki/Kernel_density_estimation
        with the more practical:
        http://en.wikipedia.org/wiki/Kernel_(statistics)

*/








// A set of functions for making operations on arrays of object or hashmaps,
// both representing vectors of information

var mul = function(X,Y) {
    if ( Object.prototype.toString.call(X) == "[object Array]" ) {
        return _.map(X,function(e,i){
            return { value: e.value*Y[i].value, msd: e.msd };
        });
    }
    else if( Object.prototype.toString.call(X) == "[object Object]" ) {
        var res = {};
        for( var key in X ){
            res[key] = X[key]*Y[key];
        }
        res.msd = X.msd;
        return res;
    }
}
var add = function(X,Y) {
    if ( Object.prototype.toString.call(X) == "[object Array]" ) {
        return _.map(X,function(e,i){
            return { value: e.value + Y[i].value, msd: e.msd };
        });
    }
    else if( Object.prototype.toString.call(X) == "[object Object]" ) {
        var res = {};
        for( var key in X ){
            res[key] = X[key] + Y[key];
        }
        res.msd = X.msd;
        return res;
    }
}
var divide = function(X,Y) {
    if ( Object.prototype.toString.call(X) == "[object Array]" ) {
        return _.map(X,function(e,i){
            if(Y[i].value) return { value: e.value / Y[i].value, msd: e.msd };
            else return { value: 0, msd: e.msd };
        });
    }
    else if( Object.prototype.toString.call(X) == "[object Object]" ) {
        var res = {};
        for( var key in X ){
            if(Y[key])
                res[key] = X[key] / Y[key];
            else res[key] = 0;
        }
        res.msd = X.msd;
        return res;
    }
}
var substract = function(X,Y) {
    if ( Object.prototype.toString.call(X) == "[object Array]" ) {
        return _.map(X,function(e,i){
            return { value: e.value - Y[i].value, msd: e.msd };
        });
    }
    else if( Object.prototype.toString.call(X) == "[object Object]" ) {
        var res = {};
        for( var key in X ){
            res[key] = X[key] - Y[key];
        }
        res.msd = X.msd;
        return res;
    }
}


var cor = function(X,Y) {
    var EXY = statistics.mean(mul(X,Y));
    var EX = statistics.mean(X);
    var EY = statistics.mean(Y);
    if(!EX || !EY)
        return 0;
    return (EXY - EX*EY) / ( statistics.sigma(X)*statistics.sigma(Y) ) ;
}
var pearson = function(X,Y) {
    var D2 = Y.map(function(y,i){
        return Math.pow( y.value-X[i].value ,2);
    });
    return statistics.mean(D2)*6/(D2.length*D2.length -1);
}
var partCor = function(M,i,j,k) {

    if( Math.abs(M[i][k])>= 0.999)
        return capToOne(M[j][k]);
    if( Math.abs(M[j][k])>= 0.999)
        return capToOne(M[i][k]);

    var c = M[i][j]-M[i][k]*M[k][j] /
        ( Math.sqrt( 1 - Math.pow(M[i][k],2) ) * Math.sqrt( 1 - Math.pow(M[j][k],2) ) );
    return capToOne(c);
}
var capToOne = function(num) {
    // if(Math.abs(num)>1) console.log(num, 'encore une erreur numérique');
    if(num>1) return 1;
    else if(num<-1) return -1;
    else return num;
}
var isSymmetric = function(M) {
    for (var i = 0; i < n; i++) {
        for (var j = 0; j <= i; j++) {
            if(M[i][j] !==  M[j][i])
                return false;
        };
    };
    return true;
}
var isLink = function(M,i,j,seuil) {

    var n = M.length;
    if(Math.abs(M[i][j]) >= seuil)
    {
        for (var k = n - 1; k >= 0; k--) {
            if(
                k!=i
                && k!=j
                && (
                    Math.abs(statistics.partCor(M,i,j,k)) < seuil
                    || M[i][j]*statistics.partCor(M,i,j,k) < 0
                )
            )
                return false;
        };
        return true;
    }
    else return false;
}
var truncate = function(num,range) {
    if(isNaN(num)) return num;
    var p = Math.pow(10,range);
    return Math.floor(num*p)/p;
}

var partMatrix = function(M,skipped) {
    var coords = _.cloneDeep(skipped);
    var d = coords.length - 1;

    if(coords.length) {

        var Matrix = _.cloneDeep(M);
        var i = coords[d];

        for (var k = 0; k < M.length; k++) {
            for (var l = 0; l < M.length; l++) {
                if( k!=i && l!=i && k!=l)
                {
                    Matrix[k][l] = statistics.partCor(M,k,l,i);
                }
            };
        };

        Matrix.splice(coords[d],1);
        Matrix = Matrix.map(function(el){
            el.splice(coords[d],1);
            return el;
        });
        console.log(Matrix.length, Matrix[0].length,'mismatch in the splice ?');

        coords.splice(d,1);
        return partMatrix(Matrix,coords);
    }
    else return M;
}

var partNames = function(lesnoms,skipped) {
    var coords = skipped.slice(0),
        thenames = lesnoms.slice(0);
    for (var i = coords.length - 1; i >= 0; i--) {
        thenames.splice(coords[i],1);
    };
    if(thenames.length != lesnoms.length-skipped.length) console.log('Erreur dans les noms');
    return thenames;
}

var isSkippedLink = function(source,target,skipped) {
    for (var k = skipped.length - 1; k >= 0; k--) {
        if( ( skipped[k].source == source && skipped[k].target == target )
            || ( skipped[k].source == target && skipped[k].target == source ) )
        {
            // console.log('isSkippedLink',target, source)
            return true;
        }
        // else console.log('notskipped')
    };
    return false;
}

var mean = function(X) {
    var m = 0;
    _.each(X,function(e){
        m = m + e.value;
    })
    m = m / X.length;
    return m;
}
var sigma = function(X) {
    // console.log('Multiplication',mul(X,X))
    return Math.sqrt(statistics.mean(mul(X,X)) - Math.pow(statistics.mean(X),2));
}

var maximisation = function(vars,k,coords) {

    var barycentre = function(obs,coords,groupe) {
        var centre = {};
        for (var i = coords.length - 1; i >= 0; i--) {
            centre[coords[i]] = 0;
        };
        var n = 0;
        for (var i = obs.length - 1; i >= 0; i--) {
            if(obs[i].cluster == groupe) {
                n++;
                for (var j = coords.length - 1; j >= 0; j--) {
                    centre[coords[j]] += obs[i][coords[j]];
                };
            }
        };
        // console.log(obs.length,n);

        for(var key in centre) {
            centre[key] = centre[key] / n;
        };
        // console.log(centre)
        return centre;
    }
    var centres = [];
    for (var i = 0; i < k; i++) {
        centres[i] = barycentre(vars,coords,i);
    };
    return centres;
}
var expectation = function(vars,centres,coords) {
    var nearest = function(X,centres,coords) {
        var cdist = function(X,Y,coords) {
            var dist = 0;
            for (var i = coords.length - 1; i >= 0; i--) {
                //dist += Math.pow(X[coords[i]] - Y[coords[i]], 2);
                dist += Math.abs(X[coords[i]] - Y[coords[i]]);
            };
            return dist; // Math.sqrt(dist);
        }
        var dists = _.map(centres,function(e){
            return cdist(X,e,coords);
        });
        return dists.indexOf(_.min(dists));
    }

    for (var i = vars.length - 1; i >= 0; i--) {
        vars[i].cluster = nearest(vars[i],centres,coords);
    };
    return vars;
}
var epanechnikov = function(x) {
    var r2pi = Math.sqrt(2*3.14159)
    var pi = 3.14159;
    // if(Math.abs(x)<1) {
    //     return 0.75*(1-x*x);
    // } else return 0;

    // if(x>=0&&x<1) return 2*(1-x);
    // else return 0;
    return 1/r2pi*Math.exp(-x*x/2);
    // return Math.sin(pi*x)/pi/x;
}
var step = function(x,e) {
    return 1 - Math.exp(-Math.pow(x,2))*(1-e);
}

var norme2 = function(X) {
    var u = 0;
    _.each(X,function(e){
        u += e*e;
    })
    return Math.sqrt(u);
}

var arrayToTable = function (data, options) {

    "use strict";

    var table = $('<table />'),
        thead,
        tfoot,
        rows = [],
        row,
        i,
        j,
        defaults = {
            th: true, // should we use th elemenst for the first row
            thead: true, //should we incldue a thead element with the first row
            tfoot: false, // should we include a tfoot element with the last row
            attrs: {} // attributes for the table element, can be used to
        };

    options = $.extend(defaults, options);

    table.attr(options.attrs);

    // loop through all the rows, we will deal with tfoot and thead later
    for (i = 0; i < data.length; i = i + 1) {
        row = $('<tr />');
        for (j = 0; j < data[i].length; j = j + 1) {
            if (i === 0 && options.th) {
                row.append($('<th />').html(truncate(data[i][j],3)));
            } else {
                row.append($('<td />').html(truncate(data[i][j],3)));
            }
        }
        rows.push(row);
    }

    // if we want a thead use shift to get it
    if (options.thead) {
        thead = rows.shift();
        thead = $('<thead />').append(thead);
        table.append(thead);
    }

    // if we want a tfoot then pop it off for later use
    if (options.tfoot) {
        tfoot = rows.pop();
    }

    // add all the rows
    for (i = 0; i < rows.length; i = i + 1) {
        table.append(rows[i]);
    }

    // and finally add the footer if needed
    if (options.tfoot) {
        tfoot = $('<tfoot />').append(tfoot);
        table.append(tfoot);
    }

    return table;
};

var obj = {
    statistics: {
        mul: mul,
        add: add,
        divide: divide,
        substract: substract,
        cor: cor,
        pearson: pearson,
        partCor: partCor,
        isSymmetric: isSymmetric,
        isLink: isLink,
        partMatrix: partMatrix,
        partNames: partNames,
        isSkippedLink: isSkippedLink,
        mean: mean,
        sigma: sigma,
        barycentre: barycentre,
        cdist: cdist,
        nearest: nearest,
        maximisation: maximisation,
        expectation: expectation,
        epanechnikov: epanechnikov,
        step: step,
        norme2: norme2,
        arrayToTable: arrayToTable
    },
    truncate: truncate,
    capToOne: capToOne
};
