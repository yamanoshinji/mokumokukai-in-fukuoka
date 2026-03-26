# 第1回 進行台本

## 0. この回の位置づけ

**全体計画との関連性:**

- 全8回（最大12回）の第1回目スタート
- 勉強会の成功指標「3人が同じ作業を通じて小さくても動くエージェントを自力構築できる状態」に向けた0ステップ
- 形式：「毎回30分座学 + 90分ハンズオン、3人同期学習、完璧主義を避け動く最小実装優先」の実践第1回

## 1. この回のゴール

| 項目 | 内容 |
| --- | --- |
| **達成結果** | API接続済みの最小対話アプリ（CLIチャット）が動く |
| **学習テーマ** | LLM、プロンプト、エージェントの違い を実装で理解 |
| **共通理解** | 3人が「1ターン処理の入出力フロー」を同じレベルで理解 |
| **次回への土台** | 次回からのツール呼び出し・プロンプト改善に向けた基盤 |

## 2. 30分座学の話す内容（進行者向け台本）

### 00:05-00:10 テーマ提示と全体像

話すこと:

- 今日のテーマは「LLMアプリ」と「AIエージェント」の違いをつかむこと。
- 全8回のゴールは「小さくても動くエージェント」を自力で構築できる状態。
- その道のりの第1ステップは「土台：最小チャットが安定して動く」こと。
- 土台がないと、後のツール呼び出しやメモリ管理で原因不明なバグが発生しやすくなる。

板書キーワード:

```code
【LLMアプリ】
 入力 → LLM → 出力（真偽判定ではなく予測）

【AIエージェント】
 入力 → LLM → 出力
     ↓
 ツール呼び出し（外部システム動作）
     ↓
 状態管理（会話履歴・メモリ）
```

### 00:10-00:18 基本概念（何が違うのか、なぜか）

#### 進め方: 「既知」→ 「たとえ」→ 「違い」→ 「今日の位置づけ」の順

#### ステップ1: 「ChatGPT知ってる？」から始まる（1-2分）

話すこと:

```code
みなさん ChatGPT 使ったことあります？（挙手確認）
「何ですか？」と聞くと「私はAIアシスタントです」って返ってきますね。
あれが「LLMアプリ」です。つまり、ChatGPT = LLMアプリ。
```

板書: `ChatGPT = LLM + プロンプト + 入出力ループ`

---

#### ステップ2: 「LLMって何か」を日常例で説明（2分）

話すこと:

```code
LLMってのは、ぶっちゃけ「予測機」なんです。
たとえば、皆さんが「あ、こんにちは」と言い始めたとき、
自動変換が「こんにちは」って補完してくれることありますね。

LLMはそれと似てます。
「こんにちは。あなたは」って入力があると、
「『何ですか？』が次に来るだろう」と確率で判断して、
確率が高い順に単語をつなぎ合わせていく。

だから「正確な計算」はニガテなんです。
『2+2 は何か？』と聞いても、
「大体 4 っぽい」という「確率的な返答」が得意なだけ。
```

板書:

```code
【LLMの正体】
 入力 → 「次の単語は何が来そう？」確率計算 → そりゃ単語つなぎ
 （真偽判定ではなく「予測」）
```

---

#### ステップ3: 「だからこそ制御が必要」の話（2分）

話すこと:

```code
ここで問題が出ます。予測だから「揺らぎ」が生じる。

同じ質問 「2+2は？」を 3 回やると：
 1回目：「4です」
 2回目：「答は4」
 3回目：「4です。」

意味は同じだけど、言い方がバラバラ。
これが「再現性がない」という問題です。

本当のエージェントを作ろうとしたら、
この揺らぎがあると、後でバグの原因調査が大変になる。
だからまず「揺らぎを抑える」設定から始めるんです。
（温度パラメータを 0.2 に固定）
```

板書:

