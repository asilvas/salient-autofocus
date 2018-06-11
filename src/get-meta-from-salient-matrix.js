const assert = require('assert');
const constants = require('./constants');

function getComputeModOptions({ valueMin, valueMax, biasMin, biasMax, fn, scalar }) {
  assert(valueMin !== undefined, 'valueMin required');
  assert(valueMax !== undefined, 'valueMax required');
  assert(biasMin !== undefined, 'biasMin required');
  assert(biasMax !== undefined, 'biasMax required');
  assert(fn !== undefined, 'fn required');

  return {
    valueMin,
    valueMax,
    valueRange: Math.abs(valueMax - valueMin),
    biasMin,
    biasMax,
    biasRange: biasMax - biasMin,
    fn,
    scalar
  };
}

function computeMod(cell, { valueMin, valueMax, valueRange, biasMin, biasMax, biasRange, fn, scalar }) {
  const val = fn(cell);

  let factor;

  if (valueMin < valueMax) { // ex: 0 to 100
    factor = ((val - valueMin) / valueRange);    
  } else { // ex: 100 to 0
    factor = 1 - ((val - valueMax) / valueRange);    
  }  

  if (scalar) { // apply scalar algorithm if linear is not desired
    factor = scalar(factor);
  }

  // compute final mod
  return biasMin + (biasRange * factor);
}

function getMetaFromSalientMatrix(salientData, { gridRows=constants.GRID_ROWS, gridCols=constants.GRID_COLS } = {}) {
  const rows = salientData.length;
  const cols = salientData[0].length;

  // middle should be float for accuracy, do not round
  const middleRow = gridRows / 2;
  const middleCol = gridCols / 2;

  let row, col, x, y, xDelta, yDelta, cell, sum, weight;
  let center = [0.5, 0.5]; // [x,y]

  // calc center
  sum = 0;
  for (row = 0; row < rows; row++) {
    for (col = 0; col < cols; col++) {
      cell = salientData[row][col];
      if (!cell) continue; // skip if non-salient
      weight = sum ? cell / sum : 1;
      x = col / cols;
      y = row / rows;
      xDelta = center[0] - x;
      yDelta = center[1] - y;
      center[0] -= (xDelta * weight);
      center[1] -= (yDelta * weight);
      sum += cell;
    }
  }

  // regardless of the size of the salient matrix, we want to focus on a fixed grid to perform gravitational saliency detection for the most accurate autofocus possible
  const salientGrid = downsize(salientData, { rows: gridRows, cols: gridCols });

  // filter out the center grid cell since it's our starting point
  const { gravityArr, topSum } = matrixToGravityArray(salientGrid);
  
  if (!gravityArr.length) {
    // if no gravity, return default center/center
    return {
      v: constants.VERSION,
      c: {
        x: 0.5,
        y: 0.5
      }
    };
  }

  const saliencyModOptions = getComputeModOptions({
    valueMin: 0,
    valueMax: topSum,
    biasMin: constants.GRAVITY_BIAS_SALIENCY.MIN,
    biasMax: constants.GRAVITY_BIAS_SALIENCY.MAX,
    fn: cell => cell.sum,
    scalar: constants.GRAVITY_BIAS_SALIENCY.SCALAR
  });

  const centerModOptions = getComputeModOptions({
    valueMin: 1,
    valueMax: 0,
    biasMin: constants.GRAVITY_BIAS_CENTER.MIN,
    biasMax: constants.GRAVITY_BIAS_CENTER.MAX,
    fn: cell => (((Math.abs(cell.row - middleRow) / middleRow) + (Math.abs(cell.col - middleCol) / middleCol)) / 2),
    scalar: constants.GRAVITY_BIAS_CENTER.SCALAR
  });

  const topModOptions = getComputeModOptions({
    valueMin: gridRows,
    valueMax: 0,
    biasMin: constants.GRAVITY_BIAS_TOP.MIN,
    biasMax: constants.GRAVITY_BIAS_TOP.MAX,
    fn: cell => cell.row,
    scalar: constants.GRAVITY_BIAS_TOP.SCALAR
  });
  
  // re-sort based on both the saliency and distance from starting point
  const gravitySorter = (a, b) => {
    const saliencyA = computeMod(a, saliencyModOptions);
    const saliencyB = computeMod(b, saliencyModOptions);

    const centerA = computeMod(a, centerModOptions);
    const centerB = computeMod(b, centerModOptions);

    const topA = computeMod(a, topModOptions);
    const topB = computeMod(b, topModOptions);
    
    const weightA = saliencyA * centerA * topA;
    const weightB = saliencyB * centerB * topB;

    return weightA < weightB ? -1 : weightA > weightB ? 1 : 0; // ASC
  };
  gravityArr.sort(gravitySorter);

  // first gravity point will be our center
  let gravity = gravityArr.pop();
  
  let regionSum = gravity.sum;
  let left = gravity.col;
  let right = gravity.col;
  let top = gravity.row;
  let bottom = gravity.row;
  
  let width, height, regionRatio, region, r25th, r40th, r50th, r75th, r90th;
  do {
    width = right - left + 1;
    height = bottom - top + 1;
  
    regionRatio = regionSum / sum;
    region = { l: +(left/gridCols).toFixed(4), t: +(top/gridRows).toFixed(4), w: +(width/gridCols).toFixed(4), h: +(height/gridRows).toFixed(4) };

    if (!r25th && regionRatio >= 0.25) r25th = region;
    if (!r40th && regionRatio >= 0.4) r40th = region;
    if (!r50th && regionRatio >= 0.5) r50th = region;  
    if (!r75th && regionRatio >= 0.75) r75th = region;  
    if (!r90th && regionRatio >= 0.9) r90th = region;

    let moved = false;

    // gravitate in one dimension at a time towards the next most salient grid cell
    if (gravity.col < left) {
      left--;
      for (row = top; row <= bottom; row++) regionSum += salientGrid[row][left] || 0;
      moved = true;
    } else if (gravity.col > right) {
      right++;
      for (row = top; row <= bottom; row++) regionSum += salientGrid[row][right] || 0;
      moved = true;
    }
    if (gravity.row < top) {
      top--;
      for (col = left; col <= right; col++) regionSum += salientGrid[top][col] || 0;
      moved = true;
    } else if (gravity.row > bottom) {
      bottom++;
      for (col = left; col <= right; col++) regionSum += salientGrid[bottom][col] || 0;
      moved = true;
    }

    if (!moved) {
      gravity = gravityArr.pop(); // next gravity point to gravitate towards
    }
  } while (!r90th && gravity);

  return {
    v: constants.VERSION,
    c: {
      x: +(center[0]).toFixed(4),
      y: +(center[1]).toFixed(4)
    },
    r25th,
    r40th,
    r50th,
    r75th,
    r90th
  };
}

