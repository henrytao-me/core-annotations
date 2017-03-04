const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

const compiler = require('../lib/compiler')
const SRC = fs.readFileSync('./test/sample/myClass.js', 'utf8')

describe('compiler.js', () => {

  let annotations = {
    ClassAnnotation: {},
    MethodAnnotation: {},
    FieldAnnotation: {}
  }

  let verify = (a, b) => expect((a || '').replace(/\s+/g, ' ').trim()).to.equal((b || '').replace(/\s+/g, ' ').trim())

  it('_cleanup', () => {
    let expected = fs.readFileSync('./test/sample/myClass.cleanup.js', 'utf8')
    let result = compiler._cleanup(annotations, SRC)
    verify(result, expected)
  })

  it('_fixExport', () => {
    let expected = 'class TestClass { } module.exports = TestClass'
    let src = 'module.exports    =     class TestClass {  }   '
    let result = compiler._fixExport(src)
    verify(result, expected)
  })

  it('_generateAnnotations', () => {
    let expected = {
      targets: {
        0: {
          all: `@ClassAnnotation`,
          $annotation: `ClassAnnotation`,
          $values: `null`
        },
        1: {
          all: `@FieldAnnotation`,
          $annotation: `FieldAnnotation`,
          $values: `null`
        },
        2: {
          all: `@FieldAnnotation('injectedFieldB')`,
          $annotation: `FieldAnnotation`,
          $values: `'injectedFieldB'`
        },
        3: {
          all: `@FieldAnnotation(name = 'injectedFieldC', options = { key1: 'key1', key2: variableA })`,
          $annotation: `FieldAnnotation`,
          $values: `{name: 'injectedFieldC', options: { key1: 'key1', key2: variableA }}`
        },
        4: {
          all: `@MethodAnnotation`,
          $annotation: `MethodAnnotation`,
          $values: `null`
        },
        5: {
          all: `@MethodAnnotation('injectedMethodB')`,
          $annotation: `MethodAnnotation`,
          $values: `'injectedMethodB'`
        },
        6: {
          all: `@MethodAnnotation(name = 'injectedMethodC', options = { key1: 'key1', key2: variableA })`,
          $annotation: `MethodAnnotation`,
          $values: `{name: 'injectedMethodC', options: { key1: 'key1', key2: variableA }}`
        },
        7: {
          all: `@ClassAnnotation('injectedClassB')`,
          $annotation: `ClassAnnotation`,
          $values: `'injectedClassB'`
        },
        8: {
          all: `@ClassAnnotation(name = 'injectedClassC', options = { key1: 'key1', key2: variableA })`,
          $annotation: `ClassAnnotation`,
          $values: `{name: 'injectedClassC', options: { key1: 'key1', key2: variableA }}`
        }
      }
    }
    let result = compiler._generateAnnotations(annotations, fs.readFileSync('./test/sample/myClass.js', 'utf8'), 0)
    expect(Object.keys(result.targets)).to.have.all.keys(Object.keys(expected.targets))
    Object.keys(result.targets).forEach(key => {
      verify(result.targets[key].all, expected.targets[key].all)
      verify(result.targets[key].$annotation, expected.targets[key].$annotation)
      verify(result.targets[key].$values, expected.targets[key].$values)
    })
  })
})

