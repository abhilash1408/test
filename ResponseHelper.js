const uuidv4 = require('uuid/v4');
var dateFormat = require('dateformat');
var enums = require('./Enums.js');

var baseFlightTypeDetails = {
  "arrivalTime": null,
  "departureTime": null,
  "stopOvers": null,
  "guid": null,
  "outboundGuid": null,
  "price": [],
  "flightDetails": [],
  "duration": null,
  "fareCode": null,
  "route": null,
  "extraText": null,
  "customValue": null,
  "discount": 0,
  "OTAPosition": "",
  "OTAName": "",
  "baggage1Fee": 0,
  "baggage2Fee": 0,
  "baggage3Fee": 0,
  "creditCardDetails": null,
  "operatingCXR": "",
  "bookingClassCode": null,
  "extAncillaryService": null,
  "ancillaryCurrency": null,
  "path": null
}
var baseFlightDetails = {
    "index": null,
    "airlineName": null,
    "flightNumber": null,
    "airlineCode": null,
    "extraText": null,
    "mealPlan": null,
    "type": null,
    "layover": null,
    "city": null,
    "departureTime": null,
    "arrivalTime": null,
    "airportName": null,
    "destinationAirport": null,
    "duration": null
}
var basePrice  = {
  "classType": null,
  "price": null,
  "tax": {},
  "index": 1,
  "fareCode": null,
  "discount": 0,
  "isTaxIncluded": false
}
var flightDetails = Object.assign({}, baseFlightDetails);
var flightDetailsInbound = Object.assign({}, baseFlightDetails);
var priceDetails = Object.assign({}, basePrice);
var priceDetailsInbound = Object.assign({}, basePrice);
var priceDetailsCombined = Object.assign({}, basePrice);
var outboundTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails)); //Object.assign({}, baseFlightTypeDetails);
var inboundTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails));
var combinedTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails));
var flightDetailsIndex = 1;
var flightDetailsIndexInbound = 1;
var currency = "";

function getKey(object, key) {
  let obj = Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase());
  return obj;
}

function evaluateExpression(value, expression){
  if(Object.keys(expression).length == 0){
    return null;
  }else{
    if(expression["type"] == enums.expressionTypeEnums.get("regex").value){
        let res = value.match(expression["pattern"]);
        value = [];
        for(i=1; i<=expression["value"].length; i++){
          value.push(res[i]);
        }
        let result = evaluateValue(value , expression["value"]);
        return result;
      }else if(expression["type"] == enums.expressionTypeEnums.get("split").value){
        value = value.split(expression["pattern"]);
        result = evaluateValue(value, expression["value"]);
        return result;
    }
  }
}

function evaluateValue(value, valArr){
  let output = [];
  for(let val in valArr){
    if(Object.keys(valArr[val]["expression"]).length != 0){
      let temp = evaluateExpression(value[val], valArr[val]["expression"]);
      output = output.concat(temp);
      // console.log("temp: ", temp)
    }else{
      output.push({"objectName": valArr[val]["value"], "value": value[val]});
    }
  }
  return output;
}

function mapValueToData(objectName, value, cacheUrl, isRoundtrip, isCombined, expression){
  let values = [];
  if (expression){
    values = evaluateExpression(value, expression);
  }else{
    values = [{"value": value, "objectName": ""}];
  }
  for(var i of values){
    let objects = objectName.split('>');
    value = i["value"];
    if (i["objectName"].length != 0){
      objects.push(i["objectName"]);
    }
    // prev code unchanged from here
    if (objects[0].toLowerCase() == "response"){
      if (objects[1].toLowerCase() == "currency"){
        currency = value.toString().trim();
      }
      return;
    }
    if (!isRoundtrip && objects[0].toLowerCase() == "combined") objects[0] = "outbound";
    if (isRoundtrip && isCombined && objects[1].toLowerCase() == "price") objects[0] = "combined";
    switch (true) {
      case ((objects[0].toLowerCase() == "outbound") && (objects[1].toLowerCase() == "flightdetails") && (getKey(baseFlightDetails, objects[2].toLowerCase()) in flightDetails)):
        flightDetails.index = flightDetailsIndex;
        flightDetails[getKey(baseFlightDetails, objects[2].toLowerCase())] = value;
        break;
      case ((objects[0].toLowerCase() == "inbound") && (objects[1].toLowerCase() == "flightdetails") && (getKey(baseFlightDetails, objects[2].toLowerCase()) in flightDetailsInbound)):
        flightDetailsInbound.index = flightDetailsIndexInbound;
        flightDetailsInbound[getKey(baseFlightDetails, objects[2].toLowerCase())] = value;
        break;
      case (!isCombined && (objects[0].toLowerCase() == "inbound") && objects[1].toLowerCase() == "price"):
        if (objects[2].toLowerCase() == "tax"){
          priceDetailsInbound[getKey(basePrice, objects[2].toLowerCase())]['other'] = value.toString().replace(',', '');
        }
        else{
          priceDetailsInbound[getKey(basePrice, objects[2].toLowerCase())] = value.toString().replace(',', '');
        }
        return;
      case (!isRoundtrip && (objects[0].toLowerCase() == "outbound") && objects[1].toLowerCase() == "price"):
        if (objects[2].toLowerCase() == "tax"){
          priceDetails[getKey(basePrice, objects[2].toLowerCase())]['other'] = value.toString().replace(',', '');
        }
        else{
          priceDetails[getKey(basePrice, objects[2].toLowerCase())] = value.toString().replace(',', '');
        }
        return;
      case ((objects[0].toLowerCase() == "combined") && objects[1].toLowerCase() == "price"):
        if (objects[2].toLowerCase() == "tax"){
          priceDetailsCombined[getKey(basePrice, objects[2].toLowerCase())]['other'] = value.toString().replace(',', '');
        }
        else{
          priceDetailsCombined[getKey(basePrice, objects[2].toLowerCase())] = value.toString().replace(',', '');
        }
        return;
      case ((objects[1].toLowerCase() != "flightdetails") && (objects[1].toLowerCase() != "price")):
        switch (objects[0].toLowerCase()) {
          case ("outbound"):
            if (cacheUrl && !outboundTypeDetails.path) outboundTypeDetails.path = cacheUrl;
            if (objects[1].toLowerCase() == "arrivaltime"){
              if (outboundTypeDetails[getKey(baseFlightTypeDetails, objects[1].toLowerCase())]) return;
            }
            setBaseFlightTypeDetails(outboundTypeDetails, objects[1].toLowerCase(), value);
            return;
          case ("inbound"):
            if (cacheUrl && !inboundTypeDetails.path) inboundTypeDetails.path = cacheUrl;
            if (objects[1].toLowerCase() == "arrivaltime"){
              if (inboundTypeDetails[getKey(baseFlightTypeDetails, objects[1].toLowerCase())]) return;
            }
            setBaseFlightTypeDetails(inboundTypeDetails, objects[1].toLowerCase(), value);
            return;
          case ("combined"):
            if (objects[1].toLowerCase() == "arrivaltime"){
              if (combinedTypeDetails[getKey(baseFlightTypeDetails, objects[1].toLowerCase())]) return;
            }
            setBaseFlightTypeDetails(combinedTypeDetails, objects[1].toLowerCase(), value);
            return;
        }
      default:
    }
  }

}

