import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

let apiKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [k, ...v] = trimmed.split('=');
  const key = k.trim();
  const val = v.join('=').trim();
  if (key === 'Jev_API_KEY') {
    apiKey = val;
  }
}

console.log('🔍 Extracted Jev_API_KEY format:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 8));
console.log('📡 Testing TypeSafe AI Official Endpoint: https://api.typesafe.ai/v1/systemone ...\n');

async function testOfficialJev() {
  const payload = {
    state: "Help! My payouts have been failing for 3 days.",
    model: "jev-latest",
    questions: {
      is_urgent: {
        type: "noul",
        instructions: "Does this convey urgency?",
        criteria: {
          true: "Explicitly time-sensitive or urgent issue",
          false: "Routine or non-urgent request"
        }
      },
      category: {
        type: "choice",
        instructions: "Which business department should handle this ticket?",
        criteria: {
          billing: "Payments, payouts, refunds, invoices",
          tech_support: "API issues, system bugs, downtimes",
          sales: "Contract negotiation, pricing inquiries"
        }
      },
      user_frustration: {
        type: "score",
        instructions: "Rate the customer frustration level based on the message.",
        criteria: [
          "Calm and relaxed",
          "Mildly annoyed or impatient",
          "Extremely frustrated or angry"
        ]
      }
    }
  };

  try {
    const startTime = performance.now();
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const elapsed = Math.round(performance.now() - startTime);
    console.log(`HTTP Status: ${res.status} ${res.statusText} (${elapsed}ms)`);

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (res.ok) {
      console.log('\n✅ 官方 API Key 验证成功！返回数据:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ 官方 API 请求失败:');
      console.log(data);
    }
  } catch (err) {
    console.error('❌ Network / Request Error:', err);
  }
}

testOfficialJev();
