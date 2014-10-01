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
// Call API and execute given command.
//
// @param string : the command to execute
//
function callCommand(sCommand){
	$.getJSON("/api/" + sCommand, function(data){
		// TODO: do something, if there is indeed something to do
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
			$("#songname").html(data.result.title + " &laquo; " + data.result.artist);
			if(bNoReload){
				// TODO: check if time has already elapsed (don't start from beginning)
				// TODO: check if song is in pause:
				// -> show correct symbol
				// -> don't let countdown start until song is playing
				setTimeout(function(){ loadStatus(); }, data.result.length * 1000);
			}

			lOverflow = $("#songname").width() - $("#songname").parent().width();
			if(typeof oInterval != "null"){
				clearInterval(oInterval);
				$("#songname").css({"left": 0});
			}
			animateDisplay();
			oInterval = setInterval(function(){ animateDisplay(); }, 10000);

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
