"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const companiesRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /**
   * Find all companies that match filter criteria.
   *
   * @param {nameLike, minEmployees, maxEmployees} filters
   *
   * @returns { handle, name, description, numEmployees, logoUrl }[]
   *
   * @throws BadRequestError if minEmployees is greater than maxEmployees
   * @throws NotFoundError if no companies found with those filters
   */
  static async findByFilter(filters) {

    // If no filter criteria, return all companies
    if (Object.keys(filters).length === 0) {
      return this.findAll();
    }

    // Build the query
    let qString = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies`;

    // Create an array to hold WHERE conditions
    let where = [];
    // Create an array to hold the values for the query
    //  and safeguard against SQL injection
    let vals = [];

    // Check for nameLike filter then add to WHERE conditions and vals array
    if (filters.nameLike !== undefined) {
      vals.push(`%${filters.nameLike.toLowerCase()}%`);
      where.push(`LOWER(name) LIKE $${vals.length}`);
    }

    // Check that minEmployees is not greater than maxEmployees
    if (Number(filters.minEmployees) > Number(filters.maxEmployees)) {
      throw new BadRequestError("Min employees cannot be greater than max employees");
    }

    // Check for minEmployees filter then add to WHERE conditions and vals array
    if (filters.minEmployees !== undefined) {
      vals.push(Number(filters.minEmployees));
      where.push(`num_employees >= $${vals.length}`);
    }

    // Check for maxEmployees filter then add to WHERE conditions and vals array
    if (filters.maxEmployees !== undefined) {
      vals.push(Number(filters.maxEmployees));
      where.push(`num_employees <= $${vals.length}`);
    }

    // If there are any WHERE conditions, append them to the query to make the Dynamic query
    if (where.length > 0) {
      qString += " WHERE " + where.join(" AND ");
    }

    // Finalize the query with an ORDER BY clause
    qString += " ORDER BY name";
    // Execute the query
    //  passing in the vals array to safeguard against SQL injection
    //  and get the filtered companies
    const companiesRes = await db.query(qString, vals);
    const filteredCompRes = companiesRes.rows;

    // If no companies found, throw NotFoundError
    if (filteredCompRes.length === 0) throw new NotFoundError(`No companies found with those filters`);

    //FINALLY return the filtered companies
    return filteredCompRes;

  }


  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
