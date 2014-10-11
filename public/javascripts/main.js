// General Attributes
var lOverflow = 0;
var bToggle = true;
var bFirst = true;
var oConnection = null;

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
// Load current song status (call commands that change current song)
//
// @param string : the command to execute
// @param bool : if the display needs to be updated -> should only happen on first function call
//
function loadStatus(sStat, bLoad){

	if(typeof sStat == "undefined")
		sStat = "";
	if(typeof bLoad == "undefined")
		bLoad = false;

	$.getJSON("/api/" + sStat, function(data){

		if(bLoad && sStat != "process"){
			setInformation(data, bLoad);
		}else{
			var lElapsed = 0;
			if(typeof data.elapsed != "undefined"){
				lElapsed = data.elapsed;
			}
			var lPercentage = (lElapsed / data.result.length) * 100;
			$("#timeproc").attr("style", "width: " + lPercentage + "%;");
		}

	});
}

//------------------------------------------------------------------------------
// Set current information about Song, etc.
//
// @param object : the current data
// @param boolean : if socket needs to be set up
//
function setInformation(data, bLoad){

	// set song title to display
	$("#songname").removeClass("animate").css("left", "0").html("<span class=\"title\">" + data.result.title + "</span><span class=\"artist\">" + data.result.artist + "</span>").addClass("animate");
	if(bFirst){
		loadSongs(data.result.artist);
		bFirst = false;
	}

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
		$("#songplaypause").html("II").addClass("playing");
	}else{
		$("#songplaypause").html(">").removeClass("playing");
	}

	// load the system volume and set it to display
	if(typeof data.volume != "undefined"){
		$("#sound-slider").val(data.volume[0].replace("%", ""));
	}

	// Initialize WebSocket
	if(bLoad){
		$(function () {
				// if user is running mozilla then use it's built-in WebSocket
				window.WebSocket = window.WebSocket || window.MozWebSocket;
				oConnection = new WebSocket(document.URL.replace("http", "ws").replace(":" + data.settings.app_port, ":" + data.settings.server_port));
				oConnection.onopen = function () {
					// connection is opened and ready to use
				};
				oConnection.onerror = function (error) {
					// an error occurred when sending/receiving data
				};
				oConnection.onmessage = function (oMessage) {
					var oData = JSON.parse(oMessage.data);
					setInformation(oData);
				};
		});
	}

}

//------------------------------------------------------------------------------
// Load Search results
//
// @param string : the search to execute
//
function loadSongs(sSearch){

	$.getJSON("/api/search?s=" + sSearch, function(data){
		$("#search_result span.element").unbind("click");
		$("#search_result").html("");
		$.each(data.result, function(i, o){
			$("#search_result").append("<span class=\"element select\" data-id=\"" + o["id"] + "\"><span class=\"title\">" + o["track"] + "</span><span class=\"artist\">" + o["artist"] + "</span><span class=\"album\">" + o["album"] + "</span></span>");
		});
		$("#search_result span.element").bind("click", function(oEvent){
			loadStatus("play?p=" + $(this).attr("data-id"));
		});
	});

}

//------------------------------------------------------------------------------
// Initialize App Event Handlers
//
$(document).ready(function(){
	loadStatus("", true);
});

$("#songprev").click(function(){
	oConnection.send(JSON.stringify({"control": "prev"}));
});

$("#songnext").click(function(){
	oConnection.send(JSON.stringify({"control": "next"}));
});

$("#songplaypause").click(function(){
	if($(this).hasClass("playing")){
		$("#songplaypause").html(">").removeClass("playing");
	}else{
		$("#songplaypause").html("II").addClass("playing");
	}
	oConnection.send(JSON.stringify({"control": "playpause"}));
});

$("#sound-slider").noUiSlider({
	start: 0,
	connect: "lower",
	range: {
		'min': 0,
		'max': 100
	}
});
$("#sound-slider").on("slide", function(){
	oConnection.send(JSON.stringify({"volume": $("#sound-slider").val()}));
});

//------------------------------------------------------------------------------
// Load Search Events
//
$("#songsearch").on("keydown", function(oEvent){
	if(oEvent.keyCode == 13){
		loadSongs($("#songsearch").val());
	}
});
$("#songsearch_button").on("click", function(){
	loadSongs($("#songsearch").val());
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

//------------------------------------------------------------------------------
// Check if Phone was in sleep mode
//
var lastCheck = 0;
function sleepCheck() {
	var now = new Date().getTime();
	var diff = now - lastCheck;
	if (diff > 5000) {
  	loadStatus("", true);
	}
	lastCheck = now;
}
$(document).ready(function() {
	lastCheck = new Date().getTime();
	setInterval(sleepCheck, 1000);
});
