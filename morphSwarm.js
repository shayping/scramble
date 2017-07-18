/**
 * morphSwarn 
 * Requires jQuery adn html2canvas
 */
 
 /*global $*/
 /*global html2canvas*/
 
var morphSwarm = {};

morphSwarm.util = {};

/**
 * Given 2 1-d array buffers of equal lengths, compute the mean sq error
 * between the buffers.
 * @param Array buf1
 * @param Array buf2
 * @param int step - Step = 1 means to compare every element in buf1 & buf2.
 *                   Step = 2 means to increment by 2 (i.e skip every other) etc.
 *                   defaults to 1. e.g. 
 */
morphSwarm.util.mse = function(buf1, buf2, step) {
 step = step || 1; // Use step 4 for greyscale
 if ((buf1.length) != (buf2.length)) {
  throw new Error('Buffers given to mse must be of equal lengths.')
 }
 
 var err;
 var errSum = 0;
 for (var i = 0; i < buf1.length; i += step) {
  err = buf1[i] - buf2[i];
  errSum += err * err;
 }
 return errSum / buf1.length / step;
};

/**
 * Given 2 1-d array buffers of equal lengths, compute the snr between the two
 * buffers that represent images. Return of Infinity => image is identical.
 * @param Array buf1
 * @param Array buf2
 * @param int step - Step = 1 means to compare every element in buf1 & buf2.
 *                   Step = 2 means to increment by 2 (i.e skip every other) etc.
 *                   defaults to 1. e.g. 
 */
morphSwarm.util.psnr = function(buf1, buf2, step) {
 step = step || 1; // Use step 4 for greyscale
 if ((buf1.length) != (buf2.length)) {
  throw new Error('Buffers given to psnr must be of equal lengths.')
 }
 
 // At rgba px level.
 var maxMSE = 255 * 255; 
 return 10 * Math.log10(maxMSE / morphSwarm.util.mse(buf1, buf2, step))
};


/**
 * Given a div, use html5's canvas context to get the raw image data. Returns
 * a promise since this is an async process.
 * @param $div JQueryObject Of a div, with width and height set
 */
morphSwarm.util.asRawImage = function($div) {
 var w = $div.width();
 var h = $div.height();
 if (!w && !h) throw new Error('Width or height not present for div!');
 
 var d = $.Deferred();
 html2canvas($div[0], {
   onrendered: function(newCanvas) {
     var context = newCanvas.getContext('2d');
     var rawData = context.getImageData(0, 0, w, h);  
     d.resolve(rawData.data);
   }
  });   

 return d.promise();
};


// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Functions for creating the endFrame for morphing a div into an image


/**
 * @param refBuf is expected to a rgba buffer of the image we want to morph to
 * @param $srcDiv Is the parent div, who's child divs we want to jitter and 
 *                morph into an approximation of refBuf
 * @param maxIter Optional int to limit the max number of tries.
 */ 
morphSwarm.createSwarm = {};

morphSwarm.createSwarm.calcPSNR = function(refBuf, $srcDiv) {
  var d = $.Deferred();
  
  var p = morphSwarm.util.asRawImage($srcDiv);
  p.then(function(data) {
   var psnr = morphSwarm.util.psnr(refBuf, data, 4); 
   d.resolve(psnr);
  });
  
  
  return d.promise();
};

morphSwarm.createSwarm.placeDiv___ = function(refBuf, $srcDiv, $childDiv, snr, maxIter, rndW, rndH) {
 var d = $.Deferred();
 
 var bestSNR = snr;
 var bestPosition = $childDiv.position();
 var done = false;
 
 var forChainDef = $.Deferred();
 var forChain = forChainDef.promise();
 
 for (var t = 0; t < maxIter; t++) {
  if (t == maxIter)  { forChainDef.resolve(); }
  else {
    forChain.then(function() {
      if (done) {
       forChainDef.resolve() 
      } else {
        var newTop = rndH();
        var newLeft = rndW();
        $childDiv.css({top: newTop+'px', left: newLeft+'px'});
  
        morphSwarm.createSwarm.calcPSNR(refBuf, $srcDiv).then(
          function(newSNR) {
            if (newSNR > bestSNR) {
             done = true;
             bestSNR = newSNR;
             forChain.done();
            } else {
             // Reset and try again
             $childDiv.css({top: bestPosition.top +'px', left: bestPosition.left +'px'});
             forChain.done();
            }
        });
      } 
    });
   }  
 } 
 
 forChain.then(
  function() { d.resolve(bestSNR) }
 );
 
 forChain.resolve(); // To start it off
 
 return d.promise();
};


morphSwarm.createSwarm.placeDiv = function(refBuf, $srcDiv, $childDiv, snr, maxIter, rndW, rndH) {
  var d = $.Deferred();
  var bestSNR = snr;
  var bestPosition = $childDiv.position();
  var done = false;
 
  // Loop up to maxIter or until we find a position which improves the snr.
  var d2 = $.Deferred();
  function doIteration(n) {
   var newTop = rndH();
   var newLeft = rndW();
   $childDiv.css({top: newTop+'px', left: newLeft+'px'});
   var _d = $.Deferred();
   
   if (done) {
     _d.reject();
   } else {
     var p = morphSwarm.createSwarm.calcPSNR(refBuf, $srcDiv);
     p.then(
       function(newSNR) {
         console.log('running iteration ' + n);
         console.log('  newSNR = ' + newSNR);
         console.log('  bestSNR = ' + bestSNR);
         if (newSNR > bestSNR) {
           done = true;
           bestSNR = newSNR;
           console.log('Accepting snr = ' + newSNR);
           _d.resolve();
         } else {
           // Reset and try again
           $childDiv.css({top: bestPosition.top +'px', left: bestPosition.left +'px'});
           console.log('Rejecting');
           _d.reject();
         }
       });
    }
    
    return _d.promise();
  }
 
  for (var t=0; t < maxIter; t++) {
    d2.then(doIteration(t))
  }
  
  d2.done(
    function() {
      console.log('d2 done!');
      d.resolve();
  });
  d2.fail(
    function() {d.reject()}
  );
  
 
  return d.promise();
};



morphSwarm.createSwarm.build = function(refBuf, $srcDiv, maxIter) {
 console.log('Starting');  
 maxIter = maxIter || 100;
 var w = $srcDiv.width();
 var h = $srcDiv.height();
 var rndW = function() {return Math.round(Math.random() * w)};
 var rndH = function() {return Math.round(Math.random() * h)};
 
 var snr = Infinity;
 var childDivs = $srcDiv.children();
 childDivs.detach();
 
 // Init
 var prom = morphSwarm.createSwarm.calcPSNR(refBuf, $srcDiv);
 var d = $.Deferred();
 
 prom.then(
  function(newPSNR) { 
    snr = newPSNR;
    console.log('Initial psnr = ' + snr);
    d.resolve();
  }
 )
 
 d.then(
   function() {
      var $child = $(childDivs[0]);
      $child.appendTo($srcDiv);
 
      return morphSwarm.createSwarm.placeDiv(refBuf, $srcDiv, $child,
                                             snr, maxIter, rndW, rndH
      );
   }
 ).then(function(){
  console.log('done!!!!!!!')
 });
 

 
  return d.promise();
}
 
 
 
 