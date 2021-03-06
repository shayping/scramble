/* global html2canvas */
/* global Image */
/* glboal $*/

var incanvas = document.getElementById('inCanvas');
var context = incanvas.getContext('2d');
var imageObj = new Image();
var rawData;

var d = $.Deferred();
imageObj.onload = function() {
 context.drawImage(imageObj, 0, 0);
 rawData = context.getImageData(0, 0, 400, 600);
 d.resolve();
};

// imageObj.crossOrigin = 'Anonymous';
imageObj.src = 'contemplate.jpg';

/// --------------------------------------------------
// Populate the div
var thediv = document.getElementById('thediv');
var txt = "The heights that great men#"+
 "reached and kept,#"+
 "were not achieved by sudden flights.#"+
 "But while the companions#"+ 
 "lay a sleep,#"+
 "they were toiling through the night.#" +
 "The heights that great men#"+
 "reached and kept,#"+
 "were not achieved by sudden flights.#"+
 "But while the companions#"+ 
 "lay a sleep,#"+
 "they were toiling through the night.";


// Add divs
function addDiv(d, txt) {
 var x=0.5, y=1.1;

 var s = new Set(['f','i','j','l','r','t']);
 var ss = new Set(['w','m']);
 
 function w(t) {
  if (s.has(t)) return 0.25;
  if (ss.has(t)) return 0.8;
  return 0.55;
 }
 
 for (var i=0; i < txt.length; i++) {
  if (txt[i] == '#') {
   x = 0.5; y +=1;
   continue;
  } 
  
  var e = document.createElement('div');
  var t = txt[i];
  e.innerText=t;
  e.style.position = 'absolute';
  e.style.left = x + 'em';
  e.style.top = y + 'em';
  d.appendChild(e);
 
  x = x +  w(t);
 }
}

addDiv(thediv, txt);

d.done(function(){
 var $srcDiv = $('div[id="thediv"]');
 morphSwarm.createSwarm.build(rawData.data, $srcDiv);
});





