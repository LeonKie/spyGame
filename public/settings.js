$(function () {
    // Hilfsvariablen für HTML-Elemente werden mit Hilfe von JQuery gesetzt.
    var $window = $(window);
         
    
    // Eingabefeld für Benutzername erhält den Fokus
    var $currentInput = $(".input").focus();
    
    // Socket.io Objekt anlegen
    var socket = io();
  
    // ==== Code für Benutzerschnittstelle
  
    // Tastendruck behandeln
    $window.keydown(function (event) {
      // Die Return-Taste (Ascii 13) behandeln wir speziell
      if (event.which === 13) {
        console.log($(".input").val());
        socket.emit("setMaxPeople",parseInt($(".input").val()));

        $(".input").css({
          backgroundColor: "green" 
        });
      }
    });


  });