import nox

nox.options.reuse_existing_virtualenvs = True
# ponytail: uv when available, plain venv otherwise (e.g. CI without uv)
nox.options.default_venv_backend = "uv|virtualenv"


@nox.session
def docs(session):
    """Build the site with MyST."""
    session.install("mystmd")
    session.run("myst", "build", "--html")


@nox.session(name="docs-live")
def docs_live(session):
    """Serve the site locally with live reload."""
    session.install("mystmd")
    session.run("myst", "start")
