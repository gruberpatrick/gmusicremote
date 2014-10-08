var fs = require('fs');

module.exports = {

	aAllSongs: [],
	oSettings: {},

	getSettings: function(sUser){

		this.oSettings = JSON.parse(fs.readFileSync("./settings.json"));

	},

	getAllSongs: function(){

		var sFile = this.oSettings["DB"];
		var sContent = fs.readFileSync(sFile, 'utf-8');
		var lStart = sContent.indexOf("[Songs]", 0);
		sContent = sContent.substr(lStart, sContent.indexOf("[album]", lStart) - lStart);
		var aSongs = sContent.split("\n");
		for(var i = 2; i < aSongs.length; i++){
			var aElements = aSongs[i].split("\t");
			if(aElements[0] == "")
				continue;
			this.aAllSongs[aElements[0] - 1] = {"artist": aElements[4], "track": aElements[32], "album": aElements[2], "path": aElements[21], "file": aElements[10]};
		}

	},

	searchSongs: function(sSearch){

		sSearch = sSearch.toLowerCase();
		var aRes = [];
		var c = 0;
		for(var i in this.aAllSongs){
			if(!this.aAllSongs.hasOwnProperty(i))
				continue;
			if((this.aAllSongs[i]["artist"].toLowerCase().indexOf(sSearch) > -1 || this.aAllSongs[i]["track"].toLowerCase().indexOf(sSearch) > -1 || this.aAllSongs[i]["album"].toLowerCase().indexOf(sSearch) > -1)){
				aRes[c] = this.aAllSongs[i];
				aRes[c++]["id"] = i;
			}
		}
		return aRes;

	},

	getSong: function(sSongId){

		return this.aAllSongs[parseInt(sSongId) - 1]["path"] + "/" + this.aAllSongs[parseInt(sSongId) - 1]["file"];

	}

};
