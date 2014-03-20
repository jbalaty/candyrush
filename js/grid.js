if (typeof CR == 'undefined') {
  CR = {};
}


CR.PlayGrid = function (sizeX, sizeY) {
  this.sizeX = sizeX;
  this.sizeY = sizeY;

  var initGrid = function (sizeX, sizeY) {
    var result = [];
    for (var x = 0; x < sizeX; x++) {
      result[x] = [];
      for (var y = 0; y < sizeY; y++) {
        result[x][y] = {state: 'empty', value: null};
      }
    }
    return result;
  }

  this._grid = initGrid(sizeX, sizeY);


  this.getGridCopy = function () {
    var result = new CR.PlayGrid(this.sizeX, this.sizeY);
    this.forEachCell(function (cell) {
      result.setValueAt(cell.x, cell.y, cell.value, cell.state);
    });
    return result;
  }
}

CR.PlayGrid.prototype.getElementAt = function (x, y) {
  if (this.checkBounds(x, y)) {
    var cell = this._grid[x][y];
    return {x: x, y: y, value: cell.value, state: cell.state};
  } else {
    throw new Error('Coordinates (' + x + ',' + y + ') are outside of play grid');
  }
}

CR.PlayGrid.prototype.getValueAt = function (x, y) {
  return this.getElementAt(x, y).value;
}

CR.PlayGrid.prototype.getStateAt = function (x, y) {
  return this.getElementAt(x, y).state;
}


CR.PlayGrid.prototype.setValueAt = function (x, y, value, state) {
  if (this.checkBounds(x, y)) {
    state = state || 'active'
    if (!value) {
      state = 'empty';
    }
    var cell = this._grid[x][y];
    cell.value = value;
    cell.state = state;
    return this.getElementAt(x, y);
  } else {
    throw new Error('Coordinates (' + x + ',' + y + ') are outside of play grid');
  }
}

CR.PlayGrid.prototype.removeValueAt = function (x, y) {
  return this.setValueAt(x, y, null);
}

CR.PlayGrid.prototype.setStateAt = function (x, y, state) {
  if (this.checkBounds(x, y)) {
    state = state || 'active'
    this._grid[x][y].state = state;
  } else {
    throw new Error('Coordinates (' + x + ',' + y + ') are outside of play grid');
  }
}

CR.PlayGrid.prototype.checkBounds = function (x, y) {
  if (x >= 0 && x < this.sizeX &&
      y >= 0 && y < this.sizeY) {
    return true;
  } else {
    return false;
  }
}

CR.PlayGrid.prototype.processGaps = function (cellChangeCallback) {
  for (var x = 0; x < this.sizeX; x++) {
    this.moveCellsDown(x, this.sizeY - 1, cellChangeCallback);
  }
}

/*
 @param cellChangeCallback function(changeType, oldCoordinates {x,y}, newCoordinates {x,y})
 */
CR.PlayGrid.prototype.moveCellsDown = function (x, y, cellChangeCallback) {
  var numEmptyPositions = 0;
  var numMoved = 0;
  for (var yy = y; yy >= 0; yy--) {
    var cell = this.getElementAt(x, yy);
    if (cell.state !== 'empty') {
      this._grid[x][yy] = {state: 'empty', value: null};
      // move item numEmptyPositions down, decreased of num already moved items
      var newy = yy + numEmptyPositions; //- numMoved;
      this._grid[x][newy] = cell;
      var isChange = newy !== yy;
      if (isChange) {
        numMoved++;
        // prevent calling move, when we havent changed anything
        if (cellChangeCallback) {
          cellChangeCallback('move', {x: x, y: yy}, {x: x, y: newy})
        }
      }
    } else {
      numEmptyPositions++;
    }
  }
  // refill missing cells
  var missingCount = numEmptyPositions;
  if (cellChangeCallback) {
    for (var newy = missingCount - 1; newy >= 0; newy--) {
      cellChangeCallback('new', null, {x: x, y: newy})
    }
  }
}

CR.PlayGrid.prototype.forEachCell = function (callback) {
  for (var x = 0; x < this.sizeX; x++) {
    for (var y = 0; y < this.sizeY; y++) {
      var cell = this.getElementAt(x, y);
      callback(cell)
    }
  }
}

CR.PlayGrid.prototype.getRow = function (y) {
  result = [];
  for (var x = 0; x < this.sizeX; x++) {
    result.push(this.getElementAt(x, y));
  }
  return result;
}

CR.PlayGrid.prototype.getColumn = function (x) {
  result = [];
  for (var y = 0; y < this.sizeY; y++) {
    result.push(this.getElementAt(x, y));
  }
  return result;
}

CR.PlayGrid.prototype.forEachColumn = function (callback) {
  for (var col = 0; col < this.sizeX; col++) {
    callback(this.getColumn(col));
  }
}

CR.PlayGrid.prototype.forEachRow = function (callback) {
  for (var row = 0; row < this.sizeX; row++) {
    callback(this.getRow(row));
  }
}


CR.PlayGrid.prototype.findStripes = function (compatibilityCallback) {
  var result = [];
  if (!compatibilityCallback) throw new Error('No compatiblity callback');
  var processArray = function (array) {
    var previous = null;
    var lastStripe = null;
    for (var i = 0; i < array.length; i++) {
      var current = array[i];
      var isCompatible = false;
      if (previous) {
        isCompatible = !!compatibilityCallback(previous, current);
      }
      if (isCompatible) {
        lastStripe.push(current)
      } else {
        lastStripe = [current];
        result.push(lastStripe);
      }
      previous = current;
    }
  }
  this.forEachRow(processArray);
  this.forEachColumn(processArray);
  return result;
}