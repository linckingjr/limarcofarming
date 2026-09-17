LIMARCO Farming — Static Site Scaffold

Files created:
- index.html — main site
- styles.css — colors and layout (maroon primary)
- app.js — minimal store and cart logic
- products.json — sample product data
- firebase-config.example.js — example Firebase config for forum

Next steps:
1. Replace assets/logo.png with your provided logo.
2. Configure Firebase and rename `firebase-config.example.js` to `firebase-config.js` to enable forum features.
3. Deploy to Netlify, Vercel, or GitHub Pages for a quick static site.

Forum setup quick steps:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore database (or Realtime Database) and create rules for public read/write while testing.
3. In project settings, copy the web app config and paste into `firebase-config.js`.
4. Deploy the site or run it locally with a static server.

Local test (simple HTTP server using Python):
```bash
# Python 3
python -m http.server 8000
```

Work done to replicate Wix site:
- Hero carousel using local `pictures/` images
- Special Offers, Blog preview, Operating Hours, Contact footer
- Header cart with live count and improved layout

To test locally, run the Python server and open http://localhost:8000

Colors:
- Maroon: #7B2B2B (primary)
- Orange: #FF8C42 (accent)
- Forest green: #2E8B57 (accent)

