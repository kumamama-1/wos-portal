"""製造工程管理システム デモ機。

大学発表用のシンプルなFlaskアプリです。
機能を増やすことよりも「動いて仕組みが伝わること」を優先しています。
"""
from flask import Flask, g, redirect, render_template, request, session, url_for

from db import STAGES, USERS, get_db, init_db, now_str

app = Flask(__name__)
app.secret_key = "demo-secret-key-for-university-presentation"

init_db()


def get_current_user():
    """今どのユーザーとして操作しているかをセッションから取得する。"""
    return session.get("user_name", USERS[0])


@app.context_processor
def inject_globals():
    """全テンプレートで使う共通の変数。"""
    return {"USERS": USERS, "current_user": get_current_user()}


@app.route("/set_user", methods=["POST"])
def set_user():
    """画面上部のユーザー選択を切り替える。"""
    user_name = request.form.get("user_name")
    if user_name in USERS:
        session["user_name"] = user_name
    return redirect(request.referrer or url_for("dashboard"))


def stage_counts(conn):
    """工程ごとの案件数を {工程番号: 件数} の形で返す。"""
    counts = {i: 0 for i in range(1, len(STAGES) + 1)}
    rows = conn.execute(
        "SELECT current_stage, COUNT(*) AS c FROM projects GROUP BY current_stage"
    ).fetchall()
    for row in rows:
        counts[row["current_stage"]] = row["c"]
    return counts


@app.route("/")
def dashboard():
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) AS c FROM projects").fetchone()["c"]
    counts = stage_counts(conn)

    # 「製造中」は 部品在庫確認・製造スケジュール・シート製造 の3工程をまとめて表示する
    order_count = counts[1]
    manufacturing_count = counts[2] + counts[3] + counts[4]
    inspection_count = counts[5]
    shipped_count = counts[6]

    notifications = conn.execute(
        """
        SELECT n.*, p.project_name
        FROM notifications n
        JOIN projects p ON p.id = n.project_id
        ORDER BY n.created_at DESC, n.id DESC
        LIMIT 5
        """
    ).fetchall()
    conn.close()

    return render_template(
        "dashboard.html",
        total=total,
        order_count=order_count,
        manufacturing_count=manufacturing_count,
        inspection_count=inspection_count,
        shipped_count=shipped_count,
        counts=counts,
        stages=STAGES,
        notifications=notifications,
    )


@app.route("/projects")
def project_list():
    conn = get_db()
    projects = conn.execute("SELECT * FROM projects ORDER BY id DESC").fetchall()
    conn.close()
    return render_template("projects_list.html", projects=projects, stages=STAGES)


@app.route("/projects/new", methods=["GET", "POST"])
def project_new():
    if request.method == "POST":
        project_name = request.form["project_name"].strip()
        order_number = request.form["order_number"].strip()
        customer_name = request.form["customer_name"].strip()
        quantity = request.form["quantity"].strip()
        delivery_date = request.form["delivery_date"].strip()
        notes = request.form.get("notes", "").strip()

        conn = get_db()
        ts = now_str()
        user = get_current_user()

        cur = conn.execute(
            """
            INSERT INTO projects
                (project_name, order_number, customer_name, quantity, delivery_date, notes,
                 current_stage, created_at, updated_at, last_updated_by)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            """,
            (project_name, order_number, customer_name, quantity, delivery_date, notes, ts, ts, user),
        )
        project_id = cur.lastrowid

        conn.execute(
            "INSERT INTO history (project_id, user_name, action, created_at) VALUES (?, ?, ?, ?)",
            (project_id, user, f"案件を登録しました（{STAGES[0]}）", ts),
        )
        conn.execute(
            "INSERT INTO notifications (project_id, message, created_at, is_read) VALUES (?, ?, ?, ?)",
            (project_id, f"案件「{project_name}」が登録されました（{STAGES[0]}）", ts, 0),
        )
        conn.commit()
        conn.close()
        return redirect(url_for("project_detail", project_id=project_id))

    return render_template("project_form.html")


@app.route("/projects/<int:project_id>")
def project_detail(project_id):
    conn = get_db()
    project = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    history = conn.execute(
        "SELECT * FROM history WHERE project_id = ? ORDER BY created_at DESC, id DESC",
        (project_id,),
    ).fetchall()
    conn.close()
    return render_template("project_detail.html", project=project, stages=STAGES, history=history)


@app.route("/projects/<int:project_id>/advance", methods=["POST"])
def advance_stage(project_id):
    conn = get_db()
    project = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()

    if project and project["current_stage"] < len(STAGES):
        old_stage = project["current_stage"]
        new_stage = old_stage + 1
        ts = now_str()
        user = get_current_user()

        conn.execute(
            "UPDATE projects SET current_stage = ?, updated_at = ?, last_updated_by = ? WHERE id = ?",
            (new_stage, ts, user, project_id),
        )
        conn.execute(
            "INSERT INTO history (project_id, user_name, action, created_at) VALUES (?, ?, ?, ?)",
            (project_id, user, f"{STAGES[old_stage - 1]} → {STAGES[new_stage - 1]} に進めました", ts),
        )
        conn.execute(
            "INSERT INTO notifications (project_id, message, created_at, is_read) VALUES (?, ?, ?, ?)",
            (project_id, f"案件「{project['project_name']}」が{STAGES[new_stage - 1]}工程へ進みました", ts, 0),
        )
        conn.commit()

    conn.close()
    return redirect(url_for("project_detail", project_id=project_id))


@app.route("/notifications")
def notifications_page():
    conn = get_db()
    notifications = conn.execute(
        """
        SELECT n.*, p.project_name
        FROM notifications n
        JOIN projects p ON p.id = n.project_id
        ORDER BY n.created_at DESC, n.id DESC
        """
    ).fetchall()
    conn.execute("UPDATE notifications SET is_read = 1")
    conn.commit()
    conn.close()
    return render_template("notifications.html", notifications=notifications)


if __name__ == "__main__":
    # host="0.0.0.0" にすることで、同じWi-Fi内のスマートフォンからもアクセスできる
    app.run(host="0.0.0.0", port=5000, debug=True)
