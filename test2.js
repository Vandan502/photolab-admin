const { google } = require("googleapis");
const fs = require("fs");

async function testOffset(yearsOff) {
  // monkey patch Date.now
  const RealDateNow = Date.now;
  Date.now = () => RealDateNow() - (yearsOff * 365 * 24 * 60 * 60 * 1000);
  
  try {
    const rawEnv = fs.readFileSync(".env.local", "utf8");
    const match = rawEnv.match(/GOOGLE_DRIVE_CREDENTIALS='\s*(.*?)\s*'/);
    let creds = match ? match[1] : "";
    const credentials = JSON.parse(creds);
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log(`SUCCESS with offset -${yearsOff} years:`, token.token ? "got token" : "no token");
    Date.now = RealDateNow;
    return true;
  } catch(e) {
    console.error(`FAILED with offset -${yearsOff} years:`, e.response ? e.response.data.error_description : e.message);
    Date.now = RealDateNow;
    return false;
  }
}

async function run() {
  for (let i = 0; i <= 3; i++) {
    if (await testOffset(i)) break;
  }
}
run();
