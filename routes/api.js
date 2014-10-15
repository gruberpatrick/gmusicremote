var express = require('express');
var router = express.Router();
//var dbus = require('dbus-native');
var sys = require('sys');
var exec = require('child_process').exec;

//------------------------------------------------------------------------------
// API routes
//
// TODO:
// -> currently calling console to perform command
// -> dbus-native already installed, ready to use
//
router.get('/', function(req, res) {
	signals.loadGeneralInformation(res);
});

router.get('/process', function(req, res) {
	signals.loadGeneralInformation(res);
});

router.get('/search', function(req, res) {
	if(typeof req.query.s == "undefined"){
		res.send({result: functions.aAllSongs});
	}else{
		res.send({result: functions.searchSongs(req.query.s)});
	}
});

router.get('/play', function(req, res) {
	if(typeof req.query.p != "undefined"){
		exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:\"EnqueueFiles " + functions.getSong(req.query.p) + "\"", function(err, stdio, stder){
			exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:NextSong", function(err, stdio, stder){
				signals.loadGeneralInformation(res);
			});
		});
	}
});

router.get('/enqueue', function(req, res) {
	if(typeof req.query.p != "undefined"){
		exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:\"EnqueueFiles " + functions.getSong(req.query.p) + "\"", function(err, stdio, stder){
			res.send({});
		});
	}
});

module.exports = router;
