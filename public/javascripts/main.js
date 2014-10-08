// General Attributes
var sActive = "";
var lOverflow = 0;
var bToggle = true;
var oReloadTimeout = null;
var bFirst = true;

// Settings:
// -> Reload new Song after this one finished
// -> Reload after certain amount of time
var bNoReload = true;
var lReloadTime = 5000;

//------------------------------------------------------------------------------
// Animate Playback in process bar with CSS3 transition
//
// @param int : the elapsed time
// @param int : the total time
//
function animateSongProcess(lElapsed, lTotal){

	var lAhead = Math.round(lTotal - (lElapsed + 0.5));
	$("#timeproc").css({"transition": "all " + lAhead + "s linear", "width": "100%"});

}

//------------------------------------------------------------------------------
// Call API and execute given command.
//
// @param string : the command to execute
//
function callCommand(sCommand){

	$.getJSON("/api/" + sCommand, function(data){
		if(sCommand == "volumedec" || sCommand == "volumeinc"){
			$("#volumetext").html(data.result[0]);
			$("#volumeprocess").css({width: data.result[0].substr(0, data.result[0].length - 1) + "%"});
		}
	});

}

//------------------------------------------------------------------------------
// Load current song status (call commands that change current song) and set
// all neccessary values.
//
// @param string : the command to execute
//
function loadStatus(sStat, oThat){

	if(typeof sStat == "undefined"){
		sStat = "";
	}

	$.getJSON("/api/" + sStat, function(data){

		$(oThat).removeClass("active");

		// set song title to display
		$("#songname").removeClass("animate").css("left", "0").html("<span class=\"title\">" + data.result.title + "</span><span class=\"artist\">" + data.result.artist + "</span>").addClass("animate");
		if(bFirst){
			loadSongs(data.result.artist, true);
			bFirst = false;
		}

		// TODO: check if song is in pause:
		// -> check error occuring sometimes while new song comes on

		// check if time has elapsed and add it for load of the next song
		// check if song is playing and set symbols
		var lElapsed = 0;
		if(typeof data.elapsed != "undefined"){
			lElapsed = data.elapsed;
		}
		var lPercentage = (lElapsed / data.result.length) * 100;
		$("#timeproc").attr("style", "width: " + lPercentage + "%;");
		if(data.playing == "true"){
			setTimeout(function(){ animateSongProcess(lElapsed, data.result.length); }, 500);
			$("#songplaypause").html("II");
		}else{
			$("#songplaypause").html(">");
		}

		// set time to reload data
		if(typeof oReloadTimeout != "null"){
			clearTimeout(oReloadTimeout);
		}
		oReloadTimeout = setTimeout(function(){ loadStatus(); }, ((data.result.length - lElapsed) + 0.5) * 1000);

		// load the system volume and set it to display
		if(typeof data.volume != "undefined"){
			$("#volumetext").html(data.volume[0]);
			$("#volumeprocess").css({width: data.volume[0].substr(0, data.volume[0].length - 1) + "%"});
		}

		sActive = data.result.uri;

	});
}

//------------------------------------------------------------------------------
// Load Search results
//
// @param string : the search to execute
//
function loadSongs(sSearch, bAttachEvents){

	$.getJSON("/api/search?s=" + sSearch, function(data){
		$("#search_result span.element").unbind("click");
		$("#search_result").html("");
		$.each(data.result, function(i, o){
			$("#search_result").append("<span class=\"element\" data-id=\"" + o["id"] + "\"><span class=\"title\">" + o["track"] + "</span><span class=\"artist\">" + o["artist"] + "</span><span class=\"album\">" + o["album"] + "</span></span>");
		});
		$("#search_result span.element").bind("click", function(oEvent){
			loadStatus("play?p=" + $(this).attr("data-id"));
		});
		if(bAttachEvents){
			$("#songsearch").on("keydown", function(oEvent){
				if(oEvent.keyCode == 13){
					loadSongs($("#songsearch").val(), false);
				}
			});
		}
	});

}

//------------------------------------------------------------------------------
// Play song by ID
//
// @param string : the song ID
//
function playSong(sSongId){

	$.getJSON("/api/play?p=" + sSongId, function(data){



	});

}

//------------------------------------------------------------------------------
// Initialize App Event Handlers
//
$(document).ready(function(){
	loadStatus();
});

$("#songprev").click(function(){
	$(this).addClass("active");
	loadStatus("prev", this);
});

$("#songnext").click(function(){
	$(this).addClass("active");
	loadStatus("next", this);
});

$("#songplaypause").click(function(){
	$(this).addClass("active");
	loadStatus("playpause", this);
});

$("#songdec").click(function(){
	callCommand("volumedec");
});

$("#songinc").click(function(){
	callCommand("volumeinc");
});

//------------------------------------------------------------------------------
// Load Tab Event Handlers and Show correct Tab
//
$("span.tab").each(function(i, o){

	$(this).click(function(){

		$("span.tab").removeClass("active");
		$(this).addClass("active");

		var o = $(this);
		$("div.tabc").each(function(ii, oo){

			if($(this).hasClass(o.attr("data-for"))){
				$(this).addClass("active");
			}else{
				$(this).removeClass("active");
			}

		});

	});

});
