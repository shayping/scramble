/* global html2canvas */
/* global Image */
var incanvas = document.getElementById('inCanvas');
var context = incanvas.getContext('2d');
var imageObj = new Image();
var rawData;

imageObj.onload = function() {
 context.drawImage(imageObj, 0, 0);
 rawData = context.getImageData(0, 0, 410, 400);
 var mean, median;
 var valrange = [];
 var o = psnr(rawData.data, rawData.data.map(x => x + 10), 4);
 console.log('psnr == ' + o);
};
// imageObj.crossOrigin = 'Anonymous';
imageObj.src = 'mebw.jpg';

/// --------------------------------------------------
// Populate the div
var thediv = document.getElementById('thediv');
var txt = "The heights that great men#"+
 "reached and kept,#"+
 "were not achieved by sudden flights.#"+
 "But while the companions#"+ 
 "lay a sleep,#"+
 "they were toiling through the night."


// Add divs
function addDiv(d, txt) {
 var x=0.5, y=1.1;

 var s = new Set(['f','i','j','l','r','t']);
 var ss = new Set(['w','m']);
 function w(t) {
  if (s.has(t)) return 0.35;
  if (ss.has(t)) return 0.78;
  return 0.62;
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
  //if (x==0 && i !=0) {
   e.style.top = y + 'em';
   //e.style.position = 'relative';
  //}
  d.appendChild(e);
 
  x = x +  w(t);
 }
}


addDiv(thediv, txt);



// Start random jitter
function scrambleEgg(d, c, w, h) {
 var divs = d.children;
 
}
// Save div as img
html2canvas(thediv,
 {
  onrendered: function(c) {
   document.body.appendChild(c);
  }
 }
)


//-------------------------------------------------------

function mse(buf1, buf2, step) {
 var err;
 var errSum = 0;
 step = step || 1; // Use step 4 for greyscale
 for (var i = 0; i < buf1.length; i += step) {
  err = buf1[i] - buf2[i];
  errSum += err * err;
 }
 return errSum / buf1.length / step;
}

function psnr(buf1, buf2, step) {
 // Infinity means image is identical
 var max = 255 * 255;
 return 10 * Math.log10(max / mse(buf1, buf2, step))
}