```code
【LLMの課題】
 同じ入力 → 毎回違う応答（予測だから）
 → 「どれが正解？」って判定できない
 → 最初は「再現性」重視で設定
```

---

#### ステップ4: 「LLMアプリ vs エージェント」の層構造（2-3分）

話すこと:

```code
では「LLMアプリ」と「エージェント」の違いを図で見てみましょう。

【LLMアプリ】（今日作るもの）
 ┌─────────────────┐
 │  ユーザー質問    │
 │ 「2+2は何か？」  │
 └────────┬────────┘
          ↓
 ┌──────────────────┐
 │ LLM に送信        │ ← ここで完結
 │ （Chatbot）       │
 └────────┬─────────┘
          ↓
 ┌──────────────────┐
 │ 応答を表示        │
 │「4 です」         │
 └──────────────────┘

【AIエージェント】（第3回以降で作るもの）
 ┌─────────────────┐
 │  ユーザー質問    │
 │「Fukuoka の      │
 │  人口は？」      │
 └────────┬────────┘
          ↓
 ┌──────────────────┐
 │ LLM が判断        │
 │「インターネット    │
 │  検索が必要」     │
 └────────┬─────────┘
          ↓
 ┌──────────────────┐
 │ ツール実行        │ ← ここが違う！
 │（Google検索など） │
 └────────┬─────────┘
          ↓
 ┌──────────────────┐
 │ LLM が結論        │
 │「Fukuoka の      │
 │ 人口は約 250万」  │
 └──────────────────┘
```

話すこと (図の後):

```code
違いは「外の世界とやりとりするかどうか」です。

LLMアプリ：自分の知識だけで返答
エージェント：必要に応じて「ツール」（計算機、検索、システム連携など）を呼ぶ

だから「エージェント」には：
 1. LLM（思考）
 2. ツール（行動）
 3. メモリ（会話履歴を記憶）
 4. ループ制御（「次はどうする？」を自動判定）

が必要になるんです。
```

---

#### ステップ5: 「今日の位置づけ」で締めくくる（1分）

話すこと:

```code
ですから、勉強会のロードマップはこう：

 第1回（今日）：LLMアプリ完成 ← 土台
                 ↓
 第2-3回：「プロンプト」と「ツール呼び出し」を加える
                 ↓
 第4-8回：メモリとループを完成させてエージェント化

つまり「今日のコード」は、あとでそのまま「エージェント」に育ちます。
これが「再現性とログを重視する」理由です。

今日のコードが後で「汚いコード」だと、
エージェント化する時にバグの原因調査が地獄になる。
だから「最小・クリーン・記録する」が基本姿勢なんです。
```

---

#### 初心者むけの強調ポイント（板書必須）

```code
✓「LLM」= 予測器（真偽判定機ではない）
✓「LLMアプリ」= LLM + 固定プロンプト + 質問-応答ループ
✓「エージェント」= LLMアプリ + ツール + メモリ + ループ制御
✓ 今日作るのは「LLMアプリ」
✓ でも「土台」として重要
```

### 00:18-00:25 失敗パターンと対策

話すこと:

- **失敗1：プロンプトを毎回変えて比較不能**
  - 問題：「さっきはよかったのに出力が変わった」が原因調査できない
  - 対策：**固定プロンプトから始める**。変更内容を記録して差分を見る
- **失敗2：ログを取らず原因不明**
  - 問題：「何が入ってきて何が出てったのか」が追える記録がない
  - 対策：**入力・プロンプト・応答・エラーを最低限ログ化**
- **失敗3：いきなり複雑化（RAGや複数ツール同時導入）**
  - 問題：動かない時に「どこが壊れているか」が特定できない
  - 対策：**1機能ずつ段階的に**。今日は「最小チャット」だけ

対策のルール（3つ）:

1. 同じ入力で同じ出力を目指す設定（温度低め）
2. 最低限のログで再現可能にする
3. 1ステップずつ確認しながら進める

