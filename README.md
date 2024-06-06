# 🚀  Simple Library Management System

This project is a library management system built using Node.js, Express, SQLite, and TypeScript. It includes features for user authentication, book management, and borrowing/returning books.

# Boilerplate for Node.js + TypeScript + ESLint + Prettier used in this project taken from

[this medium article](https://medium.com/@apeview/setup-node-js-projects-with-typescript-eslint-and-prettier-4c1f1fecd107)


## Prerequisites

- Node.js (>= v20.14.0)
- npm (>= 10.5.2)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/sumitnegi7/base-node
   cd base-node
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

## Database Setup

### Run Migrations

To set up the SQLite database, run the following migration script:

```sh
npm run migrate
```

This will create the necessary tables in `database.sqlite`.

## Start the Server

To start the server, run:

```sh
npm run dev
```

The server will run on `http://localhost:3000`.

## API Endpoints

### Authentication

- **POST /api/auth/register**
- **POST /api/auth/login**

### Books

- **POST /api/books** (Admin only)
- **PUT /api/books/:id** (Admin only)
- **DELETE /api/books/:id** (Admin only)
- **GET /api/books**

### Borrowing

- **POST /api/borrows/borrow** (Authenticated users)
- **POST /api/borrows/return** (Authenticated users)
- **GET /api/borrows/overdue-books** (Admin only)

## Testing

The project uses Jest and Supertest for testing. To run the tests, use the following command:

```sh
npm test
```

### Setting Up Testing Environment

The tests use a mock SQLite database to avoid affecting the real database. Ensure the test database is correctly set up by running:


### Example Test Command

```sh
npm test
```

## Linting and Formatting

The project uses ESLint for linting and Prettier for code formatting. To run the linter, use:

```sh
npm run lint
```

To format the code, use:

```sh
npm run format
```

### Important

Setting the status to 'available'/'borrowed' in books schema after every operation is not feasible when there are multiple quantities, as it can cause consistency and borrowing issues. I am using 'quantity' to manage the loaning of books.  If 'quantity' is 0, then I set the status to 'borrowed'. This ensures the functionality works correctly for books with a quantity greater than 1.
 