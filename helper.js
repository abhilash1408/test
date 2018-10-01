var dateFormat = require('dateformat');
var request = require('request');

module.exports = {
  formatDate: function(dateString, format){
    var date = new Date(dateString);
    return dateFormat(date, format);
  },
  /**
  * Summary. This method creates a list of integers between two numbers.
  *
  * @param {integer}  start      The start integer value for the list.
  * @param {integer}  end        The last integer value till the list is to be created.
  *
  * @return {array} Returns list of integers.
  */
  range: function (start, end) {
    return Array(parseInt(end) - parseInt(start) + 1).fill().map((_, idx) => start + idx)
  },
  getSelectorValue: async function(page, element, selectorAttributes){
    if ("ById" in selectorAttributes && (selectorAttributes["ById"]))
    {
      try {
        //await page.waitForSelector(selectorAttributes["ById"], {visible: true, timeout: 60000 });
        return await element.$eval(selectorAttributes["ById"], el => el.innerText);
      } catch (e) {
        console.log("Failed to fetch using ById");
      }
    }
    if ("ByClass" in selectorAttributes && (selectorAttributes["ByClass"]))
    {
      try {
        //await page.waitForSelector(selectorAttributes["ByClass"], {visible: true, timeout: 60000 });
        return await element.$eval(selectorAttributes["ByClass"], el => el.innerText);
      } catch (e) {
        console.log("Failed to fetch using ByClass");
      }
    }
    if ("ByXpath" in selectorAttributes && (selectorAttributes["ByXpath"]))
    {
      try{
        //await page.waitForXPath(selectorAttributes["ByXpath"], {visible: true, timeout: 60000 });
        let xpathElement = (await page.$x(selectorAttributes["ByXpath"]))[0];
        var xpathElementValue = await page.evaluate((xpath, el) => {
          console.log(document.evaluate(xpath, el, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText);
          return document.evaluate(xpath, el, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText;
        }, selectorAttributes["ByXpath"], element)
        return xpathElementValue;
      }catch (e) {
        console.log("Failed to fetch using ByClass");
      }
    }
    console.log("Could not locate element from any option.");
    throw new Error("Could not locate element from any available options.");
  },
  getSelector: async function(page, element, selectorAttributes){
    if ("ById" in selectorAttributes && (selectorAttributes["ById"]))
    {
      try {
        await page.waitForSelector(selectorAttributes["ById"], {visible: true, timeout: 60000 });
        return await element.$(selectorAttributes["ById"], el => el);
      } catch (e) {
        console.log("Failed to fetch using ById");
      }
    }
    if ("ByClass" in selectorAttributes && (selectorAttributes["ByClass"]))
    {
      try {
        await page.waitForSelector(selectorAttributes["ByClass"], {visible: true, timeout: 60000 });
        return await element.$(selectorAttributes["ByClass"], el => el);
      } catch (e) {
        console.log(e);
        console.log("Failed to fetch using ByClass");
      }
    }
    if ("ByXpath" in selectorAttributes && (selectorAttributes["ByXpath"]))
    {
      try{
        await page.waitForXPath(selectorAttributes["ByXpath"], {visible: true, timeout: 60000 });
        let xpathElement = (await element.$x(selectorAttributes["ByXpath"]))[0];
        return xpathElement;
      }catch (e) {
        console.log("Failed to fetch using ByXpath");
      }
    }
    console.log("Could not locate element from any available options.");
    throw new Error("Could not locate element from any available options.");
  },
  getSelectors: async function(page, element, selectorAttributes){
    //await page.waitFor(2000);
    if ("ById" in selectorAttributes && (selectorAttributes["ById"]))
    {
      try {
        //await page.waitForSelector(selectorAttributes["ById"]);
        return await element.$$(selectorAttributes["ById"], el => el);
      } catch (e) {
        console.log("Failed to fetch using ById");
      }
    }
    if ("ByClass" in selectorAttributes && (selectorAttributes["ByClass"]))
    {
      try {
        //await page.waitForSelector(selectorAttributes["ByClass"]);
        return await element.$$(selectorAttributes["ByClass"], el => el);
      } catch (e) {
        console.log(e);
        console.log("Failed to fetch using ByClass");
      }
    }
    if ("ByXpath" in selectorAttributes && (selectorAttributes["ByXpath"]))
    {
      try{
        //await page.waitForXPath(selectorAttributes["ByXpath"]);
        let xpathElement = (await element.$x(selectorAttributes["ByXpath"]));
        return xpathElement;
      }catch (e) {
        console.log("Failed to fetch using ByXpath");
      }
    }
    console.log("Could not locate element from any available options.");
    throw new Error("Could not locate element from any available options.");
  },
  setElementValue: async function(page, selectorAttributes, value){
    if ("ById" in selectorAttributes && (selectorAttributes["ById"]))
    {
      try {
        await page.waitForSelector(selectorAttributes["ById"], {visible: true, timeout: 60000 });
        await page.$eval(selectorAttributes["ById"], (el, val) => el.value = val, value);
        return;
      } catch (e) {
        console.log("Failed to fetch using ById");
      }
    }
    if ("ByClass" in selectorAttributes && (selectorAttributes["ByClass"]))
    {
      try {
        await page.waitForSelector(selectorAttributes["ByClass"], {visible: true, timeout: 60000 });
        await page.$eval(selectorAttributes["ByClass"], (el, val) => el.value = val, value);
        return;
      } catch (e) {
        console.log("Failed to fetch using ByClass");
      }
    }
    if ("ByXpath" in selectorAttributes && (selectorAttributes["ByXpath"]))
    {
      try{
        await page.waitForXPath(selectorAttributes["ByXpath"], {visible: true, timeout: 60000 });
        let xpathElement = (await page.$x(selectorAttributes["ByXpath"]))[0];
        xpathElement.type(value);
        return;
      }catch (e) {
        console.log("Failed to fetch using ByXpath");
      }
    }
    console.log("Could not locate element from any available options to set the value.");
    throw new Error("Could not locate element from any available options to set the value.");
  },
  uploadCache: async function (imageBuffer, fileName, customerId, uploadUrl) {
    var formData = {
      file: {
        value: imageBuffer,
        options: {
          filename: fileName
        }
      }
    };
    var options = {
      url: uploadUrl,
      formData: formData,
      method: 'POST',
      headers: {
        'subscriber': customerId,
        'enctype': 'multipart/form-data',
        'filepath': 'withoutency',
        'cache-control':'no-cache',
        'content-Type' : 'image/jpeg'
      }
    };
    return new Promise(function (resolve, reject) {
      request.post(options, function (err, resp, body) {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(body).publicLink);
        }
      })
    })
  }
}
