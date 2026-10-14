# Tap In

NFC card landing site: a home page, one page per place (menu, offers, social links, reviews), and a dashboard to edit the data. Built with React, Vite and React Router. English and Arabic (right-to-left).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home with the tap animation and the list of places |
| `/place/<id>` | A place's page, for example `/place/demo-cafe`. This is the link to write to its NFC card |
| `/admin` | Dashboard (password protected, not linked from the public pages) |

## Fonts (Kalam)

The site uses the Kalam font, loaded locally with `@font-face` in `src/styles.css`. There are no Google Fonts or other external font requests.

Put the two font files here (the folder already exists):

```
public/fonts/Kalam-Regular.ttf   (weight 400, regular text)
public/fonts/Kalam-Bold.ttf      (weight 700, headings and bold text)
```

Vite serves `public/` as-is in `npm run dev` and in the production build, and `vercel.json` caches the fonts for a year. To check they load, open DevTools, go to Network, filter by **Font**, reload, and you should see both files with status 200. If one is missing, the browser quietly uses a fallback font.

Kalam has no Arabic letters, so Arabic text uses the system Arabic font (Segoe UI, Tahoma, Noto Sans Arabic) while Latin letters and numbers still use Kalam.

## Features

- **Editable page address:** each place's link (`/place/<address>`) can be changed in the dashboard, or set from the place name with one click. New places follow their name until first published. When you change a published address, the old link keeps redirecting to the new one (you can remove old links in the dashboard).
- **Multiple menu photos:** upload several photos and PDFs at once, reorder them, preview and remove them. Photos show stacked on the place page; each PDF gets its own button.
- **Automatic cleanup in Supabase Storage:** when you press Save, images that are no longer used (replaced, removed, or belonging to a deleted place) are deleted from storage. Files uploaded and then discarded or replaced before saving are removed too. This needs the storage "read uploads" policy in `supabase/schema.sql`.
- **WhatsApp toggle per place** (dashboard → Sections on the public page), and a **WhatsApp icon in the footer** with the other social icons (switch it on or off in Site settings; it uses the main WhatsApp number).
- **Text fields** (inputs, text areas, dropdowns) use Noto Sans, a standard Google font with Arabic support; the rest of the site uses Kalam.

- **Official social links:** the footer shows X, Facebook, Instagram and TikTok, and the home page has a "Contact Us on Instagram" button. Both are managed in **Dashboard → Site settings → Official social media**: edit each URL, switch each platform on or off, then press **Save social links**. URLs are validated (https, right domain, account name present). A disabled platform disappears everywhere, and the Instagram button hides when Instagram is off.

- **Light and dark mode:** toggle in the header. The choice is remembered, and the first visit follows the device setting.
- **Animated card logo:** each place page opens with the card tap animation showing the place's logo. With no logo, a default icon (restaurant, café, clinic or generic) is used. Place cards on the home page show the same logo or icon.
- **Places row:** the supported places scroll sideways (swipe on mobile, arrow buttons on desktop when there is overflow).
- **Contact and social links:** any number of phone numbers and social links per place (Instagram, Facebook, TikTok, X, YouTube, LinkedIn, Telegram, Website, or any other name). Only configured ones appear. WhatsApp works exactly as before.
- **Reviews:** a reviews section with an average rating, review cards and a "Leave a review" button.
- **Section toggles:** per place, Menu, Offers, Links and Reviews can each be shown or hidden. "Links" covers social icons and phone numbers.
- **Uploads:** a logo (PNG, JPG, WebP, SVG; rasters are resized automatically) and a menu file (PDF or image up to 1.5 MB). Files are checked on upload and the dashboard shows a clear success or error message.

To add a social platform, add one line to `src/platforms.jsx`. Old data (single phone, Instagram, Facebook, TikTok, review URL) is upgraded automatically.

## Backend (Supabase)

With Supabase configured, visitors read places and settings from the database, and the dashboard saves straight to it, so changes are live for everyone as soon as you press **Save changes**. Logos and menus are uploaded to Supabase Storage.

**One-time setup**

1. In Supabase, open **Authentication → Users → Add user** and create `admin@tapineg.com` with a strong password (tick **Auto Confirm User**). Turn off public sign-ups in the Authentication settings.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. It creates the tables, the security rules (everyone can read, only `admin@tapineg.com` can write) and the `uploads` storage bucket.
3. Make sure these variables exist in Vercel (the Vercel + Supabase integration adds them automatically) and in a local `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`). `vite.config.js` exposes only `VITE_*` and `NEXT_PUBLIC_*`, so secrets such as the service role key never reach the browser. Redeploy after changing variables.
4. Open `/admin`, sign in, and press **Save changes** once to publish the sample data into the empty database. Then edit it.

**How it behaves**

- The site shows the last cached copy instantly and refreshes from the database in the background. If the database is unreachable it falls back to the cache, then to `src/data/places.json`.
- Edits stay on your screen until you press **Save changes**; the browser warns if you leave with unsaved edits. **Backup (JSON)** downloads everything, and **Import** loads a backup (press Save to publish it).
- Uploads are limited to 8 MB for menus. Replaced or removed files stay in Storage and can be deleted in the Supabase dashboard.
- Never put the service role key, JWT secret or database password in this project.

Without Supabase variables the site still works the old way: edits are a browser-only draft protected by `VITE_ADMIN_PASSWORD`, and you export and commit `places.json`.

## Edit the data (without Supabase)

All content lives in `src/data/places.json`. You can edit that file by hand, or use the dashboard:

1. Open `/admin` and sign in. The default password is `tapin-admin`; set your own with `VITE_ADMIN_PASSWORD` (copy `.env.example` to `.env`, and add the same variable in Vercel).
2. Add or edit places, offers and menu items. Changes are saved **in your browser only**.
3. Press **Export places.json**, replace `src/data/places.json` with the downloaded file, then commit and push. Vercel redeploys and everyone sees the update.

Uploaded logos and menus are stored inside `places.json` as data, so keep them small. If browser storage fills up, the dashboard warns you; export right away. For many places or large menus, move files to storage such as Supabase Storage.

The password only protects the editing screen. Visitors can never change the site, because they only read the committed `places.json`.

## Deploy on Vercel

Push the repo to GitHub, import it in Vercel, and keep the defaults (Framework: Vite). `vercel.json` already rewrites every path to `index.html` so links like `/place/demo-cafe` work when opened directly or tapped from an NFC card.

## Adding a place

Use **+ Add place** in the dashboard. Each place gets an id (for example `place-k3j9x`) that forms its link, so don't change the id after you've written it to a card. You can rename it in `places.json` before you start using the link.

