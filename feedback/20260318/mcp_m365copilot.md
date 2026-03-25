# 🛠️ MCP（Model Context Protocol）初心者ガイド for M365Copilot

MCPは、AIと外部データ・ツールをつなぐ **「AI界の共通USB規格」** です。

---

## 1. 従来の接続 vs MCPによる接続

これまでは、Copilotに外部ツールをつなぐ際は、専用の複雑な設定が必要でした。MCPなら、規格に沿ったサーバーを用意するだけで接続できます。

```mermaid
graph TD
    subgraph After_MCP [MCP：共通規格による拡張]
        AI_Copilot(M365 Copilot) === |MCP規格| Hub{MCP Server}
        Hub --- Tool_A[社内SQL Database]
        Hub --- Tool_B[GitHub]
        Hub --- Tool_C[ローカルファイル/設計書]
    end

    subgraph Before_MCP [以前：個別の作り込み]
        AI1(M365 Copilot) <--> |Graph Connector| Tool1[社内Wiki]
        AI2(ChatGPT) <--> |独自プラグイン| Tool1
        AI3(Cursor) <--> |専用API| Tool2[GitHub]
    end
```

## 2. 三つの主要コンポーネント

Copilot（**Host**）が「指示を出し」、MCP（**MCP Client**）が「橋渡し」をし、外部ツール（**MCP Server**）が動く3層構造です。

```mermaid
sequenceDiagram
    actor User as 👤 ユーザー
    participant Host as 🏢 Host (M365 Copilot / Teams)
    participant Client as 🔌 MCP Client (Copilot内部)
    participant Server as ⚙️ MCP Server (外部ツール専用)

    %% 1. ユーザーの入力
    User->>Host: Copilotに指示<br/>「GitHubの最新Issueを確認して要約して」

    %% 2. AIの思考と判断
    Note over Host: Copilotが判断:<br/>「GitHubの情報が必要だ。<br/>'github' MCPサーバーを呼び出そう」

    %% 3. MCP呼び出しフロー
    Host->>Client: MCPツール実行リクエスト
    Client->>Server: 共通規格(JSON-RPC)でデータ要求
    Note right of Server: 実際のGitHub APIを叩く
    Server-->>Client: Issueのリスト（データ）を返却
    Client-->>Host: Copilotにデータを渡す

    %% 4. 最終回答
    Note over Host: Copilotがデータを元に<br/>WordやTeamsで回答を生成
    Host-->>User: 最終的な回答<br/>「現在、3件の重要Issueがあります...」
```

```mermaid
graph LR
    subgraph Host_App [Microsoft 365 エコシステム]
        AI_Brain["M365 Copilot<br/>(LLMエンジン)"]
        subgraph Internal_System [拡張基盤]
            Client_Code["<b>MCPクライアント</b><br/>標準プロトコル処理"]
        end
    end

    Server["MCPサーバー<br/>自社DB / GitHub / SaaSツール"]

    AI_Brain <--> Client_Code
    Client_Code <--> |JSON-RPC通信| Server
```

## 3. 構造のイメージ（ビジネスAIのUSB）

M365 CopilotにMCPを導入することで、企業のIT部門とユーザー双方にメリットがあります。

```mermaid
mindmap
  root((MCP for Copilot))
    IT部門のメリット
      個別開発コストの削減
      セキュアなデータ参照
      ベンダーロックインの防止
    ユーザーのメリット
      Excel/Wordから社内DBを直接操作
      最新の外部情報を取り込める
      回答の精度（コンテキスト）向上
    開発者のメリット
      一度作ればCopilot以外でも動く
      複雑な認証処理の共通化
```

## 4. M365 Copilot × MCP でできること

CopilotがOfficeアプリの枠を超えて、外部の「生データ」を直接扱えるようになります。

|カテゴリ|具体的なアクション（ユースケース）|
|---|---|
|開発連携|Teams上のCopilotからGitHubのプルリク内容を確認・レビュー|
|データ分析|Excelから社内のSQLサーバーへMCP経由でクエリを投げ、グラフ化|
|ドキュメント|ローカルPCにある膨大な過去資料(PDF)を読み込み、Wordで新提案書を作成|
|SaaS連携|SalesforceやZendeskの顧客情報をCopilotが直接参照して回答|
