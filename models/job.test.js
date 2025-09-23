"use strict";

const db = require("../db");
const Job = require("./job.js");

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
        let jobRes = await Job.create(newJob);
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
        let jobs = await Job.findAll();
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

/************************************** get */
describe("get", function () {
    test("works", async function () {
        let jobs = await Job.findAll();
        let jobRes = await Job.getJob(jobs[0].id);
        expect(jobRes).toEqual({
            id: jobs[0].id,
            title: "J1",
            salary: 50000,
            equity: "0.01",
            companyHandle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.getJob(9999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */
describe("update", function () {
    const updateData = {
        title: "Updated Job",
        salary: 75000,
        equity: "0.10"
    };

    test("works", async function () {
        let jobs = await Job.findAll();
        let jobRes = await Job.update(jobs[0].id, updateData);
        expect(jobRes).toEqual({
            id: jobs[0].id,
            ...updateData,
            companyHandle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(9999, {
                title: "Nope",
            });
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** remove */
describe("remove", function () {
    test("works", async function () {
        let jobs = await Job.findAll();
        await Job.removeJob(jobs[0].id);
        const res = await db.query(
            "SELECT id FROM jobs WHERE id=$1", [jobs[0].id]);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.removeJob(9999);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