function downsize(mat, { rows, cols }) {
  const matRows = mat.length;
  const matCols = mat[0].length;
  let row, col, cell, cell2;

  // alloc 2d matrix
  const ret = new Array(rows);
  for (row = 0; row < rows; row++) ret[row] = new Array(cols);

  for (row = 0; row < mat.length; row++) {
    for (col = 0; col < matCols; col++) {
      cell = mat[row][col];
      cell2 = mapCells(row, col, matRows, matCols, rows, cols);
      ret[cell2.row][cell2.col] = (ret[cell2.row][cell2.col] || 0) + cell;
    }
  }

  return ret;
}

function mapCells(fromRow, fromCol, fromRows, fromCols, toRows, toCols) {
  return {
    row: Math.min(Math.round((fromRow / fromRows) * toRows), toRows-1),
    col: Math.min(Math.round((fromCol / fromCols) * toCols), toCols-1)
  };
}

/*
  map salient matrix (row[col[cell]]) to an array ([{ row, col, sum }]) ordered by sum in ascending order to permit pop
*/
function matrixToGravityArray(mat) {
  const rows = mat.length;
  const cols = mat[0].length;
  const rowTip = rows - 1;
  const colTip = cols - 1;
  const gravityArr = [];

  let row, col, sum, topSum = 0;
  for (row = 0; row < rows; row++) {
    for (col = 0; col < cols; col++) {
      sum = mat[row][col];
      if (!sum) continue;

      topSum = Math.max(topSum, sum);

      gravityArr.push({ row, col, sum });
    }
  }

  return {
    gravityArr,
    topSum
  };
}

module.exports = getMetaFromSalientMatrix;
