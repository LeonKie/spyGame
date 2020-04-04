// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Mit dieser zusätzlichen Zeile bringen wir Socket.io in unseren Server.
var io = require('socket.io')(server);

// Mit diesem Kommando starten wir den Webserver.
var port = process.env.PORT || 3000;
server.listen(port, function () {
  // Wir geben einen Hinweis aus, dass der Webserer läuft.
  console.log('Webserver läuft und hört auf Port %d', port);
});

// Hier teilen wir express mit, dass die öffentlichen HTML-Dateien
// im Ordner "public" zu finden sind.
app.use(express.static(__dirname + '/public'));

// === Ab hier folgt der Code für den Chat-Server

//server database

var data = require("./data.json");
let game ={
  'player': [],
  'ready': [],
  'fake': "",
  'hiddenWord': "",
  'numPlayer': 3
}
//var data = JSON.parse("data.json");
var word_list=data["words"];
console.log(word_list.le);
// Hier sagen wir Socket.io, dass wir informiert werden wollen,
// wenn sich etwas bei den Verbindungen ("connections") zu 
// den Browsern tut. 
io.on('connection', function (socket) {
  // Die variable "socket" repräsentiert die aktuelle Web Sockets
  // Verbindung zu jeweiligen Browser client.
  
  // Kennzeichen, ob der Benutzer sich angemeldet hat 
  var addedUser = false;

  socket.on("setMaxPeople", function (maxP) {
    console.log("Settings Updated")
    game.numPlayer=maxP;
    console.log(game);
    socket.broadcast.emit("players_ready",game);
  })

  // Funktion, die darauf reagiert, wenn sich der Benutzer anmeldet
  socket.on('add user', function (username) {
    // Benutzername wird in der aktuellen Socket-Verbindung gespeichert
    socket.username = username;
    
    if (game.player.includes(username)) {
      console.log(username + " already exists!");
    }
    game.player.push(username);

    addedUser = true;
    // Dem Client wird die "login"-Nachricht geschickt, damit er weiß,
    // dass er erfolgreich angemeldet wurde.
    socket.emit('login');
    socket.emit("players_ready",game);
    // Alle Clients informieren, dass ein neuer Benutzer da ist.
    socket.broadcast.emit('user joined', username);
    
    console.log(game)
  });

  // Funktion, die darauf reagiert, wenn ein Benutzer eine Nachricht schickt
  socket.on('new message', function (data) {
    // Sende die Nachricht an alle Clients
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });



  socket.on("newRound", function () {
    socket.emit("newRound");
    socket.emit("players_ready", game);
  });

  socket.on('switchready',function () {
    if (!game.ready.includes(socket.username)){
      game.ready.push(socket.username);
      console.log(game);
    }else{
      var ip = game.ready.indexOf(socket.username);
      if (ip > -1){
        game.ready.splice(ip,1);
      }
    }
    console.log("Switching status: "+ game.ready);
    socket.emit("players_ready", game)
    socket.broadcast.emit('players_ready', game);

    //check if we are ready to play
    if (game.numPlayer<=game.ready.length){
      var item = word_list[Math.floor(Math.random() * word_list.length)];
      var pfake = game.ready[Math.floor(Math.random() * game.ready.length)];
      game.hiddenWord=item;
      game.fake=pfake;
      console.log("Starting game");
      console.log(game);
      socket.emit("start_game",game);
      socket.broadcast.emit("start_game",game);

      //reste game.ready array

      game.ready=[];
      game.fake="";
      game.hiddenWord="";
    }



  });

  // Funktion, die darauf reagiert, wenn sich ein Benutzer abmeldet.
  // Benutzer müssen sich nicht explizit abmelden. "disconnect"
  // tritt auch auf wenn der Benutzer den Client einfach schließt.
  socket.on('disconnect', function () {
    if (addedUser) {
      // Alle über den Abgang des Benutzers informieren
      const ip= game.player.indexOf(socket.username);
      if (ip > -1){
        game.player.splice(ip,1);
      }

      const ir= game.ready.indexOf(socket.username);
      if (ir > -1){
        game.ready.splice(ir,1);
      }
 
      console.log(game)
      socket.broadcast.emit('user left', socket.username);
      socket.broadcast.emit('players_ready',game);
    }
  });
});