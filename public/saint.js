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