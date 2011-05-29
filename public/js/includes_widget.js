$(function () {

  var checkParents = function( checkbox ) {
    var parentDiv = $(checkbox).parent().parent();
    if ( parentDiv.hasClass('nested') ) {
      var parentCheckbox = parentDiv.prev().find('input[type="checkbox"]');
      checkParents( parentCheckbox[0] );
      parentCheckbox.attr( 'checked', 'checked' );
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
      $(controls).find('span').text('');
    } else {
      $(controls).find('span').text( JSON.stringify( selected ) );
    }
  };
  
  var widgetizeIncludes = function() {
    $('#includes, #excludes').each(function(i,widget) {
      var $label = $(widget).find('h2').hide();
      var label = $label.html();
      var controls = $(
        '<div class="includeControls param">' +
          '<label>' + label + ':</label> ' +
          '<span></span> <button>Edit</button>' +
        '</div>'
      );
      updateControls( controls, this );
      controls.find('button').click(function(e) {
        e.preventDefault();
        var originalNeighbor = $(widget).prev();
        $(widget).dialog({
          height: 500,
          title: label,
          modal: true,
          minWidth: 400,
          close: function(e,ui) {
            // Destroy the dialog and put the DOM element back where it was
            $(this).dialog('destroy').insertAfter(originalNeighbor);
            updateControls( controls, $(this) );            
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
      $(widget).before( controls ).hide();
   });
  };

  $('.checkboxes input[type="checkbox"]').live('change', function(e) {
    checkParents( this );
    uncheckChildren( this );
  });
  
  $(document.body).bind('methodLoaded', function() {
    widgetizeIncludes();
  });
  widgetizeIncludes();
  
});