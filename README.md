# FastAPI + MySQL CRUD sample

Qiita記事 [個人開発サービスを自宅サーバーでデプロイ（docker-compose＋cloudflare tunnel）](https://qiita.com/Omusubi0123/items/216968e23b13f35a90a1) に沿って、この FastAPI + MySQL API を Cloudflare Tunnel 経由で公開できる構成を用意しました。

## システム構成

- `backend` (FastAPI + SQLAlchemy) … `/todos` や `/members` を提供。Cloudflare Tunnel からのリクエストは nginx 経由で流入。
- `db` (MySQL 8.0) … `todos` データベースを永続化。`db-data` ボリュームで保持。
- `nginx` … HTTPS で届いたリクエストを `backend:8000` にプロキシし、アプリは HTTP だけを意識すれば OK。
- `cloudflared` … Cloudflare Tunnel と接続し、自宅ネットワークから外部 DNS (例: `members.example.com`) へ公開。
- `frontend` … `/members` のレスポンスを可視化する静的ビューア（GitHub Pages / Docker どちらでも公開可能）。

`docker-compose.yml` から 4 つのコンテナをまとめて起動します。`backend` は `./backend/app` をマウントしているため、コード変更も即時反映されます。  
`.env.example` を `.env` にコピーし、DB のユーザー／パスワードや `DATABASE_URL` を必要に応じて調整してから `docker compose up -d` を実行してください。

## 事前準備 (Qiita 記事と同じ手順)

1. Docker / Docker Compose が動く Ubuntu Server などを用意。
2. 独自ドメインを取得し、Cloudflare に登録。
3. Cloudflare CLI をインストールしてログイン。

```bash
# cloudflared CLI
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
sudo mv cloudflared /usr/local/bin/
sudo chmod +x /usr/local/bin/cloudflared

cloudflared tunnel login
cloudflared tunnel create <YOUR_TUNNEL_NAME>
```

`cloudflared tunnel create` を実行すると `~/.cloudflared/<tunnel_id>.json` が生成されるので、これを控えておきます。

## リポジトリの設定

1. `cloudflared/config.yml` を編集し、以下を自身の値へ書き換えます。

   - `tunnel`: 上記で作成された `tunnel_id`
   - `credentials-file`: `/etc/cloudflared/<tunnel_id>.json`
   - `ingress[0].hostname`: 公開したいサブドメイン (例: `members.example.com`)

2. `~/.cloudflared/<tunnel_id>.json` を `cloudflared/` ディレクトリへコピーします。`.gitignore` ではこの JSON を除外しているためリポジトリには含まれません。

```bash
cp ~/.cloudflared/<tunnel_id>.json cloudflared/
chmod 644 cloudflared/config.yml cloudflared/<tunnel_id>.json
```

3. Cloudflare の DNS ページでサブドメイン名をトンネルに紐づけます。

```bash
cloudflared tunnel route dns "<tunnel_id>" "<subdomain>"
```

## デプロイ

```bash
docker compose build --no-cache
docker compose up -d
```

- `backend`: `http://localhost:8000/docs` から直接確認できます。
- `nginx`: `http://localhost:8080/health` で Cloudflare を経由せず疎通確認ができます。
- `cloudflared`: Cloudflare ダッシュボードでトンネル状態を「Active」にし、`https://<hostname>/members` へアクセスすると名前がランダムに返ります。
- `frontend` (任意): `docker compose up -d frontend` でローカルにビューアを立ち上げ、`http://localhost:4173` から `/members` を叩く UI を確認できます。

停止は `docker compose down`。MySQL のデータは `db-data` ボリュームに保持されます。

## API 操作例

```bash
# メンバーをランダム表示
curl http://localhost:8000/members

# TODO 登録
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "初期タスク", "description": "Qiitaデモ"}'

# TODO 一覧
curl http://localhost:8000/todos
```

## `/members` ビューア（TypeScript + Vite + Docker）

`frontend/` 以下は Vite + TypeScript で実装したシングルページアプリです。`npm run build` を実行すると `frontend/viewer/`（もしくは `VITE_BUILD_OUTDIR` で与えたパス）に静的ファイルが吐かれ、Docker イメージからそのまま配信できます。

1. 依存関係をセットアップ（ルート直下の `.env` で `VITE_DEFAULT_API_BASE` を設定しておけば OK）  
   ```bash
   cd frontend
   npm install
   ```
2. ローカルプレビューは `npm run dev`。`http://localhost:5173` へアクセスすると `/members` を叩くフォームが表示されます。  
   `VITE_DEFAULT_API_BASE=https://members.example.com npm run dev` のように環境変数でデフォルト URL を上書きできます。
3. 本番ビルドは `npm run build`。Vite が `frontend/viewer/` に成果物を生成し、`frontend/Dockerfile`（Nginx 配信用）と docker compose の `frontend` サービスがこのディレクトリを取り込みます。`VITE_BUILD_OUTDIR` を指定すれば別ディレクトリにも切り替え可能です。

### Docker でフロントエンドを配信する

Node を入れたくない場合は `frontend/Dockerfile` や docker-compose の `frontend` サービスを使ってください。どちらもコンテナ内で `npm install` / `npm run build` を実行してから、Nginx が `VITE_BUILD_OUTDIR` の静的ファイルを返すだけの構成です。

```bash
# ルート直下にも .env を用意
cp .env.example .env

# 単体でビルド・起動する場合
docker build -t members-viewer -f frontend/Dockerfile .
docker run --rm -p 4173:80 members-viewer

# もしくは docker compose から
docker compose up -d frontend
# http://localhost:4173 から /members を叩ける
```

Dockerfile 内では `VITE_BUILD_OUTDIR=/app/frontend/viewer` を指定しているため、Vite の出力先を `docs` や `dist` に依存させず、常に同じパスから Nginx が配信します。ローカルで `npm run build` した際も `frontend/viewer/` に生成されるため、コンテナと同じディレクトリ構成で確認できます。

FastAPI 側では `CORSMiddleware` で `allow_origins=["*"]` を設定しているため、Docker コンテナや任意ドメインからのリクエストも許可されます。

### GitHub Pages でホスティングする

コンテナを本番構成で使う場合でも、GitHub Pages でビルド結果を公開したいときは `.github/workflows/frontend-pages.yml` を有効にしてください。`main` へ push すると以下の流れで `frontend/viewer/` を自動生成し、そのまま Pages へ反映します。

1. Actions で `VITE_DEFAULT_API_BASE` を必要に応じて Repository secret に登録（未設定なら `.env.example` の値が使われます）。
2. GitHub の Settings → Pages で「Build and deployment」を `GitHub Actions` に設定。
3. push または Actions タブから `Deploy viewer to Pages` を実行すると、`npm install` → `npm run build` → `frontend/viewer/` を Pages へ配信します。

Pages で公開されるファイルと Docker コンテナの配信物は同じ `viewer/` ディレクトリのため、どちらのルートでも同じ静的ファイルを利用できます。

## フォルダ構成

```
.
├── README.md
├── backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app
│       ├── __init__.py
│       ├── crud.py
│       ├── data.py
│       ├── database.py
│       ├── main.py
│       ├── models.py
│       └── schemas.py
├── cloudflared
│   ├── Dockerfile
│   ├── config.yml
│   └── <tunnel_id>.json  # 自分でコピー
├── docker-compose.yml
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── viewer             # `npm run build` で生成される静的ファイル（非追跡）
│   ├── src
│   │   ├── main.ts
│   │   └── style.css
│   ├── tsconfig.json
│   └── vite.config.ts
├── nginx.conf
└── qiita.html
```

`frontend/viewer/` はビルド成果物であり `.gitignore` 済みです（`VITE_BUILD_OUTDIR` を変えたい場合は適宜`.env`や `docker-compose.yml` の引数を更新してください）。

Qiita 記事と同じ構成をベースにしているため、Cloudflare Tunnel を使えば自宅サーバーから HTTPS で API を公開できます。必要に応じて `DATABASE_URL` や MySQL の環境変数を変更してください。
ルート直下の `.env` は `docker-compose.yml` と `frontend/`（Vite）の両方から自動で読み込まれます。デフォルト値のままでも動きますが、本番環境では各種パスワードや `VITE_DEFAULT_API_BASE` を変更してから起動してください。`.env.example` のみコミットし、実ファイルは `.gitignore` で除外しています。
