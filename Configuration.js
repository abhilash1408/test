var fs = require('fs');
var dateFormat = require('dateformat');
var helper = require("./helper.js");
var {CrawlParameters} = require("./CrawlParameters.js");
var crawlRequestFile = process.argv.slice(2)[0];
var crawlRequest = JSON.parse(fs.readFileSync(crawlRequestFile));

class Configuration {
  constructor(){
    this._requestId = parseInt(crawlRequest['MetaData']['RequestId']);
    this._customerId = parseInt(crawlRequest['MetaData']['SubscriberId']);
    this._requestDetailId = parseInt(crawlRequest['MetaData']['RowKey']);
    this._reportId = parseInt(crawlRequest['MetaData']['ReportId']);
    this._siteId = parseInt(crawlRequest['MetaData']['SiteId']);
    this._debugMode = crawlRequest['BotInfo']['DebugMode'];
    this._retryCount = crawlRequest['MetaData']['RetryCount'];
    this._proxy = crawlRequest['Proxies'][Math.floor(Math.random() * crawlRequest['Proxies'].length)];
    this._spec = crawlRequest['BotInfo']['HtmlTags'];
    this._classtypemapped = crawlRequest['CrawlParams']['classtypemapped'];
    this._getcheapestonly = (crawlRequest['CrawlParams']['getcheapestonly'].toLowerCase() == 'true');
    this._checkairlineavail = (crawlRequest['CrawlParams']['checkairlineavail'].toLowerCase() == 'true');
    this._calendarPath = crawlRequest['BotInfo']['CalendarScriptPath'];
    this._isCombined = (crawlRequest['BotInfo']['IsCombined'])? (crawlRequest['BotInfo']['IsCombined']): false;
    this._apiEndpoints = crawlRequest['ApiEndpoints'];
    this._azureWorkspaceId = crawlRequest['SystemSettings']['AzureWorkspaceId'];
    this._azureAuthenticationId = crawlRequest['SystemSettings']['AzureAuthenticationId'];
	this._productId = crawlRequest['BotInfo']['productId'];
  }
  /**
   * @return {string}
   */
  requestId() {
    return this._requestId;
  }
  /**
   * @return {integer}
   */
  requestDetailId() {
    return this._requestDetailId;
  }
  /**
   * @return {integer}
   */
  customerId() {
    return this._customerId;
  }
  /**
   * @return {integer}
   */
  reportId() {
    return this._reportId;
  }
  /**
   * @return {integer}
   */
  siteId() {
    return this._siteId;
  }
  /**
   * @return {string}
   */
  classtypemapped() {
    return this._classtypemapped;
  }
  /**
   * @return {boolean}
   */
  getcheapestonly() {
    return this._getcheapestonly;
  }
  /**
   * @return {boolean}
   */
  checkairlineavail() {
    return this._checkairlineavail;
  }
  /**
   * @return {boolean}
   */
  debugMode() {
    return this._debugMode;
  }
  /**
   * @return {integer}
   */
  retryCount() {
    return this._retryCount;
  }
  /**
   * @return {json}
   */
  proxy() {
    return this._proxy;
  }
  /**
   * @return {json}
   */
  spec() {
    return this._spec;
  }
  /**
   * @return {string}
   */
  calendarPath() {
    return this._calendarPath;
  }
  /**
   * @return {boolean}
   */
  isCombined() {
    return this._isCombined;
  }
  /**
   * @return {json}
   */
  apiEndpoints() {
    return this._apiEndpoints;
  }
  /**
   * @return {string}
   */
  azureWorkspaceId() {
    return this._azureWorkspaceId;
  }
  /**
   * @return {string}
   */
  azureAuthenticationId() {
    return this._azureAuthenticationId;
  }
  /**
   * @return {integer}
   */
  productId() {
    return this._productId;
  }
  /**
   */
  static create() {
    return new Configuration();
  }
}

Configuration.prototype.parameters = function() {
  return CrawlParameters.create(crawlRequest['CrawlParams'], crawlRequest['BotInfo']['DateFormat']);
}

module.exports = {Configuration};
