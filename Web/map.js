// Data from the APIs
var mapData = null; // map_floor.json
var mapNames = null; // map_names.json
var serverNames = null; // world_names.json
var continentData = {"continents":{"1":{"name":"Tyria","continent_dims":[32768,
32768],"min_zoom":0,"max_zoom":7},"2":{"name":"Mists","continent_dims":[16384,
16384],"min_zoom":0,"max_zoom":6}}}; // continents.json
var eventDetails = null; // event_details.json
var eventStatus = null; // events.json

// Player Data from GW2Link
var playerData = new Object();
playerData.name = "NoName";
playerData.server = 0;
playerData.map = 0;
playerData.pos = new Array();
playerData.pRot = 0;
playerData.cRot = 0;

var hasBeenLinked = false;
var jsonFails = 0;
var updateFrequency = 0.1;
var eventUpdateTimeMax = 30.0;
var eventUpdateTime = 0.0;

var currentMap = 0;
var currentContinent = 1;
var currentServer = 0;
var currentlyLinked = false;
var gameToMapRatio = 39.37

var mapInitialized = false;
var eventsUpdating = false;

var mapOffset = new Array();

var linkVersion = "1.2"
var linkOutdated = false;
var optionsOpen = true;
var optCenterMap = true;
var optShowEvent = true;
var optShowWaypoint = true;
var optShowPOI = true;
var optShowVista = true;
var optShowSkill = true;
var optShowTask = true;
var optBroadcast = false;
var optBroadcastGroup = "None";
var optGW2LinkIP = "127.0.0.1";

var map = null;
var playerMarker = null;
var eventMarkers = new Array();
var poiMarkers = new Array();

var livingWorldFilters = [
    "toxic offshoot",
    "Toxic Alliance",
    "Stop the Blood Witch",
    "krait witch"
];

