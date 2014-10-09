var fs = require('fs');
var exec = require('child_process').exec;
var urlencode = require('urlencode');

module.exports = {

	aAllSongs: [],
	oSettings: {},

	//------------------------------------------------------------------------------
	// Load the settings file
	//
	// @param string : the current user that runs the app
	//
	getSettings: function(sUser){

		this.oSettings = JSON.parse(fs.readFileSync("./settings.json"));

	},

	//------------------------------------------------------------------------------
	// Load all songs from the DB file
	//
	getAllSongs: function(){

		var oThat = this;
		exec("whoami", function(err, stdio, stder){

			var sFile = oThat.oSettings["DB"].replace("[USER]", stdio.trim());
			var sContent = fs.readFileSync(sFile, 'utf-8');
			var lStart = sContent.indexOf("[Songs]", 0);
			sContent = sContent.substr(lStart, sContent.indexOf("[album]", lStart) - lStart);
			var aSongs = sContent.split("\n");
			for(var i = 2; i < aSongs.length; i++){
				var aElements = aSongs[i].split("\t");
				if(aElements[0] == "" || aElements[19] != "0")
					continue;
				oThat.aAllSongs[aElements[0]] = {"artist": aElements[4], "track": aElements[32], "album": aElements[2], "path": aElements[21], "file": aElements[10]};
			}

		});

	},

	//------------------------------------------------------------------------------
	// Search in the loaded Songs for an occurence
	//
	// @param string : the search phrase
	//
	// @return array : array with all occurences of the search phrase
	//
	searchSongs: function(sSearch){

		sSearch = sSearch.toLowerCase();
		var aRes = [];
		var c = 0;
		for(var i in this.aAllSongs){
			if(!this.aAllSongs.hasOwnProperty(i))
				continue;
			if((this.aAllSongs[i]["artist"].toLowerCase().indexOf(sSearch) > -1 || this.aAllSongs[i]["track"].toLowerCase().indexOf(sSearch) > -1 || this.aAllSongs[i]["album"].toLowerCase().indexOf(sSearch) > -1)){
				aRes[c] = this.aAllSongs[i];
				aRes[c++]["id"] = parseInt(i);
			}
		}
		return aRes;

	},

	//------------------------------------------------------------------------------
	// Get a specific file by its ID
	//
	// @param string : the song ID
	//
	// @return string : the file path (encoded)
	//
	getSong: function(sSongId){

		if(parseInt(sSongId) > 0 && parseInt(sSongId) < this.aAllSongs.length){
			console.log(this.aAllSongs[parseInt(sSongId)]["path"].replace(" ", "%20") + "/" + this.aAllSongs[parseInt(sSongId)]["file"].replace(" ", "%20"));
			return this.parseUri(this.aAllSongs[parseInt(sSongId)]["path"] + "/" + this.aAllSongs[parseInt(sSongId)]["file"]);
		}else{
			return "";
		}

	},

	//------------------------------------------------------------------------------
	// Encode a song path for command execution
	//
	// @param string : the song path
	//
	// @return string : the encoded file path
	//
	parseUri: function(sUri){

		return sUri.replace(/ /g, '%20');

	}

};
