(function( $ ) {
  
  $.widget( "ui.sidebutton", {
    options: {
      title: '',
      icon: 'ui-icon-notice'
    },
  	_create: function() {
      $(this.element)
				.attr( "tabIndex", -1 )
				.attr( "title", this.options.title )
        .button({
          icons: {
            primary: this.options.icon
          },
          text: false
        })
        .removeClass( "ui-corner-all" )
				.addClass( "ui-corner-right ui-button-icon" );
	  },
	  destroy: function() {
	    $(this.element)
	    .removeClass("ui-corner-right ui-button-icon")
	    .addClass("ui-corner-all")
	    .button('destroy')
	    .removeAttr("tabindex")
	    .removeAttr("title");
	  }
	});
	  
})( jQuery );