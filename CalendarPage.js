var base = require('./BasePage.js');
var enums = require('./Enums.js');
var helper = require('./helper.js');

var CalendarPage = base.BaseCrawlPage.subclass();

CalendarPage.prototype._setInput = async function(browserPage, page, configuration, response, monitoring, logger){
  console.log("calendar set input");
  console.log(await browserPage.title());
  /*let isPageLoaded = await browserPage.evaluate(() => document.readyState);
  while(isPageLoaded != "complete"){
    isPageLoaded = await browserPage.evaluate(() => document.readyState);
  }*/
};
CalendarPage.prototype._getInfo = async function(browserPage, page, configuration, response, monitoring, logger){
  return new Promise(async function(resolve, reject) {
    let _closedTags = page.tagsList().filter(tag => (tag.parent() == null && tag.action() == enums.tagTypeEnums.get("closed").value));
    for (var _closedTag of _closedTags)
    {
      let value = await _closedTag.value(browserPage, monitoring);
      if (value) response.setAvailability = 'C';
      /*var imageName = "closedScreen-" + configuration.requestDetailId() + ".png";
      var screenshotScreen = await browserPage.screenshot({
          fullPage: true,
          omitBackground: true
      });
      cacheUrl = await helper.uploadCache(screenshotScreen, imageName, configuration.customerId(), configuration.apiEndpoints().CacheFileUrl);
      response.setOutbound = {"path": cacheUrl};*/
    }
    resolve("success");
  });
};
CalendarPage.prototype._navigate = async function(browserPage, page, configuration, response, monitoring, logger){
  if (response.availability) return;
  if (page.action() == enums.actionEnums.get("click").value){
    let navigationElement = await page.actionSelector().element(browserPage, monitoring);
    await navigationElement.click({delay:1000});
    await browserPage.waitForNavigation({waitUntil: 'networkidle0', timeout: 45000});
  }
};

module.exports = {CalendarPage};
