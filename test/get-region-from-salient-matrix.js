const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
const lib = require('../');

describe('#get-region-from-salient-matrix', () => {

  /*
    getRegionFromSalientMatrix(salientData, { imageWidth, imageHeight, regionWidth, regionHeight })
  */

  let data, options;

  beforeEach(() => {
    data = [
      [0.5, 0, 0],
      [0, 0.5, 0],
      [0, 0, 0.5]
    ];

    options = {
      imageWidth: 1024,
      imageHeight: 768,
      regionWidth: 640,
      regionHeight: 480
    };
  });

  function main() {
    return lib.getRegionFromSalientMatrix(data, options);
  }

  it('defaults don\'t throw', () => {
    const result = main();
  });

});
