var helper = require("./helper.js");
var enums = require('./Enums.js');
var botError = require('./BotError.js');

class Selector{
  constructor(name, selectorDict){
    this._action = (selectorDict.type)? getType(selectorDict.type): null;
    this._parent = selectorDict.parent;
    this._name = name;
    this._linked = (selectorDict.linked)? selectorDict.linked : null;
    this._event = (selectorDict.event)? selectorDict.event : null;
    this._isOptional = selectorDict.isOptional;
    this._ignoreAttribute = (selectorDict.ignoreAttribute) ? selectorDict.ignoreAttribute : null;
    this._ignoreValue = (selectorDict.ignoreValue)? selectorDict.ignoreValue : null;
    this._cheapestIndicatorAttribute = (selectorDict.cheapestIndicatorAttribute) ? selectorDict.cheapestIndicatorAttribute : null;
    this._cheapestIndicator = (selectorDict.cheapestIndicator)? selectorDict.cheapestIndicator : null;
    this._objectName = (selectorDict.value)? selectorDict.value : null;
    this._expression = (selectorDict.expression)? selectorDict.expression : null;
    this._raise = (selectorDict.raise)? selectorDict.raise : null;
    this._isRoot = (selectorDict.isRoot)? (selectorDict.isRoot): false;
    this._waitSelector = (selectorDict.waitSelector)? (selectorDict.waitSelector): null;
    this._applyBusinessRules = (selectorDict.applyBusinessRules)? (selectorDict.applyBusinessRules): false;
    this._flightType = (selectorDict.flightType)? (selectorDict.flightType): null;
    this._attributes = {
      "ByXpath": selectorDict.ByXpath || null,
      "ById": selectorDict.ById,
      "ByClass": (selectorDict.ByClass)? selectorDict.ByClass.match(/[^ ,]+/g).join('.') : null,
      "ByCssXpath": selectorDict.ByCssXpath || null
    };
  }
  /**
   * @return {integer}
   */
  action() {
    return this._action;
  }
  /**
   * @return {dictionary}
   */
   expression() {
     return this._expression;
   }
  /**
   * @return {string}
   */
  parent() {
    return this._parent;
  }
  /**
   * @return {string}
   */
  name() {
    return this._name;
  }
  /**
   * @return {string}
   */
  linked() {
    return this._linked;
  }
  /**
   */
  set setLinked(value) {
    this._linked = value;
  }
  /**
   * @return {string}
   */
  event() {
    return this._event;
  }
  /**
   */
  set setEvent(value) {
    this._event = value;
  }
  /**
   * @return {boolean}
   */
  isOptional(){
    return this._isOptional;
  }
  /**
   * @return {string}
   */
  ignoreAttribute() {
    return this._ignoreAttribute;
  }
  /**
   * @return {string}
   */
  ignoreValue() {
    return this._ignoreValue;
  }
  /**
   * @return {string}
   */
  objectName() {
    return this._objectName;
  }
  /**
   * @return {string}
   */
  raise() {
    return this._raise;
  }
  /**
   * @return {boolean}
   */
  isRoot(){
    return this._isRoot;
  }
  /**
   * @return {string}
   */
  cheapestIndicatorAttribute() {
    return this._cheapestIndicatorAttribute;
  }
  /**
   * @return {string}
   */
  cheapestIndicator() {
    return this._cheapestIndicator;
  }
  /**
   * @return {string}
   */
  waitSelector() {
    return this._waitSelector;
  }
  /**
   * @return {boolean}
   */
  applyBusinessRules(){
    return this._applyBusinessRules;
  }
  /**
   * @return {string}
   */
  flightType() {
    return this._flightType;
  }

  static create(name, selectorDict){
    return new Selector(name, selectorDict);
  }
}

