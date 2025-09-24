"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
    {
      handle: "c1",
      name: "C1",
      numEmployees: 1,
      description: "Desc1",
      logoUrl: "http://c1.img",
    });
  await Company.create(
    {
      handle: "c2",
      name: "C2",
      numEmployees: 2,
      description: "Desc2",
      logoUrl: "http://c2.img",
    });
  await Company.create(
    {
      handle: "c3",
      name: "C3",
      numEmployees: 3,
      description: "Desc3",
      logoUrl: "http://c3.img",
    });
  await Company.create(
    {
      handle: "comp1",
      name: "COMP1",
      numEmployees: 4,
      description: "Desc4",
      logoUrl: "http://c4.img",
    });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  // admin user
  await User.register({
    username: "admin1",
    firstName: "A1FIRST",
    lastName: "A1LAST",
    email: "admin1@user.com",
    password: "password1ADMIN",
    isAdmin: true,
  });

  // create jobs
  await Job.create({
    title: "J1",
    salary: 65000,
    equity: "0.01",
    companyHandle: "c1",
  });
  await Job.create({
    title: "J2",
    salary: 70000,
    equity: "0.02",
    companyHandle: "c1",
  });
  await Job.create({
    title: "J3",
    salary: 80000,
    equity: null,
    companyHandle: "c2",
  });

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
//Part 3 - create admin token
const adminToken = createToken({ username: "admin1", isAdmin: true });
//Create a token for another non-admin user to test unauthorized access
const u2Token = createToken({ username: "u2", isAdmin: false });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  u2Token,
};
