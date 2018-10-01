var Enum = require('enum');

var classTypeEnum = new Enum({
  ALL: 1,
  RAW: 2, //for future use till we have UI flag to signify this.
  RAWCHEAPEST: 3, //cheapest of each row
  RAWCHEAPESTPE: 4, //cheapest of dat ECONOMY
  RAWCHEAPESTBUSINESS: 5,
  RAWCHEAPESTFIRST: 6,
  ECONOMY: 7, //single cheapest in the whole lot
  PREMIUMECONOMY: 8,
  BUSINESS: 9,
  FIRST: 10
});

var classTypeGroupEnum = new Enum({
  "R": "Lowest fare",
  "N": "Premium Economy",
  "B": "Business"
});

var systemToFrameworkMappingEnum = new Enum({
  "E": classTypeEnum.ECONOMY.key,
  "PE": classTypeEnum.PREMIUMECONOMY.key,
  "B": classTypeEnum.BUSINESS.key,
  "F": classTypeEnum.FIRST.key
});

var responeStatusEnum = new Enum({
  OPEN: "O",
  CLOSED: "C",
  REQUESTFAILED: "RF"
});

var actionEnums = new Enum({
  "click": 1,
  "input": 2,
  "select": 3
});

var pageTypeEnums = new Enum({
  "main": 1,
  "advance search": 2,
  "calendar": 3,
  "listing": 4,
  "detail": 5
});

var tagTypeEnums = new Enum({
  "click": 1,
  "input": 2,
  "select": 3,
  "calendar": 4,
  "extractor": 5,
  "linked": 6,
  "closed": 7,
  "dropdown": 8
});

var expressionTypeEnums = new Enum({
  "regex": 1,
  "split": 2
});

var logLevelEnums = new Enum({
  "Info": "INFO",
  "Debug": "DEBUG",
  "Error": "ERROR"
});

module.exports = {classTypeEnum, classTypeGroupEnum, systemToFrameworkMappingEnum, responeStatusEnum, actionEnums, pageTypeEnums, tagTypeEnums, logLevelEnums, expressionTypeEnums};
