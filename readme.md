# Jobly Backend

- [Overview](#overview)
  - [Features](#features)
  - [Future Improvements](#future-improvements)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Setup Instructions](#setup-instructions)
- [Routes](#routes)
- [Author](#author)
- [Acknowledgments](#acknowledgments)
- [License] (#license)

## Overview
This is the Express backend for Jobly, version 2. Jobly is a job board application that allows users to search for and apply to jobs, and allows companies to post jobs. This backend serves a RESTful API that the frontend can interact with to perform these actions.

### Features
- User authentication and authorization using JWT tokens
- CRUD operations for users, companies, and jobs
- Search and filter functionality for companies and jobs
- Secure password storage using bcrypt
- Input validation and error handling

### Future Improvements
- Add some more robust testing, especially for edge cases
- Clean up some of the naming conventions and make them more consistent with standard practices
- Improve error messages to be more user-friendly
- Implement the generation of a random password
- Add Technologies to the database and allow users to filter jobs by technology
- Add Technologies as a field when creating a job
- Add Technologies as a field when creating a user profile
- Build a frontend for the application
- Create a UI for admin users to manage the site

## Built With
- Node.js
- Express
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt
- Jest and Supertest for testing

## Getting Started
### Setup Instructions
1. Clone the repository: `git clone
2. Navigate to the project directory: `cd express-jobly`
3. Install dependencies: `npm install`
4. Set up your PostgreSQL database and create a `.env` file with the following variables:
   - `DATABASE_URL`: Your database connection string
   - `SECRET_KEY`: A secret key for JWT
   - `BCRYPT_WORK_FACTOR`: (optional) The work factor for bcrypt (default is 12)
5. Run the database schema and seed files to set up your database tables and initial data.
6. Start the server: `npm start`
7. Run tests: `npm test`

## Routes
The API has the following routes:
- `POST /auth/token`: Authenticate a user and return a JWT token
- `POST /auth/register`: Register a new user
- `GET /companies`: Get a list of companies (with optional filters)
- `GET /companies/:handle`: Get details of a specific company
- `POST /companies`: Create a new company (admin only)
- `PATCH /companies/:handle`: Update a company (admin only)
- `DELETE /companies/:handle`: Delete a company (admin only)
- `GET /jobs`: Get a list of jobs (with optional filters)
- `GET /jobs/:id`: Get details of a specific job
- `POST /jobs`: Create a new job (admin only)
- `PATCH /jobs/:id`: Update a job (admin only)
- `DELETE /jobs/:id`: Delete a job (admin only)
- `GET /users`: Get a list of users (admin only)
- `GET /users/:username`: Get details of a specific user
- `POST /users`: Create a new user (admin only)
- `PATCH /users/:username`: Update a user (admin or the user themselves)
- `DELETE /users/:username`: Delete a user (admin or the user themselves)
- `POST /users/:username/jobs/:id`: Apply to a job (admin or the user themselves)


---

## Author
- Github - [TechEdDan2](https://github.com/TechEdDan2)
- Frontend Mentor - [@TechEdDan2](https://www.frontendmentor.io/profile/TechEdDan2)

## Acknowledgments
The YouTubers and other educational resources I have been learning from include: Coder Coder (Jessica Chan), BringYourOwnLaptop (Daniel Walter Scott), Kevin Powell, vairous Udemy courses, Geeks for Geeks, Stack Overflow, and Stony Brook University's Software Engineering Bootcamp (curriculum developed by Colt Steele) 

## License
This project is licensed under the ISC license