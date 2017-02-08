"use strict";function lastfmArtists(){return JSON.parse(localStorage.getItem("lastfm_artists"))}function lastfmArtistsDetails(){return JSON.parse(localStorage.getItem("lastfm_artists_details"))}function storageAvailable(a){try{var b=window[a],c="__storage_test__";return b.setItem(c,c),b.removeItem(c),!0}catch(a){return!1}}function getLastFM(a){localStorage.getItem("lastfm_artists")?a():pullLastFMLibrary(null,a)}function pullLastFMLibrary(a,b){null===a?(i=1,$.getJSON("http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key="+creds.lastfm.key+"&user="+creds.lastfm.user+"&format=json&limit=1000",function(a){pullLastFMLibrary(a,b)})):(Array.prototype.push.apply(temp,a.artists.artist),i++,i<=a.artists["@attr"].totalPages&&i<1?$.getJSON("http://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key="+creds.lastfm.key+"&user="+creds.lastfm.user+"&format=json&limit=1000&page="+i,function(a){pullLastFMLibrary(a,b)}):(localStorage.setItem("lastfm_artists",JSON.stringify(temp)),temp=[],b()))}function pullLastFMArtistDetails(a){if(localStorage.getItem("lastfm_artists_details"))a();else{var b=[];temp=lastfmArtists(),temp.length=100;var c=0;temp.forEach(function(d){var e=Math.ceil(d.playcount/50);$.getJSON("http://ws.audioscrobbler.com/2.0/?method=user.getartisttracks&api_key="+creds.lastfm.key+"&user="+creds.lastfm.user+"&artist="+encodeURI(d.name)+"&page="+e+"&format=json",function(e){if(e.artisttracks.track.length>0){var f=e.artisttracks.track.pop();b.push({name:d.name,mbid:d.mbid,playcount:d.playcount,firstlisten:new Date(f.date["#text"]),firsttrack:{name:f.name,mbid:f.mbid,album:f.album}}),c++,console.log(c+"of"+temp.length),c==temp.length&&(localStorage.setItem("lastfm_artists_details",JSON.stringify(b)),temp=[],a())}else c++,console.error("Issue with artist name: "+d.name+". Sent as "+encodeURI(d.name)),console.error(c+"of"+temp.length),c==temp.length&&(localStorage.setItem("lastfm_artists_details",JSON.stringify(b)),temp=[],a())})})}}function initialiseTimeline(){var a=lastfmArtistsDetails(),b=new vis.DataSet;a.forEach(function(a){b.add({title:a.name,y:a.playcount,start:a.firstlisten,tooltip:a.playcount})});var c={dataAttributes:["name","firsttrack.name"],type:"point",order:function(a){return a.playcount}},d=document.createElement("container");document.body.appendChild(d);new vis.Timeline(d,b,c)}var creds={lastfm:{user:"guys_eyes",key:"abd35684573cd5fb341b366cfe4bed7a",secret:"4300b0053d0c6078afb72251a4ed61aa"}},temp=[],i=0;storageAvailable("localStorage")?getLastFM(function(a){pullLastFMArtistDetails(function(){initialiseTimeline()})}):console.log("No local storage, need to set up fallback");