
// Beaucoup de variables globales
var seuil = 0,
    matrix,
    selectedId = "zap",
    skippedNodes = [],
    skippedLinks,
    focusNode = true,
    selectedLink,
    msds,
    means,
    sigmas,
    zaps;

if($.cookie('skippedLinks'))
    skippedLinks = JSON.parse($.cookie('skippedLinks'));
else skippedLinks = [];
if($.cookie('seuil'))
    skippedLinks = JSON.parse($.cookie('seuil'));


function onDrop(event) {
    console.log(event.dataTransfer.files[0].size,
        event.dataTransfer.files[0].type);

    // var data = event.dataTransfer.getData('text/plain')
    // event.preventDefault()
    // alert('files: ' + event.dataTransfer.files + ' && data: ' + data + '.')
}

function myGraph(el,w,h) {

    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({"id": id});
        update();
        //console.log(isDoublons());
    };

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        if(n)
        {
            while (i < links.length) {
                if ((links[i]['source'] == n) || (links[i]['target'] == n)) {
                    links.splice(i, 1);
                }
                else i++;
            }
            nodes.splice(this.findNodeIndex(id), 1);
            this.removeLonelyNodes();
            update();
        }
        
    };

    this.removeLink = function (source, target) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                links.splice(i, 1);
                //break;
            }
        }
        this.removeLonelyNodes();
        update();
    };

    this.removeAllLinks = function () {
        //links.splice(0, links.length);
        links = [];
        update();
    };

    this.removeAllNodes = function () {
        //nodes.splice(0, links.length);
        node = [];
        update();
    };

    this.addLink = function (source, target, value) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                links[i].value = value;
                update();
                console.log('Existe déjà, mis à jour');
                return true;
            }
        }
        links.push({"source": findNode(source), "target": findNode(target), "value": value});
        update();
        return true;
    };

    this.removeLonelyNodes = function() {
        for (var i = nodes.length - 1; i >= 0; i--) {
            if(!this.findLinks(nodes[i].id).length)
                this.removeNode(nodes[i].id);
        };
        return true;
    }

    this.clear = function() {
        for (var i = nodes.length - 1; i >= 0; i--) {
            this.removeNode(nodes[i].id);
        };
    }

    this.findLink = function(source,target) {
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == source && links[i].target.id == target) {
                return true;
            }
        }
        return false;
    };

    this.getNodes = function () {
        return nodes;
    }

    this.findNodeIndex = function (id) {
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].id == id) {
                return i;
            }
        };
        return undefined;
    };

    this.findLinks = function(id) {
        var correspondingLinks = [];
        for (var i = 0; i < links.length; i++) {
            if (links[i].source.id == id || links[i].target.id == id) {
                correspondingLinks.push(links[i]);
            }
        }
        return correspondingLinks;
    };

    this.setCharge = function(val) {
        charge = val;
        update();
    }

    var isDoublons = function() {
        var no = nodes.filter(function(elem, pos){
            return elem.index == nodes[this.findNodeIndex(elem.id)].index;
            //return nodes.indexOf(elem) == pos;
        })
        if(no.length != nodes.length) return true;
        else return false;
    }

    var findNode = function (id) {
        for (var i in nodes) {
            if (nodes[i]["id"] === id) return nodes[i];
        };
    };

    // set up the D3 visualisation in the specified element

    var color = d3.scale.category10();

    var vis = d3.select(el)
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "svg")
            .attr("pointer-events", "all")
            .attr("viewBox", "0 0 " + w + " " + h)
            .attr("perserveAspectRatio", "xMinYMid")
            .append('svg:g');
    
    var force = d3.layout.force();

    var nodes = force.nodes(),
        links = force.links()
        charge = -700;

    var update = function () {
        var link = vis.selectAll("line")
                .data(links, function (d) {
                    //console.log(d);
                    return d.source.id + "-" + d.target.id;
                });

        link.enter().append("line")
                .attr("id", function (d) {
                    return d.source.id + "-" + d.target.id;
                })
                // .attr("stroke-width", function (d) {
                //     return d.value / 10;
                // })
                .attr("class", "link");
        link.append("title")
                .text(function (d) {
                    return d.value;
                });
        link.exit().remove();

        var node = vis.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id;
                });

        var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .call(force.drag);

        nodeEnter.append("svg:circle")
                .attr("r", 12)
                .attr("id", function (d) {
                    return "Node;" + d.id;
                })
                .attr("class", "nodeStroke")
                .attr("fill", function(d) { return color(d.id); });

        nodeEnter.append("svg:text")
                .attr("class", "textClass")
                .attr("x", 14)
                .attr("y", ".31em")
                .text(function (d) {
                    return d.id;
                });

        node.exit().remove();

        force.on("tick", function () {

            node.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

            link.attr("x1", function (d) {
                return d.source.x;
            })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });
        });

        // Restart the force layout.
        force
            .charge(charge)
            .linkDistance(function(l){ return Math.acos( Math.abs(l.value) )*100; })
            .size([w, h])
            .start();
    };


    // Make it all go
    update();
}


