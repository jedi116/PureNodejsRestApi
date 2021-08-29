/*
*
*Request Handlers
*
*/

// dependencies
const _data = require("./data.js");
const helpers =  require("./helpers.js");


//create handler object
var handlers = {};

//create handler for 404 not found
handlers.NotFound = function(data,callback){

	callback(404);
};
//create handler for landing route
handlers.landing = function(data,callback){
	callback(406,{'this' : 'is the landing page'})
}
//create handler for ping service route
handlers.ping = function(data,callback){
	callback(200);
};

handlers.users = function(data,callback){
	var acceptableMethod = ["get","post","put","delete"];
	if(acceptableMethod.indexOf(data.method) > -1){
		handlers._users[data.method](data,callback);
	}
	else{
		callback(405);
	}

};
//handler object  for the users service
handlers._users = {

};
//user handler for post request
handlers._users.post = function(data, callback){
		var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false ;
		var lastName  = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false ;
		var phone  = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false ;
		var password  = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false ;
		var tosAgreement  = typeof(data.payload.tosAgreement) == "boolean" && data.payload.tosAgreement == true ? true : false ;

		if(firstName && lastName && phone && password && tosAgreement){
				_data.read("users",phone,(err,data)=>{
								if(err){
										var hashedPassword = helpers.hash(password);
										if(hashedPassword){
													userObject = {
															"firstName" : firstName,
															"lastName" : lastName,
															"phone" : phone,
															"password" : hashedPassword,
															"tosAgreement" : true
													}
													_data.create('users',phone,userObject, (err)=>{
																if(!err){
																	callback(200)
																}
																else{
																	console.log(err);
																	callback(500,{"Error": "Could not create new user"});
																}
													});

										}
										else{
												callback(500,{"Error" : "Could not hash user password"});

										}

								}else {
									// User alread exists
			 						callback(400,{
										'Error' : 'A user with that phone number already exists'
									});

								}
				});


		}
		else{
			callback(400,{"Error":"Missing requried feilds"});
			console.log(data);

		}

};
//handles get request to the  "users" route
//@TODO only authenticated uses should access data
handlers._users.get = function(data,callback){
		var phone =  typeof(data.querystringObject.phone) == "string" && data.querystringObject.phone.trim().length == 10 ? data.querystringObject.phone.trim() : false ;
		var token = typeof(data.headers.token) == "string" ? data.headers.token : false ;

		if(phone){
			handlers._tokens.verifyToken(token,phone,(isauthenticated)=>{
					if(isauthenticated){

								_data.read("users",phone,(err,data)=>{
										if(!err && data){
												//delete hashed password
												delete data.password ;
												callback(200,data);
										}
										else{
											callback(404);
										}
								});
					}
					else{
						callback(400,{"Error":"User Not authenticated"})
					}
			});
		}
		else{
			callback(400,{"Error" : "Missing Required fields"});
		}
}
//export handler object
//required - phone
//optional - firstName lastName
handlers._users.put = (data, callback)=>{
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false ;
	var lastName  = typeof(data.payload.lastName) == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false ;
	var phone  = typeof(data.payload.phone) == "string" && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false ;
	var password  = typeof(data.payload.password) == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false ;

	var token  =  typeof(data.headers.token) == "string" ? data.headers.token : false ;

		if( phone ){
					if(firstName || lastName || password){
									handlers._tokens.verifyToken(token,phone,(isauthenticated)=>{
												if(isauthenticated){
													_data.read("users",phone,(err,userdata)=>{
																if(!err && userdata){
																			if(firstName){
																					userdata.firstName = firstName;
																			}
																			if(lastName){
																					userdata.lastName = lastName;
																			}
																			if(password){
																					userdata.password = helpers.hash(password);
																			}
																			_data.update("users",phone,userdata,(err)=>{
																						if(!err){
																								callback(200);
																						}else{
																							callback(500, {"Error" :"Could not update user data"});
																						}
																			});
																}
																else{
																	callback(400 ,{"Error" : "User doesnot exist"});
																}

													});
												}
												else{
													callback(400,{"Error":"User not authenticated"});
												}
									});
					}
					else{
						callback(400,{"Error" : "Missing feilds to update"});
					}
		}
		else{
			callback(400,{"Error" : "Missing fields"});
		}

}

