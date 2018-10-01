class Monitoring {
  constructor(requestId, websiteId, productId){
    this.requestId = requestId;
    this.data = null;
    this.status = null;
    this.websiteId = websiteId;
    this.productId = productId;
    this.failedElements = {};
    this.error = {};
  }

  getFailedElements(){
    return this.failedElements;
  }

  /**
   */
  set setData(value) {
    this.data = value;
  }
  /**
   */
  set setStatus(value) {
    this.status = value;
  }
  /**
   */
  set setError(value) {
    this.error = value;
  }
  /**
   */
  set setFailedElements(value) {
    this.failedElements = value;
  }

  static create(requestId, websiteId, productId){
    return new Monitoring(requestId, websiteId, productId);
  }
}
module.exports = {Monitoring}
