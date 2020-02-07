const expect = require("chai").expect;
const baseurl =
  "https://6g9vbwwv17.execute-api.us-east-1.amazonaws.com/dev/msg";
const request = require("request");

describe("Test Lambda API", function() {
  it("GET API should return IP Address for correct parameters", function(done) {
    let url = baseurl + "?apiId=123";
    request.get(url, { timeout: 9000 }, function(err, response, body) {
      expect(response.statusCode).to.equal(200);
      console.log("REQUEST Sent: " + url);
      console.log(body);
      done();
    });
  });

  it("GET API should not return IP Address when apiId query parameter is missing", function(done) {
    request.get(baseurl, { timeout: 5000 }, function(err, response, body) {
      var b = JSON.parse(body);
      expect(response.statusCode).to.equal(401);
      console.log("REQUEST Sent: " + baseurl);
      console.log("RESPONSE received");
      console.log(body);
      done();
    });
  });

  it("GET API should not return IP Address when apiId is misspelt", function(done) {
    let url = baseurl + "?apIID=123";
    request.get(url, { timeout: 5000 }, function(err, response, body) {
      var b = JSON.parse(body);
      expect(response.statusCode).to.equal(401);
      console.log("REQUEST SENT:" + url);
      console.log("RESPONSE received");
      console.log(body);
      done();
    });
  });

  it("GET API should not return IP Address when apiId is blank", function(done) {
    let url = baseurl + "?apiId=";
    request.get(url, { timeout: 5000 }, function(err, response, body) {
      var b = JSON.parse(body);
      expect(response.statusCode).to.equal(401);
      console.log(url);
      console.log("RESPONSE received");
      console.log(body);
      done();
    });
  });

  it("POST API should NOT return IP Address ", function(done) {
    let url = baseurl + "apiId=123";
    request.post(url, { timeout: 5000 }, function(err, response, body) {
      var b = JSON.parse(body);
      expect(response.statusCode).to.equal(403);
      console.log("REQUEST Sent: " + url);
      done();
    });
  });
});
