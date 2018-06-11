const BezierEasing = require('bezier-easing');

module.exports = {
  VERSION: 2,

  GRID_ROWS: 15,
  GRID_COLS: 15,

  GRAVITY_BIAS_SALIENCY: {
    MIN: 0,
    MAX: 1,
    SCALAR: BezierEasing(.04,.37,0,1) // see http://cubic-bezier.com/#.04,.37,0,1
  },

  GRAVITY_BIAS_CENTER: { // center bias makes a big difference, combined with saliency makes for higher confidence truth
    MIN: 0.1,
    MAX: 1.0,
    SCALAR: BezierEasing(.4,.41,.65,.1) // see http://cubic-bezier.com/#.4,.41,.65,.1
  },

  GRAVITY_BIAS_TOP: { // helps with z-depth by a minor amount, but hacky solution
    MIN: 1.0,
    MAX: 1.1,
    SCALAR: BezierEasing(.2,.21,.95,.92) // see http://cubic-bezier.com/#.2,.21,.95,.92
  }
};
