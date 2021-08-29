//dependencies
const crypto =  require('crypto');
const config = require("../config.js");

//container for all the helpers
var helpers = {};

//hash helper to encrypt password
helpers.hash = function(str){
    if(typeof(str)== "string" && str.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash ;
    }
    else{
      return false ;
    }
}


helpers.parseJsonToObject = function(str){
  try {
      var obj =  JSON.parse(str);
      return obj;
  } catch (e) {
      return {};
  }
}

helpers.createRandomString = (size)=>{
    var strLength = typeof(size) == "number" && size > 0 ? size : false ;
    if(strLength){
        var possiblecharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
        // random string to be returned
        var str = "";
        for(var i = 1 ; i < strLength ; i++){
            //choosing random characters from possiblecharacters
            var randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));
            //appending random characters to the random string to be returned by the function
            str += randomCharacter ;

        }
        // return generated random string 
        return str ;

    }
    else{
        return false ;
    }
}

module.exports = helpers ;
