/**
 * ============================================================================
 * STARLING DISPATCH — LEADS CAPTURE & INSTANT EMAIL NOTIFICATION SCRIPT
 * ============================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new) and name it "Starling Dispatch Leads"
 * 2. In the menu, go to: Extensions > Apps Script
 * 3. Delete any existing code in Code.gs and PASTE ALL OF THIS CODE
 * 4. Verify your notification email below in CONFIG.NOTIFICATION_EMAIL
 * 5. Click "Deploy" (top right) > "New deployment"
 * 6. Select type: "Web app"
 * 7. Set:
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"  <--- (CRITICAL for website form to work)
 * 8. Click "Deploy", Authorize permissions, and COPY the Web App URL!
 * 9. Paste the Web App URL into `contact.html` in your website code.
 * ============================================================================
 */

// ── CONFIGURATION SETTINGS ──
const CONFIG = {
  // Primary email where you want to receive instant lead notifications
  NOTIFICATION_EMAIL: "support@starlingdispatch.com",

  // Optional: Add secondary email(s) separated by commas
  CC_EMAILS: "",

  // The name of the sheet/tab inside your Google Spreadsheet
  SHEET_NAME: "Leads",

  // ─────────────────────────────────────────────────────────────────────────
  // SPREADSHEET_ID: Open your Google Sheet, look at the URL:
  // https://docs.google.com/spreadsheets/d/  <<<THIS_PART>>>  /edit
  // Copy that ID and paste it below (between the quotes).
  // This is REQUIRED for the script to write rows when running as a Web App.
  // ─────────────────────────────────────────────────────────────────────────
  SPREADSHEET_ID: "1SRWm2OSpwRlKjWG8slMn2V0fU-iakJmtud_iu_PHtTI",  // Starling Dispatch Leads Sheet

  // Company Branding for Email Notifications
  COMPANY_NAME: "Starling Dispatch",
  HOTLINE_PHONE: "+1 (916) 209-0883",
  WEBSITE_URL: "https://starlingdispatch.com"
};

/**
 * Returns the Google Spreadsheet — works both as a Web App and bound script.
 * Uses SPREADSHEET_ID from CONFIG if set (required for Web App deployment),
 * otherwise falls back to the active/bound spreadsheet.
 */
function getSpreadsheet() {
  if (CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID.trim());
  }
  // Fallback: works when the script is opened directly from a sheet
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Handle POST request from website contact form (fetch or XMLHttpRequest)
 */
function doPost(e) {
  try {
    let data = {};

    // Support both JSON body and standard Form POST (FormData / URL-encoded)
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    // Extract lead information (supports both standard names and Google Form entry IDs)
    const companyName = data.name || data.company_name || data['entry.1884550941'] || "N/A";
    const phoneNumber = data.phone || data.phone_number || data['entry.441313333'] || "N/A";
    const emailAddress = data.email || data.email_address || data['entry.1623815691'] || "N/A";
    const equipmentType = data.truck || data.equipment || data.equipment_type || data['entry.824233526'] || "Not Specified";
    const messageNotes = data.message || data.notes || data.mc_dot || data['entry.1538572422'] || "None provided";
    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone() || "America/New_York", "MMM dd, yyyy hh:mm a z");

    // 1. Record Lead into Google Sheet
    const sheet = getOrCreateLeadsSheet();
    sheet.appendRow([
      formattedDate,
      companyName,
      phoneNumber,
      emailAddress,
      equipmentType,
      messageNotes,
      "New Lead" // Status column for your dispatch team
    ]);

    // 2. Send Instant Email Notification
    sendLeadEmailNotification({
      date: formattedDate,
      companyName: companyName,
      phoneNumber: phoneNumber,
      emailAddress: emailAddress,
      equipmentType: equipmentType,
      messageNotes: messageNotes
    });

    // 3. Return JSON Success Response
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Carrier application received successfully!"
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error processing lead: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (Used for checking if the script URL is active)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "online",
      message: "Starling Dispatch Lead Webhook is active and running."
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper to get or create the styled "Leads" sheet tab
 */
function getOrCreateLeadsSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    // Setup Header Row
    const headers = [
      "Submission Date / Time",
      "Company / Contact Name",
      "Phone Number",
      "Email Address",
      "Equipment Type",
      "MC/DOT & Operating Lanes / Notes",
      "Status"
    ];

    sheet.appendRow(headers);

    // Style Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0A1930"); // Navy
    headerRange.setFontColor("#D4A017"); // Gold
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }

  return sheet;
}

/**
 * Sends a rich, branded HTML email notification to support@starlingdispatch.com
 */
