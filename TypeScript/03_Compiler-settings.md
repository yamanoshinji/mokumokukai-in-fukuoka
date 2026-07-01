# TypeScript コンパイラ設定まとめ（`tsc` と `tsconfig.json`）

> 学習範囲：**コンパイラを使う方法** のうち、`--watch` / `--init` / `include`・`exclude`・`files` / `target` / `lib` / `allowJs`・`checkJs`・`jsx`・`declaration`・`declarationMap` / **SourceMap** まで。
> （`outDir`・`rootDir`・`strict` 系などはこの後の単元なので、末尾に名前だけメモ）

---

## 0. 前提：`tsc` の基本

TypeScript は **そのままでは実行できない**ので、`tsc`（TypeScript Compiler）で `.ts` → `.js` に変換（コンパイル / トランスパイル）してから実行する。

```bash
tsc index.ts        # index.ts をコンパイルして index.js を生成
node index.js       # 生成された JS を実行
```

ファイルを 1 つ指定すると、その JS が同じ場所に吐き出される。これが全ての基本。

---

## 1. watch モード（保存したら自動コンパイル）

毎回手で `tsc` を打つのは面倒なので、**監視モード**にすると保存のたびに自動で再コンパイルされる。

```bash
tsc index.ts --watch     # index.ts を監視
tsc index.ts -w          # -w は --watch の省略形
```

- ファイルを保存 → 即座に `.js` が更新される
- エラーがあればその場でターミナルに表示される
- 監視を止めるときは `Ctrl + C`

`tsconfig.json` があるプロジェクトでは、ファイル名を付けずに監視するとプロジェクト全体を監視できる（次項参照）。

```bash
tsc --watch              # tsconfig.json の対象ファイルすべてを監視
```

---

## 2. `tsc --init` と `tsconfig.json`

### `tsc --init` で設定ファイルを作る

```bash
tsc --init
```

これで `tsconfig.json` が生成される。中身は「有効なデフォルト + コメントアウトされた大量のオプション」になっていて、`//` を外していくことで設定を有効化していくスタイル。

> ※ `tsc --init` が生成する初期内容は TypeScript のバージョンで変わる。古い版は `target: es2016` ＋大量のコメント、新しい版（5.x 後半）はもっと簡潔でモダンな内容になっている。どちらにせよ「自分で開いて中身を調整する」のは同じ。

### `tsconfig.json` があると一括コンパイルできる

`tsconfig.json` を置くと、**ファイル名を指定せず** `tsc` を打つだけで対象ファイルをまとめてコンパイルできる。

```bash
tsc            # tsconfig.json の設定に従って全ファイルをコンパイル
tsc -w         # ＋監視モード
```

### ⚠️ よくある落とし穴：ファイル名を指定すると `tsconfig.json` が無視される

```bash
tsc index.ts   # ← この書き方だと tsconfig.json の設定は読まれない！
tsc            # ← tsconfig.json を使いたいならファイル名は付けない
```

`tsc ファイル名` はその場限りの単体コンパイル扱いになり、`tsconfig.json` の `target` や `strict` などの設定が一切効かない。設定を効かせたいときは**引数なしの `tsc`**（または `tsc -p tsconfig.json`）を使う。

---

## 3. `include` / `exclude` / `files`（コンパイル対象の選択）

`tsconfig.json` の中で「どのファイルをコンパイルするか」を制御する 3 つ。`compilerOptions` の**外側（トップレベル）**に書く点に注意。

```jsonc
{
  "compilerOptions": { /* ... */ },

  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"],
  "files": ["src/index.ts"]
}
```

### デフォルトの挙動（何も書かないとき）

| 設定 | 書かなかったときのデフォルト |
|------|------------------------------|
| `include` | `files` も `include` も無い場合、**tsconfig.json があるフォルダ以下すべて**の `.ts` / `.tsx` / `.d.ts`（`allowJs` 有効なら `.js`・`.jsx` も）が対象。実質 `["**/*"]` と同じ |
| `exclude` | `["node_modules", "bower_components", "jspm_packages"]` ＋ `outDir` を指定していればそれも自動で除外 |
| `files` | なし（未指定） |

つまり「`tsconfig.json` を置いただけ」でも `node_modules` は勝手に除外され、それ以外は全部コンパイル対象になる。

### それぞれの役割

