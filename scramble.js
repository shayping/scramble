var incanvas = document.getElementById('inCanvas');
var context = incanvas.getContext('2d');
var imageObj = new Image();
var rawData;

imageObj.onload = function() {
 context.drawImage(imageObj, 0, 0);
 rawData = context.getImageData(0, 0, 578, 400);
 var mean, median;
 var valrange = [];
 //console.dir(rawData);
 for (var i = 0; i < rawData.data.length; i += 4) {
  var luma = 0.299 * rawData.data[i] +
   0.587 * rawData.data[1 + 1] +
   0.114 * rawData.data[i + 2];
  rawData.data[i] = luma;
  rawData.data[i + 1] = luma;
  rawData.data[i + 2] = luma;
  valrange.push(luma);
 }
 valrange.sort();
 mean = valrange.reduce((pv, cv) => pv + cv, 0) / valrange.length;
 median = valrange[Math.floor(valrange.length / 2)];
 var q60 = valrange[Math.floor(valrange.length / 10) * 6]
 console.log('mean = ' + mean);
 console.log('median = ' + median);
 for (var i = 0; i < rawData.data.length; i += 4) {
  if (rawData.data[i] > q60) {
   rawData.data[i] = 255;
   rawData.data[i + 1] = 255;
   rawData.data[i + 2] = 255;
  }
 }
 context.putImageData(rawData, 0, 0);
 var o = psnr(rawData.data, rawData.data.map(x => x + 10), 4);
 console.log('psnr == ' + o);
};
// imageObj.crossOrigin = 'Anonymous';
imageObj.src = 'mebw.jpg';



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
