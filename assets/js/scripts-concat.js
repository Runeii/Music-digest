'use strict';

var creds = {
    'lastfm': {
        'user': 'guys_eyes',
        'key': 'abd35684573cd5fb341b366cfe4bed7a',
        'secret': '4300b0053d0c6078afb72251a4ed61aa'
    }
};
var temp = [];
var i = 0;

function lastfmArtists() {
    return JSON.parse(localStorage.getItem('lastfm_artists'));
}
function lastfmArtistsDetails() {
    return JSON.parse(localStorage.getItem('lastfm_artists_details'));
}
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}
function getLastFM(callback) {
    //Check if we've already pulled the data and stored it
    if (localStorage.getItem('lastfm_artists')) {
        callback();
    } else {
        pullLastFMLibrary(null, callback);
    }
}
function pullLastFMLibrary(remoteData, callback) {
    if (remoteData === null) {
        i = 1;
        $.getJSON('http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=' + creds.lastfm.key + '&user=' + creds.lastfm.user + '&format=json&limit=1000', function (remoteData) {
            pullLastFMLibrary(remoteData, callback);
        });
    } else {
        Array.prototype.push.apply(temp, remoteData.artists.artist);
        i++;
        //We might not be done: if pages remain, pull data and loop back round
        if (i <= remoteData.artists['@attr'].totalPages && i < 1) {
            $.getJSON('http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=' + creds.lastfm.key + '&user=' + creds.lastfm.user + '&format=json&limit=1000&page=' + i, function (remoteData) {
                pullLastFMLibrary(remoteData, callback);
            });
        } else {
            localStorage.setItem('lastfm_artists', JSON.stringify(temp));
            temp = [];
            callback();
        }
    }
}
function pullLastFMArtistDetails(callback) {
    if (!localStorage.getItem('lastfm_artists')) {
        var details = [];
        var dataset = [];
        temp = lastfmArtists();
        temp.length = 5;
        var i = 0;
        temp.forEach(function (e) {
            var lastpage = Math.ceil(e.playcount / 50);
            $.getJSON('http://ws.audioscrobbler.com/2.0/?method=user.getartisttracks&api_key=' + creds.lastfm.key + '&user=' + creds.lastfm.user + '&artist=' + encodeURI(e.name) + '&page=' + lastpage + '&format=json', function (remoteData) {
                var first = remoteData.artisttracks.track.pop();
                details.push({
                    name: e.name,
                    mbid: e.mbid,
                    playcount: e.playcount,
                    firstlisten: Date.UTC(first.date.uts),
                    firsttrack: {
                        name: first.name,
                        mbid: first.mbid,
                        album: first.album
                    }
                });
                i++;
                console.log(i + 'of' + temp.length);
                if (i == temp.length) {
                    localStorage.setItem('lastfm_artists_details', JSON.stringify(details));
                    temp = [];
                    callback();
                }
            });
        });
    } else {
        callback();
    }
}
function initialiseTimeline() {
    var details = lastfmArtistsDetails();
    var dataset = new vis.DataSet();
    details.forEach(function (e) {
        dataset.add({
            label: e.name,
            y: e.playcount,
            x: e.firstlisten,
            group: 1
        });
    });
    var container = document.createElement('container');
    document.body.appendChild(container);

    var Graph2d = new vis.Graph2d(container, dataset);
}

if (storageAvailable('localStorage')) {
    getLastFM(function (artists) {
        pullLastFMArtistDetails(function () {
            initialiseTimeline();
        });
    });
} else {
    console.log('No local storage, need to set up fallback');
}
