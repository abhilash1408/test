var enums = require('./Enums.js');
var helper = require('./helper.js');

class CrawlParameters {
  constructor(params, dateFormat){
    this._startDate = helper.formatDate(params['startDate'], dateFormat);
    this._endDate = helper.formatDate(params['endDate'], dateFormat);
    this._startLocation = params['startLocationValue'];
    this._destinationLocation = params['destinationLocationValue'];
    this._isRoundtrip = (params['returnTrip'] == "true") ? true : false;
    this._adultCount = parseInt(params['passengerCount']);
    this._childrenCount = parseInt(params['paxChild']);
    this._isDirect = (params['flighttype'] == 'A') ? false : true;
    this._carriers = params['preferredcarriers'].split(',');
    this._isRawReport = (params['getcheapestonly'] == 'false') ? true : false;
    this._flightClass = getFlightClass(params['travelClass'], (params['getcheapestonly'] == 'true'));
    this._mappedClassType = params['travelClass'];
    this._stops = getStops(params['reference'], params['custom']);
    this._pageCount = getPageCount(params['reference'], params['custom']);
    this._isSameCarrier = getIsSameCarrier(params['reference'], params['custom']);
    this._reference = params['reference'];
    this._custom = params['custom'];
    this._depth = parseInt(params['depth']);
  }
  /**
   * @return {string}
   */
  startDate() {
    return this._startDate;
  }
  /**
   * @return {string}
   */
  endDate() {
    return this._endDate;
  }
  /**
   * @return {string}
   */
  startLocation() {
    return this._startLocation;
  }
  /**
   * @return {string}
   */
  destinationLocation() {
    return this._destinationLocation;
  }
  /**
   * @return {boolean}
   */
  isRoundtrip() {
    return this._isRoundtrip;
  }
  /**
   * @return {integer}
   */
  adultCount() {
    return this._adultCount;
  }
  /**
   * @return {integer}
   */
  childrenCount() {
    return this._childrenCount;
  }
  /**
   * @return {boolean}
   */
  isDirect() {
    return this._isDirect;
  }
  /**
   * @return {array}
   */
  carriers() {
    return this._carriers;
  }
  /**
   * @return {boolean}
   */
  isRawReport() {
    return this._isRawReport;
  }
  /**
   * @return {integer}
   */
  flightClass() {
    return this._flightClass;
  }
  /**
   * @return {string}
   */
  mappedClassType() {
    return this._mappedClassType;
  }
  /**
   * @return {array}
   */
  stops() {
    return this._stops;
  }
  /**
   * @return {array}
   */
  carriers() {
    return this._carriers;
  }
  /**
   * @return {integer}
   */
  pageCount() {
    return this._pageCount;
  }
  /**
   * @return {boolean}
   */
  isSameCarrier() {
    return this._isSameCarrier;
  }
  /**
   * @return {string}
   */
  reference() {
    return this._reference;
  }
  /**
   * @return {string}
   */
  custom() {
    return this._custom;
  }
  /**
   * @return {integer}
   */
  depth() {
    return this._depth;
  }
  /**
   */
  static create(crawlParams, dateFormat) {
    return new CrawlParameters(crawlParams, dateFormat);
  }
}

/**
 * This method returns the flight class type to be scraped based on other values.
 *
 * @param {string}   classTypeMapped    The class type received in the request.
 * @param {boolean}  isCheapest         Specifies is the request is for cheapest data set or not.
 *
 * @return {enum} Returns system enum value for the flight class.
 */
function getFlightClass(classTypeMapped, isCheapest){
  //instead of raw cheapest raw -- cheapest per row
  if (!isCheapest && classTypeMapped.toLowerCase() == "e") return enums.classTypeEnum.RAWCHEAPEST.value;
  if (!isCheapest && classTypeMapped.toLowerCase() == "pe") return enums.classTypeEnum.RAWCHEAPESTPE.value;
  if (!isCheapest && classTypeMapped.toLowerCase() == "b") return enums.classTypeEnum.RAWCHEAPESTBUSINESS.value;
  if (!isCheapest && classTypeMapped.toLowerCase() == "f") return enums.classTypeEnum.RAWCHEAPESTFIRST.value;
  if (!isCheapest && classTypeMapped.toLowerCase() == "a") return enums.classTypeEnum.RAW.value;
  if (isCheapest)
  {
    let classType = null;
    for (let enumItem of enums.systemToFrameworkMappingEnum.enums)
    {
      if (enumItem.key == classTypeMapped.toUpperCase()) {
        classType = enums.classTypeEnum.get(enumItem.value).value;
        break;
      }
    }
    return classType;
  }
}

/**
 * Summary. This method returns the page count if specified in the request.
 *
 * @param {string}  reference      The custom parameters defined in request which is | separated.
 * @param {string}  custom          The custom parameters defined in request which is | separated.
 *
 * @return {integer} Returns the page count if defined else null.
 */
function getPageCount(reference, custom){
  return parseInt(getMiscellaneousFilter(reference, custom, "PAGE_COUNT")) || null;
}

/**
 * Summary. This method returns if same carrier shopping is to be done.
 *
 * @param {string}  reference      The custom parameters defined in request which is | separated.
 * @param {string}  custom          The custom parameters defined in request which is | separated.
 *
 * @return {boolean} Returns true if same carrier is to be used else false.
 */
function getIsSameCarrier(reference, custom){
  let multiCarrier = getMiscellaneousFilter(reference, custom, "MULT_CR");
  if (!multiCarrier || multiCarrier == 0) return false;
  return true;
}

/**
 * Summary. This method returns list of stops to be catered to while crawling.
 *
 * @param {string}  reference      The custom parameters defined in request which is | separated.
 * @param {string}  custom         The custom parameters defined in request which is | separated.
 *
 * @return {array} Returns list of integer values.
 */
function getStops(reference, custom){
  let minimumStops = getMiscellaneousFilter(reference, custom, "REQ_STOPS");
  let maximumStops = getMiscellaneousFilter(reference, custom, "MAX_STOPS");
  if (!minimumStops && !maximumStops) return null;
  if (!minimumStops && maximumStops) return helper.range(0, parseInt(maximumStops));
  if (minimumStops && !maximumStops) return helper.range(parseInt(minimumStops), 10);
  if (minimumStops && maximumStops) return helper.range(parseInt(minimumStops), parseInt(maximumStops));
}

/**
 * Summary. This method returns the value of the key to be searched in custom parameters.
 *
 * @param {string}  reference      The custom parameters defined in request which is | separated.
 * @param {string}  custom         The custom parameters defined in request which is | separated.
 * @param {string}  key            The key to be searched in custom parameters.
 *
 * @return {any} Returns the value of the key.
 */
function getMiscellaneousFilter(reference, custom, key){
  let customValues = [...reference.split('|'), ...custom.split('|')];
  let value = null;
  value = customValues.find(function(element) {
    if (element.split(':')[0].toUpperCase() == key)
    {
      return element.split(':')[1];
    }
  });
  return null;
}

module.exports = {CrawlParameters};
