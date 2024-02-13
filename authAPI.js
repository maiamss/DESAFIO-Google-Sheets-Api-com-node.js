/*
    Esse documento configura e executa um app que chama uma API Google seguindo a Documentação da Google Sheets: 
    https://developers.google.com/sheets/api/quickstart/nodejs?hl=pt-br

*/ 

const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');


const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(process.cwd(), './token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './credentials.json');


async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type:"authorized_user",
    client_id:"355860523587-a74q5ge5rmokhv4nt6juajdh0kuruhfv.apps.googleusercontent.com",
    client_secret: "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",
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/*Load or request or authorization to call APIs.*/
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

module.exports = { authorize };