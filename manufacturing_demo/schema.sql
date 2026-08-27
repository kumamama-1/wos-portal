-- 案件テーブル：製造案件の基本情報と現在の工程を保持する
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    delivery_date TEXT NOT NULL,
    notes TEXT,
    current_stage INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_updated_by TEXT
);

-- 通知テーブル：工程が進んだ際のお知らせを保持する
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);

-- 操作履歴テーブル：誰がいつ何をしたかを保持する
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id)
);
