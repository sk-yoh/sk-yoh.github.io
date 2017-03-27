var num = 1;
$('img').attr("src","https://sk-yoh.github.io/img/2.jpeg");

$(window).scroll(function () {
  num = $(window).scrollTop() / 3;

 if( parseInt(num) === num){

      $('img').attr("src","https://sk-yoh.github.io/img/2.jpeg");}
  else{}

  if (num<1){
    $('img').attr("src","https://sk-yoh.github.io/img/1.jpg");
  }
    if (num>30){
    $('img').attr("src","https://sk-yoh.github.io/img/3.jpg");
      $("img").css("position","absolute");
  }


});