### 00:25-00:30 今日の完成イメージ

話すこと:

- これから3人で作るのは「**CLI1問1答チャット**」。
- ユーザーが質問 → LLMが応答 → ターミナルに表示 → また質問できる
- 完成条件は3つ。（プラス1つの「理解」）

完成条件：

```code
✓ API疎通ができる（APIキーが正しく読み込まれ、リクエスト成功）
✓ 入力に対して応答が返る（1ターンが動く）
✓ エラー時に原因メッセージが出る（デバッグ可能）
✓ 3人全員が「1ターン処理の流れ」を説明できる（理解の同期）
```

## 3. 90分ハンズオン手順

---

### 手順1: プロジェクト初期化（10分）

**目的:** TypeScript + Node.js 開発環境を作り、「どのコードも同じ環境で動く」状態を確保する

**なぜやるか:**
プロジェクトの骨格（ディレクトリ構造、パッケージ管理、ビルド設定）を最初に揃えておかないと、
あとで「自分の環境では動くのに他のメンバーでは動かない」問題が起きる。
今日は3人で同じコードを動かすため、特に重要。

---

#### 操作1-1: 作業ディレクトリを作成してプロジェクト初期化

```bash
mkdir ai-chat-cli
cd ai-chat-cli
npm init -y
mkdir src
```

→ `package.json` が作成される。中身を確認（name, version が入っていればOK）

---

#### 操作1-2: TypeScript と必要パッケージをインストール

```bash
npm install @google/generative-ai dotenv
npm install --save-dev typescript ts-node @types/node
```

**各パッケージの役割:**

| パッケージ | 役割 |
| --- | --- |
| `@google/generative-ai` | Gemini API を呼び出す Google 公式 SDK |
| `dotenv` | `.env` ファイルから環境変数を読み込む |
| `typescript` | JavaScript に型安全性を追加 |
| `ts-node` | TypeScript を直接実行（コンパイル不要で開発できる） |
| `@types/node` | Node.js の型定義（fs, readline などの補完が効く） |

---

#### 操作1-3: TypeScript 設定ファイルを作成

`tsconfig.json` をプロジェクトルートに作成:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

#### 操作1-4: package.json の scripts を追加

`package.json` の `"scripts"` を以下に書き換え:

```json
"scripts": {
  "start": "ts-node src/index.ts",
  "build": "tsc"
}
```

---

#### 操作1-5: エントリーポイントを作成して動作確認

`src/index.ts` を作成:

```typescript
console.log('✓ プロジェクト起動確認');
```

```bash
npm start
```

→ `✓ プロジェクト起動確認` と表示されれば成功

---

**完了時のディレクトリ構造:**

```code
ai-chat-cli/
├── node_modules/
├── src/
│   └── index.ts      ← これから実装するメインファイル
├── package.json
├── package-lock.json
└── tsconfig.json
```

**完了チェック:**

- [ ] `npm start` を実行 → `✓ プロジェクト起動確認` が表示される
- [ ] `ls node_modules | grep openai` → `openai` が存在する
- [ ] `tsconfig.json` が存在し、`"strict": true` が入っている

**よくある詰まり:**

| 症状 | 原因 | 対策 |
| --- | --- | --- |
| `ts-node: command not found` | PATH未設定 | `npx ts-node src/index.ts` で実行 |
| `Cannot find module 'openai'` | インストール失敗 | `npm install openai` を再実行 |
| `tsconfig.json` のエラー | JSONのカンマ漏れ | カンマやブラケットをチェック |

---

### 手順2: 環境変数（APIキー）設定（10分）

**目的:** APIキーをコードに直書きせず、安全に管理する

**なぜやるか:**
APIキーをソースコードに直書きすると、GitHubに誤ってpushした瞬間に「キー漏洩」が発生する。
`.env` ファイルを使い、GitHubにコミットしない設計にする。
これは今日だけでなく、すべての開発プロジェクトで必須の基本である。