var worldBosses = [
    {
        name: "The Shatterer",
        element: null,
        events: {
            "03BF176A-D59F-49CA-A311-39FC6F533F2F": {
                state: "Warmup",
                time: null,
                element: null
            },
            "8E064416-64B5-4749-B9E2-31971AB41783": {
                state: "Warmup",
                time: null,
                element: null
            },
            "580A44EE-BAED-429A-B8BE-907A18E36189": {
                state: "Warmup",
                time: null,
                element: null,
            }
        }
    },
    {
        name: "Shadow Behemoth",
        element: null,
        events: {
            "31CEBA08-E44D-472F-81B0-7143D73797F5": {
                state: "Warmup",
                time: null,
                element: null
            },
            "36330140-7A61-4708-99EB-010B10420E39": {
                state: "Warmup",
                time: null,
                element: null
            },
            "AFCF031A-F71D-4CEA-85E1-957179414B25": {
                state: "Warmup",
                time: null,
                element: null
            },
            "E539A5E3-A33B-4D5F-AEED-197D2716F79B": {
                state: "Warmup",
                time: null,
                element: null
            },
            "CFBC4A8C-2917-478A-9063-1A8B43CC8C38": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Fire Elemental",
        element: null,
        events: {
            "33F76E9E-0BB6-46D0-A3A9-BE4CDFC4A3A4": {
                state: "Warmup",
                time: null,
                element: null
            },
            "2C833C11-5CD5-4D96-A4CE-A74C04C9A278": {
                state: "Warmup",
                time: null,
                element: null
            },
            "5E4E9CD9-DD7C-49DB-8392-C99E1EF4E7DF": {
                state: "Warmup",
                time: null,
                element: null
            },
            "FCB42C06-547F-4DA2-904B-0098E60C47BC": {
                state: "Warmup",
                time: null,
                element: null
            },
            "6B897FF9-4BA8-4EBD-9CEC-7DCFDA5361D8": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Jungle Worm",
        element: null,
        events: {
            "C5972F64-B894-45B4-BC31-2DEEA6B7C033": {
                state: "Warmup",
                time: null,
                element: null
            },
            "61BA7299-6213-4569-948B-864100F35E16": {
                state: "Warmup",
                time: null,
                element: null
            },
            "456DD563-9FDA-4411-B8C7-4525F0AC4A6F": {
                state: "Warmup",
                time: null,
                element: null
            },
            "CF6F0BB2-BD6C-4210-9216-F0A9810AA2BD": {
                state: "Warmup",
                time: null,
                element: null
            },
            "1DCFE4AA-A2BD-44AC-8655-BBD508C505D1": {
                state: "Warmup",
                time: null,
                element: null
            },
            "613A7660-8F3A-4897-8FAC-8747C12E42F8": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Golem Mark II",
        element: null,
        events: {
            "9AA133DC-F630-4A0E-BB5D-EE34A2B306C2": {
                state: "Warmup",
                time: null,
                element: null
            },
            "3ED4FEB4-A976-4597-94E8-8BFD9053522F": {
                state: "Warmup",
                time: null,
                element: null
            },
            "A7E0F553-C4E1-452F-B39F-7BDBEC8B0BB1": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Tequatl the Sunless",
        element: null,
        events: {
            "568A30CF-8512-462F-9D67-647D69BEFAED": {
                state: "Warmup",
                time: null,
                element: null
            },
            "68D6587F-0591-4B2B-A0FB-5A1187C8DEDA": {
                state: "Warmup",
                time: null,
                element: null
            },
            "67B8372B-FB85-4629-BB3E-25EE35999E7A": {
                state: "Warmup",
                time: null,
                element: null
            },
            "C7C6BC6F-7899-4B36-BD10-81BF654BA849": {
                state: "Warmup",
                time: null,
                element: null
            },
            "17787332-A042-4FE6-B1E7-9BE74DC29BF7": {
                state: "Warmup",
                time: null,
                element: null
            },
            "84C0E4D0-7503-48C3-ACB7-EF773695AA56": {
                state: "Warmup",
                time: null,
                element: null
            },
            "59B89D94-556F-4C69-9CE4-433F20531787": {
                state: "Warmup",
                time: null,
                element: null
            },
            "9C23AAD5-AECF-4944-9442-349BC411CC68": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Claw of Jormag",
        element: null,
        events: {
            "0464CB9E-1848-4AAA-BA31-4779A959DD71": {
                state: "Warmup",
                time: null,
                element: null
            },
            "BFD87D5B-6419-4637-AFC5-35357932AD2C": {
                state: "Warmup",
                time: null,
                element: null
            },
            "96D736C4-D2C6-4392-982F-AC6B8EF3B1C8": {
                state: "Warmup",
                time: null,
                element: null
            },
            "0CA3A7E3-5F66-4651-B0CB-C45D3F0CAD95": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Temple of Balthazar",
        element: null,
        events: {
            "2555EFCB-2927-4589-AB61-1957D9CC70C8": {
                state: "Warmup",
                time: null,
                element: null
            },
            "7B7D6D27-67A0-44EF-85EA-7460FFA621A1": {
                state: "Warmup",
                time: null,
                element: null
            },
            "D0ECDACE-41F8-46BD-BB17-8762EF29868C": {
                state: "Warmup",
                time: null,
                element: null
            },
            "45B84A62-BE33-4371-B9FB-CC8490528276": {
                state: "Warmup",
                time: null,
                element: null
            },
            "A8D1A2B7-1F1B-413D-8E64-06CA0D26712D": {
                state: "Warmup",
                time: null,
                element: null
            },
            "D3FFC041-4124-4AA7-A74B-B9363ED1BCBD": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Temple of Lyssa",
        element: null,
        events: {
            "0372874E-59B7-4A8F-B535-2CF57B8E67E4": {
                state: "Warmup",
                time: null,
                element: null
            },
            "F66922B5-B4BD-461F-8EC5-03327BD2B558": {
                state: "Warmup",
                time: null,
                element: null
            },
            "35997B10-179B-4E39-AD7F-54E131ECDD57": {
                state: "Warmup",
                time: null,
                element: null
            },
            "590364E0-0053-4933-945E-21D396B10B20": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Temple of Dwayna",
        element: null,
        events: {
            "6A6FD312-E75C-4ABF-8EA1-7AE31E469ABA": {
                state: "Warmup",
                time: null,
                element: null
            },
            "526732A0-E7F2-4E7E-84C9-7CDED1962000": {
                state: "Warmup",
                time: null,
                element: null
            },
            "7EF31D63-DB2A-4FEB-A6C6-478F382BFBCB": {
                state: "Warmup",
                time: null,
                element: null
            },
            "F531683F-FC09-467F-9661-6741E8382E24": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Temple of Grenth",
        element: null,
        events: {
            "C8139970-BE46-419B-B026-485A14002D44": {
                state: "Warmup",
                time: null,
                element: null
            },
            "E16113B1-CE68-45BB-9C24-91523A663BCB": {
                state: "Warmup",
                time: null,
                element: null
            },
            "99254BA6-F5AE-4B07-91F1-61A9E7C51A51": {
                state: "Warmup",
                time: null,
                element: null
            },
            "27E2F73C-E26B-4046-AC06-72C442D9B2B7": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Temple of Melandru",
        element: null,
        events: {
            "A5B5C2AF-22B1-4619-884D-F231A0EE0877": {
                state: "Warmup",
                time: null,
                element: null
            },
            "7E24F244-52AF-49D8-A1D7-8A1EE18265E0": {
                state: "Warmup",
                time: null,
                element: null
            },
            "351F7480-2B1C-4846-B03B-ED1B8556F3D7": {
                state: "Warmup",
                time: null,
                element: null
            },
            "F0CE1E71-4B96-48C6-809D-E1941AF40B1D": {
                state: "Warmup",
                time: null,
                element: null
            },
            "E7563D8D-838D-4AF4-80CD-1D3A25B6F6AB": {
                state: "Warmup",
                time: null,
                element: null
            },
            "3D333172-24CE-47BA-8F1A-1AD47E7B69E4": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "The Frozen Maw",
        element: null,
        events: {
            "F7D9D427-5E54-4F12-977A-9809B23FBA99": {
                state: "Warmup",
                time: null,
                element: null
            },
            "90B241F5-9E59-46E8-B608-2507F8810E00": {
                state: "Warmup",
                time: null,
                element: null
            },
            "374FC8CB-7AB7-4381-AC71-14BFB30D3019": {
                state: "Warmup",
                time: null,
                element: null
            },
            "DB83ABB7-E5FE-4ACB-8916-9876B87D300D": {
                state: "Warmup",
                time: null,
                element: null
            },
            "6565EFD4-6E37-4C26-A3EA-F47B368C866D": {
                state: "Warmup",
                time: null,
                element: null
            },
            "D5F31E0B-E0E3-42E3-87EC-337B3037F437": {
                state: "Warmup",
                time: null,
                element: null
            },
            "6F516B2C-BD87-41A9-9197-A209538BB9DF": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Rhendak the Crazed",
        element: null,
        events: {
            "6BD7C8B0-2605-4819-9AE6-EF2849098090": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Foulbear Chieftain",
        element: null,
        events: {
            "B4E6588F-232C-4F68-9D58-8803D67E564D": {
                state: "Warmup",
                time: null,
                element: null
            },
            "4B478454-8CD2-4B44-808C-A35918FA86AA": {
                state: "Warmup",
                time: null,
                element: null
            },
            "D9F1CF48-B1CB-49F5-BFAF-4CEC5E68C9CF": {
                state: "Warmup",
                time: null,
                element: null
            },
            "724343EA-B32C-4AE1-AB7E-E5FC160C26F9": {
                state: "Warmup",
                time: null,
                element: null
            },
            "44ABC8F1-ED5C-4E00-9338-5A8C40B228B4": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Modniir Ulgoth",
        element: null,
        events: {
            "E6872A86-E434-4FC1-B803-89921FF0F6D6": {
                state: "Warmup",
                time: null,
                element: null
            },
            "A3101CDC-A4A0-4726-85C0-147EF8463A50": {
                state: "Warmup",
                time: null,
                element: null
            },
            "DA465AE1-4D89-4972-AD66-A9BE3C5A1823": {
                state: "Warmup",
                time: null,
                element: null
            },
            "DDC0A526-A239-4791-8984-E7396525B648": {
                state: "Warmup",
                time: null,
                element: null
            },
            "C3A1BAE2-E7F2-4929-A3AA-92D39283722C": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Dredge Commissar",
        element: null,
        events: {
            "95CA969B-0CC6-4604-B166-DBCCE125864F": {
                state: "Warmup",
                time: null,
                element: null
            },
            "25ED51A1-EDFA-463A-BF50-79CB4D7912EB": {
                state: "Warmup",
                time: null,
                element: null
            },
            "10F7854A-D2E7-42E4-9BCE-0C411EF91328": {
                state: "Warmup",
                time: null,
                element: null
            },
            "64B94537-00D5-4CB6-8558-44987A9C5F76": {
                state: "Warmup",
                time: null,
                element: null
            },
            "141654A6-D42E-415E-A3C4-918A1E664AF3": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Taidha Covington",
        element: null,
        events: {
            "242BD241-E360-48F1-A8D9-57180E146789": {
                state: "Warmup",
                time: null,
                element: null
            },
            "0E0801AF-28CF-4FF7-8064-BB2F4A816D23": {
                state: "Warmup",
                time: null,
                element: null
            },
            "189E7ABE-1413-4F47-858E-4612D40BF711": {
                state: "Warmup",
                time: null,
                element: null
            },
            "B6B7EE2A-AD6E-451B-9FE5-D5B0AD125BB2": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Fire shaman",
        element: null,
        events: {
            "295E8D3B-8823-4960-A627-23E07575ED96": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Megadestroyer",
        element: null,
        events: {
            "C876757A-EF3E-4FBE-A484-07FF790D9B05": {
                state: "Warmup",
                time: null,
                element: null
            },
            "36E81760-7D92-458E-AA22-7CDE94112B8F": {
                state: "Warmup",
                time: null,
                element: null
            },
            "9E5D9F1A-FE14-49C6-917F-43AAE227165C": {
                state: "Warmup",
                time: null,
                element: null
            },
            "584A4D22-33DC-4D77-A5D9-2FA7379401ED": {
                state: "Warmup",
                time: null,
                element: null
            },
            "4210CE81-BDB7-448E-BE33-46E18A5A3477": {
                state: "Warmup",
                time: null,
                element: null
            },
            "61D4579A-C53F-4C26-A31B-92FABE3DA566": {
                state: "Warmup",
                time: null,
                element: null
            },
            "3BA29A69-A30B-405D-96AC-CBA5D511C163": {
                state: "Warmup",
                time: null,
                element: null
            },
            "294E08F6-CA36-42B3-8D06-B321BA06EECA": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Eye of Zhaitan",
        element: null,
        events: {
            "A0796EC5-191D-4389-9C09-E48829D1FDB2": {
                state: "Warmup",
                time: null,
                element: null
            },
            "42884028-C274-4DFA-A493-E750B8E1B353": {
                state: "Warmup",
                time: null,
                element: null
            },
            "6FA8BE3F-9F6C-4790-BFBC-380B26FDB06C": {
                state: "Warmup",
                time: null,
                element: null
            },
            "A0E5E563-2701-4D4E-8163-A89FEA02EC38": {
                state: "Warmup",
                time: null,
                element: null
            },
            "88DBFB0B-3CB5-47FE-8B9D-2A9E3E04F7F2": {
                state: "Warmup",
                time: null,
                element: null
            },
            "107AF387-E000-42DD-A202-BF2C7AEBE9FC": {
                state: "Warmup",
                time: null,
                element: null
            },
            "9841ACE7-5F49-45FF-AE56-16B6908A09FE": {
                state: "Warmup",
                time: null,
                element: null
            },
            "77ADD8A0-7A1F-47D7-8D82-484A2134F576": {
                state: "Warmup",
                time: null,
                element: null
            },
            "4920CE71-833B-4DF9-B9C4-6881C50F64C8": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
    {
        name: "Karka Queen",
        element: null,
        events: {
            "F479B4CF-2E11-457A-B279-90822511B53B": {
                state: "Warmup",
                time: null,
                element: null
            },
            "5282B66A-126F-4DA4-8E9D-0D9802227B6D": {
                state: "Warmup",
                time: null,
                element: null
            }
        }
    },
];

eventColors = {
    "Active": "#D09050",
    "Preparation": "#80A0B0"
}

eventClasses = {
    "Active": "event-active",
    "Preparation": "event-prep"
}

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
        iconSize:     [24, 24],
        iconAnchor:   [12, 12]
    }
});

var landmarkIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-poi.png',
        iconSize:     [14, 14],
        iconAnchor:   [7, 7]
    }
});

var vistaIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-vista.png',
        iconSize:     [24, 24],
        iconAnchor:   [12, 12]
    }
});

var skillIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-skill.png',
        iconSize:     [24, 24],
        iconAnchor:   [12, 12]
    }
});

var taskIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-task.png',
        iconSize:     [24, 24],
        iconAnchor:   [12, 12]
    }
});

var eventActiveIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-event-active.png',
        iconSize:     [128, 128],
        iconAnchor:   [64, 64]
    }
});

var eventGroupIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-event-group.png',
        iconSize:     [192, 192],
        iconAnchor:   [96, 96]
    }
});

var eventPrepIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-event-prep.png',
        iconSize:     [64, 64],
        iconAnchor:   [32, 32]
    }
});

var eventLivingIcon = L.Icon.extend({
    options: {
        iconUrl: 'images/icon-event-living.png',
        iconSize:     [160, 160],
        iconAnchor:   [80, 80]
    }
});

// Start checking for GW2Link every .1 seconds, once the page has finished loading
$( document ).ready(function() {
    initMap(1);
    initStaticData();

    setInterval(update, 1000 * updateFrequency);
});

// Create the leaflet map
function initMap(newContinent) {
    "use strict";
    
    var southWest, northEast;

    if (continentData["continents"][newContinent] == null) {
        console.log("Invalid Contintinent for initMap");
        return;
    }

    if (map != null) {
        map.removeLayer(playerMarker);
        playerMarker = null;
        map.remove();
    }

    map = L.map("map-container", {
        minZoom: continentData["continents"][newContinent].min_zoom,
        maxZoom: continentData["continents"][newContinent].max_zoom,
        crs: L.CRS.Simple
    })
    map.setView([0, 0], continentData["continents"][newContinent].min_zoom);
    
    southWest = unproject([0, continentData["continents"][newContinent].continent_dims[0]]);
    northEast = unproject([continentData["continents"][newContinent].continent_dims[1], 0]);
    
    map.setMaxBounds(new L.LatLngBounds(southWest, northEast));

    L.tileLayer("https://tiles.guildwars2.com/" + newContinent + "/1/{z}/{x}/{y}.jpg", {
        minZoom: continentData["continents"][newContinent].min_zoom,
        maxZoom: continentData["continents"][newContinent].max_zoom,
        continuousWorld: true
    }).addTo(map);

    map.on("click", onMapClick);
}

