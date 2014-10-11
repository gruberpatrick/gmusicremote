var exec = require('child_process').exec;

module.exports = {

	setVolume: function(sVolume){

		var lVolume = Math.round(parseFloat(sVolume));
		exec(settings.sound_command_pre + lVolume + settings.sound_command_post);

	},

	nextSong: function(){

		exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:NextSong");

	},

	prevSong: function(){

		exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:PrevSong");

	},

	playPause: function(){

		exec("dbus-send --dest=org.gmusicbrowser /org/gmusicbrowser org.gmusicbrowser.RunCommand string:PlayPause");

	}

};