d3.json("correlations", function(error, M) {

    //console.log(M);
    matrix = _.cloneDeep(M);

    graph = new myGraph('#svg' ,900,600);

    // Main functions for computing and displaying data

    // Function called at the end of computing below
    var updateDom = function(matrice,noms) {

        keepNodesOnTop();


        // Refresh events binding
        $('.node').on("click", function(e){

            selectedId = e.currentTarget.__data__.id;

            $('#noeud').text(selectedId);

            density(selectedId,1000);
        });

        $('.link').on("click", function(e){

            selectedLink = e.currentTarget.__data__;

            $('#correlation').text(truncate(selectedLink.value,2));

            plotCluster();
        });


        // Display the matrix used for current data

        // matrice.unshift(noms);

        // $('.matrice').html(arrayToTable(matrice));

        // $('tbody').find('td').each(function(i){
        //     var val = parseInt($(this).html());
        //     if(val == 1)
        //         $(this).css('background-color','rgb(197, 245, 178)');
        //     if(val == -1)
        //         $(this).css('background-color','rgb(245, 181, 178)');
        // });

        // Display the contents of the skippedNodes variable
        $('#skipped_nodes').html('');
        for (var i = skippedNodes.length - 1; i >= 0; i--) {
            $('#skipped_nodes')
            .append(
                $('<span>').text(names[skippedNodes[i]])
                .append($('<br>'))
            );
        };

        $('#skipped_links').html('');
        for (var i = skippedLinks.length - 1; i >= 0; i--) {
            $('#skipped_links')
            .append(
                $('<span>').text(skippedLinks[i].source +' - '+skippedLinks[i].target)
                .append($('<br>'))
            );
        };

    };

    var updateGraph = function() {

        // Copie des variables globales pour modification profonde
        var noms = _.cloneDeep(names);
        var matrice = _.cloneDeep(matrix);

        // If necessary, compute the partial correlation matrix
        if(skippedNodes.length)
        {
            // console.log('avant', skippedNodes);
            matrice = partMatrix(matrice,skippedNodes);
            // console.log('apres', skippedNodes);
            noms = partNames(noms,skippedNodes);

            if(matrice.length != noms.length)
                console.log(matrice.length, noms.length, 'mismatch');

        }

        for (var i = 0; i < matrice.length; i++) {
            for (var j = 0; j < i; j++) {
                if(isLink(matrice,i,j,seuil) && !(isSkippedLink(noms[i],noms[j],skippedLinks)))
                {
                    // console.log(isSkippedLink(noms[i],noms[j],skippedLinks))
                    if(graph.findNodeIndex(noms[i]) == undefined)
                    {
                        graph.addNode(noms[i]);
                    }

                    if(graph.findNodeIndex(noms[j]) == undefined)
                    {
                        graph.addNode(noms[j]);
                    }

                    graph.addLink(noms[i],noms[j], matrice[i][j]);

                }
                else if(graph.findLink( noms[i], noms[j] ))
                {
                    graph.removeLink(noms[i],noms[j]);
                }
            };
        };
        updateDom(matrice,noms);
    }

    var isolateGraph = function() {
        // Copie des variables globales pour modification profonde
        var noms = _.cloneDeep(names);
        var matrice = _.cloneDeep(matrix);

        // If necessary, compute the partial correlation matrix
        if(skippedNodes.length)
        {
            // console.log('avant', skippedNodes);
            matrice = partMatrix(matrice,skippedNodes);
            // console.log('apres', skippedNodes);
            noms = partNames(noms,skippedNodes);

            if(matrice.length != noms.length)
                console.log(matrice.length, noms.length, 'mismatch');

        }

        var index = noms.indexOf(selectedId);

        for (var i = 0; i < matrice.length; i++) {
            for (var j = 0; j < i; j++) {
                if(i==index && isLink(matrice,i,j,seuil) && !(isSkippedLink(noms[i],noms[j],skippedLinks)))
                {
                    if(graph.findNodeIndex(noms[i]) == undefined)
                    {
                        graph.addNode(noms[i]);
                    }

                    if(graph.findNodeIndex(noms[j]) == undefined)
                    {
                        graph.addNode(noms[j]);
                    }

                    graph.addLink(noms[i],noms[j], matrice[i][j]);

                }
                else if(graph.findLink( noms[i], noms[j] ))
                {
                    graph.removeLink(noms[i],noms[j]);
                }
            };
        };
        updateDom(matrice,noms);
    }

    isolateGraph();

    // Action handlers
    var updateSeuil = function(context) {
        console.log(context.currentTarget.valueAsNumber);

        seuil = context.currentTarget.valueAsNumber;
        $('#seuil_span').html(seuil);

        $.cookie('seuil',JSON.stringify(seuil))

        if(focusNode)
            isolateGraph();
        else
            updateGraph();
    }

    var updateCharge = function(context) {
        console.log(context.currentTarget.valueAsNumber);

        var charge = context.currentTarget.valueAsNumber;
        graph.setCharge(charge);
        $('#charge_span').html(charge);
    }

    var removeSelectedNode = function(context) {

        var inames = names.indexOf(selectedId);
        if(skippedNodes.indexOf(inames)==-1)
        {
            skippedNodes.push(inames);
            graph.removeNode(selectedId);
            if(focusNode)
                isolateGraph();
            else
                updateGraph();
        }
    }
    
    var removeSelectedLink = function() {
        console.log(selectedLink)

        var source = selectedLink.source.id,
            target = selectedLink.target.id;

        graph.removeLink( source, target);

        if(!isSkippedLink(source,target,skippedLinks))
        {
            skippedLinks.push({ source: source, target: target});
            // console.log(skippedLinks);
            $.cookie('skippedLinks', JSON.stringify(skippedLinks));
        }

        $('#skipped_links').html('');
        for (var i = skippedLinks.length - 1; i >= 0; i--) {
            $('#skipped_links')
            .append(
                $('<span>').text(skippedLinks[i].source +' - '+skippedLinks[i].target)
                .append($('<br>'))
            );
        };
    }

    var clearSkippedLinks = function() {
        skippedLinks = [];
        $.removeCookie('skippedLinks');

        $('#skipped_links').html('');
        for (var i = skippedLinks.length - 1; i >= 0; i--) {
            $('#skipped_links')
            .append(
                $('<span>').text(skippedLinks[i].source +' - '+skippedLinks[i].target)
                .append($('<br>'))
            );
        };
    }

    var isolate = function(context) {
        focusNode = $('#isolate')[0].checked;
        if(focusNode)
            isolateGraph();
        else
            updateGraph();
    }

    var plotCluster = function() {
        var source = selectedLink.source.id,
            target = selectedLink.target.id;
        globalCluster(2,[source,target],source,target)
    }

    var computeProblems = function() {
        problemes(_.cloneDeep(whens))
    }
    

    // Define button actions
    $('#seuil').on("change",updateSeuil);

    $('#charge').on("change",updateCharge);

    $('#remove_node').on("click",removeSelectedNode);

    $('#remove_link').on("click",removeSelectedLink);

    $('#clear_skipped_links').on("click",clearSkippedLinks);

    $('#plot').on("click",plotCluster);

    $('#isolate').on("change",isolate);

    $('#compute_problems').on("click",computeProblems)


});

