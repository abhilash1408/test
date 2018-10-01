Function.prototype.subclass= function(isabstract) {
  if (isabstract) {
    var c= new Function(
      'if (arguments[0]!==Function.prototype.subclass.FLAG) throw(\'Abstract class may not be constructed\'); '
    );
  } else {
    var c= new Function(
      'if (!(this instanceof arguments.callee)) throw(\'Constructor called without "new"\'); '+
      'if (arguments[0]!==Function.prototype.subclass.FLAG && this._init) this._init.apply(this, arguments); '
    );
  }
  if (this!==Object)
  c.prototype= new this(Function.prototype.subclass.FLAG);
  return c;
}
Function.prototype.subclass.FLAG= new Object();

var BaseCrawlPage = Object.subclass(true); // is abstract
BaseCrawlPage.prototype.crawl = async function(browserPage, page, configuration, response, monitoring, logger) {
  await Promise.all([
  await new Promise(resolve => {
    resolve(this._setInput(browserPage, page, configuration, response, monitoring, logger));
  }).then(() => new Promise(resolve => {
    resolve(this._getInfo(browserPage, page, configuration, response, monitoring, logger));
  })).then(() => new Promise(resolve => {
    resolve(this._navigate(browserPage, page, configuration, response, monitoring, logger));
  }))
]);
};

module.exports = {BaseCrawlPage};
