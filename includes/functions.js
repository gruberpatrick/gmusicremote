var fs = require('fs');
var exec = require('child_process').exec;

module.exports = {

	aAllSongs: [],
	oSettings: {},

	getSettings: function(sUser){

		this.oSettings = JSON.parse(fs.readFileSync("./settings.json"));

	},

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
				if(aElements[0] == "")
					continue;
				oThat.aAllSongs[aElements[0]] = {"artist": aElements[4], "track": aElements[32], "album": aElements[2], "path": aElements[21], "file": aElements[10]};
			}

		});

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
				aRes[c++]["id"] = parseInt(i);
			}
		}
		return aRes;

	},

	getSong: function(sSongId){

		if(parseInt(sSongId) > 0 && parseInt(sSongId) < this.aAllSongs.length){
			return this.aAllSongs[parseInt(sSongId)]["path"] + "/" + this.aAllSongs[parseInt(sSongId)]["file"];
		}else{
			return "";
		}

	}

};
