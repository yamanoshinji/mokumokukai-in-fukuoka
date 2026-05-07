# eg_iams アーキテクチャ確認結果

## 結論

このリポジトリは **Maven マルチモジュール構成（Aggregator/Parent 構成）** です。

- 正規モジュール: `eg/eg-env`, `eg/eg-web`, `eg/eg-initdb`, `eg-domain`
- ルート直下の `eg-env`, `eg-web`, `eg-initdb` は実装本体ではなく、`.project` と `bin` が中心の補助ディレクトリ（IDE 由来の可能性が高い）

## 根拠

### 1. 親 POM のモジュール定義

`eg/pom.xml` で以下の modules が定義されています。

- `eg-env`
- `../eg-domain`
- `eg-web`
- `eg-initdb`

つまり、ビルド基準は `eg` 配下（+ `eg-domain`）です。

### 2. 子モジュールの親参照

例として `eg-domain/pom.xml` は次を親に参照しています。

- `<relativePath>../eg/pom.xml</relativePath>`

これにより、`eg/pom.xml` が親（Parent/Aggregator）であることが確認できます。

### 3. Git 管理対象の件数

追跡ファイル件数の確認結果:

- `top-eg-web = 0`
- `top-eg-env = 0`
- `top-eg-initdb = 0`
- `nested-eg-web = 481`
- `nested-eg-env = 204`
- `nested-eg-initdb = 35`

ルート直下の同名ディレクトリには管理対象ファイルがなく、`eg/` 配下に実体があることを示しています。

## これは何というアーキテクチャか

### ビルド/リポジトリ構成

- **Maven マルチモジュール構成**
- **Parent POM + Aggregator POM**

### アプリケーション構成（責務分割）

- `eg-web`: Web 層（WAR）
- `eg-domain`: ドメイン/業務ロジック層（JAR）
- `eg-env`: 環境設定・外部連携設定（JAR）
- `eg-initdb`: DB 初期化/DDL/初期データ

実体としては、レイヤ分割型のモノリシック構成です。

## 構成図（Mermaid）

```mermaid
flowchart TD
    %% 正規モジュール群
    subgraph Real ["✅ 正規のMaven構成（実体・ビルド対象）"]
        direction TB
        Parent{"eg/pom.xml\n(Parent & Aggregator)"}

        subgraph EG_Dir ["eg/ ディレクトリ配下"]
            Env["eg-env\n(環境設定 JAR)"]
            Web["eg-web\n(Web層 WAR)"]
            InitDB["eg-initdb\n(DB初期化)"]
        end

        Domain["eg-domain\n(ドメイン層 JAR)"]

        %% Aggregatorとしてのモジュール包含関係（点線）
        Parent -. "modules" .-> Env
        Parent -. "modules" .-> Web
        Parent -. "modules" .-> InitDB
        Parent -. "modules" .-> Domain

        %% アプリケーションの依存関係（太線）
        %% 修正箇所：ラベルを引用符で囲み、書き方を調整
        Web == "dependency" ==> Domain
        Web == "dependency" ==> Env
    end

    %% 不要と思われるディレクトリ群
    subgraph Dummy ["⚠️ ルート直下の同名ディレクトリ（ビルド非対象）"]
        direction TB
        X1[/"eg-env"/]
        X2[/"eg-web"/]
        X3[/"eg-initdb"/]

        Note>※ 正規モジュールとはリンクしていない。<br>IDE（Eclipse等）のワークスペース依存で<br>生成されたゴミディレクトリの可能性が高い。]

        X1 -.- Note
        X2 -.- Note
        X3 -.- Note
    end
```

## 補足

ルート直下の `eg-env` / `eg-web` / `eg-initdb` は、削除前に IDE 設定依存（Eclipse のワークスペース参照など）を確認してから整理するのが安全です。
