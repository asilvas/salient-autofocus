const VERSION = 1;
const GRAVITY_SORT_DISTANCE_WEIGHT = 1.0;
const GRAVITY_SORT_SALIENT_WEIGHT = 1.5;

function getMetaFromSalientMatrix(salientData) {
  const rows = salientData.length;
  const cols = salientData[0].length;

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
  const gridRows = 20;
  const gridCols = 20;
  const salientGrid = downsize(salientData, { rows: gridRows, cols: gridCols });

  // filter out the center grid cell since it's our starting point
  let gravityArr = matrixToGravityArray(salientGrid);

  // first gravity point will be our center
  let gravity = gravityArr.pop();
  let regionSum = gravity.sum;
  
  // re-sort based on both the saliency and distance from starting point
  const gravitySorter = (a, b) => {
    const distanceA = Math.abs(a.row - gravity.row) + Math.abs(a.col - gravity.col);
    const distanceB = Math.abs(b.row - gravity.row) + Math.abs(b.col - gravity.col);
    const weightA = (distanceA * GRAVITY_SORT_DISTANCE_WEIGHT) + (a.sum * GRAVITY_SORT_SALIENT_WEIGHT);
    const weightB = (distanceB * GRAVITY_SORT_DISTANCE_WEIGHT) + (b.sum * GRAVITY_SORT_SALIENT_WEIGHT);

    return weightA < weightB ? -1 : weightA > weightB ? 1 : 0; // ASC
  };
  gravityArr.sort(gravitySorter);

  let left = gravity.col;
  let right = gravity.col;
  let top = gravity.row;
  let bottom = gravity.row;
  
  let width, height, regionRatio, r25th, r50th, r75th, r90th;
  do {
    width = right - left + 1;
    height = bottom - top + 1;
  
    regionRatio = regionSum / sum;
    if (!r25th && regionRatio >= 0.25) {
      r25th = { l: +(left/gridCols).toFixed(4), t: +(top/gridRows).toFixed(4), w: +(width/gridCols).toFixed(4), h: +(height/gridRows).toFixed(4) };
    }  
    if (!r50th && regionRatio >= 0.5) {
      r50th = { l: +(left/gridCols).toFixed(4), t: +(top/gridRows).toFixed(4), w: +(width/gridCols).toFixed(4), h: +(height/gridRows).toFixed(4) };
    }  
    if (!r75th && regionRatio >= 0.75) {
      r75th = { l: +(left/gridCols).toFixed(4), t: +(top/gridRows).toFixed(4), w: +(width/gridCols).toFixed(4), h: +(height/gridRows).toFixed(4) };
    }  
    if (!r90th && regionRatio >= 0.9) {
      r90th = { l: +(left/gridCols).toFixed(4), t: +(top/gridRows).toFixed(4), w: +(width/gridCols).toFixed(4), h: +(height/gridRows).toFixed(4) };
    }

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
    v: VERSION,
    c: {
      x: +(center[0]).toFixed(4),
      y: +(center[1]).toFixed(4)
    },
    r25th,
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
  const gravityArr = new Array(rows * cols);
  let row, col, i = 0;
  for (row = 0; row < rows; row++) {
    for (col = 0; col < cols; col++) {
      gravityArr[i++] = { row, col, sum: mat[row][col] };
    }
  }

  // no need for empty cells
  return gravityArr.filter(({ sum }) => sum > 0).sort((a, b) => a.sum < b.sum ? -1 : a.sum > b.sum ? 1 : 0); // ASC
}

module.exports = getMetaFromSalientMatrix;
