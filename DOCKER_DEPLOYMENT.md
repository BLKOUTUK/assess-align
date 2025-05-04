## Docker Deployment

This application can be deployed using Docker for a production-ready environment.

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t assess-align .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 assess-align
   ```

3. Access the application at http://localhost:3000

### Using Docker Compose

1. Start the application:
   ```bash
   docker-compose up -d
   ```

2. Access the application at http://localhost:3000

3. Stop the application:
   ```bash
   docker-compose down
   ```

### Environment Variables

Make sure to set the following environment variables for production:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY`: Your AI provider API key
- `AI_PROVIDER`: Set to either "openai" or "openrouter"

You can set these in the docker-compose.yml file or pass them when running the Docker container.
