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
    options: {
      force_array: false
    },
  	_create: function() {
      this.options.key_autocomplete = this.element.attr('data-key-autocomplete');
      this.options.value_autocomplete = this.element.attr('data-value-autocomplete');
      this.options.force_array = this.element.attr('data-force-array') ? true : false;
  	  
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
                    var field = $(e.target)
                      .blur(); // closes autocomplete box if hinting is on
                    if ( field.attr('name') == 'key[]' ) {
                      field.nextAll('input:first').focus();
                    } else {
                      jsonBuilder.addRow();                      
                    }
                  }
                });
              jsonBuilder.addHinting( jsonBuilder.rowForm );
              $('<button>&nbsp;</button>')
                .sidebutton({
                  icon: 'ui-icon-plus',
                  title: 'Add Row'
                })
        				.appendTo( jsonBuilder.rowForm )
                .click(function() {
                  jsonBuilder.addRow();
                });
              var deserializedOk = jsonBuilder.deserialize();;
              if ( deserializedOk ) {
                jsonBuilder.textArea = null;
                jsonBuilder.rowForm
                  .appendTo( this )
                  .find('input:first').focus();                
              } else {
                jsonBuilder.textArea = $('<textarea />', {
                  name: 'jsonBlob'
                }).val( jsonBuilder.element.val() );
                $(this).html( jsonBuilder.textArea );
                jsonBuilder.textArea.focus();
                alert("Could not parse the JSON in the form field. You'll get a big textarea until you can write valid JSON.");                
              }
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
                  if ( jsonBuilder.textArea ) {
                    // Textarea for invalid JSON
                    jsonBuilder.element.val( jsonBuilder.textArea.val() );
                    $(this).dialog('close');                    
                  } else {
                    // Normal form builder
                    var noErrors = jsonBuilder.checkLastRow();
                    if ( noErrors ) {
                      var json = jsonBuilder.serialize();
                      jsonBuilder.element.val( json );
                      $(this).dialog('close');
                    }                    
                  }
                }
              }              
            ]
          });
				  
				});
	  },
	  serialize: function() {
      var object={},
        fields=this.rows.find('input'),
        key;
      if ( fields.length == 0 ) {
        return '';
      }
      var that = this;
      fields.each(function(i,f) {
        var $f = $(f);
        if ( $f.attr('name') == 'key[]' ) {
          key = $f.val();
        } else {
          if ( that.options.force_array ) {
            object[ key ] = [ $f.val() ];  
          } else {
            object[ key ] = $f.val();  
          }
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
          return false;
        }
        var jsonBuilder = this;
        $.each( data, function(key,value) {
          var addedRow = newRow( key, value )
            .appendTo( jsonBuilder.rows );
          jsonBuilder.addHinting( addedRow );
        });
      }
      return true;
	  },
	  checkLastRow: function() {
      // Check if the user left something in the last form field
      var nonEmpty = $.grep( this.rowForm.find('input'), function(f) {
        return $(f).val().length > 0;
      });
      if ( nonEmpty.length > 0 && confirm('Add the last row?') ) {
        var rowAdded = this.addRow();
        return rowAdded;
      } else {
        return true;
      }
	  },
	  addRow: function() {
	    // Check for duplicate keys
      var fields = this.rowForm.find('input'),
        key = $(fields[0]).val(),
        value = $(fields[1]).val();
      var duplicateKeys = $.grep( this.rows.find('input[name="key[]"]'), function(f) {
        return key == $(f).val();
      });
      if ( duplicateKeys.length > 0 ) {
        alert("A key for '" + key + "' already exists.");
        $(duplicateKeys[0]).focus();
        return false;
      } else {
        var addedRow = newRow( key, value )
          .appendTo( this.rows );
        this.addHinting( addedRow );
        $(fields).val('');
        $(fields[0]).focus();
        return true;
      }
	  },
	  addHinting: function( node ) {
      var fields = node.find('input');
      if ( this.options.key_autocomplete ) {
        $(fields[0]).hintedinput({
          source: this.options.key_autocomplete
        });
      }
      if ( this.options.value_autocomplete ) {
        $(fields[1]).hintedinput({
          source: this.options.value_autocomplete,
          link: fields[0]
        });
      }
	  },
	  destroy: function() {
	    this.button.remove();
	  }
	});
	  
})( jQuery );