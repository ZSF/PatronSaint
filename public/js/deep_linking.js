$(function() {

  if ( window.location.hash ) {
    var parts = window.location.hash.split('/');
    switch( parts[1] ) {
      case 'method':
          var methodUrl = '/' + parts.slice(1).join('/');
          var resourceUrl = '/resource/' + parts.slice(2,-1).join('/');
          $(document.body).trigger('loadMethodList', resourceUrl );
          $(document.body).trigger('loadMethod', methodUrl );
        break;
      case 'resource':
        var resourceUrl = '/' + parts.slice(1).join('/');
        $(document.body).trigger('loadMethodList', resourceUrl );
        break;
    }
  }
  
  $(document.body).bind('methodListLoaded', function(e,data) {
    window.location.replace( '#!' + data.href );
  });

  $(document.body).bind('methodLoaded', function(e,data) {
    window.location.replace( '#!' + data.href );
  });

});