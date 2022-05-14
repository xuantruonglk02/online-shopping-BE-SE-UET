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
  });

  $('.dropdown-menu.cart-dropdown').click(function (e) {
    e.stopPropagation();
  });

  $('.hd-cart-icon-ctn.dropdown').click(function (e) {
    if ($(this).find('.dropdown-menu').css('display') == 'none') {
      e.stopPropagation();
      showDropdownMenu($(this).find('.dropdown-menu'));
    } else {
      hideDropdownMenu($(this).find('.dropdown-menu'));
    }
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

// ----------------------------------------------------------------------------

var run = document.getElementById("images");
var x = 0;

setInterval(function(){
  if (x < 1475*2) x += 1475;
  else x = 0;
  run.style.marginLeft = '-' + x + 'px';
}, 3000)

const a = document.querySelectorAll("button");
a.forEach(function(button, index) {
  button.addEventListener("click", function(event){
    var product = event.target.parentElement;
    var productImg = product.querySelector("img").src;
    var productName = product.querySelector("p").innerText;
    var productPrice = product.querySelector("h3").innerText;
    addCart(productImg, productName, productPrice);
  })
})

function addCart(productImg, productName, productPrice) {
  var addTr = document.createElement("tr");
  var trContent = '<tr><td><img src="' + productImg + '" style="width: 100px"></td><td>' + productName + '</td><td>' + productPrice + '</td><td><input type="radio" id="sizeS" name="Size" value="S"><label for="sizeS"> S </label><input type="radio" id="sizeM" name="Size" value="M"><label for="sizeM"> M</br></label><input type="radio" id="sizeL" name="Size" value="L"><label for="sizeL"> L </label></td><td><span class="deleteCart" style="cursor: pointer;">Xóa</span></td></tr>';
  addTr.innerHTML = trContent;
  var tbody = document.querySelector("#product-tbody");
  tbody.append(addTr);
  deleteCart();
}

function deleteCart() {
  var cartItem = document.querySelectorAll("#product-tbody tr");
  for(var i = 0; i < cartItem.length; i++) {
    var pro = document.querySelectorAll(".deleteCart");
    pro[i].addEventListener("click", function(event) {
      var deleteItem = event.target.parentElement.parentElement;
      deleteItem.remove();
    })
  }
}

const close = document.querySelector(".fa-xmark");
close.addEventListener("click", function() {
  var cart = document.querySelector(".section-cart");
  cart.style.right = '-100%';
})

const open = document.querySelector(".fa-cart-shopping");
open.addEventListener("click", function() {
  var cart = document.querySelector(".section-cart");
  cart.style.right = '0';
})

const search = document.querySelector(".search-input");
search.addEventListener("click", function() {
  var x = document.querySelector(".search-list");
  x.style.display = 'block';
  const list = document.querySelectorAll(".search-list li");
  list[0].addEventListener("click", function() {
    var searchInput = document.querySelector(".search-input");
    searchInput.value = "Sơ mi";
    x.style.display = 'none';
  })
  list[1].addEventListener("click", function() {
    var searchInput = document.querySelector(".search-input");
    searchInput.value = "Hoddie";
    x.style.display = 'none';
  })
  list[2].addEventListener("click", function() {
    var searchInput = document.querySelector(".search-input");
    searchInput.value = "Quần jeans";
    x.style.display = 'none';
  })
  list[3].addEventListener("click", function() {
    var searchInput = document.querySelector(".search-input");
    searchInput.value = "Quần âu";
    x.style.display = 'none';
  })
})

function enter() {
  var value = document.querySelector(".search-input").value;
  switch(value) {
    case "Quần âu": window.location = 'au.html';break;
    case "Quần jeans": window.location = 'jeans.html';break;
    default: {
      var x = document.querySelector(".search-list");
      x.style.display = 'none';
    }
  }
}

const aa = document.querySelectorAll(".cart-jeans");
aa.forEach(function(button, index) {
  button.addEventListener("click", function(event){
    var product = event.target.parentElement;
    var productImg = product.parentElement.parentElement.querySelector("img").src;
    var productName = product.querySelector("h1").innerText;
    var productPrice = product.querySelector("h2").innerText;
    addCart(productImg, productName, productPrice);
  })
})
