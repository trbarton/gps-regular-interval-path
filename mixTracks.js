var fs = require('fs');

var numberOfTracks = 10

var trackCSVs = {
    1: ''
}

var lengths = [];

for (i=1; i<=numberOfTracks; i++) {
    trackCSVs[i] = fs.readFileSync('tracks/better-tracks/track' + i + '.csv').toString().split("\n");
}

for (i=1; i<=numberOfTracks; i++) {
    lengths.push(trackCSVs[i].length);
}

var smallestLength = Math.min.apply(null, lengths);
console.log(smallestLength);
var csvFileStringToWrite = '';

for(j=0; j<smallestLength; j++) {
    for (i=1; i<=numberOfTracks; i++) {
        csvFileStringToWrite += trackCSVs[i][j];
        csvFileStringToWrite += "\n";
    }
}

//Write the output to file
fs.writeFile('mixedPositions.csv', csvFileStringToWrite, (err) => {
    if (err) throw err;
    console.log('The CSV file has been saved!');
  });
