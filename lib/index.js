const fse = require('fs-extra')
const hook = require('node-hook')
const path = require('path')

const compiler = require('./compiler')

class Annotation {

  compile() {
    // intent to be extended
  }

  getAnnotation() {
    return this._annotation
  }

  getClass() {
    return this._clz
  }

  getPriority() {
    return 0
  }

  // (null | methodName | fieldName)
  getTarget() {
    return this._target
  }

  // ('class' | 'method' | 'field')
  getType() {
    return this._type
  }

  getValues() {
    return this._values instanceof Object ? this._values : {
      name: this._values
    }
  }

  isClass() {
    return this.getType() === 'class'
  }

  isField() {
    return this.getType() === 'field'
  }

  isMethod() {
    return this.getType() === 'method'
  }
}

Annotation._annotations = {}
Annotation._debuggable = true
Annotation._excludeDirs = []
Annotation._logDir = './.annotation'

Annotation.register = clzAnnotation => {
  let annotation = clzAnnotation.name
  if (!!Annotation._annotations[annotation]) {
    throw new Error(`Duplicated annotation <${annotation}>`)
  }
  Annotation._annotations[annotation] = clzAnnotation
}

Annotation.setDebuggable = debuggable => Annotation._debuggable = debuggable

Annotation.setExcludeDirs = excludedDirs => Annotation._excludeDirs = excludedDirs || []

Annotation.setLogDir = logDir => {
  Annotation._logDir = logDir
  fse.removeSync(logDir)
}
Annotation.setLogDir(Annotation._logDir)

Annotation._compile = (src, dir) => {
  if (Annotation._excludeDirs.indexOf(dir) >= 0) {
    return;
  }
  let result = compiler.compile(Annotation._annotations, src)
  if (result.compiled && Annotation._debuggable) {
    fse.outputFileSync(path.join(Annotation._logDir, dir.replace(process.cwd(), '')), result.src);
  }
  return result.src
}

hook.hook('.js', (src, dir) => Annotation._compile(src, dir.replace(process.cwd(), '')))

global.Annotation = Annotation

