@Component(modules = [])
class AppComponent {

}

@Module
class AppModule {

  constructor() {}

  @Singleton
  @Provides('express')
  provideExpress() {
    return express
  }

  @Singleton
  @Provides('jsonParser')
  provideJsonParser() {
    return bodyParser.json()
  }

  @Provides('router')
  provideRouter(express) {
    return express.Router()
  }

  @Singleton
  @Provides('server')
  provideServer(express) {
    return express()
  }

  @Singleton
  @Provides('urlencodedParser')
  provideUrlencodedParser() {
    return bodyParser.urlencoded({ extended: false })
  }
}

@Module
module.exports = class ProductRouter extends Object {

  @Inject router

  @Inject
  router

  constructor(component) {
    component.inject(this)
    this.router.get('/list', this.list)
  }

  list(req, res) {
    res.send('Hello listed')
  }
}