---

#### 操作2-1: Gemini APIキーを取得（完全無料）

1. ブラウザで **Google AI Studio** を開く: `https://aistudio.google.com/`
2. 右上「Get API key」→「Create API key」をクリック
3. プロジェクトを選択（なければ新規作成）→ APIキー文字列をコピー
   - キーの形式: `AIzaSy...`（39文字）
   - 無料枠: **1日1,500リクエスト、1分60回** まで無料（クレカ不要）

---

#### 操作2-2: `.env` ファイルを作成

プロジェクトルートに `.env` を作成（実際のキーを記入）:

```code
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
MODEL_NAME=gemini-2.5-flash
```

---

#### 操作2-3: `.gitignore` を作成してキーをGitから除外

```code
# .gitignore
.env
node_modules/
dist/
logs/
```

---

#### 操作2-4: `.env.example` を作成（チームで共有するテンプレート）

```code
# .env.example（実際のキーは書かない。GitHubにコミットしてOK）
GEMINI_API_KEY=AIzaSy-your-key-here
MODEL_NAME=gemini-2.5-flash
```

---

#### 操作2-5: `src/index.ts` を書き換えてキー読み込みを実装

```typescript
import dotenv from 'dotenv';
dotenv.config();  // ← 必ず最初の行で呼ぶ

// APIキー存在確認（起動時に即チェック）
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.MODEL_NAME ?? 'gemini-2.5-flash';

if (!apiKey) {
  console.error('❌ エラー: GEMINI_API_KEY が .env に設定されていません');
  console.error('  Google AI Studio (https://aistudio.google.com/) でキーを取得してください');
  process.exit(1);  // ← プロセスを終了（エラーコード1）
}

console.log('✓ APIキー読み込み成功');
console.log(`✓ 使用モデル: ${modelName}`);
```

---

**動作確認:**

```bash
npm start
# → ✓ APIキー読み込み成功
# → ✓ 使用モデル: gemini-2.5-flash

# わざとキーを消してみる（.env の GEMINI_API_KEY= の値を削除）
npm start
# → ❌ エラー: GEMINI_API_KEY が .env に設定されていません
```

---

**完了チェック:**

- [ ] `.env` にキーを設定した状態で `npm start` → 「✓ APIキー読み込み成功」
- [ ] `.env` のキー値を空にして `npm start` → 「❌ エラー」が出てプロセス終了
- [ ] `.gitignore` に `.env` が含まれている
- [ ] `.env.example` がリポジトリに存在する（実キーは書かれていない）

**よくある詰まり:**

| 症状 | 原因 | 対策 |
| --- | --- | --- |
| キーを設定したのに「❌ エラー」になる | `dotenv.config()` の呼び出し位置が間違っている | `import` 文の直後、他のコードより前に置く |
| `.env` が読まれない | ファイル名が `.env.txt` になっている | `ls -a` で確認 → `mv .env.txt .env` |
| キーが `undefined` になる | `.env` のキー名がコードと不一致 | コードの `process.env.GEMINI_API_KEY` とファイルのキー名を照合 |

---

### 手順3: 最小1ターン実装（20分）

**目的:** コードから実際にGemini APIを呼び出し、応答が返ることを確認する

**なぜやるか:**
CLIやログ機能を作る前に「APIが疎通する」を先に確認する。
疎通前にUIを作ると、「動かない理由がAPIか、UIか」の切り分けができなくなる。
「**1機能ずつ動作確認する**」原則の実践。

---

#### 操作3-1: `src/index.ts` を完全に書き換え

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

// 起動時チェック
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.MODEL_NAME ?? 'gemini-2.5-flash';

if (!apiKey) {
  console.error('❌ エラー: GEMINI_API_KEY が設定されていません');
  process.exit(1);
}