- **`include`**：コンパイル対象に**含める**パターン（glob 可）。例 `["src/**/*"]`
- **`exclude`**：`include` の結果から**除外**するパターン。**`include` を絞り込むだけ**で、単独で「このファイルを禁止」する機能ではない（後述の注意）。
- **`files`**：個別ファイルを**1 つずつ明示列挙**する。glob は使えない。ファイル数が少ないとき向け。多いなら `include` を使う。

### glob（ワイルドカード）の書き方

| 記号 | 意味 |
|------|------|
| `*` | `/` 以外の 0 文字以上にマッチ（例：`*.ts`） |
| `?` | 任意の 1 文字にマッチ |
| `**/` | サブフォルダを**再帰的**にすべてたどる |

例：`"src/**/*"` = `src` 以下の全階層の全ファイル。

### ⚠️ `exclude` の注意点

`exclude` は「`include` が拾う対象を減らす」だけ。除外したファイルでも、**他のファイルから `import` されていると結局コンパイルされる**。`exclude` は「import 経路まで断つ」機能ではないことに注意。

### 優先順位のイメージ

`include` - `exclude` + `files`

`files` と `include` で「足し算」して対象を集め、`exclude` で「引き算」する。ただし `exclude` は `files` で明示したファイルには効かない（`include` の結果にだけ効く）。


---

## 4. `target`（出力する JavaScript のバージョン）

`compilerOptions.target` で、**どのバージョンの JavaScript に変換するか**を決める。古いブラウザ／環境向けなら低く、モダン環境なら高く設定する。

```jsonc
{ "compilerOptions": { "target": "ES2016" } }
```

### デフォルト

- **未指定だと `ES3`**（かなり古い）。普段は明示的に設定するのが基本。`ES6`（= `ES2015`）以上が無難。

### 指定できる主な値

`ES3` / `ES5` / `ES2015`(=`ES6`) / `ES2016` / `ES2017` / … / `ES2022` / … / `ESNext`

> `ESNext` は「その TypeScript が対応している最新版」を指す。バージョンによって意味が変わるのでアップグレード時は注意。

### `target` を下げると「構文」が変換される（ダウンレベル）

例：アロー関数は `target` が `ES5` 以下だと従来の `function` に書き換えられる。

```ts
// 元の TS
const f = () => this;
```
```js
// target: ES5 だと…
var _this = this;
var f = function () { return _this; };
```

他にも `let`/`const` → `var`、クラス → プロトタイプ、`async`/`await` → ステートマシンなど、低い target ほど変換量が増えて出力が大きく読みにくくなる。

### ⚠️ `target` は「構文」を変換するだけで「API」は補完（polyfill）しない

`target` が変換するのはあくまで**文法**。`Array.prototype.flat()` や `Promise` のような**ランタイム API そのものは追加してくれない**。古い環境で新しい API を使いたい場合は別途 polyfill が必要（型の話は次の `lib` で扱う）。

> 補足：`target` を変えると `module`（出力するモジュール形式）のデフォルトも連動する（target が ES3/ES5 → `CommonJS`、ES6 以上 → `ES6`）。

---

## 5. `lib`（TypeScript が用意している型定義の追加）

`lib` は、**組み込み API の型定義**（`Math`、`document`、`Promise`、`Map` など）として何を読み込むかを指定する。

```jsonc
{ "compilerOptions": { "target": "ES6", "lib": ["DOM", "ES2015", "DOM.Iterable"] } }
```

### デフォルト

- **`lib` 未指定だと `target` に応じて自動で決まる**（最低でも `DOM` を含み、target に対応した分が足される）。
- そのため `target` を上げると、使える型（新しい API の型）も自動的に増える。

### 使いどころ

- **target は低いまま、新しい API の型だけ欲しい**：例えば `target: ES5` でも `lib` に `ES2015.Promise` を足せば `Promise` の型が使える（※型が増えるだけで、実行時の Promise 本体は別途必要）。
- **DOM を使う／使わない**：ブラウザのコードなら `DOM` が要る。Node.js だけで `document` を触らないなら `DOM` を外す構成もあり得る。
- 代表的な値：`DOM` / `DOM.Iterable` / `ES2015` / `ES2020` / `WebWorker` / `ScriptHost` など。

> 関係性のまとめ：**`target` = 出力する JS のバージョン（構文の変換）** ／ **`lib` = エディタ上で使える型の定義（文法ではなく型レベル）**。

---

## 6. `allowJs` / `checkJs` / `jsx` / `declaration` / `declarationMap`

すべて `compilerOptions` 内。**デフォルトはどれも `false`（`jsx` は未設定）**。

