# core-annotations [![Build Status](https://travis-ci.org/henrytao-me/core-annotations.svg?branch=master)](https://travis-ci.org/henrytao-me/core-annotations) 
===============

Flexible annotation parser for Node


## Install

```
$ npm install --save core-annotations
```


## Usage

Checkout sample module at [https://github.com/henrytao-me/dagger-compiler/tree/master/sample](https://github.com/henrytao-me/dagger-compiler/tree/master/sample)

### Add core-annotations to your project

```js
require('core-annotations')
...
```

### Define Annotation

Custom Annotation should be extended from `Annotation` class.

```js
class Component extends Annotation {

	compile() {
 		/* do anything you want to intercept (class | method | field) using below methods
 		 * this.getClass() 
 		 * this.getTarget()
 		 * this.getType()
 		 * this.getValues()
 		 * this.isClass()
 		 * this.isField()
 		 * this.isMethod()
 		 */
	}
}

module.exports = Component
```

### Register Annotation

```js
Annotation.register(require('./annotations/componentAnnotation'))
```

### Using Annotation

Annotation can be used in `class | method | field`.

```js
@Module
class AppModule {

}

@Module
class ServiceModule {

  @Singleton
  @Provides('configService')
  provideConfigService() {
    return new ConfigService(...arguments)
  }

  @Provides('databaseService')
  provideDatabaseService(configService) {
    return new DatabaseService(...arguments)
  }
}

@Component(modules = [AppModule, ServiceModule])
class AppComponent {

}

class MainController {

  @Inject configService

  @Inject databaseService
}
```

## API

### Annotation.register(clzAnnotation)

##### clzAnnotation

Type: `? extends Annotation`

### Annotation.setDebuggable(debuggable)

##### debuggable

Type: `boolean`
Default: `true`

### Annotation.setExcludeDirs(excludedDirs)

##### excludedDirs

Type: `array`
Default: `[]`

### Annotation.setLogDir(logDir)

##### logDir

Type: `string`
Default: `./.annotation`


## Contributing

Any contributions are welcome!  
Please check the [CONTRIBUTING](CONTRIBUTING.md) guideline before submitting a new issue. Wanna send PR? [Click HERE](https://github.com/henrytao-me/core-annotations/pulls)


## License

    Copyright 2017 "Henry Tao <hi@henrytao.me>"

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

