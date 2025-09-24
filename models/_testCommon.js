const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const fakeJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img'),
           ('comp1', 'COMP1', 4, 'Desc4', 'http://c4.img')`);

  await db.query(`
        INSERT INTO users(username,
    password,
    first_name,
    last_name,
    email)
        VALUES('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
    ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]);

  //Need the ids, so capture the return values
  const resJobs = await db.query(`
        INSERT INTO jobs(title, salary, equity, company_handle)
        VALUES ('J1', 50000, '0.01', 'c1'),
               ('J2', 60000, '0.02', 'c1'),
               ('J3', 70000, '0', 'c2'),
               ('J4', NULL, NULL, 'c3'),
               ('J5', 80000, '0.03', 'comp1')
        RETURNING id`);
  // Add the ids to the fakeJobIds array for use in tests
  // use splice to add to existing array
  // use the ... spread operator to spread the array into individual values
  //  so that splice adds each value, rather than the array itself
  //  at index 0, remove 0 elements, and add the new elements
  fakeJobIds.splice(0, 0, ...resJobs.rows.map(r => r.id));

  await db.query(`
    INSERT INTO applications(username,job_id)
    VALUES ('u1', ${fakeJobIds[0]}),
           ('u1', ${fakeJobIds[1]})`);
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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  fakeJobIds,
};