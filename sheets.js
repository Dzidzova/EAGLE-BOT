const { google } = require('googleapis');
const fs = require('fs');

// ✅ Décode la variable d'environnement en credentials.json si nécessaire
const base64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
if (base64 && !fs.existsSync('credentials.json')) {
  const json = Buffer.from(base64, 'base64').toString('utf-8');
  fs.writeFileSync('credentials.json', json);
}

// 🔐 Authentification avec Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// 🧾 ID de ta feuille Google Sheets
const spreadsheetId = '18iuwmvkB-J5sJ1zrow6F5ets5lLlQrknriyHzAE7yy0'; // remplace au besoin
const range = 'Feuille1!A:E'; // adapte si le nom de la feuille change

async function getSheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  return sheets;
}

// 🔍 Lire toutes les lignes avec leur index
async function getRowsWithIndex() {
  const sheets = await getSheet();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values || [];
  return rows.map((row, index) => ({
    index: index + 1,
    numero: row[0],
    etape: row[1],
    dateStart: row[2],
    dateNext: row[3],
    statut: row[4],
  })).filter(row => row.numero); // ignorer les lignes vides
}

// 🔎 Cherche les lignes avec un numéro donné
async function getRowsByNumber(numero) {
  const rows = await getRowsWithIndex();
  return rows.filter(r => r.numero === numero);
}

// ➕ Ajouter une nouvelle ligne
async function addRow(row) {
  const sheets = await getSheet();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
}

// 🔄 Mettre à jour une ligne existante
async function updateRow(index, newRow) {
  const sheets = await getSheet();
  const targetRange = `Feuille1!A${index}:E${index}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: targetRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newRow],
    },
  });
}

module.exports = {
  getRowsByNumber,
  addRow,
  updateRow,
  getRowsWithIndex,
};