// Geminiクライアント初期化
const genAI = new GoogleGenerativeAI(apiKey);

// LLM呼び出し関数（温度を固定して再現性を確保）
async function callLLM(userMessage: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: 'あなたは丁寧な日本語で回答するアシスタントです。',
    generationConfig: {
      temperature: 0.2,   // 再現性重視（0=完全固定, 1=最大揺らぎ）
      maxOutputTokens: 300,
    },
  });

  // 応答テキストを取り出す
  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  if (!text) {
    throw new Error('LLMから空の応答が返されました');
  }
  return text;
}

// メイン処理（固定入力で1回テスト）
async function main() {
  console.log('✓ APIキー読み込み成功');
  console.log(`✓ 使用モデル: ${modelName}`);
  console.log('--- LLM疎通テスト開始 ---');

  const testMessage = 'こんにちは。あなたは何ができますか？';
  console.log(`送信: ${testMessage}`);

  try {
    const reply = await callLLM(testMessage);
    console.log(`応答: ${reply}`);
    console.log('--- 疎通テスト完了 ✓ ---');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ API呼び出し失敗: ${error.message}`);
    } else {
      console.error('❌ 不明なエラー:', error);
    }
    process.exit(1);
  }
}

main();
```

---

#### 操作3-2: 実行と応答確認

```bash
npm start
```

期待する出力例:

```code
✓ APIキー読み込み成功
✓ 使用モデル: gemini-2.5-flash
--- LLM疎通テスト開始 ---
送信: こんにちは。あなたは何ができますか？
応答: こんにちは！私はテキストの生成や質問への回答、文章の要約など...
--- 疎通テスト完了 ✓ ---
```

---

#### 操作3-3: 温度 0.2 の効果を体感する

同じコマンドを **3回** 実行して、応答を書き留める:

```bash
npm start   # 1回目
npm start   # 2回目
npm start   # 3回目
```

→ 意味は同じだが語尾や言い回しが微妙に異なることを確認
→ `temperature: 1.0` に変えて3回実行→応答の揺れが大きくなることを確認
→ 終わったら `temperature: 0.2` に戻す

---

**完了チェック:**

- [ ] `npm start` → LLMから日本語の応答が返ってくる
- [ ] 3回実行して「意味は同じ、言い回しは微妙に違う」が確認できた
- [ ] `temperature: 1.0` では揺れが大きいことが体感できた
- [ ] `temperature: 0.2` に戻してある

**よくある詰まり:**

| 症状 | 原因 | 対策 |
| --- | --- | --- |
| `400 Bad Request` | モデル名が間違っている | `.env` の `MODEL_NAME` を `gemini-2.5-flash` に修正 |
| `403 Forbidden` | APIキーが無効またはプロジェクト未設定 | Google AI Studio でキーを再確認 |
| `429 Too Many Requests` | レートリミット超過 | 少し待って再試行（無料枠は60 RPMまで） |
| 応答が空 | `result.response.text()` のパースエラー | `console.log(JSON.stringify(result.response, null, 2))` で生レスポンスを確認 |

---

### 手順4: CLI化（20分）

**目的:** 固定入力から「何でも入力できるCLI対話ループ」に拡張する

**なぜやるか:**
手順3は「決まった質問を1回送るだけ」だった。
実用的なチャットには「何でも入力できる → 返ってくる → また入力できる」のループが必要。
ここで初めて「人間とAIの対話」が成立する。

---

#### 操作4-1: `src/index.ts` を書き換え（CLIループを追加）

```typescript
import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as readline from 'readline';

// 起動時チェック
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.MODEL_NAME ?? 'gemini-2.5-flash';

if (!apiKey) {
  console.error('❌ エラー: GEMINI_API_KEY が設定されていません');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// LLM呼び出し関数（手順3から流用）
async function callLLM(userMessage: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: 'あなたは丁寧な日本語で回答するアシスタントです。',
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 300,
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  if (!text) throw new Error('LLMから空の応答が返されました');
  return text;
}

// readline でユーザー入力を受け取るヘルパー
function createPrompt(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// メイン: CLIループ
async function main() {
  console.log('✓ AI チャット CLI 起動');
  console.log(`✓ モデル: ${modelName}`);
  console.log('--- 会話を開始します（終了: exit） ---\n');

  const rl = createPrompt();

  while (true) {
    const userInput = await askQuestion(rl, 'you: ');

    // 空入力をスキップ
    if (userInput.trim() === '') {
      continue;
    }

    // 終了コマンド
    if (userInput.trim().toLowerCase() === 'exit') {
      console.log('\n👋 終了します');
      rl.close();
      break;
    }

    try {
      process.stdout.write('assistant: ');  // 改行なしで出力（応答が続く）
      const reply = await callLLM(userInput.trim());
      console.log(reply);
      console.log();  // 空行で見やすく
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\n❌ エラー: ${error.message}`);
        console.error('  もう一度試してください\n');
      }
    }
  }
}

