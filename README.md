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

## Features

- **Light and dark mode:** toggle in the header. The choice is remembered, and the first visit follows the device setting.
- **Animated card logo:** each place page opens with the card tap animation showing the place's logo. With no logo, a default icon (restaurant, café, clinic or generic) is used. Place cards on the home page show the same logo or icon.
- **Places row:** the supported places scroll sideways (swipe on mobile, arrow buttons on desktop when there is overflow).
- **Contact and social links:** any number of phone numbers and social links per place (Instagram, Facebook, TikTok, X, YouTube, LinkedIn, Telegram, Website, or any other name). Only configured ones appear. WhatsApp works exactly as before.
- **Reviews:** a reviews section with an average rating, review cards and a "Leave a review" button.
- **Section toggles:** per place, Menu, Offers, Links and Reviews can each be shown or hidden. "Links" covers social icons and phone numbers.
- **Uploads:** a logo (PNG, JPG, WebP, SVG; rasters are resized automatically) and a menu file (PDF or image up to 1.5 MB). Files are checked on upload and the dashboard shows a clear success or error message.

To add a social platform, add one line to `src/platforms.jsx`. Old data (single phone, Instagram, Facebook, TikTok, review URL) is upgraded automatically.

## Edit the data

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

## Next step: edit without redeploying

If you want edits to go live instantly instead of exporting and committing, move `places.json` into a database such as Supabase or Firebase and read it in `src/store.jsx`. The rest of the app doesn't need to change.
