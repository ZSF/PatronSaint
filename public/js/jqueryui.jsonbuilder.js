(function( $ ) {
  
  // Represents one row of input
  var inputRow = '<div><input type="text" name="key[]" />: <input type="text" name="value[]" /></div>';
  
  var newRow = function( key, value ) {
    var row = $(inputRow),
      fields = row.find('input');
    $(fields[0]).val( key );
    $(fields[1]).val( value );
    $('<button>&nbsp;</button>')
      .sidebutton({
        icon: 'ui-icon-trash',
        title: 'Remove Row'
      })
      .click(function(event,ui) {
        $(this).parent().remove();
      })
      .appendTo( row );    
    return row;
  };
  
  $.widget( "ui.jsonbuilder", {
  	_create: function() {
  	  var jsonBuilder = this;
  	  this.button = $( "<button type='button'>&nbsp;</button>" )
				.insertAfter( this.element )
				.sidebutton({
					icon: "ui-icon-pencil",
					title: 'Edit JSON'
				})
				.click(function() {
          $('<div />', {
            class: 'jsonBuilder'
          }).dialog({
            title: 'JSON Builder',
            modal: true,
            width: 500,
            open: function(event, ui) {
              // Read JSON and add triggers
              jsonBuilder.rows = $('<div />', { class: 'rows' }).appendTo( this );
              jsonBuilder.rowForm = $(inputRow)
                .addClass('rowForm')
                .bind('keydown', function(e) {
                  if ( e.keyCode == 13 ) {
                    var field = $(e.target);
                    if ( field.attr('name') == 'key[]' ) {
                      field.next('input').focus();
                    } else {
                      jsonBuilder.addRow();                      
                    }
                  }
                });
              $('<button>&nbsp;</button>')
                .sidebutton({
                  icon: 'ui-icon-plus',
                  title: 'Add Row'
                })
        				.appendTo( jsonBuilder.rowForm )
                .click(function() {
                  jsonBuilder.addRow();
                });
              jsonBuilder.rowForm
                .appendTo( this )
                .find('input:first').focus();
              jsonBuilder.deserialize();
            },
            close: function(event, ui) {
              $(this).remove();
            },
            buttons: [
              { 
                text: "Cancel",
                click: function() {
                  $(this).dialog('close');
                }
              },            
              { 
                text: "OK",
                click: function() {
                  var json = jsonBuilder.serialize();
                  jsonBuilder.element.val( json );
                  $(this).dialog('close');
                }
              }              
            ]
          });
				  
				}).click();
	  },
	  serialize: function() {
      var object={},
        fields=this.rows.find('input'),
        key;
      if ( fields.length == 0 ) {
        return '';
      }
      fields.each(function(i,f) {
        var $f = $(f);
        if ( $f.attr('name') == 'key[]' ) {
          key = $f.val();
        } else {
          object[ key ] = $f.val();
        }
      });
      return JSON.stringify( object );
	  },
	  deserialize: function() {
	    var json = this.element.val(),
	      data;
      if ( json.length > 0 ) {
        try {
          data = JSON.parse( json );
        } catch( error ) {
          alert("Could not parse JSON in the form field.");
          return;
        }
        var jsonBuilder = this;
        $.each( data, function(key,value) {
          newRow( key, value )
            .appendTo( jsonBuilder.rows );          
        });
      }
	  },
	  addRow: function() {
      var fields = this.rowForm.find('input');
      newRow( $(fields[0]).val(), $(fields[1]).val() )
        .appendTo( this.rows );
      $(fields).val('');
      $(fields[0]).focus();
	  },
	  destroy: function() {
	    this.button.remove();
	  }
	});
	  
})( jQuery );