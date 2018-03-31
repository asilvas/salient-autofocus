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

  let data;

  beforeEach(() => {
    data = [
      [0.5, 0, 0],
      [0, 0.5, 0],
      [0, 0, 0.5]
    ];
  });

  function main() {
    return lib.getMetaFromSalientMatrix(data);
  }

  it('defaults don\'t throw and return required fields', () => {
    const result = main();

    expect(result).to.be.deep.equal({
      v: 1,
      c: { x: 0.5, y: 0.5 },
      r25th: { l: 0.65, t: 0.65, w: 0.05, h: 0.05 },
      r50th: { l: 0.35, t: 0.35, w: 0.35, h: 0.35 },
      r75th: { l: 0, t: 0, w: 0.7, h: 0.7 },
      r90th: { l: 0, t: 0, w: 0.7, h: 0.7 }
    });
  });
  
});
