var mapData = new Array();
var playerData = new Object();
playerData.pName = "NoName";
playerData.server = 0;
playerData.map = 0;
playerData.pos = new Array();
playerData.pRot = 0;
playerData.cRot = 0;

var hasBeenLinked = false;
var mapInitialized = false;
var jsonFails = 0;
var currentMap = 0;
var currentServer = 0;
//var gameToMapRatio = 1.65; 
var gameToMapRatio = 39.37
var mapOffset = new Array();

var linkVersion = "1.1"
var linkOutdated = false;
var optionsOpen = true;
var optCenterMap = true;
var optShowWaypoint = true;
var optShowPOI = true;
var optShowVista = true;
var optShowSkill = true;
var optShowTask = true;
var optBroadcast = false;
var optBroadcastGroup = "None";
var optGW2LinkIP = "127.0.0.1";
//var gw2LinkIP = "192.168.1.115";
//var gw2LinkIP = "24.22.243.30";

var map = null;
var playerMarker = null;

var playerIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/marker-icon.png',
        iconSize:     [58, 25],
        iconAnchor:   [29, 12]
    }
});

var waypointIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-waypoint.png',
        iconSize:     [32, 32],
        iconAnchor:   [16, 16]
    }
});

var poiIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-poi.png',
        iconSize:     [18, 18],
        iconAnchor:   [9, 9]
    }
});

var vistaIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-vista.png',
        iconSize:     [32, 32],
        iconAnchor:   [16, 16]
    }
});

var skillIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-skill.png',
        iconSize:     [32, 32],
        iconAnchor:   [16, 16]
    }
});

var taskIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-task.png',
        iconSize:     [32, 32],
        iconAnchor:   [16, 16]
    }
});

// Create the leaflet map
function initMap() {
    "use strict";
    
    var southWest, northEast;
    
    map = L.map("map-container", {
        minZoom: 0,
        maxZoom: 7,
        crs: L.CRS.Simple
    }).setView([0, 0], 0);
    
    southWest = unproject([0, 32768]);
    northEast = unproject([32768, 0]);
    
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.tileLayer("https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg", {
        minZoom: 0,
        maxZoom: 7,
        continuousWorld: true
    }).addTo(map);

    map.on("click", onMapClick);

    $.getJSON("https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1", function (data) {
        var region, gameMap, i, il, poi;
        
        for (region in data.regions) {
            region = data.regions[region];
            
            for (gameMap in region.maps) {
                var mapNum = gameMap;
                gameMap = region.maps[gameMap];

                //console.log(gameMap.name);

                mapData[mapNum] = new Object();
                mapData[mapNum].mData = gameMap;
                //jQuery.extend(true, mapData[mapNum].mData, gameMap);
                mapData[mapNum].mLeft = gameMap.map_rect[0][0];
                mapData[mapNum].mTop = gameMap.map_rect[0][1];
                mapData[mapNum].mWidth = gameMap.map_rect[1][0] - gameMap.map_rect[0][0];
                mapData[mapNum].mHeight = gameMap.map_rect[1][1] - gameMap.map_rect[0][1];
                mapData[mapNum].cLeft = gameMap.continent_rect[0][0];
                mapData[mapNum].cTop = gameMap.continent_rect[0][1];
                mapData[mapNum].cWidth = gameMap.continent_rect[1][0] - gameMap.continent_rect[0][0];
                mapData[mapNum].cHeight = gameMap.continent_rect[1][1] - gameMap.continent_rect[0][1];


                //mapData[mapNum].mOffset = new Array();
                //mapData[mapNum].mOffset[0] = ((gameMap.continent_rect[1][0] - gameMap.continent_rect[0][0]) * 0.5) + gameMap.continent_rect[0][0];
                //mapData[mapNum].mOffset[1] = ((gameMap.continent_rect[1][1] - gameMap.continent_rect[0][1]) * 0.5) + gameMap.continent_rect[0][1];
                
                //for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
                //    poi = gameMap.points_of_interest[i];
                    
                //    if (poi.type != "waypoint") {
                //        continue;
                //    }

                    //L.marker(unproject(poi.coord), {
                    //    title: poi.name
                    //}).addTo(map);
                //}
            }
        }
        mapInitialized = true;
        console.log("Map initialized");
    });
}

