var coordinates = [
    [-0.9374427795410155,50.844456794368675],
    [-0.935983657836914,50.843481258249376],
    [-0.9365844726562499,50.843128976304584]
];

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

/** Usage **/
var myInitialBearing = geo.bearing(coordinates[0][1],coordinates[0][0],coordinates[1][1],coordinates[1][0]);
console.log(myInitialBearing);