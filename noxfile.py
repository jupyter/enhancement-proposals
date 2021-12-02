import nox

nox.options.reuse_existing_virtualenvs = True

build_command = ["-b", "html", ".", "_build/html"]

@nox.session
def docs(session):
    session.install("-r", "requirements.txt")
    session.run("sphinx-build", *build_command)

@nox.session(name="docs-live")
def docs_live(session):
    session.install("-r", "requirements.txt")
    session.install("sphinx-autobuild")

    AUTOBUILD_IGNORE = [
        "_build",
        "build_assets",
        "tmp",
    ]
    cmd = ["sphinx-autobuild"]
    for folder in AUTOBUILD_IGNORE:
        cmd.extend(["--ignore", f"*/{folder}/*"])
    cmd.extend(build_command)
    session.run(*cmd)
