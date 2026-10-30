# Проверяет целостность закреплённого исследовательского корпуса.
import hashlib
import json
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET

base = Path(__file__).resolve().parent
manifest = json.loads((base / "manifest.json").read_text())
entries = manifest["entries"]
assert len(entries) == 25
assert sum(entry["bytes"] for entry in entries) <= 15_000_000
for entry in entries:
    path = base / entry["local_path"]
    data = path.read_bytes()
    assert len(data) == entry["bytes"] <= 2_000_000
    assert hashlib.sha256(data).hexdigest() == entry["sha256"]
    assert entry["commit"] in entry["raw_url"]
    if path.suffix != ".docx":
        assert data.startswith(b"%PDF-")
        continue
    with zipfile.ZipFile(path) as archive:
        items = archive.infolist()
        assert len(items) <= 256
        assert len({item.filename for item in items}) == len(items)
        assert sum(item.file_size for item in items) <= 20_000_000
        for item in items:
            assert not item.filename.startswith("/")
            assert ".." not in Path(item.filename).parts
            assert item.file_size <= 5_000_000
            if item.filename.endswith((".xml", ".rels")):
                payload = archive.read(item)
                assert b"<!DOCTYPE" not in payload.upper()
                assert b"<!ENTITY" not in payload.upper()
                ET.fromstring(payload)
print("PASS: 15 DOCX + 10 PDF; hashes, sizes, ZIP limits, XML parsing")
