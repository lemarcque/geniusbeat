 /*
	*********************************
	*********************************
	*********************************
	****** Henoc Sese (c) 2019 ******
	*********************************
	*********************************
	*********************************
*/


/* auto resize */
function textAreaAdjust(o) {
 	o.style.height = "1px";
 	o.style.height = (25 + o.scrollHeight) + "px";
}

/* get DOM element */
var view = {
	'viewer': document.querySelector("#lyrics-viewer"),
	'area': document.querySelector("#lyrics-textarea")
}

var btn = {
	'edit': document.querySelector("#btn-edit"),
	'cancel': document.querySelector("#btn-cancel"),
	'record': document.querySelector("#btn-record"),
	'play': document.querySelector("#btn-play")
}

/* click listener */
btn['edit'].addEventListener("click", function (e) {
	displayEditArea();
});
btn['cancel'].addEventListener("click", function (e) {
	displayViewer();
});
btn['record'].addEventListener("click", function (e) {
	if(isRecording == false) {
		isRecording = true;
		recordingSound();
	}
});

btn['play'].addEventListener("click", function (e) {
	if(isPlaying == false) {
		isPlaying = true;
		playSound();
	}
});

var audio;

function displayViewer() {
	view['area'].style.display = "none";
	btn['cancel'].style.display = "none";
	btn['edit'].style.display = "block";
	view['viewer'].style.display = "block";
	//view['viewer'].innerHTML = lyrics;
}

function displayEditArea() {
	view['viewer'].style.display = "none";
	btn['cancel'].style.display = "block5";
	btn['edit'].style.display = "none";
	view['area'].style.display = "block";
	view['area'].value = lyrics.replace(/<br *\/?>/gi, '\n');
	textAreaAdjust(view['area']);
}

function recordingSound() {
	if(audio != undefined) audio.pause();
	audio = new Audio('vg-lagoh.mp3');
	audio.pause();
	audio.currentTime = 0;

	audio.ontimeupdate = function() {}
	audio.onended = function() { console.log("FINISH"); recordedReferentTime = referentTime; }
	audio.play();
}

function playSound() {
	// reset settings
	pointer = 0;

	if(audio != undefined) audio.pause();
	audio = new Audio('vg-lagoh.mp3');
	audio.currentTime = 0;

	audio.ontimeupdate = function() {
   		if(Math.round(audio.currentTime) == Math.round(recordedReferentTime[pointerReferentTime])) {
   			switchReferentPos(pointerReferentTime);
   			pointerReferentTime++
   		}
	};
	audio.play();
} 


document.addEventListener('keyup', logKey);

function logKey(e) {
	if(e.code == "Enter") nextReferent();
}


// TEMP
var lyrics = "[Intro]<br>It's Vegedream<br>Atona tona oh<br>Naza eh lagoh ya oh<br>Naza eh lagoh ya oh<br>Naza eh<br>Atona tona oh<br>Naza eh lagoh ya oh<br><br>[Couplet unique]<br>J'ai charbonné tous les soirs<br>Ça a failli me tuer, oh<br>Je vivais un vrai cauchemar<br>Ça pouvait me tuer, oh<br>J'appelais maman tous les soirs<br>Ça a failli la tuer, oh<br>Et me voilà 7 ans plus tard<br>Je vais tuer, oh<br><br>[Refrain]<br>Ah comment je m’appelle?<br>Vegedream<br>Ah comment je m’appelle?<br>Vegedream<br>Ah comment je m’appelle?<br>Vegedream<br>Ah comment je m’appelle?<br>Ah Vegedream"

var recordedReferentTime = [];

function addLyrics() {
	var data = lyrics.split("<br>");
	data.forEach(function(element) {

		if(element.length > 0) {

			var span = document.createElement("span");
			span.innerHTML = element + "<br>"
			
			if(element.includes("[") && element.includes("]")) {
				span.className = "separator"
			}else {
				span.className = "referent"
			}
			view['viewer'].appendChild(span)
		}else {
			var br = document.createElement("br");
			view['viewer'].appendChild(br);
		}
	});

	referents = view.viewer.querySelectorAll('.referent')
}

var referents;
var pointer = 0;

function nextReferent() {
	if(isRecording) {
		if(pointer < referents.length) {
			switchReferentPos(pointer);
			referentTime.push(audio.currentTime)
			recordedReferentTime = referentTime;
			pointer++;
		}
	}
}

function switchReferentPos(position) {
	if(position > 0) referents[position - 1].className = "referent";
	referents[position].className ="referent-live";
}

var isPlaying = false;
var isRecording = false;
var referentTime = [];
var pointerReferentTime = 0;

// init
addLyrics();
displayViewer();