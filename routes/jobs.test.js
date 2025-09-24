"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken,
    fakeJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */
describe("POST /jobs", function () {
    test("ok for admins", async function () {
        const newJob = {
            title: "New Job",
            salary: 90000,
            equity: "0.03",
            companyHandle: "c1",
        };
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "New Job",
                salary: 90000,
                equity: "0.03",
                companyHandle: "c1",
            },
        });
    });
});

/************************************** GET /jobs */
describe("GET /jobs", function () {
    test("ok for anyone", async function () {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "J1",
                    salary: 65000,
                    equity: "0.01",
                    companyHandle: "c1",
                },
                {
                    id: expect.any(Number),
                    title: "J2",
                    salary: 70000,
                    equity: "0.02",
                    companyHandle: "c1",
                },
                {
                    id: expect.any(Number),
                    title: "J3",
                    salary: 80000,
                    equity: null,
                    companyHandle: "c2",
                },
            ],
        });
    });
});

/************************************** PATCH /jobs */
describe("PATCH /jobs/:id", function () {
    test("works for admins", async function () {
        const resp = await request(app)
            .patch(`/jobs/${fakeJobIds[0].id}`)
            .send({
                title: "J1-new",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: fakeJobIds[0].id,
                title: "J1-new",
                salary: 65000,
                equity: "0.01",
                companyHandle: "c1",
            },
        });
    });
});

/************************************** DELETE /jobs */
describe("DELETE /jobs/:id", function () {
    test("works for admins", async function () {
        const resp = await request(app)
            .delete(`/jobs/${fakeJobIds[0].id}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: `${fakeJobIds[0].id}` });
    });
});


