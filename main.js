var tick = new Audio('tick.ogg');
var timeInterval = Math.floor((Math.random() * 40) + 40) * 10;
var gameBeat = 0, beat = 0;
var audioStartTime = 0;
var gameStarted = false;
var gameStartTimeSet = false;
var beats = [];
var clicks = [];
var realclicks = [];
var totalGameTime = 5000;
var userName = "Anonymous";
var leaderboard = [];

function standardDeviation(values){
    var avg = average(values);

    var squareDiffs = values.map(function(value){
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
    });

    var avgSquareDiff = average(squareDiffs);

    var stdDev = Math.sqrt(avgSquareDiff);
    if(avg<0)
        return -1 * stdDev;
    else
        return stdDev;
}

function average(data){
    var sum = data.reduce(function(sum, value){
       return sum + value;
    }, 0);

    var avg = sum / data.length;
    return avg;
}

function FadeTick() {
    tick.play();
    var dNow = new Date();
    var timeNow = dNow.getTime();
    if(gameStarted) {
        beats.push(timeNow);
    }
    if(timeNow - audioStartTime >= 5000) {
        document.getElementById("game_start_note").style.visibility = "visible";
        if(tick.volume >= 0.05) {
            tick.volume -= 0.05
        }
        else
            tick.volume = 0;
        if(tick.volume <= 0) {
            gameStarted = true;
        }
    }
}

function StartGame() {
    if(gameStarted == true) {
        if(!gameStartTimeSet) {
            var d = new Date();
            var gameStartTime = d.getTime();
            console.log("Game started!");
            gameStartTimeSet = true;
                setTimeout(function() {
                    clearInterval(gameBeat);
                    clearInterval(beat);
                    GameOver(); 
                }, totalGameTime);
                setTimeout(function() {
                    document.getElementById("game_midway_note").style.visibility = "visible";
                }, totalGameTime/2);
        }
    }
}

function StartAudio() {
    var d = new Date();
    audioStartTime = d.getTime();
    tick.volume = 1;
    gameBeat = setInterval(StartGame, 10);
    beat = setInterval(FadeTick, timeInterval);
    console.log(timeInterval);
}

function SyncClickStart() {
    var diffs = []
    if(clicks.length > 0) {
        for(var i=0 ; i<clicks.length ; i++) {
            var diff = beats[0] - clicks[i];
            diffs.push(Math.abs(diff));
        }
        var index = 0;
        var minvalue = diffs[0];
        for(var i=0 ; i<diffs.length ; i++) {
            if(diffs[i] < minvalue) {
                minvalue = diffs[i];
                index = i;
            }
        }
        for(var i=0 ; i<beats.length ; i++) {
            beats[i] -= beats[0] - clicks[index];
        }
        for(var i=index ; i<clicks.length ; i++) {
            realclicks.push(clicks[i]);
        }
    }
}

function CreateGraph(diffs) {
    for (var i=0 ; i<diffs.length ; i++) {
        var row = '<div class="'
        if(diffs[i] == 'NA')
            row = '<div class="ext pos"><div style="width: 0%;" class="bar"></div></div>'
        else if(diffs[i] < 0)
            row = row + 'ext neg"><div style="width:' + Math.ceil((Math.abs(diffs[i]) * 100) / timeInterval) + '%;" class="bar"></div></div>'
        else
            row = row + 'ext pos"><div style="width:' + Math.ceil((Math.abs(diffs[i]) * 100) / timeInterval) + '%;" class="bar"></div></div>'
        $("#results-graph").append(row);
    }
}

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  xhr.setRequestHeader('Content-Type', 'application/json')
  return xhr;
}

// Helper method to parse the title tag from the response.
function getTitle(text) {
  return text.match('<title>(.*)?</title>')[1];
}

