$(function () {

  $('#resources a').live('click', function(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    $('#methods').load( href );
    $('#method').html('');
    $('#response').html('');
  });

  $('#methods a').live('click', function(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    $('#method').load( href );
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
    if ( childDiv[0].tagName == 'DIV' && childDiv.hasClass('nested') ) {
     childDiv.find('input:checked').each(function(e) {
       $(this).removeAttr('checked');
     });
    }
  }
  $('.checkboxes input[type="checkbox"]').live('change', function(e) {
    checkParents( this );
    uncheckChildren( this );
  });

  $('#callAPI').live('submit', function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/call',
      data: $(this).serialize(),
      success: function(data) {
        var html = '<h3>' + data.url + ' - ' + data.code + '</h3>' + 
        '<pre class="prettyprint">' + data.body + '</pre>';
        $('#response').html( html );
        prettyPrint();
      },
      error: function() {
        alert('Boo - some crazy error.');
      },
      dataType: 'json'
    });
  });
  
});