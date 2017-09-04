console.clear();

const zoomSwitch = document.querySelector('#switcher');
const floorPlans = document.querySelector('.floor-plans');
const floorPlan = document.querySelectorAll('.floor-plan');
const arrow = document.querySelectorAll('.arrow');

zoomSwitch.addEventListener('change', function(e){
  e.preventDefault();
  if( floorPlans.classList.contains('zoomed')) {
    floorPlans.classList.remove('zoomed');
    floorPlan.forEach(f => { f.classList.remove('focused') });
    floorInner.style.transform = 'translate(0, 0)';
  } else {
    floorPlans.classList.add('zoomed');
    floorPlan[0].classList.add('focused')
  }
});

const floorInner = document.querySelector('.floor-plans__inner');
let focused = 0;

arrow.forEach(a => {
  a.addEventListener('click', function(){
    if( focused == 0 ){
      floorPlan.forEach(f => { f.classList.remove('focused') });
      floorPlan[1].classList.add('focused');
      floorInner.style.transform = 'translate(calc(-50% + 50px), 0)';  
      focused = 1;
    }else{
      focused = 0;
      floorPlan.forEach(f => { f.classList.remove('focused') });
      floorPlan[0].classList.add('focused');
      floorInner.style.transform = 'translate(10px, 0)';
    }
  });
});