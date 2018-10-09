var base = require('./BasePage.js');
var enums = require('./Enums.js');
var responseHelper = require('./ResponseHelper.js');
var helper = require('./helper.js');
var index = 1;
var cacheUrl = null;
var cheapestSelected = false;
var cheapestSelectedInbound = false;

var ListingPage = base.BaseCrawlPage.subclass();

ListingPage.prototype._setInput = async function(browserPage, page, configuration, response, monitoring, logger){
  logger.Info = "SetInput completed on listing page.";
};
ListingPage.prototype._getInfo = async function(browserPage, page, configuration, response, monitoring, logger){
  console.log("in listing page");
  await browserPage.waitFor(10000);
  let _parentTags = page.tagsList().filter(tag => (tag.parent() == null && tag.action() == enums.tagTypeEnums.get("select").value && tag.isRoot()));
  await selectionInfo(browserPage, page, configuration, response, monitoring, logger, _parentTags);
  logger.Info = "GetInfo completed on listing page.";
};
ListingPage.prototype._navigate = async function(browserPage, page, configuration, response, monitoring, logger){
  if (!page.action()) return;
  if (page.action() == enums.actionEnums.get("click").value){
    let navigationElement = await page.actionSelector().element(browserPage, monitoring);
    await navigationElement.click({delay:3000});
    logger.Info = "Navigating from start page.";
  }
};

/**
 * This method handles traversal of the selectors to extract values.
 *
 * @param {object}      browserPage        The browser page object.
 * @param {object}      page               The page class object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      response           The response class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger object.
 * @param {array}       parentTags         The list of selectors.
 * @param {object}      elementHandle      The current select dom object.
 *
 * @return None.
 */
async function selectionInfo(browserPage, page, configuration, response, monitoring, logger, parentTags, elementHandle=null){
  for (var _tag of parentTags)
  {
    let childTags = null;
    let searchInPage = true;
    if ([enums.tagTypeEnums.get("select").value, enums.tagTypeEnums.get("linked").value].includes(_tag.action()))
    {
      childTags = page.tagsList().filter(tag => tag.parent() == _tag.name());
    }else{
      searchInPage = false;
      childTags = page.tagsList().filter(tag => tag.name() == _tag.name());
    }
    let parentElements = await _tag.elements(browserPage, monitoring, elementHandle);
    for(let parentElement of parentElements){
      for (let _childTag of childTags){
        if (_childTag.applyBusinessRules()){
          if (_childTag.flightType() == "outbound" && cheapestSelected && !configuration.parameters().isRawReport()) continue;
          if (_childTag.flightType() == "inbound" && cheapestSelectedInbound && !configuration.parameters().isRawReport()) continue;
        }
        await handleSelect(browserPage, parentElement, _childTag, page, configuration, response, monitoring, logger);
        await handleClick(browserPage, parentElement, searchInPage, _childTag, page, configuration, response, monitoring, logger);
        await handleExtract(browserPage, parentElement, _childTag, page, configuration, response, monitoring, logger);
      }
      console.log("check tag flush flight details ", _tag.name());
      if (_tag.raise() && _tag.raise() == "flush.flightdetails"){
        console.log("flushing flight details");
        responseHelper.flushFlightDetails(response);
      }
      if (_tag.raise() && _tag.raise() == "flush.flightdetailsInbound"){
        responseHelper.flushFlightDetailsInbound(response);
      }
      if (_tag.raise() && _tag.raise() == "flush"){
        console.log("flush all details");
        responseHelper.flush(response, configuration.parameters().isRoundtrip());
      }
    }
  }
}

/**
 * This method handles the select type of selector used for navigating into the dom tree.
 *
 * @param {object}      browserPage        The browser page object.
 * @param {object}      parentElement      The object under which the selector would be found.
 * @param {selector}    tag                The selector which is to be evaluated.
 * @param {object}      response           The response class object.
 * @param {object}      page               The page class object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger object.
 *
 * @return None.
 */
async function handleSelect(browserPage, parentElement, tag, page, configuration, response, monitoring, logger){
  console.log("selecting tag ", tag.name());
  if ([enums.tagTypeEnums.get("select").value].includes(tag.action())){
    if (tag.raise() && tag.raise() == "screenshot"){
      await browserPage.waitFor(2500);
      var detailsScreen = await browserPage.screenshot({
          fullPage: true,
          omitBackground: true
      });
      var imageName = "detailsScreen-" + configuration.requestDetailId() + "-" + index.toString() + ".png";
      cacheUrl = await helper.uploadCache(detailsScreen, imageName, configuration.customerId(), configuration.apiEndpoints().CachePageServiceUrl);
      index += 1;
    }
    await selectionInfo(browserPage, page, configuration, response, monitoring, logger, [tag], parentElement);
    if (tag.event()){
      let subChildTags = page.tagsList().filter(_tag => _tag.name() == tag.event());
      await selectionInfo(browserPage, page, configuration, response, monitoring, logger, subChildTags);
    }
    // console.log("checking flush ", tag.name());
    if (tag.raise() && tag.raise() == "flush"){
      responseHelper.flush(response, configuration.parameters().isRoundtrip());
    }
  }
}

