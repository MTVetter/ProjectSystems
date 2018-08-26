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
        var controlSectionValue;
    
        //========================================
        //Create the map and add layers
    
        var map = new Map({
            basemap: "dark-gray-vector"
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
            zoom: 7
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

        var projectTemplate = {
            title: "Proposed Project",
            content:[{
                type: "fields",
                fieldInfos: [{
                    fieldName: "ControlSection",
                    visible: true
                },{
                    fieldName: "LRSID",
                    visible: true
                },{
                    fieldName: "BeginLogmile",
                    visible: true
                },{
                    fieldName: "EndLogmile",
                    visible: true
                },{
                    fieldName: "Parish",
                    visible: true
                },{
                    fieldName: "DOTDDistrict",
                    visible: true
                },{
                    fieldName: "UrbanizedArea",
                    visible: true
                }]
            }]
        };

        var oldProjectTemplate = {
            title: "Let Projects",
            content:[{
                type: "fields",
                fieldInfos: [{
                    fieldName: "PROJECT",
                    visible: true
                }, {
                    fieldName: "DISTRICT",
                    visible: true
                }, {
                    fieldName: "PARISH_NAME",
                    visible: true
                }, {
                    fieldName: "URBANIZED_AREA",
                    visible: true
                }, {
                    fieldName: "ROUTE",
                    visible: true
                }, {
                    fieldName: "House_District",
                    visible: true
                }, {
                    fieldName: "Senate_District",
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
            // popupTemplate: routeTemplate,
            title: "LRSID_Routes",
            definitionExpression: "RouteID LIKE '%-%-1-%' OR RouteID LIKE '%-%-2-%'"
        });

        //Add the editable projects layer
        var projects = new FeatureLayer({
            url: "https://services.arcgis.com/PLiuXYMBpMK5h36e/arcgis/rest/services/ProjectSystems/FeatureServer/0",
            outFields: ["*"],
            popupTemplate: projectTemplate,
            title: "Proposed Projects",
            capabilites: {
                "supportsAdd": true
            }
        });

        //Add the last 5 fiscal year projects
        var lastFiveProjects = new FeatureLayer({
            url: "https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/2019_Roadshow/FeatureServer/4",
            outFields: ["PROJECT", "DISTRICT", "PARISH_NAME", "URBANIZED_AREA", "ROUTE", "House_District", "Senate_District"],
            title: "Projects Started in July 2012-August 2017",
            popupTemplate: oldProjectTemplate
        });

        //Add last fiscal year's projects
        var lastYearProjects = new FeatureLayer({
            url: "https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/2019_Roadshow/FeatureServer/5",
            outFields: ["PROJECT", "DISTRICT", "PARISH_NAME", "URBANIZED_AREA", "ROUTE", "House_District", "Senate_District"],
            title: "Projects Started in September 2017-June 2018",
            popupTemplate: oldProjectTemplate
        });

        //Add next fiscal year's projects
        var nextYearProjects = new FeatureLayer({
            url: "https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/2019_Roadshow/FeatureServer/6",
            outFields: ["PROJECT", "DISTRICT", "PARISH_NAME", "URBANIZED_AREA", "ROUTE", "House_District", "Senate_District"],
            title: "Projects Started in Fiscal Year 2018-2019",
            popupTemplate: oldProjectTemplate
        });
    
        map.add(parish);
        map.add(routes);
        map.add(projects);
        map.add(lastFiveProjects);
        map.add(lastYearProjects);
        map.add(nextYearProjects);
    
        mapSetup();
    
        //====================================
        //Create buttons and widgets for the map
    
        function mapSetup(){
            //Layer list
            var layerList = new LayerList({
                view: view,
                listItemCreatedFunction: function(event){
                    const item = event.item;
                    item.panel = {
                        content: "legend",
                        open: true
                    };
                }
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
                popupOpenOnSelect: false,
                sources: [{
                    featureLayer: routes,
                    displayField: "RouteID",
                    searchFields: ["RouteID"],
                    outFields: ["*"],
                    name: "LRSID",
                    popupTemplate: routeTemplate,
                    zoomScale: 120000,
                    resultSymbol: {
                        type: "simple-line",
                        color: [255, 255, 25],
                        width: 5
                    }
                }, {
                    featureLayer: parish,
                    outFields: ["*"],
                    popupTemplate: parishTemplate,
                    name: "Parish",
                    zoomScale: 200000,
                    resultSymbol: {
                        type: "simple-line",
                        color: [255, 255, 25],
                        width: 5
                    }
                },{
                    featureLayer: lastFiveProjects,
                    displayField: "PROJECT",
                    searchFields: ["PROJECT"],
                    name: "Projects Let in July 2012-August 2017",
                    popupTemplate: oldProjectTemplate,
                    zoomScale: 80000,
                    resultSymbol: {
                        type: "simple-line",
                        color: [255, 255, 25],
                        width: 5
                    }
                },{
                    featureLayer: lastYearProjects,
                    displayField: "PROJECT",
                    searchFields: ["PROJECT"],
                    name: "Projects Let in September 2017-June 2018",
                    popupTemplate: oldProjectTemplate,
                    zoomScale: 80000,
                    resultSymbol: {
                        type: "simple-line",
                        color: [255, 255, 25],
                        width: 5
                    }
                }, {
                    featureLayer: nextYearProjects,
                    displayField: "PROJECT",
                    searchFields: ["PROJECT"],
                    name: "Projects Let in Fiscal Year 2018-2019",
                    popupTemplate: oldProjectTemplate,
                    zoomScale: 80000,
                    resultSymbol: {
                        type: "simple-line",
                        color: [255, 255, 25],
                        width: 5
                    }
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

            //Query Widget
            var query = document.getElementById("info-div");
            queryExpand = new Expand({
                expandIconClass: "esri-icon-filter",
                expandTooltip: "Filter Projects",
                expanded: false,
                view: view,
                content: query,
                mode: "floating",
                group: "top-left"
            });

            view.ui.add([homeButton, layerExpand, searchButton, queryExpand], "top-left");

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
                    $("#panel").show("slide");
                    view.graphics.removeAll();
                    enableCreateLine(draw, view);
                }
            });
        }

        //==================================
        //Change when filter is applied
        $("#filterBtn").click(function(){
            checkValues = getValues();
            districtFilterValue = $("#districtFilter").val();
            parishFilterValue = $("#parishFilter").val();
            senateFilterValue = $("#senateFilter").val();
            houseFilterValue = $("#houseFilter").val();
            if (checkValues[0] === "district"){
                lastFiveProjects.definitionExpression = "DISTRICT LIKE '" +districtFilterValue+ "'";
                lastYearProjects.definitionExpression = "DISTRICT LIKE '"+districtFilterValue+ "'";
                nextYearProjects.definitionExpression = "DISTRICT LIKE '" +districtFilterValue+ "'";
                projects.definitionExpression = "DOTDDistrict LIKE '" +districtFilterValue+ "'";
            } else if (checkValues[0] === "parish"){
                lastFiveProjects.definitionExpression = "PARISH LIKE '" +parishFilterValue+ "'";
                lastYearProjects.definitionExpression = "PARISH LIKE '" +parishFilterValue+ "'";
                nextYearProjects.definitionExpression = "PARISH LIKE '" +parishFilterValue+ "'";
                projects.definitionExpression = "Parish LIKE '" +parishFilterValue+ "'";
            } else if (checkValues[0] === "senateDistrict"){
                lastFiveProjects.definitionExpression = "Senate_District LIKE '" +senateFilterValue+ "'";
                lastYearProjects.definitionExpression = "Senate_District LIKE '" +senateFilterValue+ "'";
                nextYearProjects.definitionExpression = "Senate_District LIKE '" +senateFilterValue+ "'";
            } else if (checkValues[0] === "houseDistrict"){
                lastFiveProjects.definitionExpression = "House_District LIKE '" +houseFilterValue+ "'";
                lastYearProjects.definitionExpression = "House_District LIKE '" +houseFilterValue+ "'";
                nextYearProjects.definitionExpression = "House_District LIKE '" +houseFilterValue+ "'";
            }
            queryExpand.iconNumber = 1;
            lastFiveProjects.visible = true;
            lastYearProjects.visible = true;
            nextYearProjects.visible = true;
            queryExpand.collapse();
        });

        //Remove filter when clear button is clicked
        $("#clearFilterBtn").click(function(){
            lastFiveProjects.definitionExpression = "";
            lastYearProjects.definitionExpression = "";
            nextYearProjects.definitionExpression = "";
            projects.definitionExpression = "";
            queryExpand.iconNumber = 0;
            queryExpand.collapse();
            $("#parishFilter").val("");
            $("#senateFilter").val("");
            $("#houseFilter").val("");
        });

        //Determine which filter to apply
        function getValues(){
            var checkArray = [];
            $(".chk:checked").each(function (){
                checkArray.push($(this).val());
            });
            return checkArray;
        };

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
                    color: [0, 191, 255],
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

            //Check to see if the user entered a parish number
            var parishData = $(".parishNum").val();
            if (parishData){
                attributes["Parish"] = parishData;
            } else {
                getParish(addFeature, attributes);
            }

            //Check to see if the user entered a district
            var distData = $(".dotdDistrict").val();
            if (distData){
                attributes["DOTDDistrict"] = distData;
            } else {
                getDistrict(addFeature, attributes);
            }

            //Check to see if user entered a control section
            var controlData = $(".cs").val();
            if (controlData){
                attributes["ControlSection"] = controlData;
            } else {
                getControl(addFeature, attributes);
            }

            //Check to see if user entered a LRSID
            var lrsData = $(".lrsID").val();
            if (lrsData){
                attributes["LRSID"] = lrsData;
                getLogmiles(addFeature, attributes, lrsData);
            } else {
                getLRS(addFeature, attributes);
            }

            //Check to see if user entered a rural/urban code
            var ruralData = $("#rural").val();
            if (ruralData){
                attributes["UrbanRural"] = ruralData;
            } else {
                getRural(addFeature, attributes);
            }

            // //Check to see if user entered a fed aid value
            // var aidData = $(".fedAids").val();
            // if (aidData){
            //     attributes["FedAid"] = aidData;
            // } else {
            //     getAid(addFeature, attributes);
            // }

            //Check to see if user entered a functional class
            // var functData = $(".functClass").val();
            // if (functData){
            //     attributes["FunctionalSystem"] = functData;
            // } else {
            //     getFunctional(addFeature, attributes);
            // }

            //Check to see if user entered an urbanized area
            var urbanizedData = $("#cities").val();
            if (urbanizedData){
                attributes["UrbanizedArea"] = urbanizedData;
            } else {
                getUrbanized(addFeature, attributes);
            }
            // getAttributes(addFeature, attributes);
            newProject = new Graphic({
                geometry: new Polyline({
                    paths: addFeature.geometry.paths[0],
                    spatialReference: view.spatialReference
                }),
                attributes: attributes
            });
            console.log(JSON.stringify(newProject));
        }

        //Click submit to add the new projects to the feature
        var url = "https://services.arcgis.com/PLiuXYMBpMK5h36e/ArcGIS/rest/services/ProjectSystems/FeatureServer/0/applyEdits";

        $("#submitbtn").on("click", function(e){
            //Check to see if the user made any changes to the values
            checkChanges(newProject);

            $.post({
                url: url,
                data: {
                    f: "json",
                    adds: JSON.stringify(newProject)
                },
                dataType: "json",
                success: (success) =>{
                    console.log(success);
                    alert("Proposed Project has successfully posted to the database!");
                    view.graphics.removeAll();
                    projects.refresh();
                    clearFields();
                },
                error: (error) =>{
                    console.log(error);
                    alert("An error occurred please try again");
                }
            })
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
                var split = road.split("-");
                attributes["LRSID"] = road;
                attributes["BeginLogmile"] = measure;
                attributes["ControlSection"] = split[0] + "-" + split[1];
                $("#lrsid input:text").val(road);
                $("#beginLogmile input:text").val(measure);
                $("#controlsection input:text").val(split[0] + "-" + split[1]);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var locations = json.locations[0].results[0];
                var road = locations.routeId;
                var measure = locations.measure;
                attributes["EndLogmile"] = measure;
                $("#endLogmile input:text").val(measure);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Boundaries/LA_Parishes/FeatureServer/0/query?where=&objectIds=&time=&geometry="+x+","+ y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var parishJSON = response.data;
                var parishLocations = parishJSON.features[0].attributes;
                var parishName = parishLocations.Parish_Num;
                var district = parishLocations.DOTD_Distr;
                attributes["Parish"] = parishName;
                attributes["DOTDDistrict"] = district;
                $(".parishNum").val(parishName);
                $("#dotdDistrict input:text").val(district);
            });

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/LABoundaries/FeatureServer/3/query?where=&objectIds=&time=&geometry=" +x+","+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var cityJSON = response.data;
                var cityLocations = cityJSON.features[0].attributes;
                var cityCode = cityLocations.Metro_Area_Code;
                if (cityCode){
                    attributes["UrbanizedArea"] = cityCode;
                    $("#cities").find("option[value='" +cityCode+"']").attr("selected",true);
                    attributes["UrbanRural"] = "U";
                    $("#ruralUrban input:text").val("U");
                    
                } else {
                    console.log("It finally worked!");
                    attributes["UrbanizedArea"] = "00003";
                    $("#cities").find("option[value='00003']").attr("selected",true);
                    attributes["UrbanRural"] = "R";
                    $("#ruralUrban input:text").val("R");
                }
            });
            
            return attributes;
        }

        //Set up the REST call to get the parish values
        function getParish(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Boundaries/LA_Parishes/FeatureServer/0/query?where=&objectIds=&time=&geometry="+x+","+ y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var parishJSON = response.data;
                var parishLocations = parishJSON.features[0].attributes;
                var parishName = parishLocations.Parish_Num;
                var district = parishLocations.DOTD_Distr;
                attributes["Parish"] = parishName;
                $(".parishNum").val(parishName);
            });
            return attributes;
        }

        //Get the district number of the project
        function getDistrict(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the district the project is located in
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Boundaries/LA_Parishes/FeatureServer/0/query?where=&objectIds=&time=&geometry="+x+","+ y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var parishJSON = response.data;
                var parishLocations = parishJSON.features[0].attributes;
                var district = parishLocations.DOTD_Distr;
                attributes["DOTDDistrict"] = district;
                $("#dotdDistrict input:text").val(district);
            });
            return attributes;
        }

        //Get the control section of the project
        function getControl(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the control section of the project
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'geometry':{'x':" + x+",'y':" +y+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var locations = json.locations[0].results[0];
                var road = locations.routeId;
                if (road.length === 12){
                    var split = road.split("-");
                    attributes["ControlSection"] = split[0] + "-" + split[1];
                    $("#controlsection input:text").val(split[0] + "-" + split[1]);
                } 
            });
            return attributes;
        }

        //Get the district number of the project
        function getLRS(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the district the project is located in
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'geometry':{'x':" + x+",'y':" +y+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                console.log(json);
                if (json.locations[0].results.length > 1){
                    var firstLocation = json.locations[0].results[0];
                    var secondLocation = json.locations[0].results[1];
                    var string = JSON.stringify(firstLocation, ["routeId"]);
                    var string2 = JSON.stringify(secondLocation, ["routeId"]);
                    console.log(string);
                    var confirmLoc = confirm("Click OK to use " +string+ ".\nOtherwise click Cancel to use " +string2+".\nNote: For non-divided roadways "+
                    "you more than likely want an LRSID like 000-00-1-000 or 000000000000001000");
                    if (confirmLoc == true){
                        var road = firstLocation.routeId;
                        attributes["LRSID"] = road;
                        $("#lrsid input:text").val(road);

                        if (road.length > 12){
                            $(".local").css("display", "table-cell");
                            $(".localValue").css("display", "table-cell");
                            $(".functClass").css("display", "table-cell");

                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                var beginLocation = json.locations[0].results[0];
                                var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                                var endLocation = json.locations[1].results[0];
                                var endMeasure = Math.round(endLocation.measure * 1000)/1000;

                                //Check to see if the measure from the first point is bigger than second measure
                                if (beginMeasure > endMeasure){
                                    //If first measure is greater then put it as end logmile
                                    attributes["BeginLogmile"] = endMeasure;
                                    $("#beginLogmile input:text").val(endMeasure);
                                    attributes["EndLogmile"] = beginMeasure;
                                    $("#endLogmile input:text").val(beginMeasure);
                                } else {
                                    //If first measure isn't greater then leave it alone
                                    attributes["BeginLogmile"] = beginMeasure;
                                    $("#beginLogmile input:text").val(beginMeasure);
                                    attributes["EndLogmile"] = endMeasure;
                                    $("#endLogmile input:text").val(endMeasure);
                                }

                                translate(road, beginMeasure, x, y, attributes);
                            });

                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/2/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                console.log(json);
                                if (json.features.length == 0){
                                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/3/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                        responseType: "json"
                                    }).then(function(response){
                                        var response = response.data;
                                        console.log(response);
                                        if (response.features.length == 0){
                                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/4/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                responseType: "json"
                                            }).then(function(response){
                                                var majorCollectorResponse = response.data;
                                                console.log(majorCollectorResponse);
                                                if (majorCollectorResponse.features.length == 0){
                                                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/5/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                        responseType: "json"
                                                    }).then(function(response){
                                                        var minorCollectorResponse = response.data;
                                                        console.log(minorCollectorResponse);
                                                        if (minorCollectorResponse.features.length == 0){
                                                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/6/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                                responseType: "json"
                                                            }).then(function(response){
                                                                var localResponse = response.data;
                                                                console.log(localResponse);
                                                                if (localResponse.features.length == 0){
                                                                    attributes["FunctionalSystem"] = "N";
                                                                    $("#functClass").find("option[value='N']").attr("selected", true);
                                                                } else {
                                                                    var fedaid6 = localResponse.features[0].attributes.FunctionalSystem;
                                                                    attributes["FunctionalSystem"] = "L";
                                                                    $("#functClass").find("option[value='L']").attr("selected", true);
                                                                }
                                                            });
                                                        } else {
                                                            var fedaid5 = minorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                            attributes["FunctionalSystem"] = "R";
                                                            $("#functClass").find("option[value='R']").attr("selected", true);
                                                        }
                                                    });
                                                } else {
                                                    var fedaid4 = majorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                    attributes["FunctionalSystem"] = "C";
                                                    $("#functClass").find("option[value='C']").attr("selected", true);
                                                }
                                            });
                                        } else {
                                            var fedaid3 = response.features[0].attributes.FunctionalSystem;
                                            attributes["FunctionalSystem"] = "C";
                                            $("#functClass").find("option[value='M']").attr("selected", true);
                                        }
                                    });
                                } else {
                                    var fedaid2 = json.features[0].attributes.FunctionalSystem;
                                    attributes["FunctionalSystem"] = "P";
                                    $("#functClass").find("option[value='P']").attr("selected", true);
                                }
                            });
                        } else {
                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                var beginLocation = json.locations[0].results[0];
                                var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                                var endLocation = json.locations[1].results[0];
                                var endMeasure = Math.round(endLocation.measure * 1000)/1000;

                                //Check to see if the measure from the first point is bigger than second measure
                                if (beginMeasure > endMeasure){
                                    //If first measure is greater then put it as end logmile
                                    attributes["BeginLogmile"] = endMeasure;
                                    $("#beginLogmile input:text").val(endMeasure);
                                    attributes["EndLogmile"] = beginMeasure;
                                    $("#endLogmile input:text").val(beginMeasure);
                                } else {
                                    //If first measure isn't greater then leave it alone
                                    attributes["BeginLogmile"] = beginMeasure;
                                    $("#beginLogmile input:text").val(beginMeasure);
                                    attributes["EndLogmile"] = endMeasure;
                                    $("#endLogmile input:text").val(endMeasure);
                                }
                            });
                        }

                        
                    } else {
                        var road = secondLocation.routeId;
                        attributes["LRSID"] = road;
                        $("#lrsid input:text").val(road);
    
                        if (road.length > 12){
                            $(".local").css("display", "table-cell");
                            $(".localValue").css("display", "table-cell");
                            $(".functClass").css("display", "table-cell");

                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                var beginLocation = json.locations[0].results[0];
                                var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                                var endLocation = json.locations[1].results[0];
                                var endMeasure = Math.round(endLocation.measure * 1000)/1000;
        
                                //Check to see if the measure from the first point is bigger than second measure
                                if (beginMeasure > endMeasure){
                                    //If first measure is greater then put it as end logmile
                                    attributes["BeginLogmile"] = endMeasure;
                                    $("#beginLogmile input:text").val(endMeasure);
                                    attributes["EndLogmile"] = beginMeasure;
                                    $("#endLogmile input:text").val(beginMeasure);
                                } else {
                                    //If first measure isn't greater then leave it alone
                                    attributes["BeginLogmile"] = beginMeasure;
                                    $("#beginLogmile input:text").val(beginMeasure);
                                    attributes["EndLogmile"] = endMeasure;
                                    $("#endLogmile input:text").val(endMeasure);
                                }

                                translate(road, beginMeasure, x, y, attributes);
                            });
                            
                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/2/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                console.log(json);
                                if (json.features.length == 0){
                                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/3/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                        responseType: "json"
                                    }).then(function(response){
                                        var response = response.data;
                                        console.log(response);
                                        if (response.features.length == 0){
                                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/4/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                responseType: "json"
                                            }).then(function(response){
                                                var majorCollectorResponse = response.data;
                                                console.log(majorCollectorResponse);
                                                if (majorCollectorResponse.features.length == 0){
                                                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/5/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                        responseType: "json"
                                                    }).then(function(response){
                                                        var minorCollectorResponse = response.data;
                                                        console.log(minorCollectorResponse);
                                                        if (minorCollectorResponse.features.length == 0){
                                                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/6/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                                responseType: "json"
                                                            }).then(function(response){
                                                                var localResponse = response.data;
                                                                console.log(localResponse);
                                                                if (localResponse.features.length == 0){
                                                                    attributes["FunctionalSystem"] = "N";
                                                                    $("#functClass").find("option[value='N']").attr("selected", true);
                                                                } else {
                                                                    var fedaid6 = localResponse.features[0].attributes.FunctionalSystem;
                                                                    attributes["FunctionalSystem"] = "L";
                                                                    $("#functClass").find("option[value='L']").attr("selected", true);
                                                                }
                                                            });
                                                        } else {
                                                            var fedaid5 = minorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                            attributes["FunctionalSystem"] = "R";
                                                            $("#functClass").find("option[value='R']").attr("selected", true);
                                                        }
                                                    });
                                                } else {
                                                    var fedaid4 = majorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                    attributes["FunctionalSystem"] = "C";
                                                    $("#functClass").find("option[value='C']").attr("selected", true);
                                                }
                                            });
                                        } else {
                                            var fedaid3 = response.features[0].attributes.FunctionalSystem;
                                            attributes["FunctionalSystem"] = "M";
                                            $("#functClass").find("option[value='M']").attr("selected", true);
                                        }
                                    });
                                } else {
                                    var fedaid2 = json.features[0].attributes.FunctionalSystem;
                                    attributes["FunctionalSystem"] = "P";
                                    $("#functClass").find("option[value='P']").attr("selected", true);
                                }
                            });
                        } else {
                            var locations = json.locations[0].results[0];
                            var road = locations.routeId;
                            attributes["LRSID"] = road;
                            $("#lrsid input:text").val(road);

                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                                responseType: "json"
                            }).then(function(response){
                                var json = response.data;
                                var beginLocation = json.locations[0].results[0];
                                var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                                var endLocation = json.locations[1].results[0];
                                var endMeasure = Math.round(endLocation.measure * 1000)/1000;

                                //Check to see if the measure from the first point is bigger than second measure
                                if (beginMeasure > endMeasure){
                                    //If first measure is greater then put it as end logmile
                                    attributes["BeginLogmile"] = endMeasure;
                                    $("#beginLogmile input:text").val(endMeasure);
                                    attributes["EndLogmile"] = beginMeasure;
                                    $("#endLogmile input:text").val(beginMeasure);
                                } else {
                                    //If first measure isn't greater then leave it alone
                                    attributes["BeginLogmile"] = beginMeasure;
                                    $("#beginLogmile input:text").val(beginMeasure);
                                    attributes["EndLogmile"] = endMeasure;
                                    $("#endLogmile input:text").val(endMeasure);
                                }
                            });
                        }
                    }
                } else {
                    var road = json.locations[0].results[0].routeId;
                    attributes["LRSID"] = road;
                    $("#lrsid input:text").val(road);
                    if (road.length > 12){
                        $(".local").css("display", "table-cell");
                        $(".localValue").css("display", "table-cell");
                        $(".functClass").css("display", "table-cell");

                        esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                            responseType: "json"
                        }).then(function(response){
                            var json = response.data;
                            var beginLocation = json.locations[0].results[0];
                            var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                            var endLocation = json.locations[1].results[0];
                            var endMeasure = Math.round(endLocation.measure * 1000)/1000;

                            //Check to see if the measure from the first point is bigger than second measure
                            if (beginMeasure > endMeasure){
                                //If first measure is greater then put it as end logmile
                                attributes["BeginLogmile"] = endMeasure;
                                $("#beginLogmile input:text").val(endMeasure);
                                attributes["EndLogmile"] = beginMeasure;
                                $("#endLogmile input:text").val(beginMeasure);
                            } else {
                                //If first measure isn't greater then leave it alone
                                attributes["BeginLogmile"] = beginMeasure;
                                $("#beginLogmile input:text").val(beginMeasure);
                                attributes["EndLogmile"] = endMeasure;
                                $("#endLogmile input:text").val(endMeasure);
                            }

                            translate(road, beginMeasure, x, y, attributes);
                        });

                        esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/2/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                            responseType: "json"
                        }).then(function(response){
                            var json = response.data;
                            console.log(json);
                            if (json.features.length == 0){
                                esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/3/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                    responseType: "json"
                                }).then(function(response){
                                    var response = response.data;
                                    console.log(response);
                                    if (response.features.length == 0){
                                        esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/4/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                            responseType: "json"
                                        }).then(function(response){
                                            var majorCollectorResponse = response.data;
                                            console.log(majorCollectorResponse);
                                            if (majorCollectorResponse.features.length == 0){
                                                esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/5/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                    responseType: "json"
                                                }).then(function(response){
                                                    var minorCollectorResponse = response.data;
                                                    console.log(minorCollectorResponse);
                                                    if (minorCollectorResponse.features.length == 0){
                                                        esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/6/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                            responseType: "json"
                                                        }).then(function(response){
                                                            var localResponse = response.data;
                                                            console.log(localResponse);
                                                            if (localResponse.features.length == 0){
                                                                attributes["FunctionalSystem"] = "N";
                                                                $("#functClass").find("option[value='N']").attr("selected", true);
                                                            } else {
                                                                var fedaid6 = localResponse.features[0].attributes.FunctionalSystem;
                                                                attributes["FunctionalSystem"] = "L";
                                                                $("#functClass").find("option[value='L']").attr("selected", true);
                                                            }
                                                        });
                                                    } else {
                                                        var fedaid5 = minorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                        attributes["FunctionalSystem"] = "R";
                                                        $("#functClass").find("option[value='R']").attr("selected", true);
                                                    }
                                                });
                                            } else {
                                                var fedaid4 = majorCollectorResponse.features[0].attributes.FunctionalSystem;
                                                attributes["FunctionalSystem"] = "C";
                                                $("#functClass").find("option[value='C']").attr("selected", true);
                                            }
                                        });
                                    } else {
                                        var fedaid3 = response.features[0].attributes.FunctionalSystem;
                                        attributes["FunctionalSystem"] = "C";
                                        $("#functClass").find("option[value='M']").attr("selected", true);
                                    }
                                });
                            } else {
                                var fedaid2 = json.features[0].attributes.FunctionalSystem;
                                attributes["FunctionalSystem"] = "P";
                                $("#functClass").find("option[value='P']").attr("selected", true);
                            }
                        });
                    } else {
                        esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +road+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +road+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                            responseType: "json"
                        }).then(function(response){
                            var json = response.data;
                            var beginLocation = json.locations[0].results[0];
                            var beginMeasure = Math.round(beginLocation.measure * 1000)/1000;
                            var endLocation = json.locations[1].results[0];
                            var endMeasure = Math.round(endLocation.measure * 1000)/1000;

                            //Check to see if the measure from the first point is bigger than second measure
                            if (beginMeasure > endMeasure){
                                //If first measure is greater then put it as end logmile
                                attributes["BeginLogmile"] = endMeasure;
                                $("#beginLogmile input:text").val(endMeasure);
                                attributes["EndLogmile"] = beginMeasure;
                                $("#endLogmile input:text").val(beginMeasure);
                            } else {
                                //If first measure isn't greater then leave it alone
                                attributes["BeginLogmile"] = beginMeasure;
                                $("#beginLogmile input:text").val(beginMeasure);
                                attributes["EndLogmile"] = endMeasure;
                                $("#endLogmile input:text").val(endMeasure);
                            }
                        });
                    }
                }
            });
            return attributes;
        }

        //Get the beginning and ending logmile
        function getLogmiles(path, attributes, data){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/geometryToMeasure?f=json&locations=[{'routeId':'" +data+ "','geometry':{'x':" + x+",'y':" +y+ "}},{'routeId':'" +data+ "','geometry':{'x':" + x2+",'y':" +y2+ "}}]&tolerance=10&inSR=102100", {
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var beginLocation = json.locations[0].results[0];
                var beginMeasure = beginLocation.measure;
                var endLocation = json.locations[1].results[0];
                var endMeasure = endLocation.measure;

                //Check to see if the measure from the first point is bigger than second measure
                if (beginMeasure > endMeasure){
                    //If first measure is greater then put it as end logmile
                    attributes["BeginLogmile"] = endMeasure;
                    $("#beginLogmile input:text").val(endMeasure);
                    attributes["EndLogmile"] = beginMeasure;
                    $("#endLogmile input:text").val(beginMeasure);
                } else {
                    //If first measure isn't greater then leave it alone
                    attributes["BeginLogmile"] = beginMeasure;
                    $("#beginLogmile input:text").val(beginMeasure);
                    attributes["EndLogmile"] = endMeasure;
                    $("#endLogmile input:text").val(endMeasure);
                }
            });
            return attributes;
        }

        //Get the value of the Rural/Urban field
        function getRural(path, attributes){
            //Determine if the user entered rural for urbanized area
            var rural = $("#cities").val();
            if (rural == "00003"){
                $("#ruralUrban input:text").val("R");
            }
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the district the project is located in
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/LABoundaries/FeatureServer/3/query?where=&objectIds=&time=&geometry=" +x+","+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var cityJSON = response.data;
                var cityLocations = cityJSON.features[0].attributes;
                var cityCode = cityLocations.Metro_Area_Code;
                if (cityCode){
                    attributes["UrbanRural"] = "U";
                    $("#rural").find("option[value='U']").attr("selected", true);
                    
                } else {
                    attributes["UrbanRural"] = "R";
                    $("#rural").find("option [value='R']").attr("selected", true);
                }
            });
            return attributes;
        }

        //Get the district number of the project
        function getAid(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the district the project is located in
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/Roads_and_Highways/FeatureServer/14/query?where=&objectIds=&time=&geometry={["+x+","+y+"]}&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                console.log(json);
                if (json.features.length > 1){
                    alert(json.features.length);
                }
            });
            return attributes;
        }

        //Get the district number of the project
        function getUrbanized(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the district the project is located in
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Static_Data/LABoundaries/FeatureServer/3/query?where=&objectIds=&time=&geometry=" +x+","+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var cityJSON = response.data;
                console.log(cityJSON);
                if (cityJSON.features.length == 0){
                    attributes["UrbanizedArea"] = "00003";
                    attributes["UrbanRural"] = "R";
                    $("#cities").val("00003");
                    $("#rural").val("R");
                } else {
                    var cityLocations = cityJSON.features[0].attributes;
                    var cityCode = cityLocations.Metro_Area_Code;
                    attributes["UrbanizedArea"] = cityCode;
                    attributes["UrbanRural"] = "U";
                    $("#cities").val(cityCode);
                    $("#rural").val("U");
                }
            });
            return attributes;
        }

        //Get the district number of the project
        function getFunctional(path, attributes){
            //Determine the number of clicks the user did
            var num = path.geometry.paths[0].length -1;

            //Get the coordinates of the first click
            var x = path.geometry.paths[0][0][0];
            var y = path.geometry.paths[0][0][1];
            //Get the coordinates of the last click
            var x2 = path.geometry.paths[0][num][0];
            var y2 = path.geometry.paths[0][num][1];

            //Determine the functional system the project is located on
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/2/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                console.log(json);
                if (json.features.length == 0){
                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/3/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                        responseType: "json"
                    }).then(function(response){
                        var response = response.data;
                        console.log(response);
                        if (response.features.length == 0){
                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/4/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                responseType: "json"
                            }).then(function(response){
                                var majorCollectorResponse = response.data;
                                console.log(majorCollectorResponse);
                                if (majorCollectorResponse.features.length == 0){
                                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/5/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                        responseType: "json"
                                    }).then(function(response){
                                        var minorCollectorResponse = response.data;
                                        console.log(minorCollectorResponse);
                                        if (minorCollectorResponse.features.length == 0){
                                            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/LA_RoadwayFunctionalClassification/FeatureServer/6/query?where=&objectIds=&time=&geometry={'paths':[[["+x+","+y+"],["+x2+","+y2+"]]]}&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                                                responseType: "json"
                                            }).then(function(response){
                                                var localResponse = response.data;
                                                console.log(localResponse);
                                                if (localResponse.features.length == 0){
                                                    attributes["FunctionalSystem"] = "N";
                                                    $("#functClass").find("option[value='N']").attr("selected", true);
                                                } else {
                                                    var fedaid6 = localResponse.features[0].attributes.FunctionalSystem;
                                                    attributes["FunctionalSystem"] = "L";
                                                    $("#functClass").find("option[value='L']").attr("selected", true);
                                                }
                                            });
                                        } else {
                                            var fedaid5 = minorCollectorResponse.features[0].attributes.FunctionalSystem;
                                            attributes["FunctionalSystem"] = "R";
                                            $("#functClass").find("option[value='R']").attr("selected", true);
                                        }
                                    });
                                } else {
                                    var fedaid4 = majorCollectorResponse.features[0].attributes.FunctionalSystem;
                                    attributes["FunctionalSystem"] = "C";
                                    $("#functClass").find("option[value='C']").attr("selected", true);
                                }
                            });
                        } else {
                            var fedaid3 = response.features[0].attributes.FunctionalSystem;
                            attributes["FunctionalSystem"] = "C";
                            $("#functClass").find("option[value='M']").attr("selected", true);
                        }
                    });
                } else {
                    var fedaid2 = json.features[0].attributes.FunctionalSystem;
                    attributes["FunctionalSystem"] = "P";
                    $("#functClass").find("option[value='P']").attr("selected", true);
                }
            });
            return attributes;
        }

        //Function to get the translated RouteID
        function translate(routeid, measure, x, y, attributes){
            esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/State_LRS_Route_Networks/MapServer/exts/LRSServer/networkLayers/0/translate?f=json&locations=[{'routeId':'"+routeid+"','measure':'"+measure+"'}]&targetNetworkLayerIds=1",{
                responseType: "json"
            }).then(function(response){
                var json = response.data;
                var location = json.locations["0"].translatedLocations["0"].routeId;
                var n = location.substr(location.length - 5);
                var slice = n.slice(0,1);
                if (slice != 1){
                    var location2 = json.locations["0"].translatedLocations["1"].routeId;
                    console.log(location2);
                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/Roads_and_Highways/FeatureServer/14/query?where=RouteId+%3D+%27"+location2+"%27&objectIds=&time=&geometry='x':"+x+",'y':"+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=RouteId%2C+FederalFundingStatus&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                        responseType: "json"
                    }).then(function(response){
                        var fedAidResponse2 = response.data;
                        var fundingStatus2 = fedAidResponse2.features["0"].attributes.FederalFundingStatus;
                        if (fundingStatus2 == "1"){
                            attributes["FedAid"] = "I";
                            $("#fedAids").val("I");
                        } else if (fundingStatus2 == "2" || fundingStatus2 == "4" || fundingStatus2 == "5"){
                            attributes["FedAid"] = "Z";
                            $("#fedAids").val("Z");
                        } else if (fundingStatus2 == "3"){
                            attributes["FedAid"] = "O";
                            $("#fedAids").val("O");
                        }
                    });
                } else {
                    esriRequest("https://giswebnew.dotd.la.gov/arcgis/rest/services/Transportation/Roads_and_Highways/FeatureServer/14/query?where=RouteId+%3D+%27"+location+"%27&objectIds=&time=&geometry='x':"+x+",'y':"+y+"&geometryType=esriGeometryPoint&inSR=102100&spatialRel=esriSpatialRelIntersects&distance=10&units=esriSRUnit_Foot&relationParam=&outFields=RouteId%2C+FederalFundingStatus&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&gdbVersion=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=&resultOffset=&resultRecordCount=&f=pjson",{
                        responseType: "json"
                    }).then(function(response){
                        var fedAidResponse = response.data;
                        var fundingStatus = fedAidResponse.features["0"].attributes.FederalFundingStatus;
                        if (fundingStatus == "1"){
                            attributes["FedAid"] = "I";
                            $("#fedAids").val("I");
                        } else if (fundingStatus == "2" || fundingStatus == "4" || fundingStatus == "5"){
                            attributes["FedAid"] = "Z";
                            $("#fedAids").val("Z");
                        } else if (fundingStatus == "3"){
                            attributes["FedAid"] = "O";
                            $("#fedAids").val("O");
                        }
                    })
                }
            });
            return attributes;
        }

        //===================================================================
        //Function to check the change if any that the user made
        function checkChanges(project){
            var districtVal = project.attributes["DOTDDistrict"];
            var parishVal = project.attributes["Parish"];
            var controlSectionVal = project.attributes["ControlSection"];
            var lrsVal = project.attributes["LRSID"];
            var bLogmileVal = project.attributes["BeginLogmile"];
            var eLogmileVal = project.attributes["EndLogmile"];

            if (!(parishVal === $(".parishNum").val())){
                project.attributes["Parish"] = $(".parishNum").val();
            }

            if (!(districtVal === $(".dotdDistrict").val())){
                project.attributes["DOTDDistrict"] = $(".dotdDistrict").val();
            }

            if (!(controlSectionVal === $(".cs").val())){
                project.attributes["ControlSection"] = $(".cs").val();
            }

            if (!(lrsVal === $(".lrsID").val())){
                project.attributes["LRSID"] = $(".lrsID").val();
            }

            if (!(bLogmileVal === $(".bL").val())){
                project.attributes["BeginLogmile"] = $(".bL").val();
            }

            if (!(eLogmileVal === $(".eL").val())){
                project.attributes["EndLogmile"] = $(".eL").val();
            }
        }

        //Function to clear the fields
        function clearFields(){
            $(".dotdDistrict").val("");
            $(".parishNum").val("");
            $(".cs").val("");
            $(".lrsID").val("");
            $(".bL").val("");
            $(".eL").val("");
            $("#fedAids").val("");
            $("#functClass").val("");
            $("#cities").val("");
            $("#rural").val("");
            $(".local").css("display", "none");
            $(".localValue").css("display", "none");
        }

        //Clear the input boxes/select
        $("#clearbtn").on("click", function(){
            clearFields();
            view.graphics.removeAll();
        });

    });

    //========================================================================
    //jQuery functions when clicking buttons

    //Close the panel after user is done looking at the information
    $("#closebutton").on("click", function(e){
        $("#panel").hide("slide");
    });

    //Create a dialog box when click the info button
    //Create a jQuery UI dialog box
    var dialog = $("#dialog").dialog({
        autoOpen: false,
        height: 500,
        width: 450,
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

    //Hide the select options
    $("#districtFilter").hide();
    $("#senateFilter").hide();
    $("#parishFilter").hide();
    $("#houseFilter").hide();

    //Show dropdown list based on checked box
    $("#district").click(function(){
        if ($(this).is(":checked")){
            $("#districtFilter").show();
            $("#senateFilter").hide();
            $("#parishFilter").hide();
            $("#houseFilter").hide();
        }
    });

    $("#senateDistrict").click(function(){
        if ($(this).is(":checked")){
            $("#districtFilter").hide();
            $("#senateFilter").show();
            $("#parishFilter").hide();
            $("#houseFilter").hide();
        }
    });

    $("#parish").click(function(){
        if ($(this).is(":checked")){
            $("#districtFilter").hide();
            $("#senateFilter").hide();
            $("#parishFilter").show();
            $("#houseFilter").hide();
        }
    });

    $("#houseDistrict").click(function(){
        if ($(this).is(":checked")){
            $("#districtFilter").hide();
            $("#senateFilter").hide();
            $("#parishFilter").hide();
            $("#houseFilter").show();
        }
    });

    //Check to see if user entered a local LRSID
    $(".lrsID").on("change", function(){
        var idValue = $(".lrsID").val();
        if (idValue.length > 12){
            $(".local").css("display", "table-cell");
            $(".localValue").css("display", "table-cell");
            $(".functClass").css("display", "table-cell");
        }
    });

    //Create a dialog box when click the help button
    //Create a jQuery UI dialog box
    var helpDialog = $("#helpDialog").dialog({
        autoOpen: false,
        height: window.innerHeight - 100,
        width: window.innerWidth - 400,
        modal: true,
        position:{
            my: "center center",
            at: "center center",
            of: "#wrapper"
        },
        buttons:{
            "Close": function(){
                helpDialog.dialog("close");
            }
        },
        close: function (){
            console.log("Dialog has successfully closed");
        }
    });
    
    //Click the about button to open the dialog
    $("#helpbtn").on("click", function(e){
        helpDialog.dialog("open");
    });

    //Click the help button
    $(".title").on("click", function(e){
        helpDialog.dialog("open");
    });

    
})
