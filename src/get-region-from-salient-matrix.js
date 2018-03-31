const getMetaFromSalientMatrix = require('./get-meta-from-salient-matrix');
const getRegionFromMeta = require('./get-region-from-meta');

function getRegionFromSalientMatrix(salientData, options) {
  const meta = getMetaFromSalientMatrix(salientData);
  return getRegionFromMeta(meta, options);
}

module.exports = getRegionFromSalientMatrix;