function waitForMapData() {
    var startTime = new Date();
    var curTime = null;
    do {
        if(mapInitialized)
            break;
        curTime = new Date();
    }
    while(curTime - startTime < 10000);

    if(!mapInitialized)
        console.log("Failed to get map data after 10 seconds");
}

// Start checking for GW2Link every .25 seconds, once the page has finished loading
$( document ).ready(function() {
    initMap();
    //waitForMapData();
    updateGW2Link();
    setInterval(updateGW2Link, 250);
    setInterval(checkOptions, 500);
});


// Get an array of the player's x/y position
function getPlayerPos() {
    if(map == null || mapData[currentMap] == null)
        return;
    
    playerPos = new Array();
    mapPct = new Array();

    if(mapData[currentMap].mWidth == 0 || mapData[currentMap].mHeight == 0 || mapData[currentMap].cWidth == 0 || mapData[currentMap].cHeight == 0) {
        console.log("Bad map data: " + currentMap.toString());
        return;
    }

    mapPct[0] = ((playerData.pos[0] * gameToMapRatio) - mapData[currentMap].mLeft) / mapData[currentMap].mWidth;
    mapPct[1] = ((playerData.pos[2] * gameToMapRatio) - mapData[currentMap].mTop) / mapData[currentMap].mHeight;

    playerPos[0] = mapData[currentMap].cLeft + (mapData[currentMap].cWidth * mapPct[0])
    playerPos[1] = (mapData[currentMap].cTop + mapData[currentMap].cHeight) - (mapData[currentMap].cHeight * mapPct[1])

    return playerPos;
}

function getMapCenter() {
    mapCenter = new Array();

    mapCenter[0] = -mapData[currentMap].mLeft / mapData[currentMap].mWidth;
    mapCenter[1] = -mapData[currentMap].mTop / mapData[currentMap].mHeight;

    mapCenter[0] = mapData[currentMap].cLeft + (mapData[currentMap].cWidth * mapCenter[0])
    mapCenter[0] = mapData[currentMap].cTop + (mapData[currentMap].cHeight * mapCenter[1])

    return mapCenter;
}


function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
}

// Update the player marker's location and rotation
function updatePlayer() {
    if(map == null || !mapData[currentMap])
        return;

    playerPos = getPlayerPos()

    if(playerMarker == null) {
        playerMarker = L.marker(unproject([playerPos[0], playerPos[1]]), { icon: new playerIcon(), title: playerData.pName });
        playerMarker.addTo(map);
    }
    playerMarker.setLatLng(unproject([playerPos[0], playerPos[1]]));
    playerMarker._icon.style[L.DomUtil.TRANSFORM] += ' rotate(-' + playerData.cRot + 'deg)';

    if(optCenterMap)
        map.panTo(unproject([playerPos[0], playerPos[1]]));
}


function removeMarkers(mapNum, markerType) {
    if(map == null || mapData[mapNum] == null)
        return;

    var marker;
    if(markerType == "waypoint" || markerType == "all") {
        for (marker in mapData[currentMap].mWaypoints) {
            map.removeLayer(mapData[currentMap].mWaypoints[marker]);
        }
        mapData[currentMap].mWaypoints = null;
    }
    if(markerType == "vista" || markerType == "all") {
        for (marker in mapData[currentMap].mVistas) {
            map.removeLayer(mapData[currentMap].mVistas[marker]);
        }
        mapData[currentMap].mVistas = null;
    }
    if(markerType == "poi" || markerType == "all") {
        for (marker in mapData[currentMap].mPOIs) {
            map.removeLayer(mapData[currentMap].mPOIs[marker]);
        }
        mapData[currentMap].mPOIs = null;
    }
    if(markerType == "skill" || markerType == "all") {
        for (marker in mapData[currentMap].mSkills) {
            map.removeLayer(mapData[currentMap].mSkills[marker]);
        }
        mapData[currentMap].mSkills = null;
    }
    if(markerType == "task" || markerType == "all") {
        for (marker in mapData[currentMap].mTasks) {
            map.removeLayer(mapData[currentMap].mTasks[marker]);
        }
        mapData[currentMap].mTasks = null;
    }
}

