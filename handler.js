"use strict";

const express = require("express");
const serverless = require("serverless-http");
const MongoClient = require("mongodb").MongoClient;
const faker = require("faker");

const mongoUser = "sas";
const mongoDbName = "Spotiq";
const mongoPass = "sashank007";
const mongoConnStr = `mongodb+srv://${mongoUser}:${mongoPass}@cluster0-nydon.mongodb.net/${mongoDbName}?retryWrites=true`;

const getAlert = () => {
  return {
    id: 1,
    name: faker.name.findName(),
    age: 23,
    location: { x: 1515151, y: 141413 }
  };
};

const postAlert = (
  crime_id,
  suspect_description,
  crime_severity,
  location_x,
  location_y,
  suspect_spotted,
  time
) => {
  return {
    crime_id,
    suspect_description,
    crime_severity,
    location_x,
    location_y,
    suspect_spotted,
    time
  };
};

const postCrime = (
  crime_id,
  suspect_description,
  crime_severity,
  location_x,
  location_y,
  victim_details,
  time
) => {
  return {
    crime_id,
    suspect_description,
    crime_severity,
    location_x,
    location_y,
    victim_details,
    time
  };
};

const client = new MongoClient(mongoConnStr, {
  useNewUrlParser: true
});
let db;

const createConn = async () => {
  await client.connect();
  db = client.db("project_delta");
};

const performQuery = async () => {
  const alerts = db.collection("alerts");

  const newAlert = getAlert();

  return {
    insertedAlert: newAlert,
    mongoResult: await alerts.insertOne(newAlert)
  };
};

const performQueryUpdateAlert = async (
  crime_id,
  suspect_description,
  crime_severity,
  location_x,
  location_y,
  suspect_spotted,
  time
) => {
  const alerts = db.collection("alerts");

  const newAlert = postAlert(
    crime_id,
    suspect_description,
    crime_severity,
    location_x,
    location_y,
    suspect_spotted,
    time
  );

  return {
    insertedAlert: newAlert,
    mongoResult: await alerts.insertOne(newAlert)
  };
};

const performQueryUpdateCrime = async (
  crime_id,
  suspect_description,
  crime_severity,
  location_x,
  location_y,
  victim_details,
  time
) => {
  const crime = db.collection("crimes");

  const newCrime = postCrime(
    crime_id,
    suspect_description,
    crime_severity,
    location_x,
    location_y,
    victim_details,
    time
  );

  return {
    insertedAlert: newCrime,
    mongoResult: await crime.insertOne(newCrime)
  };
};
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post("/post_alert", async function(request, res) {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");

  var crime_id = request.body.crime_id;
  var suspect_description = request.body.suspect_description;
  var crime_severity = request.body.crime_severity;
  var location_x = request.body.location_x;
  var location_y = request.body.location_y;
  var suspect_spotted = request.body.suspect_spotted;
  var time = request.body.time;

  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  try {
    res.json(
      await performQueryUpdateAlert(
        crime_id,
        suspect_description,
        crime_severity,
        location_x,
        location_y,
        suspect_spotted,
        time
      )
    );
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

app.get("/get_alert", async function(req, res) {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");
  var id = req.query.id;
  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  // Connection ready. Perform insert and return result.
  try {
    const alerts = db.collection("alerts");
    const query = { crime_id: parseInt(id) };
    alerts.find(query).toArray((err, result) => {
      res.send({
        search_id: parseInt(id),
        alerts: result
      });
    });
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

app.get("/get_all_alerts", async function(req, res) {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");
  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  // Connection ready. Perform insert and return result.
  try {
    const alerts = db.collection("alerts");

    alerts.find().toArray((err, result) => {
      res.send({
        alerts: result
      });
    });
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

// endpoints for crimes

app.get("/get_all_crimes", async function(req, res) {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");
  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  // Connection ready. Perform insert and return result.
  try {
    const alerts = db.collection("crimes");

    alerts.find().toArray((err, result) => {
      res.send({
        alerts: result
      });
    });
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

app.get("/get_crime", async function(req, res) {
  var id = req.query.id;
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");
  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  // Connection ready. Perform insert and return result.
  try {
    const alerts = db.collection("crimes");
    const query = { crime_id: parseInt(id) };
    alerts.find(query).toArray((err, result) => {
      res.send({
        search_id: parseInt(id),
        alerts: result
      });
    });
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

app.post("/post_crime", async function(request, res) {
  var crime_id = request.body.crime_id;
  var suspect_description = request.body.suspect_description;
  var crime_severity = request.body.crime_severity;
  var location_x = request.body.location_x;
  var location_y = request.body.location_y;
  var victim_details = request.body.victim_details;
  var time = request.body.time;

  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Headers", "Content-Type");
  res.append("Access-Control-Allow-Credentials", "true");

  if (!client.isConnected()) {
    // Cold start or connection timed out. Create new connection.
    try {
      await createConn();
    } catch (e) {
      res.json({
        error: e.message
      });
      return;
    }
  }

  try {
    res.json(
      await performQueryUpdateCrime(
        crime_id,
        suspect_description,
        crime_severity,
        location_x,
        location_y,
        victim_details,
        time
      )
    );
    return;
  } catch (e) {
    res.send({
      error: e.message
    });
    return;
  }
});

module.exports = {
  app,
  my_app: serverless(app)
};
