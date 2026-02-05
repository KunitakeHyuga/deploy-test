"""Static data for lab members."""
from __future__ import annotations

from typing import Final, List

# Each entry includes the member's student ID, name, grade, and optional remark.
LAB_MEMBERS: Final[List[dict[str, str | None]]] = [
    # B3
    {"student_id": "23238007", "name": "朝隈 大耀", "grade": "B3", "remark": "知能"},
    {"student_id": "23238032", "name": "石松 優弥", "grade": "B3", "remark": "知能"},
    {"student_id": "23238069", "name": "楳木 優汰", "grade": "B3", "remark": "情報ネットワーク"},
    {"student_id": "23238144", "name": "日下部 渉", "grade": "B3", "remark": "DS"},
    {"student_id": "23238184", "name": "佐藤 圭太", "grade": "B3", "remark": "DS"},
    {"student_id": "23238196", "name": "重松 和弥", "grade": "B3", "remark": "知能"},
    {"student_id": "23238218", "name": "宗野 優輝", "grade": "B3", "remark": "知能"},
    {"student_id": "23238286", "name": "冨永 蒔人", "grade": "B3", "remark": "知能"},
    {"student_id": "23238418", "name": "三浦 慶人", "grade": "B3", "remark": "DS"},
    # B4
    {"student_id": "22238160", "name": "國武 飛冴", "grade": "B4", "remark": None},
    {"student_id": "22238318", "name": "野田 大希", "grade": "B4", "remark": None},
    {"student_id": "22238332", "name": "原内 海音", "grade": "B4", "remark": None},
    {"student_id": "22238345", "name": "平川 景悟", "grade": "B4", "remark": None},
    {"student_id": "22238362", "name": "藤田 和駿", "grade": "B4", "remark": None},
    {"student_id": "22238385", "name": "松尾 侑", "grade": "B4", "remark": None},
    {"student_id": "22238477", "name": "山根 雅也", "grade": "B4", "remark": None},
    {"student_id": "22238493", "name": "渡邊 咲良", "grade": "B4", "remark": None},
    {"student_id": "22238904", "name": "大塚 天斗", "grade": "B4", "remark": None},
    # M1
    {"student_id": "23726003", "name": "井上 魁斗", "grade": "M1", "remark": None},
    {"student_id": "23726010", "name": "岡 泰之", "grade": "M1", "remark": None},
    {"student_id": "23726031", "name": "光延 竜成", "grade": "M1", "remark": None},
    {"student_id": "24725004", "name": "森 公輝", "grade": "M1", "remark": "DS"},
    # M2
    {"student_id": "25726001", "name": "出雲 正浩", "grade": "M2", "remark": None},
    {"student_id": "25726002", "name": "伊藤 綾香", "grade": "M2", "remark": None},
    {"student_id": "25726006", "name": "大霜 聖那", "grade": "M2", "remark": None},
    {"student_id": "25726007", "name": "大津 皓盟", "grade": "M2", "remark": None},
    {"student_id": "25726010", "name": "小川 慶太", "grade": "M2", "remark": None},
    {"student_id": "25726013", "name": "栗屋 大夢", "grade": "M2", "remark": None},
    {"student_id": "25726025", "name": "藤井 幹太", "grade": "M2", "remark": None},
    {"student_id": "25726030", "name": "吉岡 秀悟", "grade": "M2", "remark": None},
]
