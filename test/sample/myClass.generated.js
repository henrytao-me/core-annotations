const variableA = 'This is variable A'

@{0}
class ClassA {

  @{1} injectA

  @{2}('injectedFieldB') injectB

  @{3}(name = 'injectedFieldC', options = {
    key1: 'key1',
    key2: variableA
  }) injectC

  @{4}
  methodA() {}

  @{5}('injectedMethodB')
  methodB() {}

  @{6}(name = 'injectedMethodC', options = {
    key1: 'key1',
    key2: variableA
  })
  methodC() {}
}

@{7}('injectedClassB')
class ClassB extends ClassA {}

@{8}}(name = 'injectedClassC', options = {
  key1: 'key1',
  key2: variableA
})
class ClassC extends ClassB {}