function unproject(coord) {
    return map.unproject(coord, map.getMaxZoom());
}

function onMapClick(e) {
    console.log("You clicked the map at " + map.project(e.latlng));
}

function initStaticData() {
    console.log("Initializing Static Data");
    loadCookies();

    initServerNames();
    initMapNames();
    initMapData();
    initEventDetails();
}

function loadCookies() {
    var lang = $.cookie('lang');
    if (!lang)
        lang = 'en';
    setLang(lang);
}

function initServerNames() {
    $.getJSON('https://api.guildwars2.com/v1/world_names.json?lang=' + getLang(), function(json) {
        serverNames = json;
        serverNames.sort(function(a,b) { return (a.name.toUpperCase() < b.name.toUpperCase()) ? -1 : (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : 0; } );
        console.log("Server Names Initialized")

        var serverSelector = $('#serverselector');
        for (var i = 0; i < serverNames.length; i++) {
            var option = new Option(serverNames[i].name, serverNames[i].id);

            serverSelector.append(option);
        }
        serverSelector.prop('disabled', false);
        if (getServer())
            setServer(getServer());
    });
}

function initMapNames() {
    //console.log("")
    $.getJSON('https://api.guildwars2.com/v1/map_names.json?lang=' + getLang(), function(json) {
        mapNames = json;

        mapNames.sort(function(a,b) { return (a.name.toUpperCase() < b.name.toUpperCase()) ? -1 : (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : 0; } );
        console.log("Map Names Initialized")

        var mapSelector = $('#mapselector');
        for (var i = 0; i < mapNames.length; i++) {
            var option = new Option(mapNames[i].name, mapNames[i].id);

            mapSelector.append(option);
        }

        mapSelector.prop('disabled', false);
        if (getMap() && mapData)
            setMap(getMap());
    });
}

function initMapData() {
    $.getJSON('https://api.guildwars2.com/v1/maps.json?lang=' + getLang(), function(json) {
        mapData = json.maps;
        console.log("Map Data Initialized")

        if (getMap() && mapNames)
            setMap(getMap());
    });
}

function getMapData(map) {
    if(!mapData) {
        console.log("No mapData");
        return null;
    }

    if(map in mapData)
        return mapData[map]

    console.log("No mapData");
    return null;
}

function initEventDetails() {
    $.getJSON('https://api.guildwars2.com/v1/event_details.json?lang=' + getLang(), function(json) {
        eventDetails = json.events;
        console.log("Event Details Initialized")
    });
}

function update() {
    updateGW2Link();
    updateEventTimer();
}

function updateEventTimer() {
    eventUpdateTime -= updateFrequency;

    if(eventUpdateTime <= 0.0) {
        eventUpdateTime = 0.0;

        if(getServer() != 0 && !eventsUpdating && eventDetails)
            getEvents();
    }

    $('#eventtime').html("00:" + ((Math.round(eventUpdateTime) < 10) ? "0" + Math.round(eventUpdateTime).toString() : Math.round(eventUpdateTime).toString()));

    currTime = new Date();
    for(var wb = 0; wb < worldBosses.length; wb++) {

        if(!worldBosses[wb].element)
            continue;

        for(var wbev in worldBosses[wb].events) {
            if(worldBosses[wb].events[wbev].time && worldBosses[wb].events[wbev].element) {
                elapsed = parseInt((currTime - worldBosses[wb].events[wbev].time) / 1000);
                elapsed += parseInt(eventUpdateTimeMax / 2);

                minutes = Math.floor(elapsed / 60)
                seconds = elapsed % 60

                if(minutes < 10)
                    minutes = '0' + minutes.toString()

                if(seconds < 10)
                    seconds = '0' + seconds.toString()
                
                timerText = minutes.toString() + ':' + seconds.toString();
                worldBosses[wb].events[wbev].element.children('.event-time').html(timerText)
            }   
            
        }
    }
}

function updateGW2Link() {
    var jsonSuccess = false;

    // Request the JSON file from GW2Link
    var gw2json = $.getJSON('http://' + optGW2LinkIP + ':8428/gw2.json', function(data) {
        jsonSuccess = true;
        jsonFails = 0;

        // Update the raw data display
        $("#status").html(data.status);
        $("#game").html(data.game);
        $("#name").html(data.identity.name);
        $("#server").html(data.identity.world_id);
        $("#map").html(data.identity.map_id);
        $("#posx").html(data.pos[0]);
        $("#posy").html(data.pos[1]);
        $("#posz").html(data.pos[2]);
        $("#prot").html(data.prot);
        $("#crot").html(data.crot);

        // Update the player data
        playerData.name = data.identity.name;
        playerData.server = data.identity.world_id;
        playerData.map = data.identity.map_id;
        playerData.pos[0] = data.pos[0];
        playerData.pos[1] = data.pos[1];
        playerData.pos[2] = data.pos[2];
        playerData.pRot = data.prot;
        playerData.cRot = data.crot;

        if(!linkOutdated && (!data.version || data.version != linkVersion)) {
            $("#versionwarning").css('display', 'inline');
            linkOutdated = true;
        }
        else if(linkOutdated && data.version == linkVersion) {
            $("#versionwarning").css('display', 'none');
            linkOutdated = false;
        }

        // Change the map if we have moved to another zone
        if(playerData.map != currentMap && getTrackPlayer()) {
            setMap(playerData.map);
        }

        if(playerData.server != currentServer) {
            setServer(playerData.server);
        }

        updateLinkStatus(true);
        updatePlayer();
    })
    .fail(function() {
        jsonFails += 1;
        if(jsonFails >= 3)
            updateLinkStatus(false);
    });
}

function getLang() {
    var lang = $.cookie('lang');
    if (!lang)
        lang = $("#language option:selected").val();
    if (!lang)
        lang = 'en';
    return lang;
}

function setLang(lang) {
    $("#language option[value='" + lang + "']").attr('selected', 'selected');
    $.cookie('lang', $("#language option:selected").val(), { expires: 10 }); 
}

function getServer() {
    if (currentServer != 0)
        return currentServer
    var server = $.cookie('server');
    if (!server)
        server = $("#serverselector option:selected").val();
    return server;
}

function setServer(server) {
    if(isNormalServer(server)) {
        $("#serverselector option[value='" + server + "']").attr('selected', 'selected');
        $.cookie('server', $("#serverselector option:selected").val(), { expires: 10 });

        $("#serveroption-overflow").css('display', 'none');
    }
    else {
        $("#serveroption-overflow").val(server);
        $("#serveroption-overflow").css('display', 'inline');
        $("#serveroption-overflow").attr('selected', 'selected');
    }
    currentServer = server;
}

function isNormalServer(server) {
    for(var i = 0; i < serverNames.length; i++) {
        if(server == serverNames[i].id)
            return true;
    }
    return false;
}

function getMap() {
    if (currentMap != 0)
        return currentMap
    var map = $.cookie('map');
    if (!map)
        map = $("#mapselector option:selected").val();
    return map;
}

function setMap(map) {
    console.log("Set Map: " + map.toString());
    console.log(getMapData(map).map_name);
    previousMap = currentMap

    if(isNormalMap(map)) {
        $("#mapselector option[value='" + map + "']").attr('selected', 'selected');
        $.cookie('map', $("#mapselector option:selected").val(), { expires: 10 });

        $("#mapoption-other").css('display', 'none'); 
    }
    else {
        $("#mapoption-other").val(map);
        $("#mapoption-other").css('display', 'inline');
        $("#mapoption-other").attr('selected', 'selected');
    }

    currentMap = map;
    if (currentMap != previousMap) {
        mData = getMapData(map);
        if(mData && currentContinent != mData.continent_id) {
            currentContinent = mData.continent_id;
            initMap(getMapData(map).continent_id);
        }
        updateEventMarkers();
    }
}

function getTrackPlayer() {
    return $("#trackplayercheck").prop('checked');
}

function setTrackPlayer(track) {
    $("#trackplayercheck").prop('checked', track);
}

function isNormalMap(map) {
    for(var i = 0; i < mapNames.length; i++) {
        if(map == mapNames[i].id)
            return true;
    }
    return false;
}

// Update the player marker's location and rotation
function updatePlayer() {
    if(!map || !mapData)
        return;

    playerPos = getPosition(playerData.map, playerData.pos[0], playerData.pos[2], true)

    if(!playerMarker) {
        playerMarker = L.marker(unproject(playerPos), { icon: new playerIcon(), title: playerData.pName });
        playerMarker.addTo(map);
    }
    playerMarker.setLatLng(unproject(playerPos));
    playerMarker._icon.style[L.DomUtil.TRANSFORM] += ' rotate(-' + playerData.cRot + 'deg)';

    if(getTrackPlayer())
        map.panTo(unproject(playerPos));
}

// Update the status in the top-bar
function updateLinkStatus(bLinked) {
    if(bLinked == currentlyLinked)
        return;

    currentlyLinked = bLinked;
    if(bLinked) {
        hasBeenLinked = true;
        $( "#top-download" ).css('display', 'none');
        $( "#link-status" ).css('display', 'inline');
        $( "#link-status-b" ).html("Connected");
        $( "#link-status-b" ).css('color', '#cceccc');
        setTrackPlayer(true);
        map.setZoom(6);
    }
    else if(hasBeenLinked) {
        $( "#link-status-b" ).html("Disconnected");
        $( "#link-status-b" ).css('color', '#eccccc');
        setTrackPlayer(false);
    }
}

function getPosition(map, posX, posY, scale) {
    if( !map || !mapData)
        return;

    mData = getMapData(map)
    if(!mData)
        return;

    mLeft = mData.map_rect[0][0];
    mTop = mData.map_rect[0][1];
    mWidth = mData.map_rect[1][0] - mData.map_rect[0][0];
    mHeight = mData.map_rect[1][1] - mData.map_rect[0][1];
    cLeft = mData.continent_rect[0][0];
    cTop = mData.continent_rect[0][1];
    cWidth = mData.continent_rect[1][0] - mData.continent_rect[0][0];
    cHeight = mData.continent_rect[1][1] - mData.continent_rect[0][1];

    if(mWidth == 0 || mHeight == 0 || cWidth == 0 || cHeight == 0) {
        console.log("Bad map data: " + map.toString());
        return;
    }

    var position = new Array();
    var mapPct = new Array();

    if(scale) {
        posX *= gameToMapRatio;
        posY *= gameToMapRatio;
    }

    mapPct[0] = (posX - mLeft) / mWidth;
    mapPct[1] = (posY - mTop) / mHeight;

    position[0] = cLeft + (cWidth * mapPct[0])
    position[1] = (cTop + cHeight) - (cHeight * mapPct[1])

    return position;
}

function getEvents() {
    if(getServer() == 0 || !map || !mapData || !eventDetails)
        return;

    console.log("Requesting Event Status")

    eventsUpdating = true;
    $.getJSON("https://api.guildwars2.com/v1/events.json?world_id=" + getServer(), function (json) {
        eventStatus = json.events;
        console.log("Got Event Status")

        if(!map || !mapData || !eventDetails) {
            console.log("Aborting Even Update")
            eventUpdateTime = 5.0;
            return;
        }

        updateEventMarkers();
        updateWorldBosses();
        eventUpdateTime = eventUpdateTimeMax;
        eventsUpdating = false;
    });
}

function updateEventMarkers() {
    if(!map || !eventDetails || !mapData || !eventStatus) {
        console.log("Data Not Ready for Marker Update")
        return;
    }
    
    console.log("Updating Event Markers");

    for(var k in eventMarkers) {
        if(eventMarkers[k].map_id != getMap())
            removeEventMarker(k);
    }

    for(var i in eventStatus) {


        if(eventStatus[i].map_id == getMap() || (eventIsLivingWorld(eventStatus[i].event_id) && isNormalMap(eventStatus[i].map_id))) {
            eventId = eventStatus[i].event_id;
            if(eventStatus[i].state == "Active" || eventStatus[i].state == "Preparation") {
                if(eventId in eventMarkers) {
                    if(eventMarkers[eventId].state != eventStatus[i].state) {
                        removeEventMarker(eventId);
                        addEventMarker(eventId, eventStatus[i].state);
                    }
                }
                else {
                    addEventMarker(eventId, eventStatus[i].state);
                }
            }
            else if(eventMarkers[eventId]) {
                removeEventMarker(eventId);
            }
        }
    }
}

function addEventMarker(eventId, eventState) {
    if(!map || !eventDetails)
        return;

    if(eventState == "Active" && eventIsLivingWorld(eventId)) {
        marker = new L.Marker(unproject(getPosition(eventDetails[eventId].map_id, eventDetails[eventId].location.center[0], eventDetails[eventId].location.center[1], false)), { icon: new eventLivingIcon(), title: "(" + eventDetails[eventId].level + ") " + eventDetails[eventId].name });
        marker.state = eventState;
        marker.map_id = eventDetails[eventId].map_id
        eventMarkers[eventId] = marker;
        map.addLayer(marker);
    }
    else if(eventState == "Active" && eventDetails[eventId].flags[0] == "group_event") {
        marker = new L.Marker(unproject(getPosition(eventDetails[eventId].map_id, eventDetails[eventId].location.center[0], eventDetails[eventId].location.center[1], false)), { icon: new eventGroupIcon(), title: "(" + eventDetails[eventId].level + ") [Group] " + eventDetails[eventId].name });
        marker.state = eventState;
        marker.map_id = eventDetails[eventId].map_id
        eventMarkers[eventId] = marker;
        map.addLayer(marker);
    }
    else if(eventState == "Active") {
        marker = new L.Marker(unproject(getPosition(eventDetails[eventId].map_id, eventDetails[eventId].location.center[0], eventDetails[eventId].location.center[1], false)), { icon: new eventActiveIcon(), title: "(" + eventDetails[eventId].level + ") " + eventDetails[eventId].name });
        marker.state = eventState;
        marker.map_id = eventDetails[eventId].map_id
        eventMarkers[eventId] = marker;
        map.addLayer(marker);
    }
    else if(eventState == "Preparation" && eventDetails[eventId].name.indexOf("Skill Challenge:") != 0) {
        marker = new L.Marker(unproject(getPosition(eventDetails[eventId].map_id, eventDetails[eventId].location.center[0], eventDetails[eventId].location.center[1], false)), { icon: new eventPrepIcon(), title: "(" + eventDetails[eventId].level + ") [In Prep] " + eventDetails[eventId].name });
        marker.state = eventState;
        marker.map_id = eventDetails[eventId].map_id
        eventMarkers[eventId] = marker;
        map.addLayer(marker);
    }
}

function removeEventMarker(eventId) {
    if(!map || !eventMarkers || !eventMarkers[eventId])
        return;

    map.removeLayer(eventMarkers[eventId]);
    delete eventMarkers[eventId];
}

function eventIsLivingWorld(eventId) {
    if(!eventDetails)
        return false;

    for(var i = 0; i < livingWorldFilters.length; i++) {
        if(eventDetails[eventId].name.indexOf(livingWorldFilters[i]) > -1)
            return true;
    }

    return false;
}

function updateWorldBosses() {
    if(!eventDetails || !eventStatus) {
        console.log("Data Not Ready for World Boss Update")
        return;
    }
    
    console.log("Updating World Bosses");

    for(var ev in eventStatus) {
        eventId = eventStatus[ev].event_id;
        eventState = eventStatus[ev].state;

        for(var wb = 0; wb < worldBosses.length; wb++) {
            for(var wbev in worldBosses[wb].events) {
                if(wbev == eventId) {

                    if(eventState != worldBosses[wb].events[wbev].state) {

                        if(worldBosses[wb].element)
                            $('#wb-start').after(worldBosses[wb].element);

                        worldBosses[wb].events[wbev].state = eventState

                        if(worldBosses[wb].events[wbev].element) {
                            worldBosses[wb].events[wbev].element.remove();
                            worldBosses[wb].events[wbev].time = null;
                        }

                        if(eventState == "Active" || eventState == "Preparation") {

                            if(!worldBosses[wb].element) {

                                worldBosses[wb].element = $('<div/>', {
                                    class: 'panel-event'
                                });
                                $('#wb-start').after(worldBosses[wb].element);

                                title = $('<div/>', {
                                    class: 'event-title',
                                    text: worldBosses[wb].name
                                });
                                worldBosses[wb].element.append(title)
                            }

                            worldBosses[wb].events[wbev].element = $('<div/>', {
                                class: 'event-status ' + eventClasses[eventState],
                                html: '<span class="event-time">00:00</span> ' + eventDetails[eventId].name
                            });
                            worldBosses[wb].element.children('.event-title').after(worldBosses[wb].events[wbev].element);
                            worldBosses[wb].events[wbev].time = new Date();
                        }
                    }
                }
            }
        }
    }

    for(var wb = 0; wb < worldBosses.length; wb++) {

        if(!worldBosses[wb].element)
            continue;

        topState = null;
        guid = null
        for(var wbev in worldBosses[wb].events) {

            if(worldBosses[wb].events[wbev].state == "Active") {
                topState = "Active";
                guid = wbev
                break;
            }
            else if(worldBosses[wb].events[wbev].state == "Preparation") {
                topState = "Preparation";
                guid = wbev
            }
        }

        eventId = guid;

        if(!topState){
            worldBosses[wb].element.remove();
            if(eventMarkers[eventId])
                removeEventMarker(eventId);
            continue;
        }

        worldBosses[wb].element.children('.event-title').css({ "background-color": eventColors[topState]});

        
        if(eventId in eventMarkers) {
            if(eventMarkers[eventId].state != topState) {
                removeEventMarker(eventId);
                addEventMarker(eventId, topState);
            }
        }
        else {
            addEventMarker(eventId, topState);
        }
    }
}

function checkOptions() {
    var opt = $('#form-gw2linkip').prop('value')
    if(opt != optGW2LinkIP) {
        if(opt == "127.0.0.1" || opt.search("^(192.168.)[0-9]{1,3}(.)[0-9]{1,3}$") != -1)
            optGW2LinkIP = opt;
    }
        
}

$("a.collapse-link").click(function() {
    section = $( this ).attr('collapse');
    interior = $('div.collapse-interior[collapse="' + section + '"]');
    if(interior.css('display') == 'inline') {

        interior.css('display', 'none')
        $('span.collapse-text[collapse="' + section + '"]').html(' (expand)');
    }
    else {
        interior.css('display', 'inline')
        $('span.collapse-text[collapse="' + section + '"]').html(' (collapse)');
    }
});

$('#form-gw2linkip').change(function() {
        checkOptions();
});

$('#language').change(function() {
        setLang($("#language option:selected").val());
});

$('#serverselector').change(function() {
        setServer($("#serverselector option:selected").val());
        setTrackPlayer(false);
});

$('#mapselector').change(function() {
    setMap($("#mapselector option:selected").val());
    setTrackPlayer(false);
});

