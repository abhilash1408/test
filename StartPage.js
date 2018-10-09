var base = require('./BasePage.js');
var enums = require('./Enums.js');

var StartPage = base.BaseCrawlPage.subclass();
StartPage.prototype._setInput = async function(browserPage, page, configuration, response, monitoring, logger){
  await browserPage.addScriptTag({
    path: './' + configuration.calendarPath()
  });
  await setTripSelector(browserPage, page, configuration, monitoring, logger);
  logger.Debug = "SetTripSelector completed.";
  await setInputs(browserPage, page, configuration, monitoring);
  logger.Debug = "setInputs completed.";
  await setCalendar(browserPage, page, configuration, monitoring);
  logger.Debug = "setCalendar completed.";
  await setAdults(browserPage, page, configuration, monitoring);
  logger.Debug = "setAdults completed.";
  await setClass(browserPage, page, configuration, monitoring);
  logger.Debug = "setClass completed.";
  logger.Info = "SetInput completed on start page.";
}
StartPage.prototype._getInfo = async function(browserPage, page, configuration, response, monitoring, logger){
  logger.Info = "GetInput completed on start page.";
};
StartPage.prototype._navigate = async function(browserPage, page, configuration, response, monitoring, logger){
  if (page.action() == enums.actionEnums.get("click").value){
    let navigationElement = await page.actionSelector().element(browserPage, monitoring);
    await navigationElement.click({delay:2000});
    await browserPage.waitFor(3000);
    logger.Info = "Navigating from start page.";
  }
};

async function setTripSelector(browserPage, page, configuration, monitoring, logger){
  console.log(configuration.parameters().isRoundtrip());
  logger.Debug = "Value for Roundtrip is: " + configuration.parameters().isRoundtrip().toString();
  if (configuration.parameters().isRoundtrip())
  {
    let roundTripTag = page.tagsList().filter(tag => tag.name() == "roundTripSelector")[0];
    let tripElement = await roundTripTag.element(browserPage, monitoring);
    await tripElement.click({delay:500});
  }
  else{
    let onewayTripTag = page.tagsList().filter(tag => tag.name() == "onewayTripSelector")[0];
    let tripElement = await onewayTripTag.element(browserPage, monitoring);
    await tripElement.click({delay:500});
  }
  await browserPage.waitFor(2000);
}

async function setInputs(browserPage, page, configuration, monitoring){
  let inputTags = page.tagsList().filter(tag => tag.action() == enums.tagTypeEnums.get("input").value);
  for (var inputTag of inputTags){
    if (inputTag.name() == "fromLocationSelector"){
      let fromElement = await inputTag.element(browserPage, monitoring);
      await fromElement.type(configuration.parameters().startLocation(), {delay: 300});
      let fromLocationListTag = page.tagsList().filter(tag => tag.name() == "fromLocationListSelector")[0];
      let fromLocationListElement = await fromLocationListTag.element(browserPage, monitoring);
      await fromLocationListElement.click({delay:4000});
    }else if (inputTag.name() == "toLocationSelector") {
      let toElement = await inputTag.element(browserPage, monitoring);
      await toElement.type(configuration.parameters().destinationLocation(), {delay: 300});
      let fromLocationListTag = page.tagsList().filter(tag => tag.name() == "toLocationListSelector")[0];
      let fromLocationListElement = await fromLocationListTag.element(browserPage, monitoring);
      await fromLocationListElement.click({delay:2000});
    }
  }
}

async function setCalendar(browserPage, page, configuration, monitoring){
  let calendarTags = page.tagsList().filter(tag => tag.action() == enums.tagTypeEnums.get("calendar").value);
  for (var inputTag of calendarTags){
    if (inputTag.name() == "fromDateSelector"){
      let fromDateElement = await inputTag.element(browserPage, monitoring);
      await fromDateElement.click();
      await browserPage.waitFor(2000);
      await browserPage.evaluate((parameters, departureDateControl) => {
        var departure_date_element = findGivenDateControl(parameters._startDate.toString());
        departure_date_element.click();
      }, configuration.parameters(), fromDateElement);
    }else if ((inputTag.name() == "toDateSelector") && (configuration.parameters()._isRoundtrip)) {
      let toDateElement = await inputTag.element(browserPage, monitoring);
      await toDateElement.click();
      await browserPage.waitFor(2000);
      await browserPage.evaluate((parameters, departureDateControl) => {
        var return_date_element = findGivenDateControl(parameters._endDate.toString());
        return_date_element.click();
      }, configuration.parameters(), toDateElement);
    }
  }
}

async function setAdults(browserPage, page, configuration, monitoring){
  let inputTags = page.tagsList().filter(tag => (tag.action() == enums.tagTypeEnums.get("dropdown").value) && (tag.objectName() == "adults"));
  for (var inputTag of inputTags){
    let adultElement = await inputTag.element(browserPage, monitoring);
    await browserPage.evaluate((element, value) => {
      function selectAdults(element, value) {
        for (i = 0; i < element.options.length; i++) {
          if (parseInt(element.options[i].text) == value)
          {
            element.options[i].selected = true;
            return;
          }
        }
        return;
      }
      console.log("adult options")
      selectAdults(element, value);
    }, adultElement, configuration.parameters().adultCount());
  };
  await browserPage.waitFor(2000);
}

async function setClass(browserPage, page, configuration, monitoring){
  let inputTags = page.tagsList().filter(tag => (tag.action() == enums.tagTypeEnums.get("dropdown").value) && (tag.objectName() == "classtype"));
  for (var inputTag of inputTags){
    let adultElement = await inputTag.element(browserPage, monitoring);
    await browserPage.evaluate((element, value) => {
      function selectClassType(element, value) {
        for (i = 0; i < element.options.length; i++) {
          if (element.options[i].text.includes(value))
          {
            element.options[i].selected = true;
            return;
          }
        }
        return;
      }
      selectClassType(element, value);
    }, adultElement, enums.classTypeGroupEnum.get(configuration.parameters().mappedClassType()).value )
  };
  await browserPage.waitFor(2000);
}

module.exports = {StartPage};
