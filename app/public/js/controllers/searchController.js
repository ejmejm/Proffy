function SearchController(){
	$('#search-button').click(function() {
		page++;
		document.getElementById('pg'+(page-1)).style.display = 'none';
		document.getElementById('pg'+page).style.display = 'block';
		if(page == 3){
			document.getElementById('info-submit-button').style.display = 'block';
			document.getElementById('next-button').style.display = 'none';
		}
	});
}
