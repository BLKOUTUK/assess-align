# Assess & Align

A tool for Black voluntary sector leaders to evaluate research requests on Black mental health.

## Overview

Assess & Align helps Black voluntary sector leaders evaluate research requests on Black mental health by:

1. Scraping research requests from emails
2. Asking key questions about equity and collaboration
3. Generating feedback for researchers using an LLM
4. Tracking impact through anonymized data

## Features

- **Research Request Analysis**: Extract and analyze research requests
- **Equity Assessment**: Evaluate requests using key equity questions
- **AI-Generated Feedback**: Provide constructive feedback to researchers
- **Impact Analytics**: Track and visualize trends in research requests

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI**: OpenAI API for text analysis and feedback generation
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Variables

Create a .env.local file with the following variables:

`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
`

### Installation

1. Clone the repository:
   `
   git clone https://github.com/BLKOUTUK/assess-align.git
   cd assess-align
   `

2. Install dependencies:
   `
   npm install
   `

3. Set up the database:
   - Create a new Supabase project
   - Run the SQL from supabase-schema.sql in the Supabase SQL editor

4. Run the development server:
   `
   npm run dev
   `

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Set the build command to 
pm run build
3. Set the publish directory to .next
4. Add the environment variables in the Netlify dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for BLKOUT UK to support Black voluntary sector leaders
- Uses OpenAI's GPT models for text analysis and feedback generation
