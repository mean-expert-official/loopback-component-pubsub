'use strict';
/**
 * UNIVERSAL DEPENDENCIES
 */
require('angular2-universal/polyfills');
var NG2Universal = require('angular2-universal');
var path = require('path');
/**
 * @module LoopBack Component Universal
 * @author Jonathan Casarrubias <http://twitter.com/johncasarrubias>
 * @description
 */
module.exports = (server, options) => {
  console.log('\nANGULAR UNIVERSAL: SERVER SIDE RENDERING WITH STRONGLOOP\n');
  /**
   * Set Default Options
   */
  options = Object.assign({}, options, {
    baseUrl : '/',
    client  : 'client/dist'
  });
  /**
   * Create 
   **/
  console.log(options);
  let client = require(server.loopback.static(path.join(__dirname, options.client)));
  /**
  * Enable Prod Mode
  */
  if (process.env.NODE_ENV === 'production')
  NG2Universal.enableProdMode();
  /**
   * SERVER CONFIGURATIONS
   */
  server.engine('.html', NG2Universal.expressEngine);
  server.set('views', __dirname + '/dist');
  server.set('view engine', 'html');
  server.set('view options', { doctype: 'html' });
  server.use(server.loopback.static(path.join(__dirname, 'dist'), { index: false }));
  server.use(server.loopback.static(path.join(__dirname, 'src'), { index: false }));
  server.use(options.baseUrl, function ngApp(req, res) {
    var url = req.originalUrl || options.baseUrl;
    var config = {
      directives: [client.ClientAppComponent],
      platformProviders: [
        NG2Universal.provide(NG2Universal.ORIGIN_URL, { useValue: 'http://0.0.0.0:' + server.get('port') }),
        NG2Universal.provide(NG2Universal.BASE_URL, { useValue: options.baseUrl }),
      ],
      providers: [
        NG2Universal.provide(NG2Universal.REQUEST_URL, { useValue: url }),
        NG2Universal.NODE_ROUTER_PROVIDERS,
        NG2Universal.NODE_HTTP_PROVIDERS,
      ],
      async: true,
      preboot: { appRoot: 'client-app' }
    };
    res.render('index', config);
  });
}