function keepNodesOnTop() {
    $(".nodeStroke").each(function( index ) {
        var gnode = this.parentNode;
        gnode.parentNode.appendChild(gnode);
    });
}

var plot2D = function(data,xlabel,ylabel,radius) {

    var radius = radius || 6;

    // _.each(data,function(e){
    //     e.x += Math.random()*0.05;
    //     e.y += Math.random()*0.05;
    // })

    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var randomX = d3.random.normal(width / 2, 80),
        randomY = d3.random.normal(height / 2, 80),
        color = d3.scale.category10();

    var minX = d3.min(data.map(function(e){return e.x;})),
        maxX = d3.max(data.map(function(e){return e.x;})),
        minY = d3.min(data.map(function(e){return e.y;})),
        maxY = d3.max(data.map(function(e){return e.y;}));

    var x = d3.scale.linear()
        .domain([minX,maxX])
        .range([0,width])

    // var y = d3.scale.linear()
    //     .domain([minX,maxX])
    //     .range([height,0])

    var y = d3.scale.linear()
        .domain([minY,maxY])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width);

    $('#chart').html('');

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.behavior.zoom().x(x).y(y).on("zoom", zoom));

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
    .call(xAxis).append("text")
        .attr("class", "caption")
        .attr("x", width-150)
        .attr("y", -6)
        .text(xlabel);;

    svg.append("g")
        .attr("class", "y axis")
    .call(yAxis).append("text")
        .attr("class", "caption")
        .attr("x", 6)
        .attr("y", 50)
        .text(ylabel);

    var circle = svg.selectAll("circle")
        .data(data)
    .enter().append("circle")
        .attr("r", radius)
        .attr("fill", cluster)
        .attr("transform", transform);


    function zoom() {
        //console.log(arguments)
        circle.attr("transform", transform);
        svg.select("path")
            .scale
            // .attr("transform", transform);
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
    }

    function transform(d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
    }
    function cluster(d,i) {
        if(d.cluster) {
            //console.log(msds[i].cluster)
            // if(d.cluster == 0)
            //     return "green";
            // else if(d.cluster == 1)
            //     return "red";
            // else return "blue";
            return color(d.cluster);
        }
    }

    $('circle').click(function(e){
        var msd = e.currentTarget.__data__.msd;
        console.log(e.currentTarget.__data__.msd,e.currentTarget.__data__);
        $('#msd').html(''+msd)
    })
}