function setBaseFlightTypeDetails(obj, key, value){
  obj[getKey(baseFlightTypeDetails, key.toLowerCase())] = value;
}

function flushFlightDetails(response){
  outboundTypeDetails.flightDetails.push(flightDetails);
  baseFlightTypeDetails.flightDetails = [];
  flightDetails = Object.assign({}, baseFlightDetails);
  flightDetailsIndex += 1;
}

function flushFlightDetailsInbound(response){
  inboundTypeDetails.flightDetails.push(flightDetailsInbound);
  baseFlightTypeDetails.flightDetails = [];
  flightDetailsInbound = Object.assign({}, baseFlightDetails);
  flightDetailsIndexInbound += 1;
}

function flush(response, isRoundtrip, isCombined=true){
  if (!outboundTypeDetails['guid']) outboundTypeDetails['guid'] = uuidv4();
  outboundTypeDetails = updateObjectData(outboundTypeDetails);
  inboundTypeDetails = updateObjectData(inboundTypeDetails);
  response.setOutbound = Object.assign({}, outboundTypeDetails);
  if (isRoundtrip) {
    if (!inboundTypeDetails['guid']) inboundTypeDetails['guid'] = uuidv4();
    inboundTypeDetails.outboundGuid = outboundTypeDetails['guid'];
    if(isCombined){
      combinedTypeDetails.outboundGuid = inboundTypeDetails['guid'];
      combinedTypeDetails.price.push(priceDetailsCombined);
      response.setCombined = Object.assign({}, combinedTypeDetails);
    }else{
      inboundTypeDetails.price.push(priceDetailsInbound);
    }
    response.setInbound = Object.assign({}, inboundTypeDetails);
  }else{
    outboundTypeDetails.price.push(priceDetails);
  }
  response.setCurrency = currency;
  baseFlightTypeDetails.flightDetails = [];
  baseFlightTypeDetails.price = [];
  outboundTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails));
  inboundTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails));
  combinedTypeDetails = JSON.parse(JSON.stringify(baseFlightTypeDetails));
  flightDetails = Object.assign({}, baseFlightDetails);
  flightDetailsInbound = Object.assign({}, baseFlightDetails);
  priceDetails = Object.assign({}, basePrice);
  priceDetailsInbound = Object.assign({}, basePrice);
  priceDetailsCombined = Object.assign({}, basePrice);
  flightDetailsIndex = 1;
  flightDetailsIndexInbound = 1;
}

function updateObjectData(object){
  object.stopOvers = object.flightDetails.length -1;
  object['departureTime'] = dateFormat(object['departureTime'], "mm/dd/yyyy").toString().trim();
  var arrivalDate = new Date(object['departureTime']);
  if (object['arrivalTime']){
    object['arrivalTime'] = object['arrivalTime'].substring(1,2);
    arrivalDate.setDate(arrivalDate.getDate() + parseInt(object['arrivalTime']));
    object['arrivalTime'] = dateFormat(arrivalDate.toString(), "mm/dd/yyyy").toString().trim();
  }else{
    object['arrivalTime'] = object['departureTime'].toString().trim();
  }
  return object;
}

module.exports = {mapValueToData, flush, flushFlightDetails, flushFlightDetailsInbound};
