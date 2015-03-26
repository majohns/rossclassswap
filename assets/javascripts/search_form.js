var options;

$(document).ready(function() {
	var subject_select = $('#section_dropdown');
	
	options = $('#section_dropdown option').clone();	//   For backup
	$('#section_dropdown').empty();
	$('#section_dropdown').html('<option disabled selected>' + options[0].text + '</option>');
});

function update_section() {
	var subject_select = document.getElementById('subject_dropdown');
	var select_box = document.getElementById('section_dropdown');
	var results = [];
	
	for(var i=1; i < options.length; i++) {
		if(options[i].value.split(',')[0] == subject_select.selectedIndex - 1) {
			results[results.length] = '<option value=' + options[i].value + '>'
				+ options[i].text + '</option>';
		}
	}
	
	$('#section_dropdown').empty();
	$('#section_dropdown').html(results);
	$('#section_dropdown').prepend('<option disabled selected>--- Choose Section ---</option>');
	$('#section_pref').empty();
}

function update_pref() {
	var sections = document.getElementById('section_dropdown');
	
	var checkbox_space = $('#section_pref');
	var boxes = [];
	
	for(var i=1; i < sections.options.length; i++) {
		var temp = '<input type="checkbox" ';
		if(i == sections.selectedIndex) {
			temp += 'disabled ';
		}
		temp += 'name="check_' + sections.options[i].value + '" ' 
			+ 'value="' + sections.options[i].value.split(',')[1] + '">' 
			+ sections.options[i].text + '</input>';
		boxes[boxes.length] = temp;
	}
	
	checkbox_space.html(boxes);
}