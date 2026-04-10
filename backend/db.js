const neo4j = require("neo4j-driver");

const URI = "neo4j+s://10c966a8.databases.neo4j.io";
const USER = "10c966a8";
const PASSWORD = "AzzUBjQZGJrpwdr2pi0oOBg_4557fSluOesY2_Ybo3Q";

const driver = neo4j.driver(
  URI,
  neo4j.auth.basic(USER, PASSWORD)
);

module.exports = { driver };