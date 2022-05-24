$(document).ready(() => {
  const bgImages = ['/images/auth1.jpg', '/images/auth2.jpg', '/images/auth3.jpg'];
  let bgImage = 0;
  setInterval(() => {
    $('.auth-background').css('background-image', 'url("' + bgImages[bgImage] + '")');
    bgImage += 1;
    if (bgImage == bgImages.length) bgImage = 0;
  }, 5000);
});

function ajaxStart() {
  $('.auth-error').css('display', 'none');
  $('.success-notif').css('display', 'none');
  $('#submit-btn').data('enable', '0');
  $('#submit-btn').css('pointer-events', 'none');
  $('#submit-loader').css('display', 'block');
}

function ajaxStop() {
  $('#submit-btn').data('enable', '1');
  $('#submit-btn').css('pointer-events', 'all');
  $('#submit-loader').css('display', 'none');
}

function ajaxSuccess() {
  $('.form-split-line').css('display', 'block');
  $('.success-notif').css('display', 'block');
}
