expect = require('chai').expect
math = require '../main'

describe 'import 1 file', ->
  it 'should return 3 when passed the params (1, 2)', ->
    expect(math.add(1, 2)).to.equal 3
    return
  return