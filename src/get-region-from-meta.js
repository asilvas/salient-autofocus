const constants = require('./constants');

function getRegionFromMeta({ v, /*c, */r25th, r40th, r50th, r75th, r90th } = {}, { imageWidth, imageHeight, regionWidth, regionHeight }) {
  if (v !== constants.VERSION) throw new Error(`v:${constants.VERSION} required`);
  if (!imageWidth) throw new Error('`imageWidth` required');
  if (!imageHeight) throw new Error('`imageHeight` required');
  if (!regionWidth) throw new Error('`regionWidth` required');
  if (!regionHeight) throw new Error('`regionHeight` required');

  const regions = [];

  if (r90th) regions.push(autoFocusFromSaliency(r90th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true }));
  if (r75th) regions.push(autoFocusFromSaliency(r75th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true }));
  if (r50th) regions.push(autoFocusFromSaliency(r50th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true }));
  if (r40th) regions.push(autoFocusFromSaliency(r40th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true }));
  if (r25th) regions.push(autoFocusFromSaliency(r25th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true }));

  if (!regions.length) autoFocusFromSaliency({ l: 0.5, t: 0.5, w: 0, h: 0 }, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true });

  const regionSum = regions.reduce((state, r) => {
    return {
      left: state.left + r.left,
      top: state.top + r.top
    }
  }, { left: 0, top: 0 });

  const regionMean = {
    left: Math.round(regionSum.left / regions.length),
    top: Math.round(regionSum.top / regions.length),
    width: regions[0].width,
    height: regions[0].height
  };

  regionMean.right = regionMean.left + regionMean.width - 1;
  regionMean.bottom = regionMean.top + regionMean.height - 1;

  return regionMean;
}



function autoFocusFromSaliency({ l, t, w, h }, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort }) {
  let finalRegionWidth = regionWidth;
  let finalRegionHeight = regionHeight;

  const aspectX = regionWidth / regionHeight;
  const aspectY = regionHeight / regionWidth;
  if (finalRegionWidth > imageWidth) {
    // reduce region size if we must but retain aspect
    finalRegionWidth = imageWidth;
    finalRegionHeight = Math.round(finalRegionWidth * aspectY);
  }
  if (finalRegionHeight > imageHeight) {
    // reduce region size if we must but retain aspect
    finalRegionHeight = imageHeight;
    finalRegionWidth = Math.round(finalRegionHeight * aspectX);
  }

  const leftPx = Math.round(imageWidth * l);
  const topPx = Math.round(imageHeight * t);
  const widthPx = Math.round(imageWidth * w);
  const heightPx = Math.round(imageHeight * h);
  const rightPx = leftPx + widthPx;
  const bottomPx = topPx + heightPx;
  const centerX = leftPx + Math.round(widthPx / 2);
  const centerY = topPx + Math.round(heightPx / 2);

  // place region in center of saliency
  let left = Math.max(centerX - Math.round(finalRegionWidth / 2), 0); // do not allow negative
  let top = Math.max(centerY - Math.round(finalRegionHeight / 2), 0); // do not allow negative
  let right = left + finalRegionWidth - 1;
  if (right >= imageWidth) {
    right = imageWidth - 1;
    left = Math.max(right - (finalRegionWidth - 1), 0); // do not allow negative
  }
  let bottom = top + finalRegionHeight - 1;
  if (bottom >= imageHeight) {
    bottom = imageHeight - 1;
    top = Math.max(bottom - (finalRegionHeight - 1), 0); // do not allow negative
  }
  right = Math.min(right, imageWidth-1); // cap width
  bottom = Math.min(bottom, imageHeight-1); // cap height
  const width = right - left + 1; // calc final width
  const height = bottom - top + 1; // calc final height

  if (!bestEffort) { // if best effort isn't good enough, only return success if we met all region requirements
    if (left > leftPx || top > topPx || right < rightPx || bottom < bottomPx) {
      return null;
    }
  }

  return { left, top, right, bottom, width, height };
}

module.exports = getRegionFromMeta;
