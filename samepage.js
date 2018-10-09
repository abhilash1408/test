const puppeteer = require('puppeteer');
var fs = require('fs');
var {Configuration} = require("./Configuration.js");
var {SpecManager} = require("./SpecManager.js");
var {PageSelector} = require("./Selector.js");
var {NavigationManager} = require("./NavigationManager.js");
var {Response} = require("./Response.js");
var {Monitoring} = require("./Monitoring.js");
var botError = require('./BotError.js');
var request = require('request');
var {Logger} = require("./Logger.js");
var dateFormat = require('dateformat');
var helper = require('./helper.js');
var browser = null;
var retryCount = 0;
let requestStatus = 6;

const args = [
  "--disable-infobars",
  "--disable-dev-shm-usage",
  "--remote-debugging-port=122",
  "--disk-cache-size-200000000",
  "--no-sandbox",
  '--no-first-run',
  '--start-maximized',
  "--disable-background-networking"
];

//options
const options = {
  args,
  headless: false,
  ignoreHTTPSErrors: true
  //userDataDir: 'D:\\usrdata\\puppeteer_crawler_profile'
  //userDataDir: '/AutoBotEngine/userdata'
};

async function BrowserHeaderSettings(page) {
  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
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
};

async function setProxy(browser, page, configuration){
  try {
    await page.authenticate({
      username: configuration.proxy().UserId,
      password: configuration.proxy().Password
    });
  } catch (e) {
    throw new botError.ProxyError("Proxy authentication failed for username " + configuration.proxy().UserId);
  }
}

process.on("unhandledRejection", async (reason, p) => {
  console.log("unhandled");
  console.log(reason);
  if (browser) await browser.close();
  if (retryCount > 2)
  {
    retryCount += 1;
    execute().then(() => {
      setTimeout(() => {
        console.log("Waited for stipulated time and closing the thread.");
      }, 5000);
    });
  }
});

/**
 * This method makes a post request to send the logs to the logs service.
 *
 * @param {object}      browser            The browser object.
 * @param {object}      page               The browser page object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      response           The response class object.
 * @param {object}      specManager        The SpecManager class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger class object.
 *
 */
async function crawl(browser, page, configuration, response, specManager, monitoring, logger) {
  try {
    await setProxy(browser, page, configuration);
  } catch (e) {
    logger.Error = e;
    response.setCrawlEndTime = dateFormat(new Date(), "UTC:mm/dd/yyyy hh:MM:ss TT");
    monitoring.setStatus = 3;
    monitoring.setError = {
      "errorType": e.type,
      "errorDescription": e.message
    };
    return;
  }
  logger.Info = "Creating pages list object.";
  let pages = specManager.pages();
  const navigationManager = NavigationManager.create(pages, configuration, response, monitoring, logger);
  try{
    logger.Info = "Calling NavigationManager crawl method.";
    await navigationManager.crawl(browser, page).then(async () => {
      logger.Info = "Crawl completed.";
      response.setCrawlEndTime = dateFormat(new Date(), "UTC:mm/dd/yyyy hh:MM:ss TT");
      monitoring.setStatus = 2;
      monitoring.setError = {
        "errorType": 0,
        "errorDescription": null
      };
    });
  }catch(e){
    console.log(e);
    if (e.message.indexOf('ERR_TUNNEL_CONNECTION_FAILED') > -1)
    {
      e = new botError.ProxyError("Proxy authentication failed for username " + configuration.proxy().UserId);
    }
    if (!(e instanceof botError.ProxyError) && !(e instanceof botError.HTMLTagsError)) {
      e = new botError.OtherError(e.message);
    }
    logger.Error = e;
    response.setAvailability = 'RF';
    response.errorDescription = e.message;
    response.isRequestFailed = true;
    response.setCrawlEndTime = dateFormat(new Date(), "UTC:mm/dd/yyyy hh:MM:ss TT");
    monitoring.setStatus = 3;
    monitoring.setError = {
      "errorType": e.type,
      "errorDescription": e.message
    };
  }finally{
    if (!('not_scraped_items_optional' in monitoring.getFailedElements())) monitoring.failedElements['not_scraped_items_optional'] = [];
    if (!('not_scraped_items' in monitoring.getFailedElements())) monitoring.failedElements['not_scraped_items'] = [];
    if (!response.availability) response.setAvailability = 'O';
    if (response.availability == "C"){
      var imageName = "closedScreen-" + configuration.requestDetailId() + ".png";
      await handleClosedRf(imageName, browser, response, configuration);
    }
    if (response.availability == "RF"){
      var imageName = "failure-" + configuration.requestDetailId() + ".png";
      await handleClosedRf(imageName, browser, response, configuration);
    }
    monitoring.setData = response;
    console.log(JSON.stringify(response));
    Promise.all([
      await postData(response, configuration).then(function(result) {
        logger.Info = "Post data successful.";
      }, function(err) {
        logger.Error = new Error("Error while posting data. Error " + err);
      }),
      await postMonitoringData(monitoring, configuration).then(function(result) {
        logger.Info = "Post monioring data successful.";
      }, function(err) {
        logger.Error = "Error while posting monitoring data. Error " + err;
      }),
      await postLogs(logger, configuration).then(function(result) {
        console.log("Post Logs success");
      }, function(err) {
        console.log("Error while posting logs. Error " + err);
      })
    ]).then(async () => {
      console.log("closing browser");
      await browser.close();
    });
  }
}