// Make the actual CORS request.
function makeCorsRequest(url, method, params) {
  // All HTML5 Rocks properties support CORS.

  var xhr = createCORSRequest(method, url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  xhr.onreadystatechange = function() {
    if(method == 'GET') {
        if(xhr.readyState == XMLHttpRequest.DONE) {
            getLeaderboard(xhr.responseText)
        }
    }
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    var title = getTitle(text);
    console.log('Response from CORS request to ' + url + ': ' + title);
  };

  xhr.onerror = function() {
    console.log('Woops, there was an error making the request.');
  };

  if(params != null) {
      xhr.send(params);
    }
  else {
    xhr.send();
  }
}

function getLeaderboard(jsonString) {
    jsonString = '[{"model": "website.holdthebeat", "pk": 116, "fields": {"username": "arpan", "score": 750}}, {"model": "website.holdthebeat", "pk": 117, "fields": {"username": "arpan", "score": 500}}, {"model": "website.holdthebeat", "pk": 118, "fields": {"username": "Anonymous", "score": 376}}, {"model": "website.holdthebeat", "pk": 119, "fields": {"username": "arpan", "score": 341}}, {"model": "website.holdthebeat", "pk": 120, "fields": {"username": "Anonymous", "score": 309}}, {"model": "website.holdthebeat", "pk": 121, "fields": {"username": "arpan", "score": 300}}, {"model": "website.holdthebeat", "pk": 122, "fields": {"username": "Anonymous", "score": 257}}, {"model": "website.holdthebeat", "pk": 123, "fields": {"username": "arpan", "score": 190}}, {"model": "website.holdthebeat", "pk": 124, "fields": {"username": "Anonymous", "score": 185}}, {"model": "website.holdthebeat", "pk": 125, "fields": {"username": "arpan", "score": 165}}]'
    var leaderboard_list = JSON.parse(jsonString);
    var table = document.getElementById("leaderboard");
    for (var i=0 ; i<leaderboard_list.length ; i++) {
        row=document.createElement("tr");
        cell1 = document.createElement("td");
        cell2 = document.createElement("td");
        cell3 = document.createElement("td");
        textnode1 = document.createTextNode(i + 1);
        textnode2 = document.createTextNode(leaderboard_list[i].fields.username);
        textnode3 = document.createTextNode(leaderboard_list[i].fields.score);
        cell1.appendChild(textnode1);
        cell2.appendChild(textnode2);
        cell3.appendChild(textnode3);
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        table.appendChild(row);
    }
}

function GameOver() {
    var diffs = []
    console.log("Game over!");
    SyncClickStart();
    if(realclicks.length > 0) {
        if(realclicks.length >= beats.length) {
            for(var i=0 ; i<beats.length ; i++) {
                var diff = beats[i] - realclicks[i];
                diffs.push(diff);
            }
        }
        else {
            for(var i=0 ; i<realclicks.length ; i++) {
                var diff = beats[i] - realclicks[i];
                diffs.push(diff);
            }
            for(i=realclicks.length ; i<beats.length ; i++) {
                diff = timeInterval;
                diffs.push(diff);
            }
        }
        console.log(diffs);
        var avg = standardDeviation(diffs);
        console.log("Average = " + avg);
        var newdiffs = [];
        var newabsdiffs = [];
        for(var i=0 ; i<diffs.length ; i++) {
            newdiffs.push(diffs[i] - avg);
            newabsdiffs.push(Math.abs(diffs[i] - avg));
        }
        console.log(newdiffs);
        var deviation = standardDeviation(newabsdiffs);
        var score = Math.floor(10000/deviation);
        console.log(deviation);
            CreateGraph(newdiffs);
    }
    else
        var score = 0;
    data = {"username": userName, "score": score}

    makeCorsRequest("http://www.kibo.in/holdthebeat/highscore", 'POST', JSON.stringify(data));

    makeCorsRequest("http://www.kibo.in/holdthebeat/highscore", 'GET', null);

    $(".remove-when-score").remove();
    $(".score").show();
    $(".score-value").text(score);
}


$(document).ready(function() {
    userName = prompt("Please enter your name for leaderboard", "Anonymous");
    if(userName == null) {
        userName = "Anonymous";
    }
    StartAudio();
})

document.onclick = function(event) {
    var d = new Date();
    var t = d.getTime();
    clicks.push(t);
}