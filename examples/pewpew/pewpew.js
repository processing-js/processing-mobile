/*
 * int13h Javascript for Pew Pew
 */
$(document).ready(function(){ 
	$("#shieldlevel").progressbar({value: 100});
	$("#beamlevel").progressbar({value: 100});

	// Stop cursor highlight
	document.onselectstart=function(){return false;};
	
	// Stop Backspace event
	$(document).keypress(function(event){
		if(event.keyCode == 8)
			return false;
	});
});
