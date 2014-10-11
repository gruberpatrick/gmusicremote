module.exports = {

	//------------------------------------------------------------------------------
	// Parse the Signal output
	//
	// @param string : the signal string
	//
	// @return string : the signal method
	//
	parseSignal: function(sSignal){

		// get Method
		var lStart = sSignal.indexOf("member=") + 7;
		var lEnd = sSignal.indexOf("\n", lStart);
		return sSignal.substr(lStart, lEnd - lStart);

	},

	//------------------------------------------------------------------------------
	// Parse DBUS output of current song
	//
	// @param string : the DBUS array output as string
	//
	// @return object : all the values available
	//
	parseSong: function(sResult){
		var oRes = {};
		var aParsed = sResult.split("dict entry(");
		for(var i = 0; i < aParsed.length; i++){
			var lStart = aParsed[i].indexOf("string \"") + 8;
			var lEnd = aParsed[i].indexOf("\"", lStart);
			var sIndex = aParsed[i].substr(lStart, lEnd - lStart);
			if(sIndex == ""){
				continue;
			}
			lStart = aParsed[i].indexOf("string \"", lEnd) + 8;
			lEnd = aParsed[i].indexOf("\"", lStart);
			var sValue = aParsed[i].substr(lStart, lEnd - lStart);
			oRes[sIndex] = sValue;
		}
		return oRes;
	},

	//------------------------------------------------------------------------------
	// Parse Volume output of system
	//
	// @param string : the volume output of the Master
	//
	// @return object : Volume information
	//
	parseVolume: function(sVolume){
		var oRes = {};
		var lStart = 0;
		var lEnd = 0;
		for(var i = 0; i < 3; i++){
			lStart = sVolume.indexOf("[", lEnd) + 1;
			lEnd = sVolume.indexOf("]", lStart);
			oRes[i] = sVolume.substr(lStart, lEnd - lStart);
		}
		return oRes;
	},

	//------------------------------------------------------------------------------
	// Parse Elapsed output of current song
	//
	// @param string : the elapsed output of the song
	//
	// @return object : elapsed information
	//
	parseElapsed: function(sElapsed){
		return parseFloat(sElapsed.substr(sElapsed.indexOf("double ") + 7));
	},

	//------------------------------------------------------------------------------
	// Parse Playing output of current song
	//
	// @param bool : if song is playing
	//
	parsePlaying: function(sPlaying){
		return sPlaying.substr(sPlaying.indexOf("boolean ") + 8).trim();
	},

	//------------------------------------------------------------------------------
	// Load the general Information of the current song
	//
	// @param object : the result object for the final output
	//
	loadGeneralInformation: function(res){

		var oInfo = {};
		var oVolume = {};
		var lElapsed = 0;
		var bPlaying = "false";
		var oThat = this;
		exec("amixer get Master", function(err, stdio, stder){
			oVolume = oThat.parseVolume(stdio);
			exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.GetPosition", function(err, stdio, stder){
				lElapsed = oThat.parseElapsed(stdio);
				exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.Playing", function(err, stdio, stder){
					bPlaying = oThat.parsePlaying(stdio);
					exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
						oInfo = oThat.parseSong(stdio);
						if(typeof res != "undefined"){
							res.send({volume: oVolume, result: oInfo, elapsed: lElapsed, playing: bPlaying, settings: settings});
						}else{
							oThat.sendSocket({volume: oVolume, result: oInfo, elapsed: lElapsed, playing: bPlaying});
						}
					});
				});
			});
		});

	},

	//------------------------------------------------------------------------------
	// Send the WebSocket information to the App
	//
	// @param object : the data to send
	//
	sendSocket: function(oData){

		for(var i = 0; i < aConnection.length; i++){
			if(aConnection[i] != null){
				aConnection[i].sendUTF(JSON.stringify(oData));
			}
		}

	}

};