var plot1D = function(data,obs,xlabel,ylabel,radius) {

    var radius = radius || 6;

    // _.each(data,function(e){
    //     e.x += Math.random()*0.05;
    //     e.y += Math.random()*0.05;
    // })

    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var randomX = d3.random.normal(width / 2, 80),
        randomY = d3.random.normal(height / 2, 80),
        color = d3.scale.category10();

    var minX = d3.min(data.map(function(e){return e.x;})),
        maxX = d3.max(data.map(function(e){return e.x;})),
        minY = d3.min(data.map(function(e){return e.y;})),
        maxY = d3.max(data.map(function(e){return e.y;}));

    var x = d3.scale.linear()
        .domain([minX,maxX])
        .range([0,width])

    var y = d3.scale.linear()
        .domain([minY,maxY])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
        .tickSize(-width);

    $('#chart').html('');

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
    .call(xAxis).append("text")
        .attr("class", "caption")
        .attr("x", width-150)
        .attr("y", -6)
        .text(xlabel);;

    svg.append("g")
        .attr("class", "y axis")
    .call(yAxis).append("text")
        .attr("class", "caption")
        .attr("x", 6)
        .attr("y", 50)
        .text(ylabel);

    var line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); })
        .interpolate("basis");

    svg.append("path")
        .attr("d",line(data))
        //.attr("transform",transform)
        .attr("class","density")


    var brush = d3.svg.brush().x(x)
        .on("brushstart", brushstart)
        .on("brush", brushmove)
        .on("brushend", brushend)


    svg.append("g")
        .attr("class", "brush")
    .call(brush)
    .selectAll("rect")
        .attr("height", height);

    function cluster(d,i) {
        if(d.cluster) {
            return color(d.cluster);
        }
    }

    var brushCell,
        selected;

    function brushstart(p) {
        console.log('brushstart');
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.clear());
            brushCell = this;
        }
    }
    $('#n_msd').html(obs.length);
        // Highlight the selected circles.
    function brushmove(p) {

        var e = brush.extent();
        selected = _.filter(obs,function(d){
            return e[0] <= d.value && d.value <= e[1]
        });
        $('#k_msd').html(selected.length);
    }

    // If the brush is empty, select all circles.
    function brushend() {
        console.log('brushend');
        var ext = brush.extent(),
            step = data[10].x-data[9].x;
        var reclus = [["msd",xlabel]];

        _.forEach(selected, function(e,i){ reclus.push([e.msd, e.value ]) })
        reclus = _.sortBy(reclus,function(e){return -e[1]}).slice(0,100);

        $('#selected_msds').html(arrayToTable(reclus));

        var integrale = 0;

        _.each(data,function(e){
            if(e.x>ext[0]&&e.x<ext[1] )
            {
                integrale += e.y*step;
            }
        })
        console.log("l'intégrale de la courbe vaut : ",integrale," pourtant elle représente ",selected.length," utilisateurs");
        $('#integrale').html(truncate(integrale,4))

    }
}

