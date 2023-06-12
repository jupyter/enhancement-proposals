author = "Project Jupyter"
copyright = "2021"
exclude_patterns = ["_build", ".nox", ".github"]
extensions = [
    "myst_parser",
    "sphinx_copybutton",
    "sphinx_external_toc",
    "sphinx.ext.intersphinx",
    "sphinx_book_theme",
    "sphinxcontrib.mermaid",
]
html_baseurl = "https://jupyter.org/enhancement-proposals"
html_favicon = ""
html_logo = ""
html_sourcelink_suffix = ""
html_theme = "sphinx_book_theme"
html_theme_options = {
    "search_bar_text": "Search the docs...",
    "repository_url": "https://github.com/jupyter/enhancement-proposals",
    "repository_branch": "master",
    "home_page_in_toc": True,
    "use_repository_button": True,
    "use_edit_page_button": True,
    "use_issues_button": True,
}
html_title = "Jupyter Enhancement Proposals"

myst_enable_extensions = [
    "colon_fence",
    "linkify",
]
pygments_style = "sphinx"
