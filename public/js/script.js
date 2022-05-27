const params = new URLSearchParams(window.location.search);

$(document).ready(function () {
  $(window).scroll(function () {
    if ($(this).scrollTop() != 0) {
      $('.header').addClass('header-fixed');
    } else {
      $('.header').removeClass('header-fixed');
    }
  });

  $('.nav-item.dropdown').hover(function () {
    showDropdownMenu($(this).find('.dropdown-menu'));
  }, function () {
    hideDropdownMenu($(this).find('.dropdown-menu'));
  });

  $('html').click(function () {
    hideDropdownMenu($('.hd-cart-icon-ctn.dropdown .dropdown-menu'));
    hideDropdownMenu($('.hd-account-icon-ctn.dropdown .dropdown-menu'));
  });

  $('.dropdown-menu.user-dropdown').click(function (e) {
    e.stopPropagation();
  });

  $('.hd-cart-icon-ctn.dropdown').click(function (e) {
    if ($(this).find('.dropdown-menu').css('display') == 'none') {
      e.stopPropagation();
      showDropdownMenu($(this).find('.dropdown-menu'));
    } else {
      hideDropdownMenu($(this).find('.dropdown-menu'));
    }
    hideDropdownMenu($('.hd-account-icon-ctn.dropdown .dropdown-menu'));
  });
  $('.hd-account-icon-ctn.dropdown').click(function (e) {
    if ($(this).find('.dropdown-menu').css('display') == 'none') {
      e.stopPropagation();
      showDropdownMenu($(this).find('.dropdown-menu'));
    } else {
      hideDropdownMenu($(this).find('.dropdown-menu'));
    }
    hideDropdownMenu($('.hd-cart-icon-ctn.dropdown .dropdown-menu'));
  });
});

function showDropdownMenu(e) {
  e.css('display', 'block');
  e.removeClass('fadeOutUp');
  e.addClass('fadeInDown');
}

function hideDropdownMenu(e) {
  e.css('display', 'none');
  e.removeClass('fadeInDown');
  e.addClass('fadeOutUp');
}

function removeParam(key, sourceURL) {
  let rtn = sourceURL.split("?")[0],
      param,
      params_arr = [],
      queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (let i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}
