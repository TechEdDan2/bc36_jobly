"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** The Jobs Class will contain Functions for interacting with jobs */
class Job {


    /**
     * 
     * Create a Job from passed data, add the record to the DB table for jobs, and return the new job data.
     * 
     * @param { title, salary, equity, companyHandle } data 
     * 
     * @returns { id, title, salary, equity, companyHandle }
     * 
     * @throws BadRequestError if missing required data or the companyHandle does not exist in companies table
     */
    static async create({ title, salary, equity, companyHandle }) {

        //Input Validation
        if (!title || !companyHandle) {
            throw new BadRequestError("Title and Company Handle are required fields");
        }

        //Check if companyHandle exists in the companies table
        const companyCheck = await db.query(
            `SELECT handle
            FROM companies
            WHERE handle = $1`,
            [companyHandle]);

        if (!companyCheck.rows[0]) {
            throw new BadRequestError(`No company found with handle: ${companyHandle}`);
        }

        //Insert the new job into the jobs table
        const result = await db.query(
            `INSERT INTO jobs
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [
                title,
                salary,
                equity,
                companyHandle
            ]);
        const job = result.rows[0];
        return job;
    }

    /**
     * Find all Jobs and return their data.
     * 
     * @returns { id, title, salary, equity, companyHandle } 
     * 
     * @throws NotFoundError if no jobs found
     */
    static async findAll() {
        const jobsRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            ORDER BY title`);

        if (jobsRes.rows.length === 0) {
            throw new NotFoundError("No jobs found");
        }
        return jobsRes.rows;
    }

    /**
     * Find By a Specific Filter minSalary, hasEquity, title
     * 
     * @param { minSalary, hasEquity, title } filters 
     * 
     * @returns { id, title, salary, equity, companyHandle }[]
     * 
     */
    static async findByFilter(filters) {
        // If no filter criteria, return all jobs
        if (Object.keys(filters).length === 0) {
            return this.findAll();
        }

        //Build the query
        let qString = `SELECT id,
                            title,
                            salary,
                            equity,
                            company_handle AS "companyHandle"
                    FROM jobs`;

        //Array for WHERE conditions and values (SQL injection protection))
        let where = [];
        let vals = [];

        //Check for minSalary filter then add to WHERE conditions and vals array
        if (filters.minSalary !== undefined) {
            vals.push(Number(filters.minSalary));
            where.push(`salary >= $${vals.length}`);
        }

        //Check for hasEquity filter then add to WHERE conditions and vals array
        if (filters.hasEquity === true) {
            where.push(`equity > 0`);
        }

        //Check for title filter then add to WHERE conditions and vals array
        if (filters.title !== undefined) {
            vals.push(`%${filters.title.toLowerCase()}%`);
            where.push(`LOWER(title) LIKE $${vals.length}`);
        }

        //If there are any WHERE conditions, append them to the query string
        if (where.length > 0) {
            qString += " WHERE " + where.join(" AND ");
        }

        //Finalize the query string with an ORDER BY clause
        qString += " ORDER BY title";

        //Execute the query
        const jobsRes = await db.query(qString, vals);
        const filteredJobRes = jobsRes.rows;

        //If no jobs found, throw NotFoundError
        if (filteredJobRes.length === 0) {
            return [];
        }


        //Return the filtered jobs
        return filteredJobRes;

    }

    /**
     * Get Job Post by Primary Key 
     * 
     * @param {id} id 
     * 
     * @returns { id, title, salary, equity, companyHandle }
     * 
     * @throws NotFoundError if no job found with that id  
     */
    static async getJob(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job found with id: ${id}`);

        return job;
    }

    /**
     * Update a Job Post
     * 
     * This will only update fields that are allowed to be updated.
     * 
     * @param {id} id
     * @param { title, salary, equity } data 
     * 
     * @returns { id, title, salary, equity, companyHandle }
     * 
     * @throws NotFoundError if no job found with that id
     * 
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                title: "title",
                salary: "salary",
                equity: "equity",
            });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols}
                          WHERE id = ${idVarIdx}
                          RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`;
        //Use the spread operator to combine the values array with the id                            
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job found with id: ${id}`);

        return job;

    }
    /**  
     * Delete a Job Post by id
     * 
     * @param {id} id
     * 
     * @returns undefined
     * 
     * @throws NotFoundError if no job found with that id
     * 
     */
    static async removeJob(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job found with id: ${id}`);

        return { deleted: id };
    }
}

module.exports = Job;