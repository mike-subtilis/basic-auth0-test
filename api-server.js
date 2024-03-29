const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const { auth } = require("express-oauth2-jwt-bearer");
const authConfig = require("./src/auth_config.json");

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = process.env.APP_ORIGIN || authConfig.appOrigin || `http://localhost:${appPort}`;

const envAuthConfig = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || authConfig.domain,
  clientId: process.env.REACT_APP_AUTH0_CLIENTID || authConfig.clientId,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || authConfig.audience,
};

if (
  !envAuthConfig.domain ||
  !envAuthConfig.audience ||
  envAuthConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));

const checkJwt = auth({
  audience: envAuthConfig.audience,
  issuerBaseURL: `https://${envAuthConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.listen(port, () => console.log(`API Server listening on port ${port}`));
