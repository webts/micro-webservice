module.exports = function(app) {
  app.tokenUtil = function(opKind, data) {
    if (typeof app.options === "undefined")
      return Promise.reject(new Error("server is not configured properly"));
    else {
      const session = app.session;

      switch (opKind) {
        case "get": {
          const token = 'authToken' in data ? data.authToken : data.authenticationToken;
          const domain = token.split(":")[0],
            authToken = token.split(":")[1];

          let ses = session.get(domain, authToken);
          if(ses == null){

          }
        }
      }
    }
  };
};
