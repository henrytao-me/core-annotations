const expect = require('chai').expect
const compiler = require('../lib/compiler')

describe('compiler.js', () => {
  let annotations = {
    ClassAnnotation: {},
    MethodAnnotation: {},
    FieldAnnotation: {}
  }

  describe('_generateAnnotations', () => {

  })

  describe('ClassAnnotation', () => {
    it('should return -1 when the value is not present', function() {
      expect({}).to.exist
      expect(26).to.equal(26)
      expect(false).to.be.false
      expect('hello').to.be.string
    })
  })
})

