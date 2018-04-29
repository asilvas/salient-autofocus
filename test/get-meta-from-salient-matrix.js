const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
const lib = require('../');

describe('#get-meta-from-salient-matrix', () => {

  /*
    getMetaFromSalientMatrix(salientData)
  */

  let data, options;

  beforeEach(() => {
    data = [
      [0.5, 0, 0],
      [0, 0.5, 0],
      [0, 0, 0.5]
    ];

    options = {
      gridRows: 20,
      gridCols: 20
    };
  });

  function main() {
    return lib.getMetaFromSalientMatrix(data, options);
  }

  it('defaults don\'t throw and return required fields', () => {
    const result = main();

    expect(result).to.be.deep.equal({
      v: 1,
      c: { x: 0.5, y: 0.5 },
      r25th: { l: 0, t: 0, w: 0.05, h: 0.05 },
      r40th: { l: 0, t: 0, w: 0.4, h: 0.4 },
      r50th: { l: 0, t: 0, w: 0.4, h: 0.4 },
      r75th: { l: 0, t: 0, w: 0.7, h: 0.7 },
      r90th: { l: 0, t: 0, w: 0.7, h: 0.7 }
    });
  });
  
});
