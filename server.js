var WebSocketServer = require('websocket').server;
exec = require('child_process').exec;
var http = require('http');
var controller = require('./includes/controller');
var oVolumeTimeout = null;
settings = require('./settings.json');
signals = require('./includes/signals');
aConnection = [];

var server = http.createServer(function(request, response) {});
server.listen(settings.server_port, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var oConnection = request.accept(null, request.origin);

    oConnection.on('message', function(message) {

			var oData = JSON.parse(message.utf8Data);

			if(typeof oData.volume != "undefined"){
				if(typeof oVolumeTimeout != "null"){
					clearTimeout(oVolumeTimeout);
				}
				controller.setVolume(oData.volume);
			}

			if(typeof oData.control != "undefined"){
				if(oData.control == "playpause")
					controller.playPause();
				else if(oData.control == "next")
					controller.nextSong();
				else if(oData.control == "prev")
					controller.prevSong();
			}

    });

    oConnection.on('close', function(connection) {
			for(var i = 0; i < aConnection.length; i++){
				if(aConnection[i] == oConnection){
					aConnection[i] = null;
				}
			}
		});

		aConnection.push(oConnection);
});

// check for changes and send Websocket if so
var proc = exec("dbus-monitor \"type='signal',sender='org.gmusicbrowser',interface='org.gmusicbrowser'\"");
proc.stdout.on("data", function(sSignal){
	sSignal = signals.parseSignal(sSignal);
	if(sSignal == "SongChanged"){
		signals.loadGeneralInformation();
	}
});

if(settings.experimental_functions){
	var sCurrentVolume = "";
	var bCurrentPlaying = false;
	exec("amixer get Master", function(err, stdio, stderr){
		sCurrentVolume = signals.parseVolume(stdio)[0];
	});
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.Playing", function(err, stdio, stderr){
		bCurrentPlaying = signals.parsePlaying(stdio);
	});
	setInterval(function(){

		var bChanged = false;
		exec("amixer get Master", function(err, stdio, stderr){
			var sSignal = signals.parseVolume(stdio)[0];
			if(sCurrentVolume != sSignal){
				bChanged = true;
				sCurrentVolume = sSignal;
			}
			if(bChanged){
				oVolumeTimeout = setTimeout(function(){ signals.loadGeneralInformation() }, 500);
			}else{
				exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.Playing", function(err, stdio, stderr){
					var bSignal = signals.parsePlaying(stdio);
					if(bCurrentPlaying != bSignal){
						bChanged = true;
						bCurrentPlaying = bSignal;
					}
					if(bChanged){
						signals.loadGeneralInformation();
					}
				});
			}
		});

	}, 1000);
}
