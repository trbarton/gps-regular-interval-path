var fs = require('fs');

var obj;
//Reads the track.json object from file, Parses it as json then uses it as an argument
fs.readFile('track.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  splitPaths(obj.geometry.coordinates);
});

//Placeholder for the data to be written to file
var outArray = [];

//Maximum distance allowed between any two points 
var maxDistance = 10;

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
    //Write the output to file
    fs.writeFile('trackData.js',pre + JSON.stringify(outArray) + post, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
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