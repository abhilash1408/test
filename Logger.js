var enums = require('./Enums.js');

class Logger{
  constructor(requestDetailId, azureWorkspaceId, azureAuthenticationId){
    this._requestDetailId = requestDetailId;
    this._info = [];
    this._debug = [];
    this._error = [];
    this._registrationData = {
      "AzureWorkspaceId": azureWorkspaceId,
      "AzureAuthenticationId": azureAuthenticationId,
      "LoggerName": "bot_puppeteer"
    };
  }
  set Info(message){
    this._info.push({
      "RequestDetailId": this._requestDetailId,
      "Message": message,
      "DateTimeStamp": (new Date()).toUTCString().replace(/GMT.*/g,""),
      "LogLevel": enums.logLevelEnums.get("Info").value
    });
  }
  set Debug(message){
    this._debug.push({
      "RequestDetailId": this._requestDetailId,
      "Message": message,
      "DateTimeStamp": (new Date()).toUTCString().replace(/GMT.*/g,""),
      "LogLevel": enums.logLevelEnums.get("Debug").value
    });
  }
  set Error(errorObj){
    this._error.push({
      "RequestDetailId": this._requestDetailId,
      "Message": errorObj,
      "DateTimeStamp": (new Date()).toUTCString().replace(/GMT.*/g,""),
      "LogLevel": enums.logLevelEnums.get("Error").value
    });
  }
  getLogs(){
    return this._info.concat(this._error);
  }
  registrationData(){
    return this._registrationData;
  }
  /**
  */
  static create(requestDetailId, azureWorkspaceId, azureAuthenticationId) {
    return new Logger(requestDetailId, azureWorkspaceId, azureAuthenticationId);
  }
}

module.exports = {Logger};