Selector.prototype.value = async function(page, monitoring, element=null) {
  if (!element) element=page;
  try{
    return await helper.getSelectorValue(page, element, this._attributes);
  }catch (e){
    if (this._isOptional){
      if (!('not_scraped_items_optional' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items_optional'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items_optional'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items_optional'].push(this._name);
      }
      return null;
    }else {
      if (!('not_scraped_items' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items'].push(this._name);
      }
      throw new botError.HTMLTagsError(this._name + " selector could not be found.");
    }
  }
  return helper.getSelectorValue(page, element, this._attributes);
}

Selector.prototype.element = async function(page, monitoring, element=null) {
  if (!element) element=page;
  try{
    return await helper.getSelector(page, element, this._attributes);
  }catch (e){
    if (this._isOptional){
      if (!('not_scraped_items_optional' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items_optional'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items_optional'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items_optional'].push(this._name);
      }
      return null;
    }else {
      if (!('not_scraped_items' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items'].push(this._name);
      }
      throw new botError.HTMLTagsError(this._name + " selector could not be found.");
    }
  }
}

Selector.prototype.elements = async function(page, monitoring, element=null) {
  if (!element) element=page;
  try{
    return await helper.getSelectors(page, element, this._attributes);
  }catch (e){
    if (this._isOptional){
      if (!('not_scraped_items_optional' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items_optional'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items_optional'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items_optional'].push(this._name);
      }
      return null;
    }else {
      if (!('not_scraped_items' in monitoring.getFailedElements())){
        monitoring.getFailedElements()['not_scraped_items'] = [];
      }
      if (!monitoring.getFailedElements()['not_scraped_items'].includes(this._name)){
        monitoring.getFailedElements()['not_scraped_items'].push(this._name);
      }
      throw new botError.HTMLTagsError(this._name + " selector could not be found.");
    }
  }
}

Selector.prototype.setElementValue = function(page, value) {
  return helper.setElementValue(page, this._attributes, value);
}

class Selectors{
  static create(selectors, configuration){
    let selectorList = [];
    let removedLinkedItems = [];
    for (let i=0; i < Object.keys(selectors).length; i++){
      if (!(isDependencySatisfied(selectors[Object.keys(selectors)[i]], configuration))){
        if (selectors[Object.keys(selectors)[i]]['linked']) removedLinkedItems.push([Object.keys(selectors)[i],
        selectors[Object.keys(selectors)[i]]['linked'],
        selectors[Object.keys(selectors)[i]]['event']
      ])
        continue;
      }
      selectorList.push(Selector.create(Object.keys(selectors)[i], selectors[Object.keys(selectors)[i]]));
    }
    for (let _removedLinkItem of removedLinkedItems){
      let rootParentTag = getRootParent(_removedLinkItem[0]);
      function getRootParent(selectorName){
          let parentTag = Object.entries(selectors).filter(([k,v]) => k == selectorName).map(([k,v]) => (v['parent']))[0];
          if (!parentTag) return selectorName;
          return getRootParent(parentTag);
      }
      selectorList.map(el => {
                  if(el._linked == rootParentTag)
                     el.setLinked = _removedLinkItem[1];
                     //el.setEvent = _removedLinkItem[2];
                  return el
              });
    }
    return selectorList;
  }
}

function getType(_type){
  switch(_type){
      case enums.tagTypeEnums.get("click").key:
        return enums.tagTypeEnums.get("click").value;
      case enums.tagTypeEnums.get("input").key:
        return enums.tagTypeEnums.get("input").value;
      case enums.tagTypeEnums.get("select").key:
        return enums.tagTypeEnums.get("select").value;
      case enums.tagTypeEnums.get("extractor").key:
        return enums.tagTypeEnums.get("extractor").value;
      case enums.tagTypeEnums.get("calendar").key:
        return enums.tagTypeEnums.get("calendar").value;
      case enums.tagTypeEnums.get("linked").key:
        return enums.tagTypeEnums.get("linked").value;
      case enums.tagTypeEnums.get("closed").key:
        return enums.tagTypeEnums.get("closed").value;
      case enums.tagTypeEnums.get("dropdown").key:
        return enums.tagTypeEnums.get("dropdown").value;
  }
}

function isDependencySatisfied(_selector, _configuration){
  if (!('dependency' in _selector) || (!_selector['dependency'])) return true;
  if (('dependency' in _selector) || (_selector['dependency'])){
    let conditions = _selector['dependency'].split(',');
    for (let _condition of conditions){
      let conditionTextArray = _condition.split(' ');
      let _flagObject = flagToObject(conditionTextArray[0], _configuration);
      let _flagObjectValue = flagToObject(conditionTextArray[2], _configuration);
      if (conditionTextArray[1] == "is"){
        return (_flagObject == _flagObjectValue);
      }
      if (conditionTextArray[1] == "greater than"){
        return (_flagObject > _flagObjectValue);
      }
      if (conditionTextArray[1] == "less than"){
        return (_flagObject < _flagObjectValue);
      }
    }
  }
  return true;
}

function flagToObject(string, configuration){
  if (/^\d+$/.test(string)) return parseInt(string);
  switch (string.toLowerCase()) {
    case "roundtrip":
      return configuration.parameters().isRoundtrip();
    case "depth":
      return configuration.parameters().depth();
    case "true":
      return true;
    case "false":
      return false;
      break;
    default:

  }
}

module.exports = {Selector, Selectors};
