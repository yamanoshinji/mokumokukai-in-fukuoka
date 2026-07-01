// 01_Feedback の勉強会記録を Backlog の課題として投稿するスクリプト
// Markdown -> Backlog記法へ変換し、画像は添付ファイルとして紐付けます。
//
// 必要環境: Node.js 18 以上（fetch / FormData / Blob を使用）
//
// 使い方:
//   # APIキーを環境変数で渡す（コミット厳禁）
//   export BK_KEY="＜あなたのBacklog APIキー＞"     # PowerShell: $env:BK_KEY="..."
//
//   # 変換結果だけ確認（投稿しない）
//   node tools/backlog/post_backlog.js dry            # 全日付
//   node tools/backlog/post_backlog.js dry 20260415   # 指定日付
//
//   # 投稿する
//   node tools/backlog/post_backlog.js post 20260415  # 指定日付だけ
//   node tools/backlog/post_backlog.js post all       # 全日付
//
//   # 投稿と同時に 親課題ぶら下げ / 担当者 / ステータス を設定（任意）
//   PARENT_ID=157206233 ASSIGNEE_ID=1868462 STATUS_ID=419120 \
//     node tools/backlog/post_backlog.js post 20260415
//
// 主要IDは下部の CONFIG と README.md を参照。
const fs = require('fs');
const path = require('path');

// ---- CONFIG（環境変数で上書き可能。デフォルトは福岡支社Challenge★Log）----
const API_KEY = process.env.BK_KEY;
const SPACE = process.env.BK_SPACE || 'https://oec-fko.backlog.com';
const BASE = SPACE + '/api/v2';
const PROJECT_ID = Number(process.env.PROJECT_ID || 795464);     // CHALLENGE
const ISSUE_TYPE_ID = Number(process.env.ISSUE_TYPE_ID || 4257173); // その他の小ネタ
const PRIORITY_ID = Number(process.env.PRIORITY_ID || 3);        // 中
const PARENT_ID = process.env.PARENT_ID ? Number(process.env.PARENT_ID) : null;     // 例: 157206233 (もくもく会 CHALLENGE-65)
const ASSIGNEE_ID = process.env.ASSIGNEE_ID ? Number(process.env.ASSIGNEE_ID) : null; // 例: 1868462 (山野 真治)
const STATUS_ID = process.env.STATUS_ID ? Number(process.env.STATUS_ID) : null;     // 例: 419120 (チャレンジ中) / 4 (完了)
// 01_Feedback の場所（このスクリプトはリポジトリの tools/backlog/ にある前提）
const FEEDBACK_DIR = process.env.FEEDBACK_DIR || path.resolve(__dirname, '..', '..', '01_Feedback');

if (!API_KEY) { console.error('ERROR: 環境変数 BK_KEY が未設定です。'); process.exit(1); }

// ---- インライン変換（リンク / 画像 / 太字）----
function inline(text) {
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
    const fn = src.split(/[\\/]/).pop();
    const a = (alt || '').trim();
    return `（添付画像: ${fn}${a && a.toLowerCase() !== 'alt text' ? ' — ' + a : ''}）`;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) =>
    /^https?:\/\//i.test(url) ? `[[${label}:${url}]]` : `${label}（${url}）`);
  text = text.replace(/\*\*([^*]+)\*\*/g, "''$1''");
  return text;
}

