/**
 * @file
 * Custom scripts for theme.
 */
(function ($) {
  $('#toggle').click(function() {
    $(this).toggleClass('active');
    $('#page-overlay').toggleClass('open');
  });
  $('#button-install').click(function(){
    $(window).scrollTo('#install-instructions',1000,{offset: {top:-140} });
  });
})(jQuery);