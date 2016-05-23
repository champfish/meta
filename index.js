var tweets = [];
var waitingForTweet = false;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var twitter = require('ntwitter');
consumerKey = 'QUTeR77aWTADBtGVK6VmFpWzG';
consumerKeySecret = '9mjf5xY1wIJhwAQVqdQI6B50XMo982652GB8f7gRaW58qOrAJe';
accessToken = '4698572058-1nQm5QX8FEbFP3xOxU1JoM0eX4G7A1k1wm8ZLaE';
accessTokenSecret = 'wVMZjvZiFZGZtBrRR7iIPpWO5NnbJLaSiDhKIirDUSTMu';
var t = new twitter({
    consumer_key: consumerKey,
    consumer_secret: consumerKeySecret,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
});
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/goldpicture.png', function (req, res) {
    res.sendFile(__dirname + '/goldpicture.png');
});

app.get('/newappleperfect.png', function (req, res) {
    res.sendFile(__dirname + '/newappleperfect.png');
});

app.get('/picframed1.png', function (req, res) {
    res.sendFile(__dirname + '/picframed1.png');
});

app.get('/resizedperfectviolin222.png', function (req, res) {
    res.sendFile(__dirname + '/resizedperfectviolin222.png');
});

app.get('/theroom.png', function (req, res) {
    res.sendFile(__dirname + '/theroom.png');
});

io.on('connection', function (socket) {
    socket.on('choice', function (choice) {
        tweets.splice(0, 1);
        waitingForTweet = true;
    });
    loadLists();
    waitingForTweet = true;
    setInterval(function () {
        checkTweets(socket);
    }, 3000);
});

var iso = [];
var fam = [];
var ego = [];
var soc = [];
function loadLists() {
    fs.readFile(__dirname + '/iso.txt', 'utf-8', function (err, data) {
        if (err !== null) {
            console.log(err);
        } else {
            var list = ("" + data).split(" ");
            for (i = 0; i < list.length; i += 2) {
                iso.push({name: list[i], number: list[i + 1]});
            }
        }
    });
    fs.readFile(__dirname + '/fam.txt', 'utf-8', function (err, data) {
        if (err !== null) {
            console.log(err);
        } else {
            var list = ("" + data).split(" ");
            for (i = 0; i < list.length; i += 2) {
                fam.push({name: list[i], number: list[i + 1]});
            }
        }
    });
    fs.readFile(__dirname + '/ego.txt', 'utf-8', function (err, data) {
        if (err !== null) {
            console.log(err);
        } else {
            var list = ("" + data).split(" ");
            for (i = 0; i < list.length; i += 2) {
                ego.push({name: list[i], number: list[i + 1]});
            }
        }
    });
    fs.readFile(__dirname + '/soc.txt', 'utf-8', function (err, data) {
        if (err !== null) {
            console.log(err);
        } else {
            var list = ("" + data).split(" ");
            for (i = 0; i < list.length; i += 2) {
                soc.push({name: list[i], number: list[i + 1]});
            }
        }
    });
}

function checkTweets(socket) {
    if (!waitingForTweet || tweets.length === 0) {
        return;
    }
    text = tweets[0];
    isoScore = 0;
    famScore = 0;
    egoScore = 0;
    socScore = 0;
    for (i = 0; i < iso.length; i++) {
        if (text.indexOf(iso[i].name) !== -1) {
            isoScore += iso[i].number;
        }
    }
    for (i = 0; i < fam.length; i++) {
        if (text.indexOf(fam[i].name) !== -1) {
            famScore += fam[i].number;
        }
    }
    for (i = 0; i < ego.length; i++) {
        if (text.indexOf(ego[i].name) !== -1) {
            egoScore += ego[i].number;
        }
    }
    for (i = 0; i < soc.length; i++) {
        if (text.indexOf(soc[i].name) !== -1) {
            socScore += soc[i].number;
        }
    }
    console.log(isoScore + " " + famScore + " " + egoScore + " " + socScore);
    var type = "";
    if (isoScore >= famScore && isoScore >= egoScore && isoScore >= socScore) {
        type = "Isolation";
    } else if (famScore >= egoScore && famScore >= socScore) {
        type = "Filial Piety";
    } else if (egoScore >= socScore) {
        type = "Solecism";
    } else {
        type = "Distress with Society";
    }
    socket.emit('tweet', type + ": " + text);
    waitingForTweet = false;
}

http.listen(9000, function () {
    console.log('listening on port 9000');
});

var keyWords = ['alone', 'family', 'society', 'world'];
t.stream('statuses/filter', {track: keyWords}, function (stream) {
    stream.on('data', function (tweet) {
        if (tweet.text.indexOf('http') === -1) {
            tweets.push(tweet.text);
        }
    });
});
//Everything's connected, and everything has meaning if you look for it.
//fs.appendFile(__dirname + '/tweets.txt', tweet.text + '\r\n', function (err) {}