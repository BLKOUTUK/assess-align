import Head from "next/head";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Simple check to see if Supabase is configured
    if (supabaseUrl && supabaseAnonKey) {
      setMessage("Supabase is configured correctly!");
    } else {
      setMessage("Supabase configuration is missing. Please check your environment variables.");
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>BLKOUT UK Assessment Tool</title>
        <meta name="description" content="Assessment and alignment tool for BLKOUT UK" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="title">
          Welcome to <a href="https://blkoutuk.com">BLKOUT UK</a> Assessment Tool
        </h1>

        <p className="description">
          A platform for assessment and alignment
        </p>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="card">
            <h2>Status</h2>
            <p>{message}</p>
          </div>
        )}
      </main>

      <footer>
        <a
          href="https://blkoutuk.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by BLKOUT UK
        </a>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .description {
          text-align: center;
          line-height: 1.5;
          font-size: 1.5rem;
        }

        .card {
          margin: 1rem;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
          width: 100%;
          max-width: 800px;
        }

        .card h2 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .title {
            font-size: 2.5rem;
          }
          .description {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