function sendLeadEmailNotification(lead) {
  const subject = "🚨 New Carrier Lead: " + lead.companyName + " (" + lead.equipmentType + ")";
  const ssUrl = getSpreadsheet().getUrl();

  const plainTextBody = 
    "NEW CARRIER APPLICATION RECEIVED\n\n" +
    "Company / Contact: " + lead.companyName + "\n" +
    "Phone: " + lead.phoneNumber + "\n" +
    "Email: " + lead.emailAddress + "\n" +
    "Equipment: " + lead.equipmentType + "\n" +
    "MC/DOT & Lanes: " + lead.messageNotes + "\n" +
    "Submitted At: " + lead.date + "\n\n" +
    "View full leads spreadsheet:\n" + ssUrl;

  const htmlBody = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
      .header { background: #030b14; padding: 24px 30px; text-align: center; border-bottom: 3px solid #d4a017; }
      .header h1 { margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 0.05em; font-weight: 800; text-transform: uppercase; }
      .header p { margin: 6px 0 0 0; color: #d4a017; font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
      .content { padding: 30px; }
      .alert-banner { background: #eff6ff; border-left: 4px solid #d4a017; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; }
      .alert-banner strong { color: #0a1930; font-size: 14px; }
      .lead-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      .lead-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
      .lead-table td.label { width: 35%; font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; background-color: #f8fafc; }
      .lead-table td.value { color: #0f172a; font-weight: 600; }
      .lead-table td.highlight { color: #0a1930; font-weight: 700; font-size: 15px; }
      .actions { display: flex; gap: 12px; margin: 25px 0 10px 0; text-align: center; }
      .btn { display: inline-block; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 4px; }
      .btn-call { background-color: #00c896; color: #ffffff !important; }
      .btn-email { background-color: #0a1930; color: #ffffff !important; }
      .btn-sheet { background-color: #d4a017; color: #030b14 !important; }
      .footer { background: #f8fafc; padding: 16px 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Starling Dispatch</h1>
        <p>🚛 New 14-Day Free Trial Lead</p>
      </div>
      <div class="content">
        <div class="alert-banner">
          <strong>⚡ Action Required:</strong> Contact this carrier within 15 minutes to confirm account and book loads.
        </div>

        <table class="lead-table">
          <tr>
            <td class="label">Company / Contact</td>
            <td class="value highlight">${escapeHtml(lead.companyName)}</td>
          </tr>
          <tr>
            <td class="label">Phone Number</td>
            <td class="value"><a href="tel:${escapeHtml(lead.phoneNumber)}" style="color: #0284c7; text-decoration: none; font-weight: 700;">${escapeHtml(lead.phoneNumber)}</a></td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="value"><a href="mailto:${escapeHtml(lead.emailAddress)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(lead.emailAddress)}</a></td>
          </tr>
          <tr>
            <td class="label">Equipment Type</td>
            <td class="value"><span style="background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">${escapeHtml(lead.equipmentType)}</span></td>
          </tr>
          <tr>
            <td class="label">MC / DOT & Lanes</td>
            <td class="value" style="white-space: pre-wrap; font-family: monospace; font-size: 13px; color: #334155;">${escapeHtml(lead.messageNotes)}</td>
          </tr>
          <tr>
            <td class="label">Submitted At</td>
            <td class="value" style="color: #64748b; font-size: 13px;">${escapeHtml(lead.date)}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="tel:${escapeHtml(lead.phoneNumber)}" class="btn btn-call">📞 Call Carrier</a>
          <a href="mailto:${escapeHtml(lead.emailAddress)}?subject=Starling%20Dispatch%20-%20Your%2014-Day%20Free%20Trial" class="btn btn-email">✉️ Reply by Email</a>
          <a href="${ssUrl}" target="_blank" class="btn btn-sheet">📊 Open Leads Sheet</a>
        </div>
      </div>
      <div class="footer">
        Automated lead delivery system · <a href="${CONFIG.WEBSITE_URL}" style="color: #64748b; text-decoration: none;">${CONFIG.COMPANY_NAME}</a>
      </div>
    </div>
  </body>
  </html>
  `;

  // Send the email via Google MailApp
  const mailOptions = {
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: plainTextBody,
    htmlBody: htmlBody
  };

  if (CONFIG.CC_EMAILS && CONFIG.CC_EMAILS.trim() !== "") {
    mailOptions.cc = CONFIG.CC_EMAILS.trim();
  }

  MailApp.sendEmail(mailOptions);
}

/**
 * Escapes HTML characters for email template safety
 */
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * OPTIONAL: Trigger handler if you connect this sheet to a Google Form response
 */
function onFormSubmit(e) {
  if (!e || !e.values) return;
  // e.values: [Timestamp, Company, Phone, Email, Truck, Notes]
  const vals = e.values;
  sendLeadEmailNotification({
    date: vals[0] || new Date().toLocaleString(),
    companyName: vals[1] || "N/A",
    phoneNumber: vals[2] || "N/A",
    emailAddress: vals[3] || "N/A",
    equipmentType: vals[4] || "Not specified",
    messageNotes: vals[5] || "None"
  });
}
