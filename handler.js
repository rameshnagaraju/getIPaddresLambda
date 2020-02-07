"use strict";

// Load the SDK and UUID
var AWS = require("aws-sdk");
var uuid = require("node-uuid");

// This is the entry point for the Lambda function
module.exports.hello = function(event, context, callback) {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v1.0! Your function executed successfully!",
      info: JSON.stringify(event)
    })
  };

  // verify the inputs
  var iresult = validateInputs(event);

  // If invalid inputs, return .

  if (iresult.status == "fail") {
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: iresult.message
    });
    callback(null, response); // Error Response is sent back to user .
    return;
  }

  // Inputs are validated.Now go get the VPC Endpoint.
  getVPCEndpoint(event, function(err, resData) {
    if (err != null) {
      response.statusCode = 401;
      response.body = JSON.stringify({
        message: err
      });
      callback(null, response); // Error Response is sent back to user .
    } else {
      console.log("Valid IP address has been allotted");
      response.statusCode = 200;
      response.body = JSON.stringify({
        message: resData
      });
      callback(null, response);
    }
  });
}; //hello

/* =========================================================
ALL Functions
===========================================================*/
/*
    This function validates the input parameters.
*/
function validateInputs(event) {
  var result = {
    status: "",
    message: "",
    action: ""
  };

  // Continue only if GET method
  if (event.httpMethod != "GET") {
    result.status = "fail";
    result.message = "only GET HTTP method supported";
    result.action = "retry with http GET";

    return result;
  }

  // Continue only if there is a valid Api ID

  if (event.queryStringParameters === null) {
    result.status = "fail";
    result.message = "Add the API Id in your query, this is mandatory";
    result.action = "retry with  API Id ";
    return result;
  }

  if (event.queryStringParameters.hasOwnProperty("apiId")) {
    // Query has a parameter apiId.
    // But does it have a proper value ?

    if (event.queryStringParameters.apiId != undefined) {
      // // apiId parameter is defined, but is it null ?
      if (event.queryStringParameters.apiId) {
        // apiId parameter is defined, and its not null.
        console.log(
          "api Id is defined, and not null .... " +
            event.queryStringParameters.apiId
        );
        // Now check if its a emprty string ?
        if (event.queryStringParameters.apiId === "") {
          console.log("api Id parameter cannot be blank ");
          result.status = "fail";
          result.message = "api Id parameter cannot be blank";
        } else {
          console.log(
            "Valid api Id found " + event.queryStringParameters.apiId
          );
          result.status = "success";
          result.message = "successful!";
          result.action = event.httpMethod;
        }
      } else {
        // apiId parameter is defined, but its null or ""
        console.log("api Id parameter does not have a valid Id ");
        result.status = "fail";
        result.message = "api Id parameter does not have a valid Id ";
      }
    } else {
      // apiId parameter is undefined ie  a query like apiId=
      result.status = "fail";
      result.message = "We didnt get an API Id required to use this function";
      result.action = "retry with valid API Id ";
    }
    /*
    result.status = "success";
    result.message = "successful!";
    result.action = event.httpMethod; */
  } else {
    result.status = "fail";
    result.message = "We didnt get an API Id required to use this function";
    result.action = "retry with valid API Id ";
  }

  return result;
}

/*
    This function gets the VPC details of the endpoint.
*/
function getVPCEndpoint(event, cb) {
  var ec2 = new AWS.EC2();
  var params = {
    VpcIds: ["vpc-276d9840"]
  };
  // We can get VPCS details if we provide VPC Name or vpcId
  // In the function below,we are giving the vpc Id, because we know it .
  // In cases,where we dont know the vpcId,we should supply the name, and then receive the vpcId in the callback.
  ec2.describeVpcs(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
      // Since an error has occured,we need to report an internal error (500) to the user.
      cb("Internal Server Error occured ");
      return;
    } else {
      console.log("Dummy implementation ");
      console.log(data); // successful response

      // Now that we have the vpcId, we must use it to get subnet details for this VPC
      //
      var sParams = {
        Filters: [
          {
            Name: "vpc-id",
            Values: [data.Vpcs[0].VpcId]
          }
        ]
      };
      ec2.describeSubnets(sParams, function(err, data1) {
        if (err) {
          console.log(err, err.stack); // an error occurred
          cb("Internal Error occured in getting subnet Info"); // Retur and report the error back to user
          return;
        } else {
          console.log("Here is the subnet Info");
          console.log(data1);
          console.log("Subnet Id is " + data1.Subnets[0].SubnetId);
          //

          var nParams = {
            Filters: [
              {
                Name: "vpc-id",
                Values: [
                  data.Vpcs[0].VpcId
                  /* more items */
                ],
                Name: "subnet-id",
                Values: [
                  data1.Subnets[0].SubnetId
                  /* more items */
                ],
                Name: "group-name",
                Values: [
                  "default"
                  /* more items */
                ]
              }
            ]
          };

          ec2.describeNetworkInterfaces(nParams, function(err, data2) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              // Since an error has occured,we need to report an internal error (500) to the user.
              cb("Internal Server Error occured ");
              return;
            } else {
              console.log("NetworkInterface info call succeeded ");
              console.log(JSON.stringify(data2));
              cb(null, { ip: "1:2:3:4" });
              return;
            }
          });
        }
      });
    }
  }); // describeVpcs
}

/*
var input = {
  httpMethod: "GET" ,
  queryStringParameters: {
    apwiId: 123
  } 
};



function hello(event, context, callback) {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v1.0! Your function executed successfully!",
      input: event
    })
  };




hello(input, null, function(err, res) {
  console.log(res);
});

*/
