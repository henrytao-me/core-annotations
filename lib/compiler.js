class Annotation {

  constructor({ annotation, clz, type, target, values }) {
    this.annotation = annotation
    this.clz = clz
    this.type = type
    this.target = target
    this.values = values
  }
}

module.exports = {

  compile: function(annotations, src) {
    let injected = ''
    let generated = this._generateAnnotations(annotations, src)
    let classAnnotations = this._getClassAnnotations(annotations, src, generated)
    let methodAnnotations = this._getMethodAnnotations(annotations, src, generated)
    let fieldAnnotations = this._getFieldAnnotations(annotations, src, generated)
    let annos = [...classAnnotations, ...methodAnnotations, ...fieldAnnotations]
    if (annos.length > 0) {
      src = this._cleanup(annotations, src)
      src = this._inject(src, annos)
      src = this._fixExport(src)
    }
    return {
      src: src,
      compiled: annos.length > 0
    }
  },

  _cleanup: function(annotations, src) {
    let key = new Date().getTime()
    src = src.replace(/\@(\w+)\s*(\([^\(\)]+\)|\s)/g, (all, $annotation, $values) => {
      if (!annotations[$annotation]) {
        return all
      }
      return ` @[${key++}] `
    })
    src = src.replace(/\]\s*\@\[/g, ',')
    src = src.replace(/\@\[([\d,]+)\](\s+\w+(\r|\n)+|)/g, '')
    return src
  },

  _fixExport: function(src) {
    let clz = null
    src = src.replace(/module\.exports\s*=(\s*class\s+\w+\s+[\w\s]*\{)/g, (all, $clz) => {
      clz = $clz.trim()
      return `${$clz}`
    })
    if (!!clz) {
      clz = clz.replace(/class\s+(\w+)\s+.*/g, (all, $clz) => $clz.trim())
      src = `${src}\r\nmodule.exports = ${clz}`
    }
    return src
  },

  _generateAnnotations: function(annotations, src, key = new Date().getTime()) {
    let targets = {}
    src = src.replace(/\@(\w+)\s*(\([^\(\)]+\)|\s)/g, (all, $annotation, $values) => {
      if (!annotations[$annotation]) {
        return ''
      }
      $values = $values.trim().replace(/^\(/g, '').replace(/\)$/g, '').trim()
      if ($values.search(/^\w+\s*=/) === 0) {
        $values = $values
          .replace(/^(\w+)\s*=/g, (all, $key) => `${$key}: `)
          .replace(/,\s*(\w+)\s*=/g, (all, $key) => `, ${$key}: `)
        $values = `{${$values}}`
      }
      $values = $values || 'null'
      targets[key] = {
        all: all,
        $annotation: $annotation,
        $values: $values
      }
      return ` @[${key++}] `
    })
    src = src.replace(/\]\s*\@\[/g, ',')
    return {
      src: src,
      targets: targets
    }
  },

  _getClass: function(src, key) {
    let clz = null
    src = src.replace(key, '[@@@@@]')
    src = src.replace(/[\r\n]*/g, '')
    src = src.replace(/class\s+(\w+)[\w\s]*\{/g, all => `\r\n${all}`)
    src = src.replace(/class\s+(\w+).*\{.*\[\@\@\@\@\@\]/g, (all, $clz) => {
      clz = $clz
      return all
    })
    return clz
  },

  _getClassAnnotations: function(annotations, src, generated) {
    generated = !!generated ? generated : this._generateAnnotations(annotations, src)
    src = generated.src
    let targets = generated.targets
    let classAnnotations = []
    src = src.replace(/\@\[([\d,]+)\][\w\s.=]*class\s+(\w+)\s+[\w\s]*\{/g, (all, $targets, $class) => {
      $targets = $targets.split(',')
      $targets.forEach($target => {
        var target = targets[$target]
        classAnnotations.push(new Annotation({
          annotation: target.$annotation,
          clz: $class,
          type: 'class',
          target: $class,
          values: target.$values
        }))
      })
      return all
    })
    return classAnnotations
  },

  _getFieldAnnotations: function(annotations, src, generated) {
    generated = !!generated ? generated : this._generateAnnotations(annotations, src)
    src = generated.src
    let targets = generated.targets
    let fieldAnnotations = []
    src = src.replace(/\@\[([\d,]+)\]\s*(\w+)\s+(\r|\n)*/g, (all, $targets, $field) => {
      var clz = this._getClass(src, $targets)
      if (!!clz) {
        $targets = $targets.split(',')
        $targets.forEach($target => {
          var target = targets[$target]
          fieldAnnotations.push(new Annotation({
            annotation: target.$annotation,
            clz: clz,
            type: 'field',
            target: $field,
            values: target.$values
          }))
        })
      }
      return all
    })
    return fieldAnnotations
  },

  _getMethodAnnotations: function(annotations, src, generated) {
    generated = !!generated ? generated : this._generateAnnotations(annotations, src)
    src = generated.src
    let targets = generated.targets
    let methodAnnotations = []
    src = src.replace(/\@\[([\d,]+)\]\s*(\w*[\t ]+\w+|\w+)\s*\([^\(\)]*\)\s*\{/g, (all, $targets, $method) => {
      var clz = this._getClass(src, $targets)
      if (!!clz) {
        $targets = $targets.split(',')
        $targets.forEach($target => {
          var target = targets[$target]
          methodAnnotations.push(new Annotation({
            annotation: target.$annotation,
            clz: clz,
            type: 'method',
            target: $method,
            values: target.$values
          }))
        })
      }
      return all
    })
    return methodAnnotations
  },

  _inject: function(src, annos) {
    annos = annos || []
    if (annos.length == 0) {
      return src
    }
    src += '\r\n'
    src += 'var _annotations = []'
    annos.forEach(annotation => {
      src += `\r\n
        var _annotation = new Annotation._annotations['${annotation.annotation}']()
        _annotation._clz = ${annotation.clz}
        _annotation._target = '${annotation.target}'
        _annotation._type = '${annotation.type}'
        _annotation._values = ${annotation.values}
        _annotations.push(_annotation)
      \r\n`
    })
    src += `\r\n
      _annotations.sort((a, b) => b.getPriority() - a.getPriority())
      _annotations.forEach(annotation => annotation.compile())
    \r\n`
    return src
  }
}