function addMarkers(markerType) {
    if(map == null || mapData[currentMap] == null)
        return;

    mData = mapData[currentMap].mData;
    var marker;

    if(markerType == "waypoint") {
        console.log("Adding Waypoints");
        mapData[currentMap].mWaypoints = new Array();
        for (i = 0, il = mData.points_of_interest.length; i < il; i++) {
            if(mData.points_of_interest[i].type == "waypoint") {
                marker = new L.Marker(unproject(mData.points_of_interest[i].coord), { icon: new waypointIcon(), title: mData.points_of_interest[i].name });
                mapData[currentMap].mWaypoints.push(marker);
                map.addLayer(marker);
            }
        }

    }
    else if(markerType == "vista") {
        console.log("Adding Vistas");
        mapData[currentMap].mVistas = new Array();
        for (i = 0, il = mData.points_of_interest.length; i < il; i++) {
            if(mData.points_of_interest[i].type == "vista") {
                marker = new L.Marker(unproject(mData.points_of_interest[i].coord), { icon: new vistaIcon(), title: "Vista" });
                mapData[currentMap].mVistas.push(marker);
                map.addLayer(marker);
            }
        }
    }
    else if(markerType == "poi") {
        console.log("Adding POIs");
        mapData[currentMap].mPOIs = new Array();
        for (i = 0, il = mData.points_of_interest.length; i < il; i++) {
            if(mData.points_of_interest[i].type == "landmark") {
                marker = new L.Marker(unproject(mData.points_of_interest[i].coord), { icon: new poiIcon(), title: mData.points_of_interest[i].name });
                mapData[currentMap].mPOIs.push(marker);
                map.addLayer(marker);
            }
        }
    }
    else if(markerType == "skill") {
        console.log("Adding Skills");
        mapData[currentMap].mSkills = new Array();
        for (i = 0, il = mData.skill_challenges.length; i < il; i++) {
            marker = new L.Marker(unproject(mData.skill_challenges[i].coord), { icon: new skillIcon(), title: "Skill Challenge" });
            mapData[currentMap].mSkills.push(marker)
            map.addLayer(marker);
        }
    }
    else if(markerType == "task") {
        console.log("Adding Tasks");
        mapData[currentMap].mTasks = new Array();
        for (i = 0, il = mData.tasks.length; i < il; i++) {
            marker = new L.Marker(unproject(mData.tasks[i].coord), { icon: new taskIcon(), title: "(" + mData.tasks[i].level + ") " + mData.tasks[i].objective });
            mapData[currentMap].mTasks.push(marker)
            map.addLayer(marker);
        }
    }

}


function selectMap(mapNum) {
    if(mapData[mapNum] == null)
        return;

    console.log("Switch to map: " + mapNum + ", " + mapData[mapNum].mData.name);

    removeMarkers(currentMap, "all");
    currentMap = mapNum;

    if(optShowWaypoint)
        addMarkers("waypoint");
    if(optShowVista)
        addMarkers("vista");
    if(optShowPOI)
        addMarkers("poi");
    if(optShowSkill)
        addMarkers("skill");
    if(optShowTask)
        addMarkers("task");
}

function selectServer(serverNum) {
    currentServer = serverNum;
}

// Update the status in the top-bar
function updateLinkStatus(bLinked) {
    if(bLinked) {
        hasBeenLinked = true;
        $( "#top-download" ).css('display', 'none');
        $( "#link-status" ).css('display', 'inline');
        $( "#link-status-b" ).html("Connected");
        $( "#link-status-b" ).css('color', '#cceccc');
    }
    else if(hasBeenLinked) {
        $( "#link-status-b" ).html("Disconnected");
        $( "#link-status-b" ).css('color', '#eccccc');
    }
}

