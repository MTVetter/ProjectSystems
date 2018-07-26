/* Main JavaScript sheet for Project Request Form by Michael Vetter*/
$(document).ready(function (){
    $("#panel").hide();
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/widgets/LayerList",
        "esri/widgets/Expand",
        "esri/geometry/Extent",
        "esri/widgets/Home",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleFillSymbol",
        "esri/widgets/Search",
        "esri/views/2d/draw/Draw",
        "esri/Graphic",
        "esri/geometry/Polyline",
        "esri/geometry/geometryEngine",
        "esri/request",
        "dojo/on",
        "dojo/dom",
        "dojo/domReady!"
    ], function(Map, MapView, FeatureLayer, LayerList, Expand, Extent, Home, SimpleLineSymbol, SimpleFillSymbol, 
        Search, Draw, Graphic, Polyline, geometryEngine, esriRequest, on, dom){

        //========================================
        //Create a list of global variables
        var graphic;
        var attributes;
        var addFeature;
        var newProject;
    
        //========================================
        //Create the map and add layers
    
        var map = new Map({
            basemap: "streets-navigation-vector"
        });
    
        var homeExtent = new Extent({
            xmin: -10251602.81762082,
            xmax: -10304989.48107227,
            ymin: 3672629.538129259,
            ymax: 3685031.445968512,
            spatialReference: 102100
        });
    
        //Create the view that will hold the map
        var view = new MapView({
            container: "viewDiv",
            map: map,
            extent: homeExtent,
            zoom: 6
        });
    
        //Creating the popup templates
        var parishTemplate = {
            title: "Parish Name: {Name}",
            content: [{
                type: "fields",
                fieldInfos: [{
                    fieldName: "Parish_FIP",
                    visible: true
                }, {
                    fieldName: "Parish_Num",
                    visible: true
                }, {
                    fieldName: "Population",
                    visible: true,
                    format:{
                        digitSeparator: true,
                        places: 0
                    }
                }]
            }]
        };
    
        var routeTemplate ={
            title: "LRSID_Route: {RouteID}",
            content: [{
                type: "fields",
                fieldInfos: [{
                    fieldName: "ControlSection",
                    visible: true
                },{
                    fieldName: "InventoryDirection",
                    visible: true
                }, {
                    fieldName: "ParishFIPS",
                    visible: true
                }, {
                    fieldName: "DOTDDistrict",
                    visible: true
                }, {
                    fieldName: "ParishNumber",
                    visible: true
                }, {
                    fieldName: "FullName",
                    visible: true
                }]
            }]
        };
    
        //Adding in the parish boundaries
        var parish = new FeatureLayer({
            url: "https://giswebnew.dotd.la.gov/arcgis/rest/services/Boundaries/LA_Parishes/FeatureServer/0",
            outFields: ["*"],
            popupTemplate: parishTemplate,
            title: "Parishes"
        });
    
        //Add LRSID_Routes
        var routes = new FeatureLayer({
            url: "https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/FeatureServer/0",
            outFields: ["*"],
            popupTemplate: routeTemplate,
            title: "LRSID_Routes",
            definitionExpression: "RouteID LIKE '%-%-1-%' OR RouteID LIKE '%-%-2-%'"
        });

        //Add the editable projects layer
        var projects = new FeatureLayer({
            url: "https://services.arcgis.com/PLiuXYMBpMK5h36e/arcgis/rest/services/ProjectSystems/FeatureServer/0",
            outFields: ["*"],
            capabilites: {
                "supportsAdd": true
            }
        });
    
        map.add(parish);
        map.add(routes);
        map.add(projects);
    
        mapSetup();
    
        //====================================
        //Create buttons and widgets for the map
    
        function mapSetup(){
            //Layer list
            var layerList = new LayerList({
                view: view,
            });
    
    
            //Create a button to hide/expand the layer list
            var layerExpand = new Expand({
                expandIconClass: "esri-icon-layers",
                expandTooltip: "Turn on and off Map Layers",
                expanded: false,
                view: view,
                content: layerList,
                mode: "floating",
                group: "top-left"
            });
    
            //Home button
            var homeButton = new Home({
                view: view
            });
    
            //Search button
            var searchWidget = new Search({
                view: view,
                allPlaceholder: "Search for a LRSID...",
                locationEnabled: false,
                includeDefaultSources: false,
                sources: [{
                    featureLayer: routes,
                    displayField: "RouteID",
                    searchFields: ["RouteID"],
                    outFields: ["*"],
                    name: "LRSID",
                    popupTemplate: routeTemplate
                }, {
                    featureLayer: parish,
                    outFields: ["*"],
                    popupTemplate: parishTemplate,
                    name: "Parish"
                }]
            });
    
            var searchButton = new Expand({
                expandIconClass: "esri-icon-search",
                expandTooltip: "Search for a LRSID",
                view: view,
                content: searchWidget,
                mode: "floating",
                group: "top-left"
            });

            view.ui.add([homeButton, layerExpand, searchButton], "top-left");

            //Create and add the draw line button
            view.ui.add("line-button", "top-left");
            view.when(function(event){
                var draw = new Draw({
                    view: view
                });
                //======================
                //Draw polyline button
                var drawLineButton = document.getElementById("line-button");
                drawLineButton.onclick = function(){
                    view.graphics.removeAll();
                    enableCreateLine(draw, view);
                }
            });
        }
    
        //==================================
        //Highlight the selected feature
        var highlighPolygon = new SimpleFillSymbol({
            color: [0,0,0,0],
            style: "solid",
            outline: {
                color: [0,255,255,1],
                width: "1.5px"
            }
        });
    
        var highlightLine = new SimpleLineSymbol({
            color: [0,255,255,1],
            width: 4
        });
    
        view.on("click", function(event){
            var clickPoint = {
                x: event.x,
                y: event.y
            };
            view.hitTest(clickPoint).then(updateGraphics);
        });
    
        function updateGraphics(response){
            view.graphics.removeAll();
            var resultGraphic = response
    
            if (resultGraphic.results.length > 0){
                var selectionGraphic = resultGraphic.results[0].graphic;
                if (selectionGraphic.geometry.type == "polygon"){
                    selectionGraphic.symbol = highlighPolygon;
                } else if (selectionGraphic.geometry.type == "polyline"){
                    selectionGraphic.symbol = highlightLine;
                };
                view.graphics.add(selectionGraphic);
            }
        }
    
        //Determine when to remove highligh graphics
        view.popup.watch("visible", function(visible){
            if (visible == false){
                view.graphics.removeAll();
            }
        });

        //=============================
        //Function to enable drawing graphics
        function enableCreateLine(draw, view){
            //Creates and returns an instance of PolylineDrawAction
            var action = draw.create("polyline",{
                mode: "click"
            });

            //Activates keyboard shortcuts for sketching
            view.focus();
            //Listen to vertex-add event on the polyline draw action
            action.on("vertex-add", updateVertices);
            // //Listen to vertex-remove event on the polyline draw action
            action.on("vertex-remove", updateVertices);
            // //Listen to cursor-update event on the polyline draw action
            action.on("cursor-update", createGraphic);
            //Listen to draw-complete event on the polyline draw
            action.on("draw-complete", addAttributes);
        }

        function updateVertices(event){
            //Create a polyline from returned vertices
            var result = createGraphic(event);
        }

        //Create a new graphic presenting the polyline that is being drawn
        function createGraphic(event){
            var vertices = event.vertices;
            view.graphics.removeAll();

            //Graphic representing the polyline
            graphic = new Graphic({
                geometry: new Polyline({
                    paths: vertices,
                    spatialReference: view.spatialReference
                }),
                symbol:{
                    type: "simple-line",
                    color: [4, 90, 141],
                    width: 4,
                    cap: "round",
                    join: "round"
                }
            });

            view.graphics.add(graphic);

        }

        //Add attributes to the graphic
        function addAttributes(event){
            var result = createGraphic(event)
            addFeature = graphic;
            attributes = [];
            getAttributes(addFeature, attributes);
            newProject = new Graphic({
                geometry: new Polyline({
                    path: addFeature.geometry.paths,
                    spatialReference: view.spatialReference
                }),
                attributes: attributes
            });
            console.log(newProject);

        }

        //Function to add the feature to the project layer
        // function addFeature(feature){
        //     routes.applyEdits({
        //         addFeatures: [feature]
        //     });
        // }

        //Click submit to add the new projects to the feature
        // on(dom.byId("submitbtn"), "click", function(){
        //     routes.applyEdits({
        //         addFeatures: [newProject]
        //     });
        // });

        //Add features to the project feature layer
        on(dom.byId("submitbtn"), "click", function(){
            projects.applyEdits({
                addFeatures: [newProject],
                updateFeatures: null,
                deleteFeatures: null
            });
        });

        //=======================================
        //Set up the REST calls to get the attributes
        function getAttributes(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];
            

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'geometry':{'x':" + x+",'y':" +y+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var locations = json.locations[0].results[0];
                var road = locations.routeId;
                var measure = locations.measure;
                attributes["ControlSection"] = road;
                attributes["BeginLogmile"] = measure;
                $("#controlsection").text(road);
                $("#beginLogmile").text(measure);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var locations = json.locations[0].results[0];
                var road = locations.routeId;
                var measure = locations.measure;
                attributes["EndLogmile"] = measure;
                $("#endLogmile").text(measure);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Boundaries/LA_Parishes/FeatureServer/0/query?where=&objectIds=&time=&geometry="+x+","+ y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var parishJSON = response.data;
                var parishLocations = parishJSON.features[0].attributes;
                var parishName = parishLocations.Name;
                var district = parishLocations.DOTD_Distr;
                attributes["Parish"] = parishName;
                attributes["DOTDDistrict"] = district;
                $("#parish").text(parishName);
                $("#district").text(district);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/LABoundaries/FeatureServer/3/query?where=&objectIds=&time=&geometry=" +x+","+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var cityJSON = response.data;
                var cityLocations = cityJSON.features[0].attributes;
                if (cityJSON.features.length == 0){
                    console.log("It finally worked!");
                    attribute["UrbanizedArea"] = "00003";
                    $("#cities").find("option[value='00003']").attr("selected",true);
                } else {
                    var cityCode = cityLocations.Metro_Area_Code;
                    attributes["UrbanizedArea"] = cityCode;
                    $("#cities").find("option[value='" +cityCode+"']").attr("selected",true);
                }
            });

            esriRequest("https://services.arcgis.com/PLiuXYMBpMK5h36e/arcgis/rest/services/ProjectSystems/FeatureServer/0/query?where=OBJECTID+IS+NOT+NULL&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnHiddenFields=false&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var obID = response.data;
                var id = obID.features[0].attributes.OBJECTID;
                attributes["OBJECTID"] = id + 1;
            });
        }

    });

    //========================================================================
    //jQuery functions when clicking buttons

    //Close the panel after user is done looking at the information
    $(".closebutton").on("click", function(e){
        $("#panel").hide("slide");
    });

    //Open the panel when the user clicks the button to add a project
    $(".edit").on("click", function(e){
        $("#panel").show("fast");
    });

    //Create a dialog box when click the info button
    //Create a jQuery UI dialog box
    var dialog = $("#dialog").dialog({
        autoOpen: false,
        height: 350,
        width: 250,
        modal: true,
        position:{
            my: "center center",
            at: "center center",
            of: "#wrapper"
        },
        buttons:{
            "Close": function(){
                dialog.dialog("close");
            }
        },
        close: function (){
            console.log("Dialog has successfully closed");
        }
    });
    //Click the about button to open the dialog
    $(".about").on("click", function(e){
        dialog.dialog("open");
    });

    
})
