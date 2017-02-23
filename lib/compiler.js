module.exports = {

  compile: function(annotations, src) {
    let injected = ''
    let generated = this._generateAnnotations(annotations, src)
    injected += this._injectClasses(generated)
    injected += this._injectMethods(generated)
    injected += this._injectFields(generated)
    src = this._cleanup(annotations, src)
    src = this._inject(src, injected)
    src = this._fixExport(src)
    return {
      src: src,
      compiled: injected.length > 0
    }
  },

  _cleanup: function(annotations, src) {
    src = src.replace(/\@(\w+)\s*(\([^\(\)]+\)|\s)/g, (all, $annotation, $values) => {
      if (!!annotations[$annotation]) {
        return ''
      }
      return all
    })
    return src
  },

  _fixExport: function(src) {
    let clz = null
    src = src.replace(/module\.exports\s*=(\s*class\s+\w+\s+[\w\s]*)\{/g, (all, $clz) => {
      clz = $clz
      return $clz
    })
    if (!!clz) {
      src = `${src}\r\nmodule.exports = ${clz}`
    }
  },

  _generateAnnotations: function(annotations, src) {
    let key = new Date().getTime()
    let targets = {}
    src = src.replace(/\@(\w+)\s*(\([^\(\)]+\)|\s)/g, (all, $annotation, $values) => {
      if (!annotations[$annotation]) {
        return ''
      }
      $values = $values.trim().replace(/^\(/g, '').replace(/\)$/g, '').trim()
      if ($values.search(/^\w+\s*=/) === 0) {
        $values = $values
          .replace(/^(\w+)\s*=/g, (all, $key) => `${$key}: `)
          .replace(/,\s*(\w+)\s*=/g, (all, $key) => `${$key}: `)
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

  _inject: function(src, injected) {
    src += `\r\n
        var _annotations = []
        \r\n
        ${injected}
        \r\n
        _annotations.sort((a, b) => b.getPriority() - a.getPriority())
        _annotations.forEach(annotation => annotation.compile())
        \r\n`
    return src
  },

  _injectClasses: function({ src, targets }) {
    let injected = ''
    src = src.replace(/\@\[([\d,]+)\][\w\s.=]*class\s+(\w+)\s+[\w\s]*\{/g, (all, $targets, $class) => {
      $targets = $targets.split(',')
      $targets.forEach($target => {
        var target = targets[$target]
        injected += `\r\n 
          var _annotation = new Annotation._annotations['${target.$annotation}']()
          _annotation._clz = ${$class}
          _annotation._target = '${$class}'
          _annotation._type = 'class'
          _annotation._values = ${target.$values}
          _annotations.push(_annotation)
        \r\n`
      })
      return all
    })
    return injected
  },

  _injectFields: function({ src, targets }) {
    let injected = ''
    src = src.replace(/\@\[([\d,]+)\]\s*(\w+)\s+(\r|\n)/g, (all, $targets, $field) => {
      var clz = this._getClass(src, $targets)
      if (!!clz) {
        $targets = $targets.split(',')
        $targets.forEach($target => {
          var target = targets[$target]
          injected += `\r\n 
	          var _annotation = new Annotation._annotations['${target.$annotation}']()
	          _annotation._clz = ${clz}
	          _annotation._target = '${$field}'
	          _annotation._type = 'field'
	          _annotation._values = ${target.$values}
	          _annotations.push(_annotation)
	        \r\n`
        })
      }
      return all
    })
    return injected
  },

  _injectMethods: function({ src, targets }) {
    let injected = ''
    src = src.replace(/\@\[([\d,]+)\]\s*(\w*[\t ]+\w+|\w+)\s*\([^\(\)]*\)\s*\{/g, (all, $targets, $method) => {
      var clz = this._getClass(src, $targets)
      if (!!clz) {
        $targets = $targets.split(',')
        $targets.forEach($target => {
          var target = targets[$target]
          injected += `\r\n 
            var _annotation = new Annotation._annotations['${target.$annotation}']()
            _annotation._clz = ${clz}
            _annotation._target = '${$method}'
            _annotation._type = 'method'
            _annotation._values = ${target.$values}
            _annotations.push(_annotation)
          \r\n`
        })
      }
      return all
    })
    return injected
  }
}

