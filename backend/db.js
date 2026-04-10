const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "neo4j://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "meena@123")
);

const session = driver.session();

module.exports = { driver, session };