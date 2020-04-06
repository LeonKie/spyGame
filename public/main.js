$(function () {
    // Hilfsvariablen für HTML-Elemente werden mit Hilfe von JQuery gesetzt.
    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Eingabefeld für Benutzername
    var $messages = $('.messages');           // Liste mit Chat-Nachrichten
    var $inputMessage = $('.inputMessage');   // Eingabefeld für Chat-Nachricht
    var $loginPage = $('.login.page');        // Login-Seite
    var $chatPage = $('.chat.page');          // Chat-Seite
    var $readylist = $('.readylist'); 
    var $ownWord = $('.ownWord');
    var $waiting_page = $('.waiting_page');
    var $role = $('.role');
    var $word = $('.word');
         

    var username;                             // Aktueller Benutzername
    var connected = false;                    // Kennzeichen ob angemeldet
    
    // Eingabefeld für Benutzername erhält den Fokus
    var $currentInput = $usernameInput.focus();
    
    // Socket.io Objekt anlegen
    var socket = io();
  
    // ==== Code für Benutzerschnittstelle
  
    // Tastendruck behandeln
    $window.keydown(function (event) {
      // Die Return-Taste (Ascii 13) behandeln wir speziell
      if (event.which === 13) {
        if (username) {
          // Wenn der Benutzername schon gesetzt ist, handelt es sich
          // um eine Chat-Nachricht.
          sendMessage();
        } else {
          // Wenn der Benutzername noch nicht gesetzt ist, hat sich
          // der Benutzer gerade angemeldet.
          setUsername();
        }
      }
    });

    $(".readyButton").click(function (event) {
      socket.emit("switchready");
      console.log("Emit Is ready");
    });

    $(".newRound").click(function (event) {
      console.log("Emit Is ready")
      socket.emit("newRound");
    });

    socket.on("players_ready", function (game) {
      let players_ready = game.ready;
      console.log(players_ready)
      var name="["+players_ready.length +"/"+ game.numPlayer+"]";
      console.log(name)
      for (var p in players_ready){
        //var $usernameDiv = $('<span class="pReady"/>').text(players_ready[p]);
        //var $messageDiv = $('<li class="message"/>').append($usernameDiv);
        name=name+ " "+  players_ready[p];
      }

      $readylist.text(name);
     
    })

    socket.on("start_game",function (game) {
        $(".wp-content").css({"display":"none"});
        startTimer(game);
        
        
    })
    socket.on("newRound",function (players_ready) {
      $role.text("");
      $word.text("");
      gowaitRoom();
    })

    function gowaitRoom() {
      if (username) {
        // Loginmaske ausblenden und Chat-Seite einblenden
        $loginPage.fadeOut();
        $ownWord.fadeOut();
        $chatPage.css({"display": "flex"});
        $waiting_page.css({"display": "flex"});
        $(".wp-content").show();
  
        // Chat-Nachricht wird neues, aktuelles Eingabefeld
        $currentInput = $inputMessage.focus();
  
        // Server mit Socket.io über den neuen Benutzer informieren. Wenn die
        // Anmeldung klappt wird der Server die "login"-Nachricht zurückschicken.
      }
      
    }

    // Benutzername wird gesetzt
    function setUsername() {
      // Benutzername aus Eingabefeld holen (ohne Leerzeichen am Anfang oder Ende).
      username = $usernameInput.val().trim();
  
      // Prüfen, ob der Benutzername nicht leer ist
      if (username) {
        // Loginmaske ausblenden und Chat-Seite einblenden
        $loginPage.fadeOut();
        $chatPage.css({"display": "flex"});
        $waiting_page.css({"display": "flex"});
  
        // Chat-Nachricht wird neues, aktuelles Eingabefeld
        $currentInput = $inputMessage.focus();
  
        // Server mit Socket.io über den neuen Benutzer informieren. Wenn die
        // Anmeldung klappt wird der Server die "login"-Nachricht zurückschicken.
        socket.emit('add user', username);
      }
    }
  
    // Chat-Nachricht versenden
    function sendMessage() {
      // Nachricht aus Eingabefeld holen (ohne Leerzeichen am Anfang oder Ende).
      var message = $inputMessage.val().trim();
  
      // Prüfen, ob die Nachricht nicht leer ist und wir verbunden sind.
      if (message && connected) {
        // Eingabefeld auf leer setzen
        $inputMessage.val('');
  
        // Chat-Nachricht zum Chatprotokoll hinzufügen
        addChatMessage({ username: username, message: message });
        
        // Server über neue Nachricht informieren. Der Server wird die Nachricht
        // an alle anderen Clients verteilen.
        socket.emit('new message', message);
      }
    }
  
    // Protokollnachricht zum Chat-Protokoll anfügen
    function log(message) {
      var $el = $('<li>').addClass('log').text(message);
      $messages.append($el);
    }
  
    // Chat-Nachricht zum Chat-Protokoll anfügen
    function addChatMessage(data) {
      var $usernameDiv = $('<span class="username"/>').text(data.username);
      var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
      var $messageDiv = $('<li class="message"/>').append($usernameDiv, $messageBodyDiv);
      $messages.append($messageDiv);
    }
  
    // ==== Code für Socket.io Events
  
    // Server schickt "login": Anmeldung war erfolgreich
    socket.on('login', function (data) {
      connected = true;
      log("Willkommen beim Chat!");
    });
  
    // Server schickt "new message": Neue Nachricht zum Chat-Protokoll hinzufügen
    socket.on('new message', function (data) {
      addChatMessage(data);
    });
  
    // Server schickt "user joined": Neuen Benutzer im Chat-Protokoll anzeigen
    socket.on('user joined', function (data) {
      log(data + ' joined');
    });
  
    // Server schickt "user left": Benutzer, der gegangen ist, im Chat-Protokoll anzeigen
    socket.on('user left', function (data) {
      log(data + ' left');
    });


    function starteGame(game) {
        $chatPage.fadeOut();
        $waiting_page.fadeOut();
        $ownWord.css({"display": "flex"});
        console.log(username + "  " + game.fake);
        if (username==game.fake) {
          $role.text("Fake");
          console.log("Fake!!");
        }else{
          $word.text(game.hiddenWord);
          console.log(game.hiddenWord);
        } 
    }

    function startTimer(game) {
        $('.count-down').css({"display": "flex"});
        var counterDown = setInterval(function () {
          var counter=parseInt($(".timer").text());
          console.log(counter);
          if (counter !== 0) {
              $(".timer").text(counter-1)
              if (counter === 5) {
                  $(".count-down").css({
                      backgroundColor: "orange"
                  });
              } else if (counter === 2) {
                  $(".count-down").css({
                      backgroundColor: "red"
                  });
              }
          } else {
              clearInterval(counterDown);
              $(".count-down").css({
                backgroundColor: "darkcyan"
              });
              $('.count-down').fadeOut();
              $(".timer").text(10)
              starteGame(game)
              
          }
      }, 500);
    }

  });