| オプション | デフォルト | 役割 |
|------------|-----------|------|
| `allowJs` | `false` | `.js` ファイルも**コンパイル対象に含める**。TS への段階的移行や、JS ファイルを取り込みたいときに使う |
| `checkJs` | `false` | `.js` ファイルにも**型チェック**をかけ、エラーを報告する。通常 `allowJs` とセット。ファイル単位なら `// @ts-check`（有効化）/ `// @ts-nocheck`（無効化）で個別制御も可能 |
| `jsx` | （未設定） | `.tsx` 内の JSX をどう出力するか。値は `preserve`（JSX のまま `.jsx` 出力。Babel 等に任せる）/ `react`（`React.createElement` に変換）/ `react-jsx`（React 17+ の自動ランタイム。`React` の import 不要）/ `react-jsxdev`（開発用）/ `react-native` |
| `declaration` | `false` | 型定義ファイル `.d.ts` を出力する。**ライブラリを配布**して利用側に型を提供したいときに必須 |
| `declarationMap` | `false` | `.d.ts` 用のソースマップ `.d.ts.map` を出力。エディタの「定義へ移動」で `.d.ts` ではなく**元の `.ts`** に飛べるようになる |

```jsonc
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true
  }
}
```

---

## 7. `sourceMap`（ブラウザで TypeScript を直接デバッグ）★今回の到達点

ブラウザが実行するのは変換後の `.js` だが、`sourceMap` を有効にすると**元の `.ts` を見ながらデバッグ**できる。

```jsonc
{ "compilerOptions": { "sourceMap": true } }
```

### 仕組み

1. `sourceMap: true` でコンパイルすると `.js` と一緒に **`.js.map`** ファイルが生成される。
2. `.map` は「変換後 JS の各行」と「元の TS の各行」の**対応表**。
3. 生成された `.js` の末尾に `//# sourceMappingURL=index.js.map` というコメントが付き、ブラウザの DevTools がこれを見て `.map` を読み込む。

### 何が嬉しいか

- ブラウザの **DevTools → Sources** に、変換後の JS ではなく**元の `.ts` が表示**される。
- `.ts` のコードに**直接ブレークポイント**を置ける。
- デフォルトは `false`。デバッグしたいときに `true` にする（本番配信では含めない運用も多い）。

---

## 付録 A：ここまでで使える `tsconfig.json` のサンプル

```jsonc
{
  "compilerOptions": {
    "target": "ES2016",        // 出力する JS のバージョン
    "lib": ["DOM", "ES2016"],  // 使う型定義（未指定なら target から自動）

    "allowJs": true,           // .js もコンパイル対象に
    "checkJs": true,           // .js も型チェック
    "jsx": "react-jsx",        // .tsx の JSX 出力方式

    "declaration": true,       // .d.ts を出力
    "declarationMap": true,    // .d.ts.map を出力
    "sourceMap": true          // .js.map を出力（ブラウザで TS をデバッグ）
  },

  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

## 付録 B：`tsc` コマンド早見表

| やりたいこと | コマンド |
|--------------|----------|
| 単体コンパイル | `tsc index.ts` |
| 単体を監視 | `tsc index.ts -w` |
| 設定ファイル生成 | `tsc --init` |
| プロジェクト一括コンパイル（tsconfig 使用） | `tsc` |
| プロジェクトを監視 | `tsc -w` |
| 設定ファイルを明示指定 | `tsc -p tsconfig.json` |

> 最重要：**`tsconfig.json` を効かせたいときはファイル名を付けない。** `tsc index.ts` は設定を無視する。

## 付録 C：デフォルトまとめ（覚えておくと混乱しない）

- `target` 未指定 → **ES3**
- `lib` 未指定 → **target に連動**（最低 `DOM` ＋ target 相当）
- `exclude` 未指定 → **`node_modules` など＋ `outDir` を自動除外**
- `include` / `files` 両方なし → **tsconfig のフォルダ以下を全部**コンパイル対象
- `allowJs` / `checkJs` / `declaration` / `declarationMap` / `sourceMap` → すべて **`false`**

---

## 次に学ぶ予定（未学習・名前だけメモ）

- `outDir` / `rootDir` / `removeComments` / `noEmit`
- `noEmitOnError`（エラー時は出力しない）
- `noImplicitAny` / `strictNullChecks` などの **`strict`** 系
- 綺麗なコードを書くための設定
- `forceConsistentCasingInFileNames` / `isolatedModules` / `skipLibCheck` / `extends` / Projects
