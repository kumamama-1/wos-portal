"""SQLiteデータベースまわりの処理をまとめたモジュール。"""
import sqlite3
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "manufacturing.db"
SCHEMA_PATH = BASE_DIR / "schema.sql"

# 工程の並び順（インデックス0が工程1「注文受付」に対応する）
STAGES = ["注文受付", "部品在庫確認", "製造スケジュール", "シート製造", "品質検査", "出荷"]

# 簡易ユーザー一覧（社内で使う4名分）
USERS = ["ユーザーA", "ユーザーB", "ユーザーC", "ユーザーD"]

# 商品マスタの件数。実際の商品リストがある場合は _seed_products を差し替える
PRODUCT_COUNT = 500


def get_db():
    """新しいDBコネクションを取得する。"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_str():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def init_db():
    """テーブルを作成し、データが空であれば初期データを投入する。"""
    conn = get_db()
    with open(SCHEMA_PATH, encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()

    if conn.execute("SELECT COUNT(*) AS c FROM products").fetchone()["c"] == 0:
        _seed_products(conn)

    if conn.execute("SELECT COUNT(*) AS c FROM projects").fetchone()["c"] == 0:
        _seed_demo_data(conn)

    conn.close()


def _seed_products(conn):
    """商品マスタに商品を投入する。実際の商品名リストに差し替えて利用してください。"""
    for i in range(1, PRODUCT_COUNT + 1):
        conn.execute(
            "INSERT INTO products (product_code, product_name) VALUES (?, ?)",
            (f"SKU-{i:04d}", f"製品{i:04d}"),
        )
    conn.commit()


def _seed_demo_data(conn):
    """画面が空にならないよう、各工程にデモ案件を1件ずつ用意する。"""
    # (案件名, 注文番号, 顧客名, 担当者名, 電話番号, product_id, 数量, 納期, 備考, 現在工程)
    demo_projects = [
        ("案件A：夏フェス限定シート", "ORD-1001", "〇〇商事", "田中太郎", "03-1111-2222", 1, 100, "2026-09-10", "初回ロット", 1),
        ("案件B：屋外イベント用シート", "ORD-1002", "△△工業", "佐藤花子", "03-2222-3333", 2, 250, "2026-09-15", "", 2),
        ("案件C：定期発注分", "ORD-1003", "□□株式会社", "鈴木一郎", "03-3333-4444", 3, 500, "2026-09-20", "リピート案件", 3),
        ("案件D：新規顧客向けサンプル", "ORD-1004", "有限会社サンプル", "高橋次郎", "03-4444-5555", 4, 30, "2026-09-05", "サンプル品", 4),
        ("案件E：大型テント用シート", "ORD-1005", "テント商会", "伊藤三郎", "03-5555-6666", 5, 80, "2026-09-08", "", 5),
        ("案件F：出荷完了分", "ORD-1006", "既存顧客A", "渡辺四郎", "03-6666-7777", 6, 200, "2026-08-25", "納品済み", 6),
    ]

    ts = now_str()
    project_ids = []
    for (name, order_number, customer, contact_person, phone_number,
         product_id, qty, delivery, notes, stage) in demo_projects:
        cur = conn.execute(
            """
            INSERT INTO projects
                (project_name, order_number, customer_name, contact_person, phone_number,
                 product_id, quantity, delivery_date, notes,
                 current_stage, created_at, updated_at, last_updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (name, order_number, customer, contact_person, phone_number, product_id,
             qty, delivery, notes, stage, ts, ts, "ユーザーA"),
        )
        project_id = cur.lastrowid
        project_ids.append(project_id)

        conn.execute(
            "INSERT INTO history (project_id, user_name, action, created_at) VALUES (?, ?, ?, ?)",
            (project_id, "ユーザーA", f"案件を登録しました（{STAGES[0]}）", ts),
        )
        if stage > 1:
            conn.execute(
                "INSERT INTO history (project_id, user_name, action, created_at) VALUES (?, ?, ?, ?)",
                (project_id, "ユーザーA", f"デモ用に「{STAGES[stage - 1]}」まで工程を進めました", ts),
            )

    demo_notifications = [
        (project_ids[0], f"案件「{demo_projects[0][0]}」が登録されました（{STAGES[0]}）", 0),
        (project_ids[4], f"案件「{demo_projects[4][0]}」が{STAGES[4]}工程へ進みました", 0),
        (project_ids[5], f"案件「{demo_projects[5][0]}」が{STAGES[5]}工程へ進みました", 1),
    ]
    for project_id, message, is_read in demo_notifications:
        conn.execute(
            "INSERT INTO notifications (project_id, message, created_at, is_read) VALUES (?, ?, ?, ?)",
            (project_id, message, ts, is_read),
        )

    conn.commit()
