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
        return res.status(201).json({ job });

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

/** 
 * GET /[id] 
 * 
 * Get a job by its ID
 * 
 * @returns { id, title, salary, equity, companyHandle } 
 * 
 * Authorization required: n/a
 */
router.get("/:id", async function (req, res, next) {
    try {
        const job = await Job.getJob(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** 
 * PATCH / [id] 
 * 
 * Update a job post with data
 * 
 * @returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: Admin
 */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** 
 * DELETE / [id] 
 * 
 * Delete a job post
 * 
 * @returns { deleted: id }
 * 
 * Authorization required: Admin 
 */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
        await Job.removeJob(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;