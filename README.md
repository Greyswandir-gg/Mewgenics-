<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1atZvzYXwCpbMqvxRFgBbIWqGlll54NFB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies: `npm install`
2. Create a Supabase project. Copy the Project URL and `anon` API key.
3. Run the SQL in `supabase.sql` via Supabase SQL Editor (или `supabase db push`).
4. Create `.env` with frontend creds (Vite uses `VITE_` prefix):
   ```
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your_anon_key>
   ```
5. Start dev: `npm run dev`

### Что внутри теперь
- Auth и хранение данных через Supabase (RLS по пользователю).  
- Таблицы: `branches`, `cats`, `events`, `team_presets`. Коллеции «ошейники» остаются статическими в клиенте.  
- После первого входа пользователю автоматически создаются 2 базовые ветки из `INITIAL_BRANCHES`.
