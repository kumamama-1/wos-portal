# 製造工程管理システム（デモ機）

大学発表用の、製造工程をスマホから管理できるシンプルなFlaskアプリです。

## 必要なもの

- Python 3.9以上

## セットアップ

```bash
cd manufacturing_demo
python3 -m venv venv
source venv/bin/activate      # Windowsは venv\Scripts\activate
pip install -r requirements.txt
```

## 起動

```bash
python app.py
```

初回起動時に `manufacturing.db`（SQLite）が自動作成され、デモ用の案件6件・通知・履歴が投入されます。

- PCから: http://127.0.0.1:5000
- スマホから: PCと同じWi-Fiに接続したうえで `http://<PCのIPアドレス>:5000`
  - PCのIPアドレスは `ifconfig`（Mac/Linux）や `ipconfig`（Windows）で確認できます（例: 192.168.1.10）

デモデータをやり直したい場合は `manufacturing.db` を削除して再起動してください。

## ファイル構成

- `app.py` … Flaskのルーティング（画面表示・登録・工程を進める処理）
- `db.py` … SQLiteの初期化・デモデータ投入
- `schema.sql` … テーブル定義（projects / notifications / history）
- `templates/` … 画面のHTML（Jinja2テンプレート）
- `static/style.css` … スマホ向けのスタイル

## デモ手順（発表用）

1. トップ画面（ダッシュボード）で案件総数・工程別件数・最新通知を見せる
2. 「新規登録」から案件を1件登録 → 「注文受付」に追加されることを確認
3. 案件一覧から適当な案件を開き、「次の工程へ進む」を押す → 工程が進み、通知一覧に反映されることを見せる
4. 同じ案件で「次の工程へ進む」を繰り返し、注文受付→出荷まで進める様子を見せる
5. 画面上部のユーザー選択を切り替えて、案件詳細の「操作履歴」に別ユーザー名で記録されることを見せる
