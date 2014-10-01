var sActive = "";
var lOverflow = 0;
var bToggle = true;
var oInterval = null;

var bNoReload = true;

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

function loadStatus(sCommand){
	$.getJSON("/api/" + sCommand, function(data){
		// TODO: do something, if there is indeed something to do
	});
}

function loadStatus(sStat){
	if(typeof sStat == "undefined"){
		sStat = "";
	}
	$.getJSON("/api/" + sStat, function(data){
		if(data.result.uri != sActive){
			$("#songname").html(data.result.title + " &laquo; " + data.result.artist);
			if(bNoReload){
				// TODO: check if time has already elapsed (don't start from beginning)
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
	});
}

if(!bNoReload){
	setInterval(function(){ loadStatus(); }, 5000);
}
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
	command("volumedec");
});

$("#songinc").click(function(){
	command("volumeinc");
});

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