function updateGW2Link() {
    var jsonSuccess = false;

    // Request the JSON file from GW2Link
    var gw2json = $.getJSON('http://' + optGW2LinkIP + ':8428/gw2.json', function(data) {
        jsonSuccess = true;
        jsonFails = 0;

        // Update the raw data display
        document.getElementById("status").innerHTML=data.status;
        document.getElementById("game").innerHTML=data.game;  
        document.getElementById("name").innerHTML=data.name; 
        document.getElementById("server").innerHTML=data.server; 
        document.getElementById("map").innerHTML=data.map; 

        document.getElementById("posx").innerHTML=data.pos[0]; 
        document.getElementById("posy").innerHTML=data.pos[1]; 
        document.getElementById("posz").innerHTML=data.pos[2]; 

        document.getElementById("prot").innerHTML=data.prot; 
        document.getElementById("crot").innerHTML=data.crot; 

        // Update the player data
        playerData.pName = data.name;
        playerData.server = data.server;
        playerData.map = data.map;
        playerData.pos[0] = data.pos[0];
        playerData.pos[1] = data.pos[1];
        playerData.pos[2] = data.pos[2];
        playerData.pRot = data.prot; 
        playerData.cRot = data.crot; 

        if(!linkOutdated && (!data.version || data.version != linkVersion)) {
            $("#versionwarning").css('display', 'inherit');
            linkOutdated = true;
        }
        else if(linkOutdated && data.version == linkVersion) {
            $("#versionwarning").css('display', 'none');
            linkOutdated = false;
        }

        // Change the map if we have moved to another zone
        if(playerData.map != currentMap) {
            selectMap(playerData.map);
        }

        // Update!
        updateLinkStatus(true);
        updatePlayer();
    });

    // if the JSON request fails 3 times in a row, consider GW2Link disconnected
    if(!jsonSuccess) {
        jsonFails += 1;
        if(jsonFails >= 3)
            updateLinkStatus(false) ;
    }
}

function checkOptions() {
    var opt = $('#form-gw2linkip').prop('value')
    if(opt != optGW2LinkIP) {
        if(opt == "127.0.0.1" || opt.search("^(192.168.)[0-9]{1,3}(.)[0-9]{1,3}$") != -1)
            optGW2LinkIP = opt;
    }
        
}

$("#options-link").click(function() {
    if(optionsOpen) {
        $("#options-panel").css('height', '16px');
        $("#options-interior").css('visibility', 'hidden')
        $("#options-collapse").html(' (expand)');
        optionsOpen = false;
    }
    else {
        $("#options-panel").css('height', '160px');
        $("#options-interior").css('visibility', 'visible')
        $("#options-collapse").html(' (collapse)');
        optionsOpen = true;
    }
});

$('#checkbox-centermap').change(function() {
    optCenterMap = $('#checkbox-centermap').prop('checked');
});

$('#checkbox-showwaypoint').change(function() {
     optShowWaypoint = $('#checkbox-showwaypoint').prop('checked');
    if(optShowWaypoint)
        addMarkers("waypoint")
    else
        removeMarkers(currentMap, "waypoint")
});

$('#checkbox-showpoi').change(function() {
     optShowPOI = $('#checkbox-showpoi').prop('checked');
    if(optShowPOI)
        addMarkers("poi")
    else
        removeMarkers(currentMap, "poi")
});

$('#checkbox-showvista').change(function() {
    optShowVista = $('#checkbox-showvista').prop('checked');
    if(optShowVista)
        addMarkers("vista")
    else
       removeMarkers(currentMap, "vista")
});

$('#checkbox-showskill').change(function() {
    optShowSkill = $('#checkbox-showskill').prop('checked');
    if(optShowSkill)
        addMarkers("skill")
    else
        removeMarkers(currentMap, "skill")
});

$('#checkbox-showtask').change(function() {
    optShowTask = $('#checkbox-showtask').prop('checked');
    if(optShowTask)
        addMarkers("task")
    else
        removeMarkers(currentMap, "task")
});

$('#form-gw2linkip').change(function() {
        checkOptions();
});


