var express = require('express');
var router = express.Router();
//var dbus = require('dbus-native');
var sys = require('sys');
var exec = require('child_process').exec;

//------------------------------------------------------------------------------
// Parse DBUS output of current song
//
// @param string : the DBUS array output as string
//
// @return object : all the values available
//
function parseSong(sResult){
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
}

//------------------------------------------------------------------------------
// Parse Volume output of system
//
// @param string : the volume output of the Master
//
// @return object : Volume information
//
function parseVolume(sVolume){
	var oRes = {};
	var lStart = 0;
	var lEnd = 0;
	for(var i = 0; i < 3; i++){
		lStart = sVolume.indexOf("[", lEnd) + 1;
		lEnd = sVolume.indexOf("]", lStart);
		oRes[i] = sVolume.substr(lStart, lEnd - lStart);
	}
	return oRes;
}

//------------------------------------------------------------------------------
// Parse Elapsed output of current song
//
// @param string : the elapsed output of the song
//
// @return object : elapsed information
//
function parseElapsed(sElapsed){
	return parseFloat(sElapsed.substr(sElapsed.indexOf("double ") + 7));
}

//------------------------------------------------------------------------------
// API routes
//
// TODO:
// -> currently calling console to perform command
// -> dbus-native already installed, ready to use
//
router.get('/', function(req, res) {
	var oInfo = {};
	var oVolume = {};
	var lElapsed = 0;
	exec("amixer get Master", function(err, stdio, stder){
		oVolume = parseVolume(stdio);
	});
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.GetPosition", function(err, stdio, stder){
		lElapsed = parseElapsed(stdio);
	});
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
		oInfo = parseSong(stdio);
		res.send({volume: oVolume, result: oInfo, elapsed: lElapsed});
	});
});

router.get('/next', function(req, res) {
	exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:NextSong", function(err, stdio, stder){});
	var oInfo = {};
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
		oInfo = parseSong(stdio);
		res.send({result: oInfo});
	});
});

router.get('/prev', function(req, res) {
	exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:PrevSong", function(err, stdio, stder){});
	var oInfo = {};
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
		oInfo = parseSong(stdio);
		res.send({result: oInfo});
	});
});

router.get('/playpause', function(req, res) {
	exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:PlayPause", function(err, stdio, stder){});
	var oInfo = {};
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
		oInfo = parseSong(stdio);
		res.send({result: oInfo});
	});
});

router.get('/volumedec', function(req, res) {
	exec("amixer set Master 5%-", function(err, stdio, stder){});
	exec("amixer get Master", function(err, stdio, stder){
		res.send({result: parseVolume(stdio)});
	});
});

router.get('/volumeinc', function(req, res) {
	exec("amixer set Master 5%+", function(err, stdio, stder){});
	exec("amixer get Master", function(err, stdio, stder){
		res.send({result: parseVolume(stdio)});
	});
});

module.exports = router;
