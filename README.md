# Wise Augur AI

A React and Supabase web application for Bazi and Feng Shui readings, conversational questions, and learning content.

The project brings chart-based readings, reading history, visualizations, and follow-up questions into one web interface. It contains membership and payment integration code as well as a learning section; a checked-in integration is not evidence that a live service is deployed or verified.

## What's in the repository?

- **Reading interface:** birth-date input, Bazi charts, reading history, custom questions, and visualization exports
- **Additional views:** Feng Shui analysis, chat, learning lessons, and account/membership pages
- **Backend integration:** Supabase client, database migrations, and Edge Function source for calculation, AI responses, and payment flows
- **Frontend stack:** React, TypeScript, Vite, Tailwind CSS, and shadcn/ui

These are cultural/interpretive application features, not a claim of scientifically validated prediction.

## Run locally

Requirements: Node.js and npm.

```sh
git clone https://github.com/xingxuling/wise-augur-ai.git
cd wise-augur-ai
npm install
npm run dev
```

The frontend reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; configure them for your own Supabase project. Authentication, persisted readings, AI responses, and payment flows also depend on the corresponding backend configuration. Starting Vite alone does not provision these services. Never put service-role keys or provider secrets in frontend environment variables.

Available checks:

```sh
npm run lint
npm run build
```

The current package does not define an automated test script. These commands are documented entrypoints, not a claim that they were run for this README update.

## Source map

- `src/App.tsx`: page routing
- `src/pages/`: reading, chat, learning, account, and membership views
- `src/components/`: reusable UI and reading/visualization components
- `src/integrations/supabase/`: generated Supabase client and types
- `supabase/functions/`: backend function source
- `supabase/migrations/`: database migrations

## License

MIT. See [LICENSE](LICENSE).

---

## Lovable development workflow

## Project info

**URL**: https://lovable.dev/projects/e89dc5e1-2a42-4d68-81a6-8ce35dc94e7d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e89dc5e1-2a42-4d68-81a6-8ce35dc94e7d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone https://github.com/xingxuling/wise-augur-ai.git

# Step 2: Navigate to the project directory.
cd wise-augur-ai

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e89dc5e1-2a42-4d68-81a6-8ce35dc94e7d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
