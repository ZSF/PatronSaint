$(function () {

  $(document.body).bind('loadMethodList', function(e,data) {
    $('#methods').load( data.href + '?inline=1', function() {
      $(document.body).trigger("methodListLoaded", data );
    });
    $('#method').html('');
  });

  $(document.body).bind('loadMethod', function(e,data) {
    var methodContainer = $('#method');
    methodContainer.load( data.href + '?inline=1', function() {
      $(document.body).trigger("methodLoaded", data);
      methodContainer
        .find('input.jsonMap').jsonbuilder().end()
        .find('#includes').patronincludes({ mode: 'includes' }).end()
        .find('#excludes').patronincludes({ mode: 'excludes' }).end()
        .find('input.hinted').hintedinput().end()        
        .find('button').button();
    });
  });
  
  $('#resources a').live('click', function(e) {
    e.preventDefault();
    $(document.body).trigger('loadMethodList', { href: this.getAttribute('href') } );
  });

  $('#methods a').live('click', function(e) {
    e.preventDefault();
    $(document.body).trigger('loadMethod', { href: this.getAttribute('href') } );
  });
    
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
  
  $('button').button();
  
});