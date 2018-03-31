function getRegionFromMeta({ v, /*c, */r25th, r50th, r75th, r90th }, { imageWidth, imageHeight, regionWidth, regionHeight }) {
  if (v !== 1) throw new Error('v:1 required');
  if (!imageWidth) throw new Error('`imageWidth` required');
  if (!imageHeight) throw new Error('`imageHeight` required');
  if (!regionWidth) throw new Error('`regionWidth` required');
  if (!regionHeight) throw new Error('`regionHeight` required');

  let region;

  region = autoFocusFromSaliency(r90th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 90th percentile!
  region = autoFocusFromSaliency(r75th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 75th percentile!
  region = autoFocusFromSaliency(r50th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: false });
  if (region) return region; // perfect match for 50th percentile!
  region = autoFocusFromSaliency(r25th, { imageWidth, imageHeight, regionWidth, regionHeight, bestEffort: true });

  return region; // region 25th percentile regardless if perfect match or not, we used our best effort
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
  const left = Math.max(centerX - Math.round(finalRegionWidth / 2), 0); // do not allow negative
  const top = Math.max(centerY - Math.round(finalRegionHeight / 2), 0); // do not allow negative
  const right = Math.min(left + finalRegionWidth - 1, imageWidth-1); // cap width
  const bottom = Math.min(top + finalRegionHeight - 1, imageHeight-1); // cap height
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
