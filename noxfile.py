import os
from pathlib import Path

import nox

nox.options.reuse_existing_virtualenvs = True
# ponytail: uv when available, plain venv otherwise (e.g. CI without uv)
nox.options.default_venv_backend = "uv|virtualenv"

# The old Sphinx site published pages at /{folder}/{file}.html
# MyST publishes at /{file}/ (and strips leading numbers).
# This re-writes the old-path logic to the new logic so old URLs redirect
REDIRECT = """<!doctype html><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url={url}">
<link rel="canonical" href="{url}">
<script>location.replace("{url}" + location.hash)</script>"""


def _write_redirects():
    # Same BASE_URL the myst build uses (set in CI; empty for local builds)
    base = os.environ.get("BASE_URL", "")
    out = Path("_build/html")
    for md in Path(".").glob("*/*.md"):
        if md.parts[0].startswith("."):
            continue
        stub = out / md.parent.name / f"{md.stem}.html"
        stub.parent.mkdir(parents=True, exist_ok=True)
        stub.write_text(REDIRECT.format(url=f"{base}/{md.stem}/"))
    # The old root page, still indexed by search engines
    (out / "README.html").write_text(REDIRECT.format(url=f"{base}/"))
    print("Finished writing redirect stubs for old JEP URLs...")


@nox.session
def docs(session):
    """Build the site with MyST."""
    session.install("mystmd")
    session.run("myst", "build", "--html")
    _write_redirects()


@nox.session(name="docs-live")
def docs_live(session):
    """Serve the site locally with live reload."""
    session.install("mystmd")
    session.run("myst", "start")
