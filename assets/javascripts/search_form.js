var options;

$(document).ready(function() {
	var subject_select = $('#section_dropdown');
	
	options = $('#section_dropdown option').clone();	//   For backup
	$('#section_dropdown').empty();
	$('#section_dropdown').html('<option disabled selected>' + options[0].text + '</option>');
	
	$('#search_button').click(function() {
		
		$.post('http://localhost:3000/search', { search : 1 }, function(data) {
			if(data == 'done') {
				alert("search!");
			}
		});
		
		//alert("hello");
	});
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
}



/*
$("#submit").click(function(){
          user=$("#user").val();
          pass=$("#password").val();
          $.post("http://localhost:3000/login",{user: user,password: pass}, function(data){
            if(data==='done')
              {
                alert("login success");
              }
          });
        });
		*/