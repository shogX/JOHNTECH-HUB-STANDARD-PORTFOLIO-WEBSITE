# JOHNTECH HUB Backend

This backend is built with Node.js, Express, and MongoDB to serve portfolio job entries to your frontend.

## Setup

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file by copying `.env.example` and update your MongoDB URI.

3. Run the server in development:

   ```bash
   npm run dev
   ```

4. The API will be available at `http://localhost:5000/api/jobs`.

## API Endpoints

- `GET /api/jobs` — list all jobs
- `GET /api/jobs/:id` — get one job
- `POST /api/jobs` — create a new job
- `PUT /api/jobs/:id` — update a job
- `DELETE /api/jobs/:id` — delete a job

## Frontend integration

From your portfolio frontend, use the endpoint `/api/jobs` to fetch jobs and render them dynamically.

Example client fetch:

```js
fetch('http://localhost:5000/api/jobs')
  .then(res => res.json())
  .then(jobs => {
    // render the jobs in your portfolio grid
  });
```

## Deployment

1. Use MongoDB Atlas for the database.
2. Deploy the backend to a provider like Render, Railway, or Heroku.
3. Set `MONGODB_URI` and `PORT` as environment variables.
4. Configure the frontend to call the deployed backend URL.
