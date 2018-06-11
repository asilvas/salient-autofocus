const constants = require('./constants');

function getRegionFromMeta({ v, /*c, */r25th, r40th, r50th, r75th, r90th } = {}, { imageWidth, imageHeight, regionWidth, regionHeight }) {
  if (v !== constants.VERSION) throw new Error(`v:${constants.VERSION} required`);
  if (!imageWidth) throw new Error('`imageWidth` required');
  if (!imageHeight) throw new Error('`imageHeight` required');
  if (!regionWidth) throw new Error('`regionWidth` required');
  if (!regionHeight) throw new Error('`regionHeight` required');

  let region;

  if (r90th) region = autoFocusFromSaliency(r90th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 90th percentile!
  if (r75th) region = autoFocusFromSaliency(r75th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 75th percentile!
  if (r50th) region = autoFocusFromSaliency(r50th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 50th percentile!
  if (r40th) region = autoFocusFromSaliency(r40th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 50th percentile!
  if (r25th) region = autoFocusFromSaliency(r25th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true });
  if (region) return region; // region 25th percentile regardless if perfect match or not, we used our best effort

  // if we get this far, there is no saliency, and we simply want to default to center/center
  return autoFocusFromSaliency({ l: 0.5, t: 0.5, w: 0, h: 0 }, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true });
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
