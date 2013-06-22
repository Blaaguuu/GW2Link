var mapData = new Array();
var playerData = new Object();
playerData.pName = "NoName";
playerData.server = 0;
playerData.map = 0;
playerData.pos = new Array();
playerData.pRot = 0;
playerData.cRot = 0;

var hasBeenLinked = false;
var jsonFails = 0;
var currentMap = 0;
var gameToMapRatio = 1.65; 
var mapOffset = new Array();

var map = null;
var playerMarker = null;

var playerIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/marker-icon.png',
        iconSize:     [58, 25],
        iconAnchor:   [29, 12],
        popupAnchor:  [-3, -76]
    }
});

// Create the leaflet map
$(function () {
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

                mapData[mapNum] = new Object();
                mapData[mapNum].mName = gameMap.name;

                mapData[mapNum].mOffset = new Array();
                mapData[mapNum].mOffset[0] = ((gameMap.continent_rect[1][0] - gameMap.continent_rect[0][0]) * 0.5) + gameMap.continent_rect[0][0];
                mapData[mapNum].mOffset[1] = ((gameMap.continent_rect[1][1] - gameMap.continent_rect[0][1]) * 0.5) + gameMap.continent_rect[0][1];
                
                for (i = 0, il = gameMap.points_of_interest.length; i < il; i++) {
                    poi = gameMap.points_of_interest[i];
                    
                    if (poi.type != "waypoint") {
                        continue;
                    }

                    //L.marker(unproject(poi.coord), {
                    //    title: poi.name
                    //}).addTo(map);
                }
            }
        }
    });
});

// Start checking for GW2Link every .25 seconds, once the page has finished loading
$( document ).ready(function() {
    updateJSON();
    setInterval(updateJSON, 250);
});

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
}

// Get an array of the player's x/y position
function getPlayerPos() {
    if(map == null)
        return;

    playerPos = new Array();

    playerPos[0] = mapData[currentMap].mOffset[0] + (playerData.pos[0] * gameToMapRatio);
    playerPos[1] = mapData[currentMap].mOffset[1] - (playerData.pos[2] * gameToMapRatio);

    return playerPos;
}

function selectMap(mapNum) {
    currentMap = mapNum;
}

// Update the status in the top-bar
function updateLinkStatus(bLinked) {
    if(bLinked) {
        hasBeenLinked = true;
        $( "#link-title" ).html("GW2Linker: ");
        $( "#link-status" ).html("Connected");
        $( "#link-status" ).css('color', '#cceccc');
    }
    else if(hasBeenLinked) {
        $( "#link-title" ).html("GW2Linker: ");
        $( "#link-status" ).html("Disconnected");
        $( "#link-status" ).css('color', '#eccccc');
    }
}

function updateJSON() {
    var jsonSuccess = false;

    // Request the JSON file from GW2Link
    var gw2json = $.getJSON('http://127.0.0.1:8428/gw2.json', function(data) {
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

