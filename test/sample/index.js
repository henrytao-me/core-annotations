require('../../lib')

class ClassAnnotation extends Annotation {}
class MethodAnnotation extends Annotation {}
class FieldAnnotation extends Annotation {}

Annotation.register(ClassAnnotation)
Annotation.register(MethodAnnotation)
Annotation.register(FieldAnnotation)

require('./myClass')

