# Jupyter Layout Namespaces and Discovery

## Problem

The Notebook editing application provides a high-productivity content creation environment. When combined with appropriate layout mechanisms, it can fulfill the need to re-present notebook documents in alternative forms: live slideshows, dynamic dashboards, mobile apps, interactive posters, traditional papers, and so on.

Today, a handful of tools exist to create alternative notebook cell arrangements:

* [jupyter/nbconvert](https://github.com/jupyter/nbconvert) reads slideshow metadata from notebook documents and transforms them into RevealJS slideshows (among a variety of other static document formats)
* [damianavila/RISE](https://github.com/damianavila/RISE) reads/writes slideshow metadata in notebook documents and renders a RevealJS presentation within the Notebook tool
* [Anaconda-Platform/nbpresent](https://github.com/Anaconda-Platform/nbpresent) reads/writes slideshow metadata in notebook documents for presentation within the Notebook tool or for export as standalone presentations
* [jupyter-incubator/dashboards](https://github.com/jupyter-incubator/dashboards) reads/writes dashboard metadata in notebook documents for display within the Notebook tool or for deployment as standalone web applications

As Jupyter continues to improve support for Notebook extensions (e.g., through better installation mechanisms in v4.2, through a new plug-in architecture in Jupyter Lab), there is potential for layout tools to proliferate. It is important, therefore, to ensure the following:

1. Layout tools can write layout metadata to a notebook document without conflict.
2. Layout tools can discover the metadata from other tools in a consistent manner.
3. Layout tools can define metadata syntax and semantics best suited to their desired feature set.

This proposal addresses these near-term requirements, and only these requirements, in very light-weight fashion.

## Proposed Enhancement

1. Reserve the key/value pair `layouts: {}` in both the notebook- and cell-level `metadata` objects for persistence of layout metadata.
2. Require that a conforming layout authoring application store all of its metadata under the key/value pair `<app id>: {}` in either the notebook-level `metadata.layouts` object, cell-level `metadata.layouts` object(s), or both.
3. Require that a conforming application adopt a particular `<app id>`, preferably named after its published package (e.g., on PyPI, on npm) or its GitHub org and/or repo.
4. Recommend that developers of layout applications define and document their their metadata syntax and semantics on a public site as an initial step toward interoperability (e.g., https://github.com/jupyter-incubator/dashboards/wiki/Dashboard-Metadata-and-Rendering).

## Detailed Explanation

Consider two fictitious layout tools, one called `nbshow` and another named `nbdash` on GitHub. Both of these tools can persist arbitrary metadata in either the notebook- or cell-level metadata like so:

```
{
    "metadata": {
        "layouts": {
            "nbshow": {
                // metadata specified by nbshow documentation
            },
            "nbdash": {
                // metadata specified by nbdash documentation
            }
        }
    },
    "cells": [
        {
            "metadata": {
                "layouts": {
                    "nbshow": {
                        // metadata specified by nbshow documentation
                    },
                    "nbdash": {
                        // metadata specified by nbdash documentation
                    }
                }
            }
        }, 
        ...
    ]
}
```

No requirements are placed on the structure of the data under the `nbshow` and `nbdash` keys. Each tool is free to store whatever it needs to support its authoring and viewing experience within its fields. For instance, `nbshow` may store a list of named slide shows at the notebook level, each containing a linked list of slides, with each slide positioning cells referenced by a generated ID. `nbdash`, on the other hand, may store a list of named row/column grid layouts at the cell level.

### JSON Schema

This proposal can be expressed as the following additions to the existing [notebook format v4 schema](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json). Untouched portions of the schema are omitted.

```
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "description": "IPython Notebook v4.0 JSON schema plus layouts.",
    "properties": {
        "metadata": {
            "properties": {
                "layouts": {
                    "description": "Notebook-level layout information"
                    "type": "object",
                    "additionalProperties": true
                }
            }
        }
    },
    "definitions": {
        "raw_cell": {
            "properties": {
                "metadata": {
                    "properties": {
                        "layouts": {"$ref": "#definitions/misc/metadata_layouts"}
                    }
                }
            }
        },
        "markdown_cell": {
            "properties": {
                "metadata": {
                    "properties": {
                        "layouts": {"$ref": "#definitions/misc/metadata_layouts"}
                    }
                }
            }
        },
        "code_cell": {
            "properties": {
                "metadata": {
                    "properties": {
                        "layouts": {"$ref": "#definitions/misc/metadata_layouts"}
                    }
                }
            }
        },
        "misc": {
            "metadata_layouts": {
                "description": "Cell-level layout information",
                "type": "object",
                "additionalProperties": true
            }
        }
    }
}
```

### Intentionally Limited Scope

This proposal intentionally leaves the information stored under `layouts.<tool id>` unspecified and left to the developers of each tool to define and document. It does not state a common layout metadata schema and rendering process to be adopted by all tools for the following reasons:

1. Creating a specification broad enough to cover known layout use cases and flexible enough to cover hypothetical and as-of-yet-unidentified cases is difficult, especially with only the handful of layout authoring tools that exist serving as examples (and those solely focused on slideshows and dashboards).
1. The benefit of sharing metadata among tools built to address disparate layout use cases is unclear. It might, for example, allow for the development of a generic renderer capable of displaying any layout created by any conforming tool. But whether such an uber-renderer would be better than portable, single-purpose renderers provided by each tool is unknown.
1. The Notebook project is on a trajectory that encourages the development of an ecosystem of simple, modular extensions to the base user experience. Creating an official Jupyter specification for layout metadata may inadvertently stifle developer experimentation with alternative means of presenting notebooks. For instance, what about auditory representations for users with visual impairments be these physical or situational (e.g., mobile)?

## Pros and Cons

* Pro: Layout tool authors are free to define a metadata schema best suited to their desired feature set.
* Pro: Developers have some guidance about where to store layout metadata in a notebook document.
* Pro: Leaves open the possibility of further specification in the future as common patterns and best practices emerge (i.e., additional fields under `metadata.layouts` and/or `metadata.layouts.<tool id>`)
* Con: Existing layout tools will need to migrate to `metadata.layouts`.
* Con: Notebooks may become bloated with redundant layout information when read and modified by multiple layout tools (e.g., multiple cell IDs).
* Con: This proposal may be too simple for an enhancement proposal.

## Interested Contributors

@parente, @bollwyvl
