(function( $ ) {
  
  var globalCache = {};
  
  $.widget( "ui.hintedinput", {
    
  	_create: function() {
  	  var hintedinput = this;
  	  if ( !this.options.source ) {
  	    this.options.source = this.element.attr('data-autocomplete');
  	  }
  	  var input = $(this.element).autocomplete({
				delay: 0,
				minLength: 0,
				source: function(request, response) {
				  var params = [];
          params.push( 'term=' + escape( request.term ) );
          if ( hintedinput.options.link ) {
            params.push( 'key=' + escape( $(hintedinput.options.link).val() ) );
          }
          var sourceUrl = '/autocomplete/' + hintedinput.options.source + '?' + params.join('&');
          $.getJSON(sourceUrl, function(data) {
            response( data );
          });
				}
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