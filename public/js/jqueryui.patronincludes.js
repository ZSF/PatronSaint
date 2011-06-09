(function( $ ) {

  var checkParents = function( checkbox ) {
    var parentDiv = $(checkbox).parent().parent();
    if ( parentDiv.hasClass('nested') ) {
      var parentCheckbox = parentDiv.prev().find('input[type="checkbox"]');
      checkParents( parentCheckbox[0] );
      if ( !parentCheckbox.hasClass('default') ) {
        parentCheckbox.attr( 'checked', 'checked' );
      }
    }
  }
  
  var uncheckChildren = function( checkbox ) {
    var childDiv = $(checkbox).parent().next();
    if ( childDiv[0] && childDiv[0].tagName == 'DIV' && childDiv.hasClass('nested') ) {
     childDiv.find('input:checked').each(function(e) {
       $(this).removeAttr('checked');
     });
    }
  }
  
  var getCheckedValues = function( container ) {
    var values = [];
    $(container).find('input:checked').each(function(i,check) {
      values.push( $(check).val() );
    });
    return values;
  };

  var updateControls = function( controls, container ) {
    var selected = getCheckedValues( container );
    if ( selected.length == 0 ) {
      $(controls).find('span:first').text('');
    } else {
      $(controls).find('span:first').text( JSON.stringify( selected ) );
    }
  };

	$.widget( "ui.patronincludes", {
  	_create: function() {
  	  var patronincludes = this;
      this.label = $(this.element).find('h2').hide();
      var title  = this.label.html();
      this.controls = $(
        '<div class="includeControls param">' +
          '<label>' + title + ':</label> ' +
          '<span></span> <button>Edit</button>' +
        '</div>'
      );
      updateControls( this.controls, this.element );
      var that = this;
      this.controls.find('button').click(function(e) {
        e.preventDefault();
        var originalNeighbor = $(that.element).prev();
        $(that.element).dialog({
          height: 500,
          title: title,
          modal: true,
          minWidth: 400,
          close: function(e,ui) {
            // Destroy the dialog and put the DOM element back where it was
            $(this).dialog('destroy').insertAfter(originalNeighbor);
            updateControls( that.controls, this );
            return true;
          },
          buttons: [
            { 
              text: "OK",
              click: function() {
                $(this).dialog('close');
              }
            }
          ]
        });
      });   
      $(this.element).bind('change', function(e) {
        if ( e.target.tagName == 'INPUT' && e.target.getAttribute('type') == 'checkbox' ) {
          if ( patronincludes.options.mode == 'includes' ) {
            checkParents( e.target );
            uncheckChildren( e.target );
          }
        }
      });   
      $(this.element).before( this.controls ).hide();
    },
    destroy: function() {
      this.label.show();
      this.element.unbind('change').show();
      this.controls.remove();
  		$.Widget.prototype.destroy.call( this );
  	}
  });
  
})( jQuery );