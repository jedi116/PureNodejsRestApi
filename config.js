// initialize enviroment object

var enviroments = {};

//create staging enviroment
enviroments.staging = {
	'httpPort' : 3000,
	'httpsPort' :3001,
	'envName': "staging",
	'hashingSecret' : "secret302637jdjdjdjdjd"
};

//create production enviroment
enviroments.production = {
	'httpPort' : 5000,
	'httpsPort': 5001,
	'envName' : 'production',
	'hashingSecret' : "secret302637jdjdjdjdjd" 
};

//make sure given NODE_ENV is a string
var chosenEnviroment = typeof(process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : '' ;

//choose enviroment object based on on chosenEnviroment or default to staging enviroment

var enviromentToExport = typeof(enviroments[chosenEnviroment])  == 'object' ?  enviroments[chosenEnviroment] : enviroments.staging ;


module.exports = enviromentToExport;
