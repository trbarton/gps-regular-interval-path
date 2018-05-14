var fs = require('fs');

var trackVal = 10;
var nodeId = Math.floor(Math.random()*(999-100+1)+100);

var obj;
//Reads the track.json object from file, Parses it as json then uses it as an argument
fs.readFile('tracks/track' + trackVal + '.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  splitPaths(obj.geometry.coordinates);
});

//Placeholder for the data to be written to file
var outArray = [];

//Maximum distance allowed between any two points 
var maxDistance = 10;

var track = {
    "type": "Feature",
    "properties": {
        boatId: null,
        times: [],
        speeds: [],
        bearings: []
    },
    "geometry": {
      "type": "LineString",
      "coordinates": []
    }
}

//Text to prepend to output cooridantes
var pre = `var track = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "LineString",
      "coordinates":`;

//Text to append to output coordinates
var post = `}
}`;

// Given array of coordiantes splits each length between two points into sections
// of no more than the given max distance
function splitPaths(coordArray) {
    for(i=1; i<coordArray.length; i++) {

        var lat1 = coordArray[i-1][1];
        var lon1 = coordArray[i-1][0];

        var lat2 = coordArray[i][1];
        var lon2 = coordArray[i][0];

        outArray.push(coordArray[i-1]);

        var distance = measure(lat1, lon1, lat2, lon2);
        if (distance > maxDistance) {

            var numSplits = Math.floor(distance/maxDistance);

            for (j = 1; j < numSplits; j++) {
                var lon = splitLatLong(lon1, lon2, numSplits, j);
                var lat = splitLatLong(lat1, lat2, numSplits, j);
                outArray.push([lon, lat]);
            }
            
        }
    }
    writeCSV(outArray);
    writeTrack(outArray);
    //Write the output to file
    fs.writeFile('trackData.js',pre + JSON.stringify(outArray) + post, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
}

/**
 * Calculates the lat or long of a point on the line between two given points.
 * @param {number} val1 - The lat/long of the first point.
 * @param {number} val2 - The lat/long of the second point.
 * @param {number} numSplits - The number of times the line is being split.
 * @param {number} split - The nth split. Which split do you want.
 */
function splitLatLong(val1, val2, numSplits, split) {
    var diff = val1 - val2;
    var diffOverSplits = diff / numSplits;
    return val1 - (diffOverSplits * split);
}

    // Third party code: converts GPS coords to distance in meters 
function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

function convertDecimalLat(latitude) {
    // 50.844387113217294
    let decimalMinutes = latitude % 1;
    let degrees = latitude - decimalMinutes;
    let minutes = decimalMinutes * 60

    return '+' + degrees.toString() + minutes.toFixed(4);
}

function convertDecimalLon(longitude) {
    // -0.9373385565621511
    let decimalMinutes = longitude % 1;
    let degrees = longitude - decimalMinutes;
    let minutes = decimalMinutes * 60

    return '-00' + degrees.toString() + minutes.toFixed(4).slice(1);
}

// `666,R,+0000.0000,+00000.0000,000.00,0.00,000000.000,V
function writeCSV (coordinates) {
    var csvFileStringToWrite = '';

    for(i=1; i<coordinates.length; i++) {
        var nodeID = nodeId;
        var nodeType = 'R';
        var latitude = convertDecimalLat(coordinates[i][1]);
        var longitude = convertDecimalLon(coordinates[i][0]);
        var courseOverGround = geo.bearing(coordinates[i-1][1],coordinates[i-1][0],coordinates[i][1], coordinates[i][0]).toFixed(2);
        var speedOverGround = Math.round(Math.random()).toString() + Math.floor(Math.random() * 9).toString() + '.' + Math.floor(Math.random() * 9).toString();
        var datetime = '130000.000';
        var gpsValid = 'V'

        var csvString = nodeID + ',' + nodeType + ',' + latitude + ',' +
            longitude + ',' + courseOverGround + ',' + speedOverGround + ',' + datetime + ',' +
            gpsValid + "\n" ;
        csvFileStringToWrite += csvString;

    }
    

    //Write the output to file
    fs.writeFile('tracks/better-tracks/track' + trackVal + '.csv', csvFileStringToWrite, (err) => {
        if (err) throw err;
        console.log('The CSV file has been saved!');
      });
}

function writeTrack (coordinates) {

    track.properties.boatId = nodeId;

    for(i=1; i<coordinates.length; i++) {
        var latitude = coordinates[i][1];
        var longitude = coordinates[i][0];
        var courseOverGround = geo.bearing(coordinates[i-1][1],coordinates[i-1][0],latitude, longitude);
        var speedOverGround = 10;
        var datetime = 1508274488 + i;

        track.geometry.coordinates.push([longitude, latitude]);
        track.properties.times.push(datetime);
        track.properties.speeds.push(speedOverGround);
        track.properties.bearings.push(courseOverGround);       
    }
    

    //Write the output to file
    fs.writeFile('tracks/geoJson-tracks/track' + trackVal + '.json', JSON.stringify(track), (err) => {
        if (err) throw err;
        console.log('The track file has been saved!');
      });
}


var geo = {
    /**
     * Calculate the bearing between two positions as a value from 0-360
     *
     * @param lat1 - The latitude of the first position
     * @param lng1 - The longitude of the first position
     * @param lat2 - The latitude of the second position
     * @param lng2 - The longitude of the second position
     *
     * @return int - The bearing between 0 and 360
     */
    bearing : function (lat1,lng1,lat2,lng2) {
        var dLon = this._toRad(lng2-lng1);
        var y = Math.sin(dLon) * Math.cos(this._toRad(lat2));
        var x = Math.cos(this._toRad(lat1))*Math.sin(this._toRad(lat2)) - Math.sin(this._toRad(lat1))*Math.cos(this._toRad(lat2))*Math.cos(dLon);
        var brng = this._toDeg(Math.atan2(y, x));
        return ((brng + 360) % 360);
    },

   /**
     * Since not all browsers implement this we have our own utility that will
     * convert from degrees into radians
     *
     * @param deg - The degrees to be converted into radians
     * @return radians
     */
    _toRad : function(deg) {
         return deg * Math.PI / 180;
    },

    /**
     * Since not all browsers implement this we have our own utility that will
     * convert from radians into degrees
     *
     * @param rad - The radians to be converted into degrees
     * @return degrees
     */
    _toDeg : function(rad) {
        return rad * 180 / Math.PI;
    },
};