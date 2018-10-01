var dateFormat = require('dateformat');

class Response {
  constructor(configuration){
    this.responseId = configuration.requestId();
    this.requestDetailId =  configuration.requestDetailId();
    this.requestId =  configuration.requestId();
    this.reportId =  configuration.reportId();
    this.siteId =  configuration.siteId();
    this.departureDate =  configuration.parameters().startDate();
    this.returnDate =  configuration.parameters().endDate();
    this.currency = "";
    this.availability =  null;
    this.sourceAirport =  configuration.parameters().startLocation();
    this.destinationAirport =  configuration.parameters().destinationLocation();
    this.isRoundTrip =  configuration.parameters().isRoundtrip();
    this.lastModifiedTime =  null;
    this.crawlStartTime = dateFormat(new Date(), "UTC:mm/dd/yyyy hh:MM:ss TT");
    this.crawlEndTime =  null;
    this.parseStartTime =  "";
    this.parseEndTime =  "";
    this.reqCurrencyId =  0;
    this.classtypemapped =  configuration.parameters().mappedClassType();
    this.queuePopRecieptId =  null;
    this.queueMessageId =  null;
    this.hitCount =  1;
    this.errorDescription =  "";
    this.isRequestFailed =  false;
    this.custom = configuration.parameters().custom();
    this.reference = configuration.parameters().reference();
    this.pagesize =  0;
    this.combined = [];
    this.inbound = [];
    this.outbound = [];
  }
  /**
   */
  set setCurrency(value) {
    this.currency = value;
  }
  /**
   */
  set setErrorDescription(value) {
    this.errorDescription = value;
  }
  /**
   */
  set setIsRequestFailed(value) {
    this.isRequestFailed = value;
  }
  /**
   */
  set setCrawlEndTime(value) {
    this.crawlEndTime = value;
  }
  /**
   */
  set setAvailability(value) {
    this.availability = value;
  }
  /**
   */
  set setOutbound(value) {
    this.outbound.push(value);
  }
  /**
   */
  set setInbound(value) {
    this.inbound.push(value);
  }
  /**
   */
  set setCombined(value) {
    this.combined.push(value);
  }

  static create(configuration){
    return new Response(configuration);
  }
}

module.exports = {Response}
