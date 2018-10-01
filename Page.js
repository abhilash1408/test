var {Selectors} = require("./Selector.js");
var {Selector} = require("./Selector.js");
var enums = require('./Enums.js');

class Page {
  constructor(pageDict, index, configuration){
    this._url = pageDict.url;
    this._tagsList = Selectors.create(pageDict.htmlTags, configuration);
    this._action = (pageDict.action) ? getActionType(pageDict.action): null;
    this._actionSelector = Selector.create("actionSelector", pageDict.actionSelector);
    this._isStartPage = (pageDict.type == "main");
    this._type = (pageDict.type) ? getPageType(pageDict.type): null;
    this._index = index;
  }
  /**
   * @return {string}
   */
  url() {
    return this._url;
  }
  /**
   * @return {string}
   */
  tagsList() {
    return this._tagsList;
  }
  /**
   * @return {string}
   */
  action() {
    return this._action;
  }
  /**
   * @return {string}
   */
  actionSelector() {
    return this._actionSelector;
  }
  /**
   * @return {boolean}
   */
  isStartPage() {
    return this._isStartPage;
  }
  /**
   * @return {string}
   */
  type() {
    return this._type;
  }
  /**
   * @return {integer}
   */
  index() {
    return this._index;
  }
  static create(pageDict, index, configuration) {
    return new Page(pageDict, index, configuration);
  }
}

function getPageType(_type){
  switch(_type){
      case enums.pageTypeEnums.get("main").key:
        return enums.pageTypeEnums.get("main").value;
      case enums.pageTypeEnums.get("advance search").key:
        return enums.pageTypeEnums.get("advance search").value;
      case enums.pageTypeEnums.get("calendar").key:
        return enums.pageTypeEnums.get("calendar").value;
      case enums.pageTypeEnums.get("listing").key:
        return enums.pageTypeEnums.get("listing").value;
      case enums.pageTypeEnums.get("detail").key:
        return enums.pageTypeEnums.get("detail").value;
  }
}

function getActionType(_type){
  switch(_type){
      case enums.actionEnums.get("click").key:
        return enums.actionEnums.get("click").value;
      case enums.actionEnums.get("input").key:
        return enums.actionEnums.get("input").value;
  }
}

module.exports = {Page};
