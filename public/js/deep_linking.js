$(function() {

  if ( window.location.hash ) {
    var hash = window.location.hash;
  }
  
  $(document.body).bind('methodListLoaded', function(e,data) {
    window.location.replace( '#!' + data.href );
    
  });

  $(document.body).bind('methodLoaded', function(e,data) {
    window.location.replace( '#!' + data.href );
  });

});