//handler for delete request
//user should be authenticated
handlers._users.delete = function(data,callback){
		var phone =  typeof(data.querystringObject.phone) == "string" && data.querystringObject.phone.trim().length == 10 ? data.querystringObject.phone.trim() : false ;
		var token  =  typeof(data.headers.token) == "string" ? data.headers.token : false ;
		if(phone){
				handlers._tokens.verifyToken(token,phone,(isauthenticated)=>{
						if(isauthenticated){
							_data.read("users",phone,(err,data)=>{
									if(!err && data){
											//delete user
											_data.delete("users",phone,(err)=>{
														if(!err){
															callback(200);
														}
														else{
															callback(500, {"Error": "Could not delete user"});
														}
											});
									}
									else{
										callback(400);
									}
							});
						}
						else{
							callback(400,{"Error": "route requires user authentication user not authenticated"});
						}
				});
		}
		else{
			callback(400,{"Error" : "Missing Required fields"});
		}
}

//tokens service for authentication

handlers.tokens = function(data,callback){
	var acceptableMethod = ["get","post","put","delete"];
	if(acceptableMethod.indexOf(data.method) > -1){
		handlers._tokens[data.method](data,callback);
	}
	else{
		callback(405);
	}

};


handlers._tokens = {};


handlers._tokens.post = (data,callback)=>{

		var phone  = typeof(data.payload.phone) == "string"  && data.payload.phone.trim().length == 10 ? data.payload.phone.trim(): false ;
		var password  = typeof(data.payload.password) == "string"  && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false ;
			if(phone && password){
					_data.read("users",phone,(err,userData)=>{
							if(!err && userData){
									var hashedPassword =  helpers.hash(password);
									if(hashedPassword == userData.password){
												var tokenID = helpers.createRandomString(20);
												var expires = Date.now() + 1000 * 60 * 60 ;
												var tokenObject = {
														"phone" : userData.phone,
														"tokenID" : tokenID,
														"expires" : expires
												}

												_data.create("tokens",tokenID,tokenObject,(err)=>{
														if(!err){
																callback(200,tokenObject);
														}
														else{
															callback(500, {"Error": "Could not save new token"});
														}
												});
									}
									else{
										callback(400,{"Error": "Wrong password"})
									}
							}else{
								callback(400,{"Error":"Error User not found"});
							}

					});
			}

}

//required data : token id from querystring
handlers._tokens.get = (data,callback) =>{
			var tokenID = typeof(data.querystringObject.tokenID) == "string" &&  data.querystringObject.tokenID.trim().length == 19 ?  data.querystringObject.tokenID.trim() : false ;
			if(tokenID){
					_data.read("tokens",tokenID,(err,tokenData)=>{
							if(!err && tokenData){
									callback(200,tokenData);
							}
							else{
								callback(404,{"Error" : "Not found"});
							}
					});
			}
			else{
				callback(400,{"Error": "Missing required feilds"});
			}
}

//required data : token Id , extends

handlers._tokens.put = (data,callback)=>{
	var tokenID = typeof(data.payload.tokenID) == "string" &&  data.payload.tokenID.trim().length == 19 ?  data.payload.tokenID.trim() : false ;
	var extend = typeof(data.payload.extend) == "boolean" &&  data.payload.extend == true ?  true : false ;

	if(tokenID && extend){
			_data.read("tokens",tokenID,(err,tokenData)=>{
					if(!err && tokenData){
							if(tokenData.expires > Date.now()){
									tokenData.expires = Date.now() + 1000 * 60 * 60 ;
									_data.update("tokens",tokenID,tokenData,(err)=>{
												if(!err){
														callback(200);
												}
												else{
													callback(500 , {"Error" : "could not extend token internal error"});
												}
									});
							}
							else{
								callback(400 ,{"Error" : "Token has expired,  can not extend this token"})
							}
					}
					else{
						callback(400,{"Error":"Token id does not exist"})
					}
			});
	}
	else{
		callback(400,{"Error":"Missing required feilds"})
	}

}

handlers._tokens.delete = (data,callback)=>{
	var tokenID = typeof(data.querystringObject.tokenID) == "string" &&  data.querystringObject.tokenID.trim().length == 19 ?  data.querystringObject.tokenID.trim() : false ;
	if(tokenID){
			_data.read("tokens",tokenID,(err,tokenData)=>{
					if(!err && tokenData){
							_data.delete("tokens",tokenData.tokenID,(err)=>{
									if(!err){
										callback(200);
									}
									else{
										callback(500,{"Error":"could not delete token"})
									}
							});
					}
					else{
						callback(404,{"Error" : "Not found"});
					}
			});
	}
	else{
		callback(400,{"Error": "Missing required feilds"});
	}

}


handlers._tokens.verifyToken = (id,phone,callback)=>{
				_data.read("tokens",id,(err,tokenData)=>{
						if(!err && tokenData){
								if(tokenData.phone == phone && tokenData.expires > Date.now() ){
									callback(true);
								}
								else{
									callback(false);
								}
						}
						else{
							callback(false);
						}
				});

}
//export handlers object
module.exports = handlers;
