var enums = require('./Enums.js');
var navigationStartPage = require('./StartPage.js');
var navigationCalendarPage = require('./CalendarPage.js');
var navigationListingPage = require('./ListingPage.js');
var wait = false;


class NavigationManager {
  constructor(pages, configuration, response, monitoring, logger){
    this._pages = pages;
    this._configuration = configuration;
    this._response = response;
    this._monitoring = monitoring;
    this._logger = logger;
  }

  static create(pages, configuration, response, monitoring, logger){
    return new NavigationManager(pages, configuration, response, monitoring, logger);
  }

  async crawl(browser, browserPage){
    let _configuration = this._configuration;
    let _response = this._response;
    let _monitoring = this._monitoring;
    let _logger = this._logger;
    console.log("in nav_man.crawl")
    browser.on('targetcreated', async(target) => {
        console.log(`Created target type ${target.type()} url ${target.url()}`);
        if (target.type() !== 'page') {
            return;
        } else {
          console.log("page type");
          wait = true;
          browserPage = await target.page();
          await browserPage.setJavaScriptEnabled(true);
          await browserPage.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9'
          });
          await browserPage.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
              get: () => false,
            });
            // We can mock this in as much depth as we need for the test.
            window.navigator.chrome = {
              runtime: {}
            };
            const originalQuery = window.navigator.permissions.query;
            return window.navigator.permissions.query = (parameters) => (
              parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission }) :
              originalQuery(parameters)
            );
            // Overwrite the `plugins` property to use a custom getter.
            Object.defineProperty(navigator, 'plugins', {
              get: () => [1, 2, 3, 4, 5],
            });
            // Overwrite the `languages` property to use a custom getter.
            Object.defineProperty(navigator, 'languages', {
              get: () => ['en-US', 'en'],
            });
          });
          try {
            await browserPage.authenticate({
              username: _configuration.proxy().UserId,
              password: _configuration.proxy().Password
            });
          } catch (e) {
            throw new botError.ProxyError("Proxy authentication failed for username " + configuration.proxy().UserId);
          }
          await browserPage.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3542.0 Safari/537.36");
          await browserPage.setViewport({
            width: 1550,
            height: 750
          });
          await browserPage.waitForNavigation({waitUntil:"domcontentloaded", timeout: 120000});
          await browserPage.waitFor(30000);
          var l = await browserPage.$x('/html/body/div[1]/div/div/div[1]/h1');
          for (let b of l){
            console.log(l.toString());
          }
          wait = false;
        }
    });
    this._logger.Debug = "Navigation Manager Crawl called";
    this._pages = this._pages.sort(function(a,b) {
        return (a.index() - b.index());
    });
    let pagesLength = (await browser.pages()).length;
    //let wait = this._wait;
    await Promise.all([
      this._pages.reduce(async function(promise, page) {
          return promise.then(async function() {
            if (_response.availability) return;
            if ( page.index() == 1){
              try{
                await browserPage.goto(page.url(), {waitUntil: 'networkidle2', timeout: 60000});
                await browserPage.waitFor(2000);
              }catch(e){
                if (e.message.indexOf('net::ERR_CONNECTION_CLOSED') > -1)
                {
                  await browserPage.reload({waitUntil: 'networkidle2', timeout: 60000});
                  await browserPage.waitFor(2000);
                }
              }
            }
            var _navigationPage = null;
            if (page.type() == enums.pageTypeEnums.get("main").value) _navigationPage = new navigationStartPage.StartPage();
            if (page.type() == enums.pageTypeEnums.get("calendar").value) _navigationPage = new navigationCalendarPage.CalendarPage();
            if (page.type() == enums.pageTypeEnums.get("listing").value) _navigationPage = new navigationListingPage.ListingPage();
            if (page.type() == enums.pageTypeEnums.get("calendar").value && !((await browserPage.title()).toLowerCase().includes("calendar"))){
              return Promise.resolve();
            }
              return _navigationPage.crawl(browserPage, page, _configuration, _response, _monitoring, _logger).then(async function(res) {
                  while (wait){
                    await browserPage.waitFor(3000);
                  }
                  let _pageType = null;
                  if (page.type() == enums.pageTypeEnums.get("main").value) _pageType = enums.pageTypeEnums.get("main").key;
                  if (page.type() == enums.pageTypeEnums.get("calendar").value) _pageType = enums.pageTypeEnums.get("calendar").key;
                  if (page.type() == enums.pageTypeEnums.get("listing").value) _pageType = enums.pageTypeEnums.get("listing").key;
                  _logger.Info = "Navigation Manager Crawl completed for " + _pageType;
              });
          });
      }, Promise.resolve())
  ]);
  }
}

module.exports = {NavigationManager};
