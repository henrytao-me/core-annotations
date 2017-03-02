const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const compiler = require('../lib/compiler')
const SRC = fs.readFileSync('./test/sample/myClass.js', 'utf8')
const SRC_CLEANUP = fs.readFileSync('./test/sample/myClass.cleanup.js', 'utf8')

describe('compiler.js', () => {

  let annotations = {
    ClassAnnotation: {},
    MethodAnnotation: {},
    FieldAnnotation: {}
  }

  it('_cleanup', () => {
    let compiled = compiler._cleanup(annotations, SRC)
    compiled = compiled.replace(/\s+/g, ' ').trim()
    expect(compiled).to.equal(SRC_CLEANUP.replace(/\s+/g, ' ').trim())
  })
})

