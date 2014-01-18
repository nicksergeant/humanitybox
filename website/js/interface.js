$(document).ready(function() {
	$(window).on('resize', function () {
		var headerHeight = $('header').height();
		$('body').css('padding-top', headerHeight + 70);
	}).resize();
});