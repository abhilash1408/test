class HTMLTagsError extends Error {
  constructor(message) {
    super(message);
    this.type = 1;
  }
}

class ProxyError extends Error {
  constructor(message) {
    super(message);
    this.type = 2;
  }
}

class OtherError extends Error {
  constructor(message) {
    super(message);
    this.type = 3;
  }
}

module.exports = {HTMLTagsError, ProxyError, OtherError};
