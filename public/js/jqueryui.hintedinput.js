(function( $ ) {
  
  $.widget( "ui.hintedinput", {
  	_create: function() {
  	  var input = $(this.element).autocomplete({
				delay: 0,
				minLength: 0,
				source: [ 'Cat', 'Dog', 'Fish' ]
  	  })
  	  .addClass( "ui-widget ui-widget-content ui-corner-left" );
  	  
			this.button = $( "<button type='button'>&nbsp;</button>" )
				.attr( "tabIndex", -1 )
				.attr( "title", "Show All Items" )
				.insertAfter( this.element )
				.button({
					icons: {
						primary: "ui-icon-triangle-1-s"
					},
					text: false
				})
				.removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-button-icon" )
				.click(function() {
					// close if already visible
					if ( input.autocomplete( "widget" ).is( ":visible" ) ) {
						input.autocomplete( "close" );
						return;
					}
					// work around a bug (likely same cause as #5265)
					$( this ).blur();
					// pass empty string as value to search for, displaying all results
					input.autocomplete( "search", "" );
					input.focus();
				});  	  
	  },
	  destroy: function() {
	  }
	});
	  
})( jQuery );