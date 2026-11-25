"""Gabungkan src/app.html + src/parser.js menjadi satu file index.html.

Jalankan:  python build.py
"""
from pathlib import Path

root = Path(__file__).parent
app = (root / "src" / "app.html").read_text(encoding="utf-8")
parser = (root / "src" / "parser.js").read_text(encoding="utf-8")
parser = parser.replace(
    "if(typeof module!=='undefined')module.exports={parse,num,isHeader};", ""
)
assert "/*PARSER*/" in app, "Penanda /*PARSER*/ tidak ditemukan di src/app.html"
(root / "index.html").write_text(app.replace("/*PARSER*/", parser), encoding="utf-8")
print("index.html berhasil dibuat")