// ---- Markdown -> Backlog記法 ----
function mdToBacklog(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^\s*```(.*)$/);
    if (fence) {
      const lang = fence[1].trim();
      out.push(lang ? `{code:${lang}}` : '{code}');
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { out.push(lines[i]); i++; }
      i++;
      out.push('{/code}');
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const tbl = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) { tbl.push(lines[i]); i++; }
      for (let r = 0; r < tbl.length; r++) {
        const raw = tbl[r].trim();
        const cells = raw.slice(1, raw.length - 1).split('|');
        if (cells.every(c => /^\s*:?-{2,}:?\s*$/.test(c))) continue; // 区切り行は除去
        const conv = cells.map(c => ' ' + inline(c.trim()) + ' ').join('|');
        out.push('|' + conv + '|' + (r === 0 ? 'h' : ''));
      }
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push('*'.repeat(h[1].length) + ' ' + inline(h[2].trim())); i++; continue; }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push('----'); i++; continue; }
    const b = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (b) { const lvl = Math.floor(b[1].replace(/\t/g, '  ').length / 2) + 1; out.push('-'.repeat(lvl) + ' ' + inline(b[2])); i++; continue; }
    const o = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (o) { const lvl = Math.floor(o[1].length / 2) + 1; out.push('+'.repeat(lvl) + ' ' + inline(o[2])); i++; continue; }
    out.push(inline(line));
    i++;
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function dateFromDir(d) { return `${d.slice(0, 4)}/${d.slice(4, 6)}/${d.slice(6, 8)}`; }

function buildDate(dir) {
  const full = path.join(FEEDBACK_DIR, dir);
  const files = fs.readdirSync(full);
  const mdMain = files.find(f => /^\d{8}\.md$/i.test(f)) || files.find(f => f.toLowerCase().endsWith('.md'));
  const mdSupp = files.filter(f => f.toLowerCase().endsWith('.md') && f !== mdMain);
  const images = files.filter(f => /\.(png|jpe?g|gif)$/i.test(f)).sort();
  const mainMd = fs.readFileSync(path.join(full, mdMain), 'utf8');
  let desc = mdToBacklog(mainMd);
  for (const s of mdSupp) {
    desc += `\n\n----\n** 補足資料: ${s}\n\n` + mdToBacklog(fs.readFileSync(path.join(full, s), 'utf8'));
  }
  if (images.length) {
    desc += `\n\n----\n** 添付画像\n` + images.map(im => `- ${im}`).join('\n');
  }
  const m = mainMd.match(/内容[：:]\s*(.+)/);
  const topic = m ? m[1].trim().replace(/^[\s　]+/, '').slice(0, 50) : '';
  const summary = `もくもく会 ${dateFromDir(dir)}` + (topic ? ` ${topic}` : '');
  return { dir, summary, description: desc, images: images.map(im => path.join(full, im)), mdMain };
}

async function uploadAttachment(filePath) {
  const fd = new FormData();
  fd.append('file', new Blob([fs.readFileSync(filePath)]), path.basename(filePath));
  const res = await fetch(`${BASE}/space/attachment?apiKey=${API_KEY}`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`attach ${path.basename(filePath)} failed: ${res.status} ${await res.text()}`);
  return (await res.json()).id;
}

async function createIssue({ summary, description, attachmentIds }) {
  const body = new URLSearchParams();
  body.append('projectId', PROJECT_ID);
  body.append('summary', summary);
  body.append('issueTypeId', ISSUE_TYPE_ID);
  body.append('priorityId', PRIORITY_ID);
  body.append('description', description);
  if (PARENT_ID) body.append('parentIssueId', PARENT_ID);
  if (ASSIGNEE_ID) body.append('assigneeId', ASSIGNEE_ID);
  for (const id of attachmentIds) body.append('attachmentId[]', id);
  const res = await fetch(`${BASE}/issues?apiKey=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
  });
  if (!res.ok) throw new Error(`create issue failed: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function updateStatus(issueKey, statusId) {
  const body = new URLSearchParams();
  body.append('statusId', statusId);
  const res = await fetch(`${BASE}/issues/${issueKey}?apiKey=${API_KEY}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body
  });
  if (!res.ok) throw new Error(`status update ${issueKey} failed: ${res.status} ${await res.text()}`);
}

const dirs = fs.readdirSync(FEEDBACK_DIR)
  .filter(d => /^\d{8}$/.test(d) && fs.statSync(path.join(FEEDBACK_DIR, d)).isDirectory())
  .sort();

(async () => {
  const mode = process.argv[2];
  const which = process.argv[3];
  if (mode === 'dry') {
    const target = which ? dirs.filter(d => d === which) : dirs;
    for (const d of target) {
      const b = buildDate(d);
      console.log('================================================================');
      console.log('DIR:', d, '| MAIN:', b.mdMain);
      console.log('SUMMARY:', b.summary);
      console.log('IMAGES :', b.images.map(p => path.basename(p)).join(', ') || '(none)');
      console.log('--- DESCRIPTION (backlog notation) ---');
      console.log(b.description);
      console.log('');
    }
    console.log(`\n[dry] ${target.length} date(s).`);
    return;
  }
  if (mode === 'post') {
    const target = which === 'all' ? dirs : dirs.filter(d => d === which);
    if (target.length === 0) { console.error('対象の日付が見つかりません:', which, '\n候補:', dirs.join(', ')); process.exit(1); }
    for (const d of target) {
      const b = buildDate(d);
      const ids = [];
      for (const img of b.images) ids.push(await uploadAttachment(img));
      const issue = await createIssue({ summary: b.summary, description: b.description, attachmentIds: ids });
      if (STATUS_ID) await updateStatus(issue.issueKey, STATUS_ID);
      const extra = [PARENT_ID && 'parent', ASSIGNEE_ID && 'assignee', STATUS_ID && 'status'].filter(Boolean).join('+');
      console.log(`OK ${d} -> ${issue.issueKey}  ${SPACE}/view/${issue.issueKey}  (attachments: ${ids.length}${extra ? ', ' + extra : ''})`);
      await new Promise(r => setTimeout(r, 400));
    }
    return;
  }
  console.error('usage: node tools/backlog/post_backlog.js dry [YYYYMMDD] | post <YYYYMMDD|all>');
  console.error('dates:', dirs.join(', '));
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