function globalCluster(k,coords,source,target){
    d3.json("kmeans", function(error, vars) {
        //var coords = whens;
        console.log(coords)
        var coo = [ coords[1] ]
        var variables = clusterize(vars,coo,k);

        var data = [];
        _.each(variables,function(e){
            data.push({ x: e[source], y: e[target], msd: e.msd, cluster: e.cluster})
        });
        _.each(data,function(e){
            e.x += Math.random()*0.05;
            e.y += Math.random()*0.05;
        })
        plot2D(data,source,target);

    });

}

function clusterize(vars,coords,k)
{

    vars.map(function(e){
        e.cluster = Math.floor(Math.random()*k);
    });
    var centres,
        centres2
        total = 0;


    do {
        centres = maximisation(vars,k,coords);

        vars = expectation(vars,centres,coords);

        centres2 = maximisation(vars,k,coords);
        //console.log(centres2)
        var deplacements = _.map(centres2,function(e,i){
            return cdist(e,centres[i],coords);
        });
        total = 0;
        deplacements.forEach(function(e){
            total += e;
        })
        console.log(total);

    } while(total > 0.001)

    return vars;

}

var density = function density(noeud,res,callback) {
    if(noeud == "zap") return false;

    d3.json("noeud/"+noeud, function plotDensity(error, vars) {

        means = vars.means;
        sigmas = vars.sigmas;
        var variable = vars[noeud];

        variable = vars[noeud].map(function(e,i){
            return { value: (e.value - vars.means[noeud])/vars.sigmas[noeud], msd: e.msd };
        });
        zaps = vars.zap.map(function(e,i){
            return { value: (e.value - vars.means.zap)/vars.sigmas.zap, msd: e.msd };
        });;
        variable.map(function(e,i){
            e.value = ( e.value - zaps[i].value ) * vars.sigmas[noeud] + vars.means[noeud];
        })
        var dispVar = vars[noeud];
        var min = _.min(dispVar, function(obs){return obs.value;}).value;
        var max = _.max(dispVar, function(obs){return obs.value;}).value;

        var marge = (max-min)/50;

        var l = max-min+2*marge,
            n = variable.length,
            e = 0.01;

        //var s = sigma(variable);
        var s = sigmas[noeud];

        var h = 1.06*s*Math.pow(n,-1/5);
        console.log(noeud,s,h)

        var data = [{x:min-marge,y:0}];

        for(var x = min-marge; x <= max+marge; x = x + l/res) {
            var y = 0;
            _.each(dispVar,function computePoint(e){
                y += epanechnikov( (x-e.value)/h );
            })
            data.push({ x: x, y: y/h });
        }

        plot1D(data,dispVar,noeud,"densité (utilisateurs / nombre de logs) à nombre de zaps fixé",1)

        var integrale = 0,
            c = 1,
            plancher = 0;
        _.each(data,function(e){
            integrale += e.y*l/res;
            if(c&&e.x>0&& e.y < 0.00001 )
            {
                console.log(e.x,e.y);
                c = 0;
                plancher = e.x;
            }
        })
        console.log("l'intégrale de la courbe vaut : ",integrale," pourtant elle représente ",variable.length," utilisateurs");

        var reclus = [["msd",noeud]];

        _.forEach(variable, function(e,i){
            if(e.value > plancher) {
                reclus.push([e.msd, vars[noeud][i].value ])
            }
        })
        reclus = _.sortBy(reclus,function(e){return -e[1]});

        $('.reclus table').html(arrayToTable(reclus));

        callback(reclus);
    });
}
density('broadcasted_version',1000);