async function handleClosedRf(fileName, browser, response, configuration){
  let pageList = await browser.pages();
  let latestPage = pageList[pageList.length - 1];
  var screenshotScreen = await latestPage.screenshot({
      fullPage: true,
      omitBackground: true
  });
  cacheUrl = await helper.uploadCache(screenshotScreen, fileName, configuration.customerId(), configuration.apiEndpoints().CachePageServiceUrl);
  response.setOutbound = {"path": cacheUrl};
}

/**
 * This method makes a post request to update the status of the request to crawling started.
 *
 * @param {object}      configuration     The configuration object.
 *
 * @return {promise}       Returns either the request was successful or a failure.
 */
async function postRequestStatus(configuration){
  let url = configuration.apiEndpoints().StateServiceUrl + "/" + configuration.requestDetailId() + "/" + requestStatus;
  return new Promise(function(resolve, reject) {
    request({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      strictSSL: false,
      uri: url,
      agentOptions: {
        rejectUnauthorized: false
      },
      method: 'POST'
    }, function (err, response, body) {
      if (err || response.statusCode != 200) {
        reject(body);
      }
      else {
        resolve("Success");
      }
    });
  })
}

/**
 * This method makes a post request to send the parsed data to the parser.
 *
 * @param {object}      response          The response class object.
 * @param {object}      configuration     The configuration class object.
 *
 * @return {promise}       Returns either the request was successful or a failure.
 */
async function postData(response, configuration){
  return new Promise(function(resolve, reject) {
    request({
      headers: {
        'Content-Type': 'application/json'
      },
      strictSSL: false,
      uri: configuration.apiEndpoints().ClosureServiceUrl,
      body: JSON.stringify(response),
      agentOptions: {
        rejectUnauthorized: false
      },
      method: 'POST'
    }, function (err, response, body) {
      if (err || response.statusCode != 200) {
        reject(body);
      }
      else {
        resolve("Success");
      }
    });
  })
}

/**
 * This method makes a post request to send the monitoring data.
 *
 * @param {object}      monitoring        The monitoring class object.
 * @param {object}      configuration     The configuration class object.
 *
 * @return {promise}       Returns either the request was successful or a failure.
 */
async function postMonitoringData(monitoring, configuration){
  return new Promise(function(resolve, reject) {
    request({
      headers: {
        'Content-Type': 'application/json'
      },
      strictSSL: false,
      uri: configuration.apiEndpoints().MonitoringServiceUrl,
      body: JSON.stringify(monitoring),
      agentOptions: {
        rejectUnauthorized: false
      },
      method: 'POST'
    }, function (err, response, body) {
      if (err || response.statusCode != 200) {
        reject(body);
      }
      else {
        resolve("Success");
      }
    });
  })
}

/**
 * This method makes a post request to send the logs to the logs service.
 *
 * @param {object}      logger            The logger class object.
 * @param {object}      configuration     The configuration class object.
 *
 * @return {promise}       Returns either the request was successful or a failure.
 */
async function postLogs(logger, configuration){
  return new Promise(function(resolve, reject) {
    let clientId;
    var r = request({
      headers: {
        'Content-Type': 'application/json'
      },
      strictSSL: false,
      agentOptions: {
        rejectUnauthorized: false
      },
      uri: configuration.apiEndpoints().RegistrationUrl,
      body: JSON.stringify(logger.registrationData()),
      method: 'POST'
    }, function (err, response, body) {
      if (err || response.statusCode != 200) {
        console.log("client registration failed");
        reject(body);
      }
      else {
        console.log("Status from registration url: ", response.statusCode);
        if (response.statusCode == 200) {
          clientId = JSON.parse(body).clientId;
          request({
            headers: {
              'Clientid': clientId,
              'Content-Type': 'application/json'
            },
            strictSSL: false,
            agentOptions: {
              rejectUnauthorized: false
            },
            uri: configuration.apiEndpoints().LogUrl,
            body: JSON.stringify(logger.getLogs()),
            method: 'POST'
          }, function (err, response, body) {
            if (err || response.statusCode != 202) {
              reject(body);
            }
            else {
              resolve("Success");
            }
          });
        }
      }
    });
  })
}

/**
 * This is the main method to invoke the browser and other classes for the framework to execute.
 *
 */
async function execute() {
  const configuration = Configuration.create();
  var response = Response.create(configuration);
  let specManager = SpecManager.create(configuration);
  var monitoring = Monitoring.create(configuration.requestId(), configuration.siteId(), configuration.productId());
  var logger = Logger.create(configuration.requestDetailId(), configuration.azureWorkspaceId(), configuration.azureAuthenticationId());
  await postRequestStatus(configuration).then(function(result) {
    logger.Info = "Request Status post request is successful.";
  }, function(err) {
    logger.Error = new Error("Error while posting request status. Error " + err);
  });
  args.push("--proxy-server=" + configuration.proxy().IPAddress);
  browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(true);
  //await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3508.0 Safari/537.36");
  await BrowserHeaderSettings(page);
  await page.setViewport({
    width: 1550,
    height: 750
  });
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      request.abort();
    } else
    request.continue();
  });
  await page.setDefaultNavigationTimeout(60000);
  await crawl(browser, page, configuration, response, specManager, monitoring, logger);
  console.log("completed");
};

// <summary>
// To run bot steps.
// </summary>
execute();

//String prototype helper method for formatting
//STRING FORMAT helper
if (!String.format) {
  String.format = function (format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != 'undefined' ?
      args[number] :
      match;
    });
  };
};
