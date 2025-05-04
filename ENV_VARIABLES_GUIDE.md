# Environment Variable Guide for Deployment

This guide explains how to properly configure environment variables for deploying the Assess & Align application.

## Next.js Environment Variables

Next.js uses a specific convention for environment variables:

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without this prefix are only available on the server side

## Required Environment Variables

### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-side only)

### AI Provider Configuration
You need to configure either OpenAI or OpenRouter:

#### Option 1: OpenAI
- `OPENAI_API_KEY`: Your OpenAI API key
- `AI_PROVIDER`: Set to "openai"

#### Option 2: OpenRouter
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `OPENROUTER_DEFAULT_MODEL`: The model to use (e.g., "deepseek-ai/deepseek-coder-33b-instruct")
- `AI_PROVIDER`: Set to "openrouter"

### Application Configuration
- `NEXT_PUBLIC_APP_URL`: The URL where your application is deployed (e.g., "https://assess-align.netlify.app")

## Setting Environment Variables in Different Environments

### Local Development
Create a `.env.local` file in the root directory with your development environment variables.

### Docker Deployment
When using Docker, you can set environment variables in several ways:

1. In the `docker-compose.yml` file:
   ```yaml
   environment:
     - NEXT_PUBLIC_SUPABASE_URL=your_value
     - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value
     # etc.
   ```

2. Using a `.env` file with docker-compose:
   Create a `.env` file in the same directory as your `docker-compose.yml` file, then run:
   ```bash
   docker-compose up -d
   ```

3. When running the Docker container directly:
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=your_value \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_value \
     # etc.
     assess-align
   ```

### Netlify Deployment
In the Netlify dashboard:
1. Go to Site settings > Build & deploy > Environment
2. Add all the required environment variables
3. Trigger a new deployment

### Vercel Deployment
In the Vercel dashboard:
1. Go to your project settings
2. Navigate to the "Environment Variables" section
3. Add all the required environment variables
4. Redeploy your application

## Important Notes

- Never commit actual environment variable values to your repository
- Use different values for development, staging, and production environments
- For production, use secure, randomly generated values for keys and secrets
