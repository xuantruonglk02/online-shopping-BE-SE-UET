$(document).ready(() => {
  if (params.get('minPrice')) $('#minPrice').val(params.get('minPrice'));
  if (params.get('maxPrice')) $('#maxPrice').val(params.get('maxPrice'));

  $('#price-filter-submit-btn').click(function () {
    let url = window.location.href;
    if ($('#minPrice').val() == '') {
      url = removeParam('minPrice', url);
    }
    if ($('#maxPrice').val() == '') {
      url = removeParam('maxPrice', url);
    }
    if ($('#minPrice').val() && !isNaN($('#minPrice').val())) {
      url = removeParam('minPrice', url) + '&minPrice=' + parseInt($('#minPrice').val());
    }
    if ($('#maxPrice').val() && !isNaN($('#maxPrice').val())) {
      url = removeParam('maxPrice', url) + '&maxPrice=' + parseInt($('#maxPrice').val());
    }
    window.location.href = removeParam('page', url) + '&page=1';
  });

  //----------------------------------------------------------------
  
  if (params.get('minStar')) {
    for (let i = 1; i <= params.get('minStar'); i++) {
      $('#rating-filter-star-' + i).addClass('checked');
    }
  }
  
  $('.rating-filter-option i').click(function() {
    window.location.href = removeParam('minStar', removeParam('page', window.location.href)) + '&page=1&minStar=' + $(this).attr('id')[$(this).attr('id').length - 1];
  });
  
  //----------------------------------------------------------------

  let order = params.get('orderBy');
  if (order == null) order = 'newest';
  if (order == 'priceASC' || order == 'priceDESC') {
    $('.products-sort-selection select').css('background-color', 'black');
    $('.products-sort-selection select').css('color', 'white');
    $('#' + order).attr('selected', 'selected');
  } else {
    $('#' + order).addClass('selected');
  }

  $('.products-sort-option').click(function() {
    if ($(this).hasClass('selected')) return;
    window.location.href = removeParam('orderBy', removeParam('page', window.location.href)) + '&page=1&orderBy=' + $(this).data().order;
  });
  $('.products-sort-selection').change(function () {
    window.location.href = removeParam('orderBy', removeParam('page', window.location.href)) + '&page=1&orderBy=' + $('#sort-selection').val();
  });
});

function gotoPage(n) {
  window.location.href = removeParam('page', window.location.href) + '&page=' + n;
}

function stepPage(n) {
  let page = parseInt(params.get('page'));
  window.location.href = removeParam('page', window.location.href) + '&page=' + (page + n);
}

function genPageButtons(curPage, totalPage) {
  let d = 0, l = curPage - 1, r = curPage + 1;
  let pagesList = makePageButton(curPage, curPage)
  while (d < 4) {
    if (l <= 0 && r > totalPage) break;
    if (l > 0) {
      pagesList = makePageButton(l, curPage) + pagesList;
      l--;
      d++;
    }
    if (r <= totalPage) {
      pagesList += makePageButton(r, curPage);
      r++;
      d++;
    }
  }
  if (curPage != 1) pagesList = makePageButton('p', null) + pagesList;
  if (curPage != totalPage) pagesList += makePageButton('n', null);
  return pagesList;
}

function makePageButton(content, cur) {
  if (content == 'p') {
    return '<div class="pages-btn-ctn"><a href="#" onclick="stepPage(-1); return false;"><div>&#10094;</div></a></div>';
  }
  if (content == 'n') {
    return '<div class="pages-btn-ctn"><a href="#" onclick="stepPage(1); return false;"><div>&#10095;</div></a></div>';
  }
  if (content == 'd') {
    return '<div class="pages-btn-ctn" style="background-color: black;"><a href="#" onclick="return false" style="cursor: default;"><div>...</div></a></div>';
  }
  return '<div class="pages-btn-ctn' + (cur == content ? ' cur-page' : '') + '" id="page-btn-' + content + '"><a href="#" onclick="' + (cur == content ? '' : ('gotoPage(' + content + '); ')) + 'return false;"><div>' + content + '</div></a></div>';
}
