// General Attributes
var sActive = "";
var lOverflow = 0;
var bToggle = true;
var oInterval = null;

// Settings:
// -> Reload new Song after this one finished
// -> Reload after certain amount of time
var bNoReload = true;
var lReloadTime = 5000;

//------------------------------------------------------------------------------
// Toggle the Song Display animation.
//
function animateDisplay(){

	if(lOverflow > 0){
		if(bToggle){
			$("#songname").css({"left": "-" + lOverflow + "px"});
			bToggle = false;
		}else{
			$("#songname").css({"left": 0});
			bToggle = true;
		}
	}

}

//------------------------------------------------------------------------------
// Animate Playback in process bar with CSS3 transition
//
// @param int : the elapsed time
// @param int : the total time
//
function animateSongProcess(lElapsed, lTotal){

	//var lPercentage = (lElapsed / lTotal) * 100;
	//$("#timeproc").css({"transition": "all 0s linear", "width": lPercentage + "%"});
	var lAhead = Math.round(lTotal - lElapsed);
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
function loadStatus(sStat){

	if(typeof sStat == "undefined"){
		sStat = "";
	}

	$.getJSON("/api/" + sStat, function(data){
		if(data.result.uri != sActive){

			// set song title to display
			$("#songname").html(data.result.title + " &laquo; " + data.result.artist);

			if(bNoReload){

				// TODO: check if song is in pause:
				// -> show correct symbol
				// -> don't let countdown start until song is playing

				// check if time has elapsed and add it for load of the next song
				var lElapsed = 0;
				if(typeof data.elapsed != "undefined"){
					lElapsed = data.elapsed;
				}
				$("#timeproc").attr("style", "fuck it");
				setTimeout(function(){ animateSongProcess(lElapsed, data.result.length); }, 500);

				// set time to reload data
				setTimeout(function(){ loadStatus(); }, ((data.result.length - lElapsed) + 0.5) * 1000);
			}

			// add song name display animation
			lOverflow = $("#songname").width() - $("#songname").parent().width();
			if(typeof oInterval != "null"){
				clearInterval(oInterval);
				$("#songname").css({"left": 0});
			}
			animateDisplay();
			oInterval = setInterval(function(){ animateDisplay(); }, 10000);

			// load the system volume and set it to display
			if(typeof data.volume != "undefined"){
				$("#volumetext").html(data.volume[0]);
				$("#volumeprocess").css({width: data.volume[0].substr(0, data.volume[0].length - 1) + "%"});
			}

			sActive = data.result.uri;
		}

		if(!bNoReload){
			setTimeout(function(){ loadStatus(); }, lReloadTime);
		}

	});
}

//------------------------------------------------------------------------------
// Initialize App Event Handlers
//
$(document).ready(function(){
	loadStatus();
});

$("#songprev").click(function(){
	loadStatus("prev");
});

$("#songnext").click(function(){
	loadStatus("next");
});

$("#songplaypause").click(function(){
	loadStatus("playpause");
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
