var express = require('express');
var router = express.Router();
var dbus = require('dbus-native');
var sys = require('sys');
var exec = require('child_process').exec;

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

router.get('/', function(req, res) {
	var oInfo = {};
	exec("dbus-send --print-reply --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.CurrentSong", function(err, stdio, stder){
		oInfo = parseSong(stdio);
		res.send({result: oInfo});
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
	exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:DecVolume", function(err, stdio, stder){});
});

router.get('/volumeinc', function(req, res) {
	exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:IncVolume", function(err, stdio, stder){});
});

module.exports = router;
