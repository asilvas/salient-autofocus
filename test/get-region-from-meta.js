const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
const lib = require('../');

describe('#get-region-from-meta', () => {

  /*
    getRegionFromMeta({ v, c, r25th, r50th, r75th, r90th }, { imageWidth, imageHeight, regionWidth, regionHeight })
  */

  let meta, options;

  beforeEach(() => {
    meta = {
      v: 1,
      c: [0.5, 0.5],
      r25th: { l: 0.45, t: 0.45, w: 0.1, h: 0.1 },
      r50th: { l: 0.40, t: 0.40, w: 0.2, h: 0.2 },
      r75th: { l: 0.35, t: 0.35, w: 0.3, h: 0.3 },
      r90th: { l: 0.25, t: 0.25, w: 0.5, h: 0.5 }
    };

    options = {
      imageWidth: 1024,
      imageHeight: 768,
      regionWidth: 640,
      regionHeight: 480
    };
  });

  function main() {
    return lib.getRegionFromMeta(meta, options);
  }

  it('defaults don\'t throw', () => {
    let err, result;
    try {
      result = main();
    } catch (ex) {
      err = ex;
    }

    expect(err).to.not.exist;
  });

  it('fix regionWidth if it exceeds imageWidth', () => {
    options.regionWidth = 1400;
    let err, result;
    try {
      result = main();
    } catch (ex) {
      err = ex;
    }

    expect(err).to.not.exist;
    expect(result).to.deep.equal({
      "bottom": 558,
      "height": 351,
      "left": 0,
      "right": 1023,
      "top": 208,
      "width": 1024
    });
  });

  it('fix regionHeight if it exceeds imageHeight', () => {
    options.regionHeight = 1200;
    let err, result;
    try {
      result = main();
    } catch (ex) {
      err = ex;
    }

    expect(err).to.not.exist;
    expect(result).to.deep.equal({
      "bottom": 767,
      "height": 768,
      "left": 307,
      "right": 716,
      "top": 0,
      "width": 410
    });
  });
  
  describe('#regions', () => {

    it('90th percentile region', () => {
      let err, result;
      try {
        result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.not.exist;
      expect(result).to.deep.equal({
        "bottom": 623,
        "height": 480,
        "left": 192,
        "right": 831,
        "top": 144,
        "width": 640
      });
    });

    it('75th percentile region', () => {
      options.regionWidth = 400;
      options.regionHeight = 400;
      let err, result;
      try {
        result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.not.exist;
      expect(result).to.deep.equal({
        "bottom": 583,
        "height": 400,
        "left": 312,
        "right": 711,
        "top": 184,
        "width": 400
      });
    });

    it('50th percentile region', () => {
      options.regionWidth = 300;
      options.regionHeight = 300;
      let err, result;
      try {
        result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.not.exist;
      expect(result).to.deep.equal({
        "bottom": 533,
        "height": 300,
        "left": 363,
        "right": 662,
        "top": 234,
        "width": 300
      });
    });

    it('25th percentile region', () => {
      options.regionWidth = 200;
      options.regionHeight = 200;
      let err, result;
      try {
        result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.not.exist;
      expect(result).to.deep.equal({
        "bottom": 484,
        "height": 200,
        "left": 412,
        "right": 611,
        "top": 285,
        "width": 200
      });
    });
      
  });

  describe('#meta', () => {

    it('v is required', () => {
      delete meta.v;
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('v:1 required');
    });

    it('v === 1', () => {
      meta.v = 'a';
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('v:1 required');
    });

  });

  describe('#options', () => {

    it('imageWidth is required', () => {
      delete options.imageWidth;
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('`imageWidth` required');
    });

    it('imageHeight is required', () => {
      delete options.imageHeight;
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('`imageHeight` required');
    });

    it('regionWidth is required', () => {
      delete options.regionWidth;
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('`regionWidth` required');
    });

    it('regionHeight is required', () => {
      delete options.regionHeight;
      let err;
      try {
        const result = main();
      } catch (ex) {
        err = ex;
      }
  
      expect(err).to.exist;
      expect(err.message).to.be.equal('`regionHeight` required');
    });
    
  });

});
