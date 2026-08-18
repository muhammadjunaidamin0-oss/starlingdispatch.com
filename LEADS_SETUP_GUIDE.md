# 📋 Starling Dispatch — Leads Sheet & Email Setup Guide

Follow these quick steps (takes ~2 minutes) to start receiving leads directly in your **Google Sheet** and instant email notifications at **`support@starlingdispatch.com`**.

---

## 🚀 Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.new) (or open Google Drive and create a new spreadsheet).
2. Name your spreadsheet: **`Starling Dispatch Leads`**.

---

## ⚡ Step 2: Paste the Apps Script

1. In your new Google Sheet menu bar, click on **Extensions** > **Apps Script**.
2. A new tab will open with a code editor (`Code.gs`).
3. **Delete everything** currently in `Code.gs`.
4. Open the file [`google-apps-script.js`](./google-apps-script.js) from your project folder, copy all the code, and paste it into the Apps Script editor.
5. *(Optional)* If you want lead notifications sent to additional email addresses too, you can edit line 27:
   ```javascript
   CC_EMAILS: "yourpersonal@gmail.com",
   ```
6. Click the 💾 **Save** icon (or press `Ctrl + S`).

---

## 🌐 Step 3: Deploy as Web App (Takes 30 Seconds)

1. In the top right of the Apps Script window, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `Starling Dispatch Leads API`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: **`Anyone`** ⚠️ *(Important: Make sure this is set to "Anyone" so visitors can submit from your website)*
4. Click **Deploy**.
5. Google will ask you to **Authorize access**:
   - Click *Authorize access*
   - Choose your Google account
   - Click *Advanced* (small text at bottom left)
   - Click *Go to Starling Dispatch Leads (unsafe)*
   - Click *Allow*
6. Copy the generated **Web App URL** (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Step 4: Add the URL to `contact.html`

1. Open [`contact.html`](./contact.html) in your editor.
2. Near line 240, replace `GOOGLE_SCRIPT_URL` with your copied URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
3. Save [`contact.html`](./contact.html).

---

## ✅ Step 5: Test It!

1. Open `contact.html` in your web browser.
2. Fill in the Carrier Application form with test details and click **Activate My 14-Day Free Trial**.
3. You will immediately see:
   - A new row in your **"Leads"** tab in your Google Sheet.
   - An instant notification email at **`support@starlingdispatch.com`** with quick **Call** and **Email** buttons!
