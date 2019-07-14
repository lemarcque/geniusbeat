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

function displayViewer() {
	view['area'].style.display = "none";
	btn['cancel'].style.display = "none";
	btn['edit'].style.display = "inline";
	btn['record'].style.display = "inline";
	btn['play'].style.display = "inline";
	btn['save'].style.display = "none";
	view['viewer'].style.display = "block";
}

function displayEditArea() {
	view['viewer'].style.display = "none";
	btn['save'].style.display = "inline";
	btn['cancel'].style.display = "inline";
	btn['edit'].style.display = "none";
	btn['record'].style.display = "none";
	btn['play'].style.display = "none";
	view['area'].style.display = "block";
	view['area'].value = lyrics.replace(/<br *\/?>/gi, '\n');
	textAreaAdjust(view['area']);
}

function updateLyrics() {
	lyrics = view.area.value;
	var data = lyrics.split("\n");

	// remove all childs
	while (view.viewer.firstChild) {
	    view.viewer.firstChild.remove();
	}

	data.forEach(function(element) {

		if(element.length > 0) {

			var span = document.createElement("span");
			span.innerHTML = element + "<br>"
			
			if(element.includes("[") && element.includes("]")) {
				span.className = "lyrics-separator"
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

function recordingSound() {
	if(audio != undefined) audio.pause();
	audio = new Audio("./" + fileName);
	audio.pause();
	audio.currentTime = 0;

	audio.ontimeupdate = function() {}
	audio.onended = function() { recordedReferentTime = referentTime; }
	audio.play();
}

function playSound() {
	if(audio != undefined) audio.pause();
	audio = new Audio(fileName);
	audio.currentTime = 0;
	pointerReferentTime = 0;
	pointer = 0;

	audio.ontimeupdate = function() {
   		if(Math.round(audio.currentTime) == Math.round(recordedReferentTime[pointerReferentTime])) {
   			switchReferentPos(pointerReferentTime);
   			pointerReferentTime++
   		}
	};
	audio.play();
} 

function logKey(e) {
	if(e.code == "Enter") {
		nextReferent();
	}
}

function nextReferent() {
	if(mode == "RECORDING") {
		if(pointer < referents.length) {
			switchReferentPos(pointer);
			referentTime.push(audio.currentTime)
			recordedReferentTime = referentTime; 	// temp for testing
			pointer++;
		}
	}
}

function switchReferentPos(position) {
	if(position > 0) referents[position - 1].className = "referent";
	referents[position].className ="referent-live";
}

function closePreviewPage() {
	document.querySelector('#preview-container').style.display = "none";
	document.querySelector('#app-container').style.display = "block";
}

/**
 * Called when a file has been correctly selected.
*/
function start() {
	// display views
	displayViewer();
	closePreviewPage();

	// set event listener
	document.addEventListener('keyup', logKey);
	btn['edit'].addEventListener("click", function (e) { mode = "EDITING"; displayEditArea(); });
	btn['cancel'].addEventListener("click", function (e) { displayViewer(); });
	btn['record'].addEventListener("click", function (e) { if(mode != "RECORDING") { mode = "RECORDING"; isRecording = true; recordingSound(); } });
	btn['play'].addEventListener("click", function (e) { if(mode != "PLAYING") { mode = "PLAYING"; isPlaying = true; playSound(); } });
	btn['save'].addEventListener("click", function (e) { if(mode != "PLAYING") { displayViewer(); updateLyrics(); } });
}

/**
 * Initiation of the application.
*/
function init() {
	//mode = "EDITING";

	document.querySelector("#input-file").onchange = function(e) {
		 // verify extension
		 var testPath = e.target.value;
	  	if(testPath.split(".").pop() != "mp3") {
	  		console.log("Files selected must be in mp3 format !");
	  	}else {
	  		fileName = e.target.value.split("\\").pop()
	  		start();
	  	}
	};

	document.querySelector('#btn-new').addEventListener('click', function() { document.querySelector('#input-file').click(); });
	document.querySelector('#btn-open').addEventListener('click', function() { });

}

// init variables
var mode = ""; // EDITING / PLAYING / RECORDING
var isPlaying = false;
var isRecording = false;
var referentTime = [];
var pointerReferentTime = 0;
var recordedReferentTime = [];
var referents;
var pointer = 0;	// pointer for the 

var lyrics = ""	// lyrics saved in raw format with carriage return (\n)
var fileName = "";
var audio;		// Audio element to instantiate

/* DOM element */
var view = {
	'viewer': document.querySelector("#lyrics-viewer"),
	'area': document.querySelector("#lyrics-textarea")
}

var btn = {
	'edit': document.querySelector("#btn-edit"),
	'cancel': document.querySelector("#btn-cancel"),
	'record': document.querySelector("#btn-record"),
	'play': document.querySelector("#btn-play"),
	'save': document.querySelector("#btn-save")
}


init();