var problemes = function(coords) {
    //var coords = _.clone(coo);

    if( ! coords.length ) return true;

    if(coords[0] != "zap") {
        var premier = density(coords[0],1000,function(reclus){

            premier = reclus[1];

            // [ "le msd " + premier[0] + " a un problème avec " + coords[0],
            //             ". Il en a loggué " + premier[1],
            //             " alors que la moyenne est à " + truncate(means[coords[0]],5),
            //             " avec un écart type de " + truncate(sigmas[coords[0]],5) ];
            var str = "Le msd " + premier[0] + " a un problème avec "
                + coords[0] + ". Il en a loggué " + premier[1] + " alors que la moyenne est à "
                + truncate(means[coords[0]],5) + " avec un écart-type de " + truncate(sigmas[coords[0]],5);

            console.log(str);
            $('#logs').append($('<p>', {text: str}))
            coords.shift()
            return problemes(coords)

        });
    }
    else
    {
        //coords.shift()
        return problemes(coords);
    }
}

var ranking = function ranking() {
    d3.json("centrenorme", function plotDensity(error, obs) {
        console.log(obs[0])
        obs.map(function(e){
           
        })
    })
}
ranking();


function scatterPlot(coords) {

    var width = 960,
        size = 150,
        padding = 19.5;

    var x = d3.scale.linear()
        .range([padding / 2, size - padding / 2]);

    var y = d3.scale.linear()
        .range([size - padding / 2, padding / 2]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);

    var color = d3.scale.category10();

    d3.json("centrenorme", function(error, vars) {

        var data = clusterize(vars,coords,coords.length);


        var domainByTrait = {},
        traits = coords,
        n = traits.length;

        traits.forEach(function(trait) {
            domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
        });

        xAxis.tickSize(size * n);
        yAxis.tickSize(-size * n);

        var brush = d3.svg.brush()
        .x(x)
        .y(y)
        .on("brushstart", brushstart)
        .on("brush", brushmove)
        .on("brushend", brushend);

        var svg = d3.select("#scatter").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

        svg.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

        svg.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

        var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

        // Titles for the diagonal.
        cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });

        cell.call(brush);

        function plot(p) {
            var cell = d3.select(this);

            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);

            cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", size - padding)
            .attr("height", size - padding);

            cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d[p.x]); })
            .attr("cy", function(d) { return y(d[p.y]); })
            .attr("r", 3)
            .style("fill", function(d) { return color(d.cluster); });
        }

        var brushCell;

        // Clear the previously-active brush, if any.
        function brushstart(p) {
        if (brushCell !== this) {
        d3.select(brushCell).call(brush.clear());
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
        brushCell = this;
        }
        }

        // Highlight the selected circles.
        function brushmove(p) {
            var e = brush.extent();
            svg.selectAll("circle").classed("hidden", function(d) {
            return e[0][0] > d[p.x] || d[p.x] > e[1][0]
            || e[0][1] > d[p.y] || d[p.y] > e[1][1];
            });
        }

        // If the brush is empty, select all circles.
        function brushend() {
        //if (brush.empty()) svg.selectAll(".hidden").classed("hidden", false);
        }

        function cross(a, b) {
        var c = [], n = a.length, m = b.length, i, j;
        for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
        return c;
        }

        d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
    });

}
//scatterPlot(['network_disconnected',"bad_signal_quality","zap"]) //,"hlsError","bad_signal_quality"












