/**
 * Morphs the source into an approximation of the given destination img.
 * The source can be an array of svg objects, or dom elements.
 * e.g. an array of points, or array of divs
 * 
 * 
 * 
 */ 
 
 
 /**
  * ref Array(rgba) the is the reference image we want to morph into
  * src JQuery selection of the parent Div we want to morph
  * 
  * The width and height of ref and src should match. 
  **/
 function morph(ref, $src, width, height, src2ImgFn) {
   var snr;
   $.when(src2ImgFn($src[0], width, height))
   .then(function (v) {
    snr = psnr(ref, v, 4);      
   }).then(function() {
   
    var divs = $src.children();
   
    for (var n=0; n<divs.length; n++) {
      var candidate = divs[n];  
      var pos = candidate.postion();
      var numIter = 0;
      var maxIter = 100;
     
      for(var it=0; it < maxIter; it++) {
        var newX = Math.floor(Math.random() * width);
        var newY = Math.floor(Math.random() * height);
       
        candidate.css({left: newX+'px', top: newY + 'px'})
        ////// Need to refactor with deferreds
         var temp_snr = psnr(ref, src2ImgFn($src[0], width, height), 4);
       
         if (temp_snr > snr) {
           snr = temp_snr;
           break;
         } else {
           candidate.css(pos);
         }
       } 
       console.log('Done with div ' + n);     
     }
   })
 }




 // ----
 function _divsToImg(theDiv, width, height) {
    var d = $.Deferred();
    html2canvas(thediv, {
        onrendered: function(newCanvas) {
            var context = newCanvas.getContext('2d');
            var rawData = context.getImageData(0, 0, width, height);  
            d.resolve(rawData);
        }
    })   


    return d.promise();
 }
 
 
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