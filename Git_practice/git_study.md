# 🚀 Gitの「3つのmain」振り返りシート

Gitの仕組みは、**3つの場所にある『main』を同期させるゲーム**と考えると非常にシンプルです。

```mermaid
flowchart LR
    %% ノードの定義
    Remote[("☁️ リモートの main<br>(GitHub / みんなの正解)")]

    subgraph MyPC ["💻 自分のPC内"]
        direction TB
        %% PC内の配置を整理
        subgraph LocalArea ["作業エリア"]
            direction TB
            Work["📝 ワークツリー<br>(作業中のファイル)"]
            Stage["📦 ステージ / Index<br>(出荷準備エリア)"]
        end

        subgraph HistoryArea ["歴史・通信ログ"]
            direction TB
            Local[("🏠 ローカルの main<br>(コミット済みの歴史)")]
            Origin["💻 origin/main<br>(PC内の隠しコピー)"]
        end
    end

    %% ------------------------------
    %% つながりの定義（距離を確保するためにハイフンを増やす）
    %% ------------------------------

    %% 1. ローカル作業の流れ（左から右へ）
    Work -- "git add" --> Stage
    Stage -- "git commit" --> Local

    %% 2. リモートとの同期サイクル
    Remote -- "git fetch<br>(最新情報の取得)" ---> Origin
    Origin -- "git merge<br>(合体)" --> Local
    Local -- "git push<br>(送信)" ---> Remote

    %% 3. 特殊な連動（点線）
    %% push成功時の自動更新
    Remote -.->|"✅ push成功で<br>自動更新"| Origin

    %% pull（ショートカット）
    Remote -.->|"git pull<br>(fetch + merge)"| Local

    %% ------------------------------
    %% スタイリング
    %% ------------------------------
    style Remote fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Origin fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style Local fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style Stage fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px,stroke-dasharray: 5 5
    style Work fill:#fafafa,stroke:#9e9e9e,stroke-width:1px

    %% 枠線の透明化（好みで調整可）
    style LocalArea fill:none,stroke:none
    style HistoryArea fill:none,stroke:none
```

## 1. 各ブランチの役割
| 名称 | 所在 | 性格・役割 |
|---------|---------|-----------|
| **リモートの main**  | サーバー (GitHub等) | 「みんなの正解」。チーム全員が共有する最終的な履歴。|
| **origin/main** | 自分のPC内 (隠し) | 「リモートのコピー」。最後に通信した時のリモートの姿をメモしたもの。 |
| **ローカルの main**  | 自分のPC内 (表舞台) | 「自分の作業場」。今まさにコードを書き換え、コミットする場所。    |

## 2. コマンドによる「3つの場所」の変化
| 操作 | 何が起きるか |
|---|---|
| **git commit** | ローカルのmain だけが進む。（originとのズレが発生） |
| **git push** | ローカルの内容をリモートへ送信。成功すると、リモートとorigin/mainがローカルに追いつく。 |
| **git fetch** | リモートの最新情報を取得。origin/main だけが最新に更新される。（作業場は変わらない） |
| **git merge** | 更新された origin/main を ローカルのmain に合体させる。 |
| **git pull** | fetch ＋ merge を一気に行う。一気にリモートの最新がローカルまで届く。 |

## 3. 要点チェックリスト
- オフラインでも動く理由
    - 自分のPC内に origin/main というコピーを持っているから。
- pullとpushが「対」ではない理由
    - pull は「合体（マージ）」という複雑な工程を含むが、push は単なる「転送」だから。
- コンフリクトの正体
    - origin/main（外の世界）と ローカルmain（自分の世界）で、同じ場所を違う内容で書き換えてしまい、Gitが自動で合体できなくなった状態。
- 情報の鮮度
    - fetch か push をしない限り、手元の origin/main は古い情報のまま固定されている。