main();
```

---

#### 操作4-2: 動作確認

```bash
npm start
```

実際に入力して確認する（3人で交互に入力してみる）:

```code
✓ AI チャット CLI 起動
✓ モデル: gemini-2.5-flash
--- 会話を開始します（終了: exit） ---

you: 今日の天気を教えて
assistant: 申し訳ありませんが、私はリアルタイムの天気情報にアクセスする...

you: TypeScript の型とは何ですか？
assistant: TypeScript の型とは、変数や関数の引数・戻り値に「どんなデータが...

you: exit
👋 終了します
```

---

**確認すること（会話しながら体感する）:**

1. 空白だけ入力してEnter → スキップされる（ループが続く）
2. 英語で質問しても日本語で返ってくる（system promptの効果）
3. `exit` で正常終了する
4. LLMが「知らない情報」（今日の天気など）を尋ねたとき、どう答えるか観察

---

**完了チェック:**

- [ ] `npm start` 後「you: 」プロンプトが表示される
- [ ] 3回以上のやり取りができた
- [ ] 空入力でもクラッシュしない
- [ ] `exit` でプロセスが正常終了した（エラーなし）
- [ ] LLMへのリクエスト失敗時にエラーメッセージが表示される（ネットを切って確認）

**よくある詰まり:**

| 症状 | 原因 | 対策 |
| --- | --- | --- |
| `you:` が表示されない | `rl.question` が動いていない | `createPrompt()` の戻り値を `rl` に代入しているか確認 |
| 入力後に応答が来ない | `await callLLM()` の `await` が漏れている | `callLLM` の呼び出しに `await` があるか確認 |
| `exit` でも終了しない | 比較文字列の問題 | `userInput.trim().toLowerCase()` になっているか確認 |
| 2回目以降が入力できない | `rl.close()` をループ内で呼んでいる | `break` の後に `rl.close()` を呼んでいるか確認 |

> **役割交代タイミング（目安: 01:20〜01:25）**
> 交代前に今のDriverが「今何をしたか、次は何をするか」を30秒で説明する

---

### 手順5: 最低限ログ機能（15分）

**目的:** 入力・応答・エラーの記録を自動化し、後から「何が起きたか」を追えるようにする

**なぜやるか:**
今後プロンプトを改善するとき、「以前の応答と今の応答の違い」を比較するためにログが必要。
またエラーが起きたとき、「何を送ったときに失敗したか」がわからないと原因調査ができない。
これは勉強会の成功指標「**なぜログが必要か**」を実装で体感するため。

---

#### 操作5-1: ログディレクトリと型定義を追加

`src/index.ts` の先頭（imports の下）に追加:

```typescript
import * as fs from 'fs';
import * as path from 'path';

// ログ用の型定義
interface LogEntry {
  timestamp: string;
  userInput: string;
  modelName: string;
  temperature: number;
  response?: string;
  status: 'success' | 'error';
  errorMessage?: string;
  durationMs?: number;
}
```

---

#### 操作5-2: ログ機能をまとめた定数と関数を追加

`src/index.ts`に追加

```typescript
const TEMPERATURE = 0.2;
const LOG_DIR = 'logs';

// ログディレクトリを初回だけ作成
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// セッション開始時のファイル名（実行ごとに1ファイル）
const sessionTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilePath = path.join(LOG_DIR, `session_${sessionTimestamp}.jsonl`);

// 1エントリをJSONLで追記
function writeLog(entry: LogEntry): void {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(logFilePath, line, 'utf-8');
}
```

---

#### 操作5-3: `callLLM` 関数にログを組み込む

`src/index.ts`に追加

```typescript
async function callLLM(userInput: string): Promise<string> {
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: 'あなたは丁寧な日本語で回答するアシスタントです。',
      generationConfig: {
        temperature: TEMPERATURE,
        maxOutputTokens: 300,
      },
    });

    const result = await model.generateContent(userInput);
    const text = result.response.text();
    if (!text) throw new Error('LLMから空の応答が返されました');

    // 成功ログ
    writeLog({
      timestamp: new Date().toISOString(),
      userInput,
      modelName,
      temperature: TEMPERATURE,
      response: text,
      status: 'success',
      durationMs: Date.now() - startTime,
    });

    return text;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // エラーログ
    writeLog({
      timestamp: new Date().toISOString(),
      userInput,
      modelName,
      temperature: TEMPERATURE,
      status: 'error',
      errorMessage,
      durationMs: Date.now() - startTime,
    });

    throw error;  // 呼び出し元にも伝播させる
  }
}
```

---

#### 操作5-4: 起動時にログファイルパスを表示

`main()` の先頭にログパス表示を追加:

```typescript
async function main() {
  console.log('✓ AI チャット CLI 起動');
  console.log(`✓ モデル: ${modelName}`);
  console.log(`✓ ログ: ${logFilePath}`);   // ← 追加
  console.log('--- 会話を開始します（終了: exit） ---\n');
  // ... 以下は変更なし
```

---

#### 操作5-5: 動作確認とログの目視確認

```bash
npm start
# 3回以上会話する
# exit で終了

# ログファイルを確認
cat logs/session_*.jsonl
```

期待する出力（各行がJSON）:

```json
{"timestamp":"2026-03-25T09:00:00.000Z","userInput":"TypeScriptって何？","modelName":"gemini-2.5-flash","temperature":0.2,"response":"TypeScriptは...","status":"success","durationMs":1234}
{"timestamp":"2026-03-25T09:00:05.000Z","userInput":"ありがとう","modelName":"gemini-2.5-flash","temperature":0.2,"response":"どういたしまして！","status":"success","durationMs":987}
```

---

**完了チェック:**

- [ ] `npm start` → ログファイルのパスが画面に表示される
- [ ] 3回以上会話した後 `exit` → `logs/` ディレクトリにファイルが作成されている
- [ ] ログファイルをエディタで開く → 各行がJSONで、`timestamp`・`userInput`・`response`・`durationMs` が入っている
- [ ] ネットを切って `npm start` → エラーが `status: "error"` でログに記録されている

**よくある詰まり:**

| 症状 | 原因 | 対策 |
| --- | --- | --- |
| `logs/` が作られない | `fs.mkdirSync` の呼び出し位置が関数内にある | モジュールのトップレベルで1回だけ呼ぶ |
| JSON が壊れている | `LogEntry` の値に `undefined` が混入 | `errorMessage?: string` のように省略可能（`?`）にする |
| `durationMs` が `0` | `startTime` の取得位置が間違っている | `const startTime = Date.now()` を API呼び出しの直前に置く |

---

## 4. 詰まりポイントと解決策

### パターン1: API認証エラー（403）

症状:

```code
Error: 403 Forbidden
または
[GoogleGenerativeAI Error]: API key not valid
```

原因と対策:

| 原因 | 対策 |
| --- | --- |
| APIキーが間違っている | `.env` 内の `GEMINI_API_KEY` 文字列を再確認（`AIzaSy...` で始まる） |
| キー読み込み順序がずれている | `dotenv.config()` が最初の行にあるか確認 |
| APIが有効化されていない | Google AI Studio で同じプロジェクトのキーか確認 |

最初の確認ステップ:

```typescript
console.log('APIキー:', process.env.GEMINI_API_KEY?.slice(0, 10) + '...');
console.log('使用モデル:', process.env.MODEL_NAME);
```

---

### パターン2: レスポンス取り出しエラー

症状:

```code
TypeError: result.response.text is not a function
または
Error: 応答が空
```

原因: `result.response.text()` の呼び出し方を誤解（関数として呼ぶ必要がある）

対策:

```typescript
// まず生レスポンスをダンプ
console.log('Raw Response:', JSON.stringify(result.response, null, 2));

// 正しい取り出し方（()で関数呼び出し）
const text = result.response.text();
console.log('Extracted text:', text);
```

---

### パターン3: 文字化け・改行崩れ

症状:

- ターミナル表示が見づらい
- 日本語が `???` になる

原因: 文字エンコーディング設定

対策:

```typescript
// stdoutを明示的にUTF-8に
console.log(response.replace(/\r\n/g, '\n').trim());

// Node.jsコマンドラインで指定
// node --input-type=module script.ts
```

---

### パターン4: 例外でプロセスが即座に終了

症状:

- エラーが出ると即座に落ちて、ログが見えない

原因: グローバルな例外ハンドリングなし

対策:

```typescript
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ キャッチされない非同期エラー:', reason);
  fs.appendFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'uncaught_rejection',
    error: String(reason)
  }) + '\n');
  process.exit(1);
});
```

---

## 5. 当日終了時の達成基準（ふりかえり時にチェック）

### 理解度チェック

[ ] 「1ターン処理の流れ」を図で説明できる
    （入力 → プロンプト組立 → LLM送信 → 応答 → ログ記録 → 出力）

[ ] 「なぜ温度を0.2に固定したか」理由を言える
    （再現性重視。値を変えると毎回応答が揺らぐ）

[ ] 「なぜログが必要か」を3つ言える
    （①原因調査、②改善前後と比較、③バージョン管理）

[ ] 「LLMアプリ」と「エージェント」の違いを図で説明できる
    （アプリ＝LLM + プロンプト、エージェント＝それ + ツール + 制御ループ）

### 実装スキルチェック

[ ] CLIの起動→「you: 」プロンプトが出る

[ ] 質問入力→LLM応答が返る→再度「you: 」プロンプト
    最低3回のやり取り成功

[ ] API認証エラーや回線エラー時に、わかりやすいメッセージが出る

[ ] ログファイルをテキストエディタで開く→
    入力・温度・モデル名・応答・タイムスタンプが記録されている

### 成果物

| 成果物 | 要件 |
| --- | --- |
| `src/index.ts` | CLI動作、ロジック300行以下 |
| `package.json` | スクリプト実行環境記述 |
| `.env.example` | キー構造を示すサンプル（実キーは含まない） |
| `log_*.jsonl` | 当日のやり取り記録（複数会話） |
| 全員の「理解メモ」 | 簡潔な個人ノート（実装後に手書き或いはテキスト化） |

---

## 6. 関連ドキュメント

- **全体計画**: aiagent_mokumoku.md（第2回以降のテーマ確認用）
- **SDK ドキュメント**: 使用LLM/SDK の公式ドキュメント
- **次回輪講資料**: aiagent_session02_runbook.md（プロンプト設計）
