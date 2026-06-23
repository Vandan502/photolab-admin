const { google } = require("googleapis");
const fs = require("fs");

async function test() {
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
    console.log("SUCCESS:", token.token ? "got token" : "no token");
  } catch(e) {
    console.error("ERROR CAUSE:", e.response ? e.response.data : e.message);
  }
}
test();
