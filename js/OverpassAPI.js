/**
 * class OverpassAPI
 */
function OverpassAPI(loader, map) {
    this.loader = loader;
    this.map = map;
    this.bbox = null;
}

OverpassAPI.prototype.getSequenceUrl = function(sequence) {
    var s = sequence.toString();
    s = "000000000".substring(0, 9 - s.length) + s;
    var path = {
        a : s.substring(0, 3),
        b : s.substring(3, 6),
        c : s.substring(6, 9)
    };
    //var urlFormat = 'http://overpass-api.de/augmented_diffs/${a}/${b}/${c}.osc.gz';
    var urlFormat = 'http://overpass-api.de/augmented_diffs/id_sorted/${a}/${b}/${c}.osc.gz';
   
    var url = OpenLayers.String.format(urlFormat, path);
    return url;
};

OverpassAPI.prototype.getCurrentSequence = function () {
    var sequence = -1;
    var url = "http://overpass-api.de/augmented_diffs/state.txt";

    OpenLayers.Request.GET({
        url: url,
        async: false, 
        // do not send X-Requested-With header (option added by olex.Request-patch)
        disableXRequestedWith: true,
        success: function(request) {
            var response = request.responseText;
            if (response) {
                sequence = parseInt(response);
            } else {
                console.error('empty response for "' + url + '" (' + request.status + ' '
                        + request.statusText + ')');
            }
        }
    });        
    return sequence;
};

OverpassAPI.prototype.load = function(sequence, postLoadCallback) {
    var bboxParam;
    if (sequence && sequence >= 0) {
        var url = "http://overpass-api.de/api/augmented_diff?id=" + sequence;
        //var url = getSequenceUrl(sequence);
        if (!this.bbox) {
            this.bbox = map.getExtent().transform(map.getProjectionObject(), "EPSG:4326");
        }
        bboxParam = OpenLayers.String.format('&bbox=${left},${bottom},${right},${top}', this.bbox);
        //console.log("box = " + bboxParam);
        url += bboxParam;
        this.loader.GET({
            url: url,
            // do not zoom to data extent after load; option forwarded to load handler
            // (option only forwarded when using success event instead of callback)
            zoomToExtent: false,
            // do not send X-Requested-With header (option added by olex.Request-patch)
            disableXRequestedWith: true,
            postLoadCallback: postLoadCallback
        });
    } else {
        console.log('invalid sequence: "' + sequence + '"');
    }
};