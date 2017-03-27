var num = 1;
$('img').attr("src","img/2.jpeg");

$(window).scroll(function () {
  num = $(window).scrollTop() / 3;

 if( parseInt(num) === num){

      $('img').attr("src","img/2.jpeg");}
  else{}

  if (num<1){
    $('img').attr("src","img/1.jpg");
  }
    if (num>30){
    $('img').attr("src","img/3.jpg");
      $("img").css("position","absolute");
  }


});
