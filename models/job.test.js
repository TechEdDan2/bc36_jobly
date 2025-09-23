"use strict";

const db = require("../db");
const job = require("./job.js");

const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
    const newJob = {
        title: "New Job",
        salary: 65000,
        equity: "0.05",
        companyHandle: "c1"
    };

    test("works", async function () {
        let jobRes = await job.create(newJob);
        expect(jobRes).toEqual({
            id: expect.any(Number),
            title: "New Job",
            salary: 65000,
            equity: "0.05",
            companyHandle: "c1"
        });
    });

});

/************************************** findAll */
describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "J1",
                salary: 50000,
                equity: "0.01",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "J2",
                salary: 60000,
                equity: "0.02",
                companyHandle: "c1"
            },
            {
                id: expect.any(Number),
                title: "J3",
                salary: 70000,
                equity: "0",
                companyHandle: "c2"
            },
            {
                id: expect.any(Number),
                title: "J4",
                salary: null,
                equity: null,
                companyHandle: "c3"
            },
            {
                id: expect.any(Number),
                title: "J5",
                salary: 80000,
                equity: "0.03",
                companyHandle: "comp1"
            },
        ]);
    });
});
