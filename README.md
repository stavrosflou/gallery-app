# Gallery App

Modern Angular gallery application for displaying artwork with multilingual support.

> **Note**: This project uses only the Angular frontend (`gallery-app` folder). Backend and Docker are not used.

## 🚀 Quick Start

### Local Development

```powershell
cd gallery-app
npm install
npm start
```

Visit `http://localhost:4200` in your browser.

## 📦 Deployment

### Your Workflow:

1. **Make changes** to your Angular app
2. **Test locally** with `npm start`
3. **Commit and push** using GitHub Desktop
4. **Deploy to live site**:
   ```powershell
   .\deploy.ps1
   ```

That's it! Your site will be live at: **https://centralgalleryart.com/**

### Custom Domain Setup

See [CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md) for complete instructions on configuring your domain.

**Quick steps:**
1. Add A records to your DNS (see guide)
2. Configure custom domain in GitHub Pages settings
3. Run `.\deploy.ps1`
4. Wait 1-2 hours for DNS propagation

### First-Time Setup

Enable GitHub Pages once:
1. Go to: https://github.com/stavrosflou/gallery-app/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** → **/ (root)**
4. Click **Save**

## 🎨 Features

- Image Gallery with detailed artwork information
- Multilingual (English/Greek)
- Contact Form with email integration
- Responsive Design
- Modern UI with Angular 19 + PrimeNG

## 🛠️ Technologies

- Angular 19
- TypeScript
- PrimeNG
- EmailJS
- RxJS

