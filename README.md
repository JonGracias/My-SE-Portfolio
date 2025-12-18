# Portfolio Frontend (Next.js + Azure)

A production Next.js portfolio website that showcases GitHub projects using live data, deployed on Azure with CI/CD.

## Overview

This repository contains the frontend for my personal developer portfolio, available at:

https://gracias.cloud

The site is built with Next.js and TypeScript and dynamically displays my GitHub repositories, including metadata such as descriptions, languages, and activity. It is designed to demonstrate real-world frontend engineering, cloud deployment, and DevOps practices rather than serving as a static résumé.

## Features

- Server-rendered Next.js application
- Dynamic GitHub API integration for live repository data
- Responsive, accessible UI built with Tailwind CSS
- Type-safe codebase using TypeScript
- Environment-based configuration for local and production builds
- Automated deployment to Azure using GitHub Actions

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Source:** GitHub REST API
- **Deployment:** Azure App Service
- **CI/CD:** GitHub Actions

## Project Structure

src/
app/ # Next.js app router pages and API routes
components/ # Reusable React components
lib/ # GitHub API utilities and helpers
styles/ # Global and Tailwind styles

.github/
workflows/ # GitHub Actions deployment pipeline

## Local Development

Clone the repository:

git clone https://github.com/JonGracias/portfolio-fe.git

cd portfolio-fe


Install dependencies:
npm install

Create a local environment file:
cp .env.example .env.local

Start the development server:
npm run dev


## Environment Variables

The following environment variables are used:

- `GITHUB_USERNAME` — GitHub username whose repositories are displayed
- `GITHUB_TOKEN` — Optional GitHub token to increase API rate limits
- `NEXT_PUBLIC_BASE_URL` — Base URL for the application

## Deployment

The application is deployed to Azure using GitHub Actions.

On each push to the `main` branch:
- The project is built
- Assets are optimized
- The site is deployed automatically to Azure App Service

This setup mirrors a real-world CI/CD workflow used in production environments.

## Purpose

This project serves as a living portfolio to demonstrate:

- Frontend engineering with modern React and Next.js
- Integration with third-party APIs
- Cloud deployment and automation
- Clean project structure and maintainability

It is actively maintained and evolves alongside my other projects.

## License

MIT