/**
 * This method handles the click type of selector.
 *
 * @param {object}      browserPage        The browser page object.
 * @param {object}      parentElement      The object under which the selector would be found.
 * @param {boolean}     searchInPage       The boolean value specifying if parent is to be ignored.
 * @param {selector}    tag                The selector which is to be evaluated.
 * @param {object}      response           The response class object.
 * @param {object}      page               The page class object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger object.
 *
 * @return None.
 */
async function handleClick(browserPage, parentElement, searchInPage, tag, page, configuration, response, monitoring, logger){
  if (tag.action() == enums.tagTypeEnums.get("click").value)
  {
    await browserPage.waitFor(10000);
    console.log("clicking flight element");
    let clickElements = [];
    if (searchInPage){
      clickElements = await tag.elements(browserPage, monitoring, parentElement);
    }else{
      clickElements = await tag.elements(browserPage, monitoring, null);
    }
    var clickElementsLength = clickElements.length;
    for (let i=0; i<clickElementsLength; i++){
      if (i > 0){
        if (searchInPage){
          clickElements = await tag.elements(browserPage, monitoring, parentElement);
        }else{
          clickElements = await tag.elements(browserPage, monitoring, null);
        }
      }
      if (tag.ignoreValue())
      {
        if ((await(await clickElements[i].getProperty('className')).jsonValue()).indexOf(tag.ignoreValue()) > -1) continue;
      }
      if (!configuration.parameters().isRawReport() && tag.cheapestIndicator())
      {
        let isCheapest = await browserPage.evaluate((element, className) => {
          let len = element.querySelectorAll(className).length;
          if (len > 0) return Promise.resolve(true);
          return Promise.resolve(false);
        }, clickElements[i], tag.cheapestIndicator().match(/[^ ,]+/g).join('.'));
        console.log(isCheapest);
        if (!isCheapest) continue;
      }
      await clickElements[i].focus();
      await browserPage.evaluate(el => {
        el.click();
      }, clickElements[i]);
      if (tag.flightType() == "inbound") cheapestSelectedInbound = true;
      if (tag.flightType() == "outbound") cheapestSelected = true;
      if (tag.waitSelector())
      {
        while((await browserPage.$$(tag.waitSelector())).length > 0)
        {
          await browserPage.waitFor(3000);
        }
      }
      if (tag.linked())
      {
        if (tag.raise() && tag.raise() == "screenshot"){
          await browserPage.waitFor(2500);
          var detailsScreen = await browserPage.screenshot({
              fullPage: true,
              omitBackground: true
          });
          var imageName = "detailsScreen-" + configuration.requestDetailId() + "-" + index.toString() + ".png";
          cacheUrl = await helper.uploadCache(detailsScreen, imageName, configuration.customerId(), configuration.apiEndpoints().CachePageServiceUrl);
          index += 1;
        }
        let subChildTags = page.tagsList().filter(_tag => _tag.name() == tag.linked());
        await selectionInfo(browserPage, page, configuration, response, monitoring, logger, subChildTags);
      }
      if (tag.event()){
        let subChildTags = page.tagsList().filter(_tag => _tag.name() == tag.event());
        await selectionInfo(browserPage, page, configuration, response, monitoring, logger, subChildTags);
      }
      if (tag.raise() && tag.raise() == "flush"){
        responseHelper.flush(response, configuration.parameters().isRoundtrip());
      }
    }
  }
}

/**
 * This method handles the extract type of selector and sets it to corresponding response object.
 *
 * @param {object}      browserPage        The browser page object.
 * @param {object}      parentElement      The object under which the selector would be found.
 * @param {selector}    tag                The selector which is to be evaluated.
 * @param {object}      response           The response class object.
 * @param {object}      page               The page class object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger object.
 *
 * @return None.
 */
async function handleExtract(browserPage, parentElement, tag, page, configuration, response, monitoring, logger){
  if (tag.action() == enums.tagTypeEnums.get("extractor").value){
    await extractData(browserPage, parentElement, tag, response, configuration, monitoring, logger);
    if (tag.linked())
    {
      let subChildTags = page.tagsList().filter(_tag => _tag.name() == tag.linked());
      await selectionInfo(browserPage, page, configuration, response, monitoring, logger, subChildTags);
    }
  }
}

/**
 * This method fetches the tag value and sets it to corresponding response object.
 *
 * @param {object}      browserPage        The browser page object.
 * @param {object}      parentElement      The object under which the selector would be found.
 * @param {selector}    tag                The selector which is to be evaluated.
 * @param {object}      response           The response class object.
 * @param {object}      configuration      The configuration class object.
 * @param {object}      monitoring         The monitoring class object.
 * @param {object}      logger             The logger object.
 *
 * @return None.
 */
async function extractData(browserPage, parentElement, tag, response, configuration, monitoring, logger){
  let value = await tag.value(browserPage, monitoring, parentElement);
  responseHelper.mapValueToData(tag.objectName(), value, cacheUrl, configuration.parameters().isRoundtrip(), configuration.isCombined(), tag.expression());
}

module.exports = {ListingPage};
