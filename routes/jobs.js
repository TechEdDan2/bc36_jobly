"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

const Job = require("../models/job");

const jobCreateSchema = require("../schemas/jobCreate.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/** 
 * POST / { job } =>  { job }
 *
 *  Creates a new Job 
 * 
 * job should be { title, salary, equity, companyHandle } 
 * 
 * @returns {id, title, salary, equity, companyHandle} 
 * 
 * * Authorization required: Admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobCreateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
        }

        const job = await Job.create(req.body);

    } catch (err) {
        return next(err);
    }

});

/** 
 * GET / 
 * 
 * Use Filters or in none Get all Jobs
 * 
 * @returns { id, title, salary, equity, companyHandle }[] 
 * 
 * Authorization required: n/a
 */
router.get("/", async function (req, res, next) {
    try {
        const filterObj = req.query;
        const jobs = await Job.findByFilter(filterObj);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id] */

/** PATCH / [id] */

/** DELETE / [id] */


module.exports = router;