$(function () {

  $(document.body).bind('loadMethodList', function(e,href) {
    $('#methods').load( href + '?inline=1', function() {
      $(document.body).trigger("methodListLoaded", { href: href });
    });
    $('#method').html('');
  });

  $(document.body).bind('loadMethod', function(e,href) {
    $('#method').load( href + '?inline=1', function() {
      $(document.body).trigger("methodLoaded", { href: href });
      $('button').button();
    });
  });

  $('#resources a').live('click', function(e) {
    e.preventDefault();
    $(document.body).trigger('loadMethodList', this.getAttribute('href') );
  });

  $('#methods a').live('click', function(e) {
    e.preventDefault();
    $(document.body).trigger('loadMethod', this.getAttribute('href') );
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
  
});