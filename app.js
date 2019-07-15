 /*
	*********************************
	*********************************
	*********************************
	****** Henoc Sese (c) 2019 ******
	*********************************
	*********************************
	*********************************
*/		

/* adjust height of area for automatically
 *  resize based on content.
*/
function textAreaAdjust(o) {
 	o.style.height = "1px";
 	o.style.height = (25 + o.scrollHeight) + "px";
}

/*
 * Display lyrics with no edit features
 */
function displayViewer() {
	view['area'].style.display = "none";
	btn['cancel'].style.display = "none";
	btn['edit'].style.display = "inline";
	btn['record'].style.display = "inline";
	btn['play'].style.display = "inline";
	btn['save'].style.display = "none";
	if(lyrics.length > 0) btn['export'].style.display = "inline";
	view['viewer'].style.display = "block";
}

/*
 * Display lyrics with no features
 */
function displayEditArea() {
	view['viewer'].style.display = "none";
	btn['save'].style.display = "inline";
	btn['cancel'].style.display = "inline";
	btn['edit'].style.display = "none";
	btn['record'].style.display = "none";
	btn['play'].style.display = "none";
	btn['export'].style.display = "none";
	view['area'].style.display = "block";

	// set lyrics and 
	view['area'].value = lyrics.replace(/<br *\/?>/gi, '\n');
}

function updateLyrics() {
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

			splittedLyrics
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
			enableExportFeature();
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

function enableExportFeature() {
	recordedReferentTime = referentTime; 	// temp for testing
	btn['export'].style.display = "inline";
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
	btn['record'].addEventListener("click", function (e) { if(mode != "RECORDING") { mode = "RECORDING"; recordingSound(); } });
	btn['play'].addEventListener("click", function (e) { if(mode != "PLAYING") { mode = "PLAYING"; playSound(); } });
	btn['save'].addEventListener("click", function (e) { if(mode != "PLAYING") { lyrics = view.area.value; updateLyrics(); displayViewer();  } });
}

/**
 * Initiation of the application.
*/
function init() {

	document.querySelector("#input-file").onchange = function(e) {
		 // verify extension
		 var testPath = e.target.value;

		 switch(mode) {
		 	case "SELECT-NEW":
		 		if(testPath.split(".").pop() != "mp3") {
	  				alert("Files selected must be in mp3 format !");
	  			}else {
	  				fileName = e.target.value.split("\\").pop()
	  				start();
				}

		 		break;

		 	case "SELECT-OPEN":
		 		const file = e.target.files[0];
		 		if (file) {
			     	const reader = new FileReader();
			    	reader.readAsText(file, 'UTF-8');

			        reader.onload = (evt) => {
			          data = JSON.parse(evt.target.result);
			          data.forEach(function(element) {
			          	lyrics += element['referent'] + "\n";
			          	if(element['time'] != undefined) recordedReferentTime.push(element['time']);
			         });

			          fileName = e.target.value.split("\\").pop()
	  			  	  start();
	  			  	  updateLyrics();
			        };
			        
			        reader.onerror = (evt) => {
			          console.error('Failed to read this file');
			        };
			      }
		 		break;
		 }

		 	
	};

	document.querySelector('#btn-new').addEventListener('click', function() { mode = "SELECT-NEW"; document.querySelector('#input-file').click(); });
	document.querySelector('#btn-open').addEventListener('click', function() { mode = "SELECT-OPEN"; document.querySelector('#input-file').click(); });
}

function exportData(anchor) {
	// pause music
	if(audio != undefined) audio.pause();


	// create json file
	var raw = [];
	var referentList = view['viewer'].querySelectorAll('span');
	for(var i = 0; i < referentList.length; i++) {
		var obj = { "referent" : referentList[i].innerHTML.split('<br>')[0] }
		if(referentList[i] .className != "lyrics-separator") {
			if(recordedReferentTime[i] != undefined) {
				obj['time'] = recordedReferentTime[i];
			}
		}
		
		raw.push(obj);
	}

    var exportedFilename = "test.txt";
    var data = JSON.stringify(raw);
    var svg_blob = new Blob([data], {'type': "text/plain"});
    var url = URL.createObjectURL(svg_blob);

    anchor.href = url;
    anchor.download = exportedFilename;
}

// init variables
var mode = ""; // EDITING / PLAYING / RECORDING
var referentTime = [];
var pointerReferentTime = 0;
var recordedReferentTime = [];
var referents;
var pointer = 0;	// pointer for the 

var lyrics = ""	// lyrics saved in raw format with carriage return (\n)
var splittedLyrics = [];
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
	'save': document.querySelector("#btn-save"),
	'export': document.querySelector("#btn-export")
}


init();