---
title: Add `$schema` to notebook format
authors: Jason Grout (@jasongrout), Angus Hollands (@agoose77), Nicholas Bollweg (@bollwyvl), Filip Schouwenaars (@filipsch), Tony Fast (@tonyfast)
issue-number: xxx
pr-number: 97
date-started: 2023-03-01
---

# Summary
    
We propose to add a new top-level required property, `$schema` to the notebook JSON, as such updating the notebook JSON schema. This new property deprecates `nbformat` and `nbformat_minor`.

# Motivation

Today, `nbformat` and `nbformat_minor` specify the JSON schema a notebook should adhere to (for example [4.5](https://github.com/jupyter/nbformat/blob/main/nbformat/v4/nbformat.v4.5.schema.json)). Since this approach was adopted in the Jupyter ecosystem, the JSON schema standard has evolved and Jupyter's approach is no longer in line with it. Other than following standards being the right thing to do, bringing the notebook format back in line with the current JSON Schema spec opens it up to the rich tooling that exists around JSON schema validation today.

# Guide-level explanation

The new required `$schema` top-level property refers to a JSON Schema that validates the current notebook. During a deprecation period, `$schema` takes precedence over the existing `"nbformat"` and `"nbformat_minor"` properties that specify the notebook format. There will be a one-to-one mapping between `$schema` and the `(nbformat, nbformat_minor)` pair, which should follow a URI template, e.g.:
```json
{
  "$schema": "https://schema.jupyter.org/notebook/v{nbformat}.{nbformat_minor}/notebook.json",
  "nbformat": 4,
  "nbformat_minor": 6
}

```
After the deprecation period expires, a future JEP will remove these `nbformat` and `nbformat_minor` properties from the notebook schema. These properties are retained to permit legacy notebook consumers to read notebooks authored during this deprecation period.

The addition of the `$schema` property removes a level of indirection between the notebook and the schema against which it is invalidated. It also guarantees that the schema against which it is validated is invariant with respect to time; the schema URI should refer to an immutable document.


# Reference-level explanation

The following changes are made to the existing v4.5 schema:
```diff
--- /tmp/a.txt	2023-03-14 16:30:37.217298279 +0000
+++ /tmp/b.txt	2023-03-14 16:30:31.705287720 +0000
@@ -1,10 +1,15 @@
 {
-  "$schema": "http://json-schema.org/draft-04/schema#",
-  "description": "Jupyter Notebook v4.5 JSON schema.",
+  "$schema": "https://json-schema.org/draft/2020-12/schema",
+  "$id": "https://schema.jupyter.org/notebook/v{nbformat}.{nbformat_minor}/notebook.json",
+  "description": "Jupyter Notebook v4.6 JSON schema.",
   "type": "object",
   "additionalProperties": false,
-  "required": ["metadata", "nbformat_minor", "nbformat", "cells"],
+  "required": ["$schema", "metadata", "nbformat_minor", "nbformat", "cells"],
   "properties": {
+    "$schema": {
+        "type": "string",
+        "format": "uri"
+    },
     "metadata": {
       "description": "Notebook root-level metadata.",
       "type": "object",
@@ -78,14 +83,11 @@
     },
     "nbformat_minor": {
       "description": "Notebook format (minor number). Incremented for backward compatible changes to the notebook format.",
-      "type": "integer",
-      "minimum": 5
+      "const": 6
     },
     "nbformat": {
       "description": "Notebook format (major number). Incremented between backwards incompatible changes to the notebook format.",
-      "type": "integer",
-      "minimum": 4,
-      "maximum": 4
+      "const": 4
     },
     "cells": {
       "description": "Array of cells of the current notebook.",
```

<details>

<summary>Full JSON Schema</summary>

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://schema.jupyter.org/notebook/v{nbformat}.{nbformat_minor}/notebook.json",
  "description": "Jupyter Notebook v4.6 JSON schema.",
  "type": "object",
  "additionalProperties": false,
  "required": ["metadata", "nbformat_minor", "nbformat", "cells"],
  "properties": {
    "$schema": {
        "type": "string",
        "format": "uri"
    },
    "metadata": {
      "description": "Notebook root-level metadata.",
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "kernelspec": {
          "description": "Kernel information.",
          "type": "object",
          "required": ["name", "display_name"],
          "properties": {
            "name": {
              "description": "Name of the kernel specification.",
              "type": "string"
            },
            "display_name": {
              "description": "Name to display in UI.",
              "type": "string"
            }
          }
        },
        "language_info": {
          "description": "Kernel information.",
          "type": "object",
          "required": ["name"],
          "properties": {
            "name": {
              "description": "The programming language which this kernel runs.",
              "type": "string"
            },
            "codemirror_mode": {
              "description": "The codemirror mode to use for code in this language.",
              "oneOf": [{ "type": "string" }, { "type": "object" }]
            },
            "file_extension": {
              "description": "The file extension for files in this language.",
              "type": "string"
            },
            "mimetype": {
              "description": "The mimetype corresponding to files in this language.",
              "type": "string"
            },
            "pygments_lexer": {
              "description": "The pygments lexer to use for code in this language.",
              "type": "string"
            }
          }
        },
        "orig_nbformat": {
          "description": "Original notebook format (major number) before converting the notebook between versions. This should never be written to a file.",
          "type": "integer",
          "minimum": 1
        },
        "title": {
          "description": "The title of the notebook document",
          "type": "string"
        },
        "authors": {
          "description": "The author(s) of the notebook document",
          "type": "array",
          "item": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              }
            },
            "additionalProperties": true
          }
        }
      }
    },
    "nbformat_minor": {
      "description": "Notebook format (minor number). Incremented for backward compatible changes to the notebook format.",
      "const": 6
    },
    "nbformat": {
      "description": "Notebook format (major number). Incremented between backwards incompatible changes to the notebook format.",
      "const": 4
    },
    "cells": {
      "description": "Array of cells of the current notebook.",
      "type": "array",
      "items": { "$ref": "#/definitions/cell" }
    }
  },

  "definitions": {
    "cell_id": {
      "description": "A string field representing the identifier of this particular cell.",
      "type": "string",
      "pattern": "^[a-zA-Z0-9-_]+$",
      "minLength": 1,
      "maxLength": 64
    },

    "cell": {
      "type": "object",
      "oneOf": [
        { "$ref": "#/definitions/raw_cell" },
        { "$ref": "#/definitions/markdown_cell" },
        { "$ref": "#/definitions/code_cell" }
      ]
    },

    "raw_cell": {
      "description": "Notebook raw nbconvert cell.",
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "cell_type", "metadata", "source"],
      "properties": {
        "id": { "$ref": "#/definitions/cell_id" },
        "cell_type": {
          "description": "String identifying the type of cell.",
          "enum": ["raw"]
        },
        "metadata": {
          "description": "Cell-level metadata.",
          "type": "object",
          "additionalProperties": true,
          "properties": {
            "format": {
              "description": "Raw cell metadata format for nbconvert.",
              "type": "string"
            },
            "jupyter": {
              "description": "Official Jupyter Metadata for Raw Cells",
              "type": "object",
              "additionalProperties": true,
              "source_hidden": {
                "description": "Whether the source is hidden.",
                "type": "boolean"
              }
            },
            "name": { "$ref": "#/definitions/misc/metadata_name" },
            "tags": { "$ref": "#/definitions/misc/metadata_tags" }
          }
        },
        "attachments": { "$ref": "#/definitions/misc/attachments" },
        "source": { "$ref": "#/definitions/misc/source" }
      }
    },

    "markdown_cell": {
      "description": "Notebook markdown cell.",
      "type": "object",
      "additionalProperties": false,
      "required": ["id", "cell_type", "metadata", "source"],
      "properties": {
        "id": { "$ref": "#/definitions/cell_id" },
        "cell_type": {
          "description": "String identifying the type of cell.",
          "enum": ["markdown"]
        },
        "metadata": {
          "description": "Cell-level metadata.",
          "type": "object",
          "properties": {
            "name": { "$ref": "#/definitions/misc/metadata_name" },
            "tags": { "$ref": "#/definitions/misc/metadata_tags" },
            "jupyter": {
              "description": "Official Jupyter Metadata for Markdown Cells",
              "type": "object",
              "additionalProperties": true,
              "source_hidden": {
                "description": "Whether the source is hidden.",
                "type": "boolean"
              }
            }
          },
          "additionalProperties": true
        },
        "attachments": { "$ref": "#/definitions/misc/attachments" },
        "source": { "$ref": "#/definitions/misc/source" }
      }
    },

    "code_cell": {
      "description": "Notebook code cell.",
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "cell_type",
        "metadata",
        "source",
        "outputs",
        "execution_count"
      ],
      "properties": {
        "id": { "$ref": "#/definitions/cell_id" },
        "cell_type": {
          "description": "String identifying the type of cell.",
          "enum": ["code"]
        },
        "metadata": {
          "description": "Cell-level metadata.",
          "type": "object",
          "additionalProperties": true,
          "properties": {
            "jupyter": {
              "description": "Official Jupyter Metadata for Code Cells",
              "type": "object",
              "additionalProperties": true,
              "source_hidden": {
                "description": "Whether the source is hidden.",
                "type": "boolean"
              },
              "outputs_hidden": {
                "description": "Whether the outputs are hidden.",
                "type": "boolean"
              }
            },
            "execution": {
              "description": "Execution time for the code in the cell. This tracks time at which messages are received from iopub or shell channels",
              "type": "object",
              "properties": {
                "iopub.execute_input": {
                  "description": "header.date (in ISO 8601 format) of iopub channel's execute_input message. It indicates the time at which the kernel broadcasts an execute_input message to connected frontends",
                  "type": "string"
                },
                "iopub.status.busy": {
                  "description": "header.date (in ISO 8601 format) of iopub channel's kernel status message when the status is 'busy'",
                  "type": "string"
                },
                "shell.execute_reply": {
                  "description": "header.date (in ISO 8601 format) of the shell channel's execute_reply message. It indicates the time at which the execute_reply message was created",
                  "type": "string"
                },
                "iopub.status.idle": {
                  "description": "header.date (in ISO 8601 format) of iopub channel's kernel status message when the status is 'idle'. It indicates the time at which kernel finished processing the associated request",
                  "type": "string"
                }
              },
              "additionalProperties": true,
              "patternProperties": {
                "^.*$": {
                  "type": "string"
                }
              }
            },
            "collapsed": {
              "description": "Whether the cell's output is collapsed/expanded.",
              "type": "boolean"
            },
            "scrolled": {
              "description": "Whether the cell's output is scrolled, unscrolled, or autoscrolled.",
              "enum": [true, false, "auto"]
            },
            "name": { "$ref": "#/definitions/misc/metadata_name" },
            "tags": { "$ref": "#/definitions/misc/metadata_tags" }
          }
        },
        "source": { "$ref": "#/definitions/misc/source" },
        "outputs": {
          "description": "Execution, display, or stream outputs.",
          "type": "array",
          "items": { "$ref": "#/definitions/output" }
        },
        "execution_count": {
          "description": "The code cell's prompt number. Will be null if the cell has not been run.",
          "type": ["integer", "null"],
          "minimum": 0
        }
      }
    },

    "unrecognized_cell": {
      "description": "Unrecognized cell from a future minor-revision to the notebook format.",
      "type": "object",
      "additionalProperties": true,
      "required": ["cell_type", "metadata"],
      "properties": {
        "cell_type": {
          "description": "String identifying the type of cell.",
          "not": {
            "enum": ["markdown", "code", "raw"]
          }
        },
        "metadata": {
          "description": "Cell-level metadata.",
          "type": "object",
          "properties": {
            "name": { "$ref": "#/definitions/misc/metadata_name" },
            "tags": { "$ref": "#/definitions/misc/metadata_tags" }
          },
          "additionalProperties": true
        }
      }
    },

    "output": {
      "type": "object",
      "oneOf": [
        { "$ref": "#/definitions/execute_result" },
        { "$ref": "#/definitions/display_data" },
        { "$ref": "#/definitions/stream" },
        { "$ref": "#/definitions/error" }
      ]
    },

    "execute_result": {
      "description": "Result of executing a code cell.",
      "type": "object",
      "additionalProperties": false,
      "required": ["output_type", "data", "metadata", "execution_count"],
      "properties": {
        "output_type": {
          "description": "Type of cell output.",
          "enum": ["execute_result"]
        },
        "execution_count": {
          "description": "A result's prompt number.",
          "type": ["integer", "null"],
          "minimum": 0
        },
        "data": { "$ref": "#/definitions/misc/mimebundle" },
        "metadata": { "$ref": "#/definitions/misc/output_metadata" }
      }
    },

    "display_data": {
      "description": "Data displayed as a result of code cell execution.",
      "type": "object",
      "additionalProperties": false,
      "required": ["output_type", "data", "metadata"],
      "properties": {
        "output_type": {
          "description": "Type of cell output.",
          "enum": ["display_data"]
        },
        "data": { "$ref": "#/definitions/misc/mimebundle" },
        "metadata": { "$ref": "#/definitions/misc/output_metadata" }
      }
    },

    "stream": {
      "description": "Stream output from a code cell.",
      "type": "object",
      "additionalProperties": false,
      "required": ["output_type", "name", "text"],
      "properties": {
        "output_type": {
          "description": "Type of cell output.",
          "enum": ["stream"]
        },
        "name": {
          "description": "The name of the stream (stdout, stderr).",
          "type": "string"
        },
        "text": {
          "description": "The stream's text output, represented as an array of strings.",
          "$ref": "#/definitions/misc/multiline_string"
        }
      }
    },

    "error": {
      "description": "Output of an error that occurred during code cell execution.",
      "type": "object",
      "additionalProperties": false,
      "required": ["output_type", "ename", "evalue", "traceback"],
      "properties": {
        "output_type": {
          "description": "Type of cell output.",
          "enum": ["error"]
        },
        "ename": {
          "description": "The name of the error.",
          "type": "string"
        },
        "evalue": {
          "description": "The value, or message, of the error.",
          "type": "string"
        },
        "traceback": {
          "description": "The error's traceback, represented as an array of strings.",
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },

    "unrecognized_output": {
      "description": "Unrecognized output from a future minor-revision to the notebook format.",
      "type": "object",
      "additionalProperties": true,
      "required": ["output_type"],
      "properties": {
        "output_type": {
          "description": "Type of cell output.",
          "not": {
            "enum": ["execute_result", "display_data", "stream", "error"]
          }
        }
      }
    },

    "misc": {
      "metadata_name": {
        "description": "The cell's name. If present, must be a non-empty string. Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check.",
        "type": "string",
        "pattern": "^.+$"
      },
      "metadata_tags": {
        "description": "The cell's tags. Tags must be unique, and must not contain commas.",
        "type": "array",
        "uniqueItems": true,
        "items": {
          "type": "string",
          "pattern": "^[^,]+$"
        }
      },
      "attachments": {
        "description": "Media attachments (e.g. inline images), stored as mimebundle keyed by filename.",
        "type": "object",
        "patternProperties": {
          ".*": {
            "description": "The attachment's data stored as a mimebundle.",
            "$ref": "#/definitions/misc/mimebundle"
          }
        }
      },
      "source": {
        "description": "Contents of the cell, represented as an array of lines.",
        "$ref": "#/definitions/misc/multiline_string"
      },
      "execution_count": {
        "description": "The code cell's prompt number. Will be null if the cell has not been run.",
        "type": ["integer", "null"],
        "minimum": 0
      },
      "mimebundle": {
        "description": "A mime-type keyed dictionary of data",
        "type": "object",
        "additionalProperties": {
          "description": "mimetype output (e.g. text/plain), represented as either an array of strings or a string.",
          "$ref": "#/definitions/misc/multiline_string"
        },
        "patternProperties": {
          "^application/(.*\\+)?json$": {
            "description": "Mimetypes with JSON output, can be any type"
          }
        }
      },
      "output_metadata": {
        "description": "Cell output metadata.",
        "type": "object",
        "additionalProperties": true
      },
      "multiline_string": {
        "oneOf": [
          { "type": "string" },
          {
            "type": "array",
            "items": { "type": "string" }
          }
        ]
      }
    }
  }
}

```

</details>

It is REQUIRED that the top-level `$schema` be a canonical URI that refers to the Jupyter Notebook formats, i.e. `$schema` cannot be an arbitrary URI to a valid notebook schema, but instead must be useable as a token that uniquely identifies that schema, e.g.:

Valid `$schema` URI:

```json
{
    "$schema": "https://schema.jupyter.org/notebook/v{nbformat}.{nbformat_minor}/notebook.json"
    ...
}
```

Invalid `$schema` URI:

```json
{
    "$schema": "https://schema.jupyter.org/notebook/../notebook/v{nbformat}.{nbformat_minor}/notebook.json"
    ...
}
```

The schema identified by `$schema` MUST require that the `nbformat` and `nbformat_minor` properties are `const`. This ensures that there is a one-to-one mapping between schemas and nbformat versions published up-to the final nbformat version of the deprecation period.


# Rationale and alternatives

Not doing this will leave the Jupyter notebook format in a non-standard state.

# Prior art

[JSON Schema](https://json-schema.org/) is a widely adopted declarative language that annotates and validates documents, so it's the obvious candidate to adhere to.

# Unresolved questions

- Code to upgrade from and downgrade to 4.5 still needs to be written.
Some exploration has been done by Nick Bollweg in [this gist](https://gist.github.com/bollwyvl/a6e1ae13125f01ff04edf121e30a462a).
- We want to deprecate `nbformat` and `nbformat_minor` in favor of `$schema` but we also need to ensure old clients can still work with notebooks in this new schema, so `nbformat` and `nbformat_minor` are still required. What's the path here? Major version update?

# Future possibilities

This work paves the way for [``Add `extraSchemas` to notebook format`` JEP](https://hackmd.io/9QZ8YibfQHm9l1B6JPSQsg?both), which will be submitted as a separate JEP soon.
