$(function () {

  $('#resources a').live('click', function(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    $('#methods').load( href + '?inline=1' );
    $('#method').html('');
    $('#response').html('');
  });

  $('#methods a').live('click', function(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    $('#method').load( href + '?inline=1', function() {
      includesWidget();
    });
    $('#response').html('');
  });

  // Automatically check/uncheck dependent checkboxes
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
  $('.checkboxes input[type="checkbox"]').live('change', function(e) {
    checkParents( this );
    uncheckChildren( this );
  });
  
  var getCheckedValues = function( container ) {
    var values = [];
    $(container).find('input:checked').each(function(i,check) {
      values.push( $(check).val() );
    });
    return values;
  };
  
  var includesWidget = function() {
    $('#includes, #excludes').each(function(i,widget) {
      var label = $(widget).find('h2').html();
      var controls = $(
        '<div class="includeControls param">' +
          '<label>' + label + ':</label> ' +
          '<span></span> <button>Edit</button>' +
        '</div>'
      );
      var updateControls = function( controls, container ) {
        var selected = getCheckedValues( container );
        if ( selected.length == 0 ) {
          $(controls).find('span').text('');
        } else {
          $(controls).find('span').text( JSON.stringify( selected ) );
        }
      };
      updateControls( controls, this );
      controls.find('button').click(function(e) {
        e.preventDefault();
        $(widget).modal({
          maxHeight: 500,
          persist: true,
          onClose: function() {
            updateControls( controls, $('#simplemodal-container') );
            $.modal.close();
          }
        });
      });
      $(widget).before( controls ).hide();
   });
  };

  includesWidget();

  $('#callAPI').live('submit', function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/call',
      data: $(this).serialize(),
      success: function(data) {
        var html = '<h3>' + data.url + ' - ' + data.code + '</h3>' + 
        '<pre class="prettyprint"></pre>';
        $('#response').html( html );
        $('#response pre').text( data.body );
        prettyPrint();
      },
      error: function() {
        alert('Boo - some crazy error.');
      },
      dataType: 'json'
    });
  });
  
});