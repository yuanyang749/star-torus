import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually to avoid extra dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...vals] = trimmed.split('=');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  }
}

loadEnv();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error('❌ Error: OPENROUTER_API_KEY not found in environment or .env file');
  process.exit(1);
}

const ENDPOINT = 'https://openrouter.ai/api/alpha/decisions';
const MODEL = '~typesafe/jev-latest';

async function callJev(title, payload) {
  console.log(`\n======================================================`);
  console.log(`🚀 测试用例: ${title}`);
  console.log(`======================================================`);
  console.log(`📝 [Input State]:\n"${payload.state}"\n`);
  console.log(`❓ [Questions]:`, Object.keys(payload.questions).map(k => `[${payload.questions[k].type}] ${k}`).join(', '));

  const startTime = performance.now();
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/typesafe-ai',
        'X-Title': 'Jev Test Suite'
      },
      body: JSON.stringify({
        model: MODEL,
        ...payload
      })
    });

    const elapsed = (performance.now() - startTime).toFixed(0);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ HTTP Error ${res.status}: ${errText}`);
      return;
    }

    const data = await res.json();
    console.log(`\n⏱️  网络与推理总耗时: ${elapsed}ms`);
    console.log(`🏷️  模型版本: ${data.model} (Provider: ${data.provider || 'TypeSafe'})`);
    console.log(`💰 Token 消耗: 输入 ${data.usage?.input_tokens} | 输出 ${data.usage?.output_tokens} | 费用: $${data.usage?.cost?.toFixed(7) || 0}`);
    console.log(`\n🎯 [Jev 判断结果]:`);

    for (const [qid, ans] of Object.entries(data.answers || {})) {
      if (ans.type === 'noul') {
        const pct = (ans.noul * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(ans.noul * 10)) + '░'.repeat(10 - Math.round(ans.noul * 10));
        console.log(`  • [Noul: 是/否概率] ${qid}: ${ans.noul >= 0.5 ? '✅ YES' : '❌ NO'} (${pct}%) [${bar}]`);
      } else if (ans.type === 'choice') {
        const conf = ans.confidence != null ? `(置信度: ${(ans.confidence * 100).toFixed(1)}%)` : '';
        console.log(`  • [Choice: 分类选择] ${qid}: 👉 "${ans.choice}" ${conf}`);
        if (ans.probabilities) {
          console.log(`    概率分布:`, ans.probabilities);
        }
      } else if (ans.type === 'score') {
        const conf = ans.confidence != null ? `(置信度: ${(ans.confidence * 100).toFixed(1)}%)` : '';
        console.log(`  • [Score: 梯级评分] ${qid}: 得分 ${ans.score} / 各档概率:`, ans.probabilities, conf);
        if (ans.legend) {
          console.log(`    量规等级:`, ans.legend);
        }
      }
    }
  } catch (err) {
    console.error('❌ Request Exception:', err);
  }
}

async function runTests() {
  console.log(`\n🔥 TypeSafe Jev 模型测试 (via OpenRouter Alpha Decisions API) 🔥`);
  console.log(`🔗 Endpoint: ${ENDPOINT}`);
  console.log(`🤖 Model: ${MODEL}`);

  // 1. 中文用户工单紧急度与业务分类评判 (Noul + Choice + Score)
  await callJev('中文客户投诉与紧急度评估 (Noul + Choice + Score)', {
    state: '你们系统今天一直报错502，我们是付费企业客户，明天早上9点老板要看大盘数据汇报，现在必须马上解决！',
    questions: {
      is_urgent: {
        type: 'noul',
        instructions: 'Does this message express urgency that requires immediate intervention?',
        criteria: {
          true: 'Time-sensitive emergency or critical blocking issue',
          false: 'Routine question or low urgency'
        }
      },
      category: {
        type: 'choice',
        instructions: 'Which engineering/business domain should take this ticket?',
        criteria: {
          infrastructure: 'Service unavailable, 502/504 outages, server down',
          billing: 'Invoicing, subscription renewals, payments',
          feature_request: 'Requests for new capabilities or design changes'
        }
      },
      sentiment_severity: {
        type: 'score',
        instructions: 'How severe is the customer frustration level?',
        criteria: [
          'Calm and neutral inquiry',
          'Mildly annoyed but patient',
          'Highly frustrated and demanding immediate fix'
        ]
      }
    }
  });

  // 2. Agent 路由分流与函数决策 (Router Decision)
  await callJev('Agent 工具路由分流判断 (Choice)', {
    state: '用户指令：“请帮我查一下昨天北京到上海的高铁余票，并把结果存到我本地的桌面文件夹里”',
    questions: {
      primary_action: {
        type: 'choice',
        instructions: 'What is the FIRST required step to take for the user request?',
        criteria: {
          query_train_tickets: 'Query train ticket availability API for Beijing to Shanghai',
          write_local_file: 'Write content to local disk',
          ask_clarification: 'Ask user for missing information'
        }
      },
      needs_permission: {
        type: 'noul',
        instructions: 'Does this task involve writing files to the user local disk or sensitive OS operations?'
      }
    }
  });

  // 3. 英文代码审查/安全风控判断
  await callJev('代码合规与安全漏洞初筛 (Noul + Score)', {
    state: 'const query = "SELECT * FROM users WHERE username = \'" + req.body.username + "\' AND password = \'" + req.body.password + "\'"; db.query(query);',
    questions: {
      has_sql_injection: {
        type: 'noul',
        instructions: 'Does this code snippet contain a critical SQL Injection vulnerability?'
      },
      risk_rating: {
        type: 'score',
        instructions: 'Rate the security risk of deploying this snippet directly to production',
        criteria: [
          'Safe / No risk',
          'Minor code style concern',
          'High or Critical security vulnerability'
        ]
      }
    }
  });

  console.log(`\n======================================================`);
  console.log(`✅ 所有测试执行完毕！`);
  console.log(`======================================================\n`);
}

runTests();
