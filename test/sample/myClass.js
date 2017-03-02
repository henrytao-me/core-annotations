const variableA = 'This is variable A'

@ClassAnnotation
class ClassA {

  @FieldAnnotation injectA

  @FieldAnnotation('injectedFieldB') injectB

  @FieldAnnotation(name = 'injectedFieldC', options = {
    key1: 'key1',
    key2: variableA
  }) injectC

  @MethodAnnotation
  methodA() {}

  @MethodAnnotation('injectedMethodB')
  methodB() {}

  @MethodAnnotation(name = 'injectedMethodC', options = {
    key1: 'key1',
    key2: variableA
  })
  methodC() {}
}

@ClassAnnotation('injectedClassB')
class ClassB extends ClassA {}

@ClassAnnotation(name = 'injectedClassC', options = {
  key1: 'key1',
  key2: variableA
})
class ClassC extends ClassB {}

