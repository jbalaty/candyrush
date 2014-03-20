describe('PlayGrid tests', function () {
  var oneGrid;
  var oneThreeGrid;
  var threeGrid;
  var filledThreeGrid;

  beforeEach(function () {
    oneGrid = new CR.PlayGrid(1, 1);
    oneThreeGrid = new CR.PlayGrid(1, 3);
    threeGrid = new CR.PlayGrid(3, 3);
    filledThreeGrid = new CR.PlayGrid(3, 3);

    filledThreeGrid.setValueAt(0, 0, 'C');
    filledThreeGrid.setValueAt(0, 1, 'A');
    filledThreeGrid.setValueAt(0, 2, 'B');

    filledThreeGrid.setValueAt(1, 0, 'A');
    filledThreeGrid.setValueAt(1, 1, 'A');
    filledThreeGrid.setValueAt(1, 2, 'A');

    filledThreeGrid.setValueAt(2, 0, 'D');
    filledThreeGrid.setValueAt(2, 1, 'A');
    filledThreeGrid.setValueAt(2, 2, 'F');

  });

  it('should get cell by coordinates', function () {
    expect(threeGrid.getElementAt(0, 0).value).toBe(null);
  });

  it('should set cell by coordinates', function () {
    threeGrid.setValueAt(0, 0, 123);
    expect(threeGrid.getElementAt(0, 0).value).toBe(123);
    expect(threeGrid.getValueAt(0, 0)).toBe(123);
    expect(threeGrid.getStateAt(0, 0)).toBe('active');

    threeGrid.setValueAt(0, 0, 321, 'mystate');
    expect(threeGrid.getElementAt(0, 0).value).toBe(321);
    expect(threeGrid.getValueAt(0, 0)).toBe(321);
    expect(threeGrid.getStateAt(0, 0)).toBe('mystate');
  });

  it('should remove cell by coordinates', function () {
    threeGrid.setValueAt(0, 0, 123);
    expect(threeGrid.getElementAt(0, 0).value).toBe(123);
    expect(threeGrid.getValueAt(0, 0)).toBe(123);
    expect(threeGrid.getStateAt(0, 0)).toBe('active');

    threeGrid.removeValueAt(0, 0);
    expect(threeGrid.getElementAt(0, 0).value).toBeNull();
    expect(threeGrid.getValueAt(0, 0)).toBeNull();
    expect(threeGrid.getStateAt(0, 0)).toBe('empty');
  });

  it('should fail getting cell outside of the grid', function () {
    expect(function () {
      threeGrid.getElementAt(3, 0)
    }).toThrow();
  });

  it('should call refill callback once', function () {
    var gridChangeCallback = jasmine.createSpy("gridChangeCallback")
    oneGrid.processGaps(gridChangeCallback)
    expect(gridChangeCallback).toHaveBeenCalled();
    expect(gridChangeCallback).toHaveBeenCalledWith('new', null, {x: 0, y: 0});
  });

  it('should call refill callback tree times with type new', function () {
    var gridChangeCallback = jasmine.createSpy("gridChangeCallback")
    oneThreeGrid.processGaps(gridChangeCallback)
//    dump(gridChangeCallback.callCount)
//    dump(gridChangeCallback.argsForCall[1])
//    dump(gridChangeCallback.argsForCall[2])
    expect(gridChangeCallback.callCount).toBe(3);
    expect(JSON.stringify(gridChangeCallback.argsForCall[0]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 2}]));
    expect(JSON.stringify(gridChangeCallback.argsForCall[1]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 1}]));
    expect(JSON.stringify(gridChangeCallback.argsForCall[2]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 0}]));
  });

  it('should call refill callback two times', function () {
    var gridChangeCallback = jasmine.createSpy("gridChangeCallback")
    oneThreeGrid.setValueAt(0, 2, 'some value');
    oneThreeGrid.processGaps(gridChangeCallback)
//    dump(gridChangeCallback.callCount)
    expect(gridChangeCallback.callCount).toBe(2);
    expect(JSON.stringify(gridChangeCallback.argsForCall[0]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 1}]));
    expect(JSON.stringify(gridChangeCallback.argsForCall[1]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 0}]));
  });

  it('should call refill callback two times', function () {
    var counter = 0;
    var obj = {method: function (type, oldcoords, newcoords) {
//      dump(arguments)
      if (type === 'new') {
        oneThreeGrid.setValueAt(newcoords.x, newcoords.y, 'newvalue' + counter++);
      }
    }};
    spyOn(obj, 'method').andCallThrough();
    oneThreeGrid.setValueAt(0, 2, 'some value');
    oneThreeGrid.processGaps(obj.method);
//    dump(obj.method.callCount)
    expect(obj.method.callCount).toBe(2);
    expect(oneThreeGrid.getValueAt(0, 1)).toBe('newvalue0');
    expect(oneThreeGrid.getValueAt(0, 0)).toBe('newvalue1');

    obj = {
      method: function () {
      }
    }
    spyOn(obj, 'method');
    oneThreeGrid.processGaps(obj.method);
    expect(obj.method.callCount).toBe(0);
  });

  it('should create grid copy, modifying element does not change old grid', function () {
    oneGrid.setValueAt(0, 0, 'old grid value');
    var copy = oneGrid.getGridCopy();
    oneGrid.setValueAt(0, 0, 'new grid value');
    expect(copy.getValueAt(0, 0)).toBe('old grid value');
  });

  it('should move one cell and create two cells', function () {
    var counter = 0;
    var obj = {method: function (type, oldcoords, newcoords) {
//      dump(arguments)
      if (type === 'new') {
        oneThreeGrid.setValueAt(newcoords.x, newcoords.y, 'newvalue' + counter++);
      }
    }};
    spyOn(obj, 'method').andCallThrough();
    oneThreeGrid.setValueAt(0, 0, 'value with original coordinates x:0 y:0');
    oneThreeGrid.setValueAt(0, 1, 'value with original coordinates x:0 y:1');
    oneThreeGrid.processGaps(obj.method);
//    dump(obj.method.callCount)
    expect(obj.method.callCount).toBe(3);
    expect(JSON.stringify(obj.method.argsForCall[0]))
        .toBe(JSON.stringify(['move', {x: 0, y: 1}, {x: 0, y: 2}]));
    expect(JSON.stringify(obj.method.argsForCall[1]))
        .toBe(JSON.stringify(['move', {x: 0, y: 0}, {x: 0, y: 1}]));
    expect(JSON.stringify(obj.method.argsForCall[2]))
        .toBe(JSON.stringify(['new', null, {x: 0, y: 0}]));

    obj = {
      method: function () {
      }
    }
    spyOn(obj, 'method');
    oneThreeGrid.processGaps(obj.method);
    expect(obj.method.callCount).toBe(0);
  });

  it('should get grid row', function () {
    threeGrid.setValueAt(0, 0, 'A');
    threeGrid.setValueAt(1, 0, 'B');
    threeGrid.setValueAt(2, 0, 'C');
    var row = threeGrid.getRow(0);
    expect(row[0].value).toBe('A');
    expect(row[1].value).toBe('B');
    expect(row[2].value).toBe('C');
  });

  it('should get grid column', function () {
    threeGrid.setValueAt(0, 0, 'A');
    threeGrid.setValueAt(0, 1, 'F');
    threeGrid.setValueAt(0, 2, 'G');
    var col = threeGrid.getColumn(0);
    expect(col[0].value).toBe('A');
    expect(col[1].value).toBe('F');
    expect(col[2].value).toBe('G');
  });


  it('should find two stripes', function () {
    var obj = {method: function (previous, current) {
      return previous.value === current.value;
    }};
    spyOn(obj, 'method').andCallThrough();
    var stripes = filledThreeGrid.findStripes(obj.method);
    expect(stripes.length).toBe(14);
    var longStripes = _.filter(stripes,function(stripe){
      return stripe.length >= 3;
    });
    expect(longStripes.length).toBe(2);
  });

  it('should call functon for each column and row', function () {
    var callback = jasmine.createSpy("callabck")
    var stripes = threeGrid.forEachColumn(callback);
    expect(callback.callCount).toBe(3);

    var callback = jasmine.createSpy("callabck")
    var stripes = threeGrid.forEachRow(callback);
    expect(callback.callCount).toBe(3);
  });
});