---
title: Add `$schema` to notebook format
authors: Jason Grout (@jasongrout), Angus Hollans (@agoose77),
Nicholas Bollweg (@bollwyvl), Filip Schouwenaars (@filipsch)
issue-number: xxx
pr-number: 97
date-started: 2023-03-01
---

# Summary
    
We propose to add a new top-level field, `$schema` to the notebook JSON, as such updating the notebook JSON schema. This new field deprecates `nbformat` and `nbformat_minor`.

# Motivation

Today, `nbformat` and `nbformat_minor` specify the JSON schema a notebook should adhere to (for example [4.5](https://github.com/jupyter/nbformat/blob/main/nbformat/v4/nbformat.v4.5.schema.json)). Since this approach was adopted in the Jupyter ecosystem, the JSON schema standard has evolved and Jupyter's approach is no longer in line with it. Other than following standards being the right thing to do, bringing the notebook format back in line with the current JSON Schema spec opens it up to the rich tooling that exists around JSON schema validation today.

# Guide-level explanation

The introduction of a new `$schema` top-level property takes precedence over the existing `"nbformat"` and `"nbformat_minor"` properties that specify the notebook format.

Example of notebook in 4.5 format:
    
```
{
    "nbformat": 4
    "nbformat_minor": 5
    "metadata": { ... }
    "cells": [ ... ]
}
```
    
Example of notebook in 4.6 format:
    
```
{
    "$schema": "https://jupyter.org/schema/notebook/4.6/notebook-4.6.schema.json"
    "nbformat": 4
    "nbformat_minor": 6
    "metadata": { ... }
    "cells": [ ... ]
}
``` 

It is REQUIRED that the top-level `$schema` be a canonical URI that refers to the Jupyter Notebook formats, i.e. `$schema` cannot be an arbitrary URI to a valid notebook schema, but instead must be useable as a token that uniquely identifies that schema, e.g.:

Valid `$schema` URI:

```json
{
    "$schema": "https://jupyter.org/schema/notebook/4.6/notebook-4.6.schema.json"
    ...
}
```

Invalid `$schema` URI:

```json
{
    "$schema": "https://jupyter.org/schema/../schema/notebook/4.6/notebook-4.6.schema.json"
    ...
}
```

# Reference-level explanation

JSON Schema changes:

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "description": "Jupyter Notebook v4.5 JSON schema.",
  "type": "object",
  "additionalProperties": false,
  "required": ["$schema", "nbformat", "nbformat_minor", metadata", "cells"], // CHANGED
  "properties": {
     "$schema": {
        "description": "JSON schema the notebook should adhere to",
        "type": "string"
      }
    "metadata": { <no changes > }
    "nbformat_minor": {
      "description": "Notebook format (minor number). Incremented for backward compatible changes to the notebook format.",
      "type": "integer",
      "minimum": 6,
      "deprecated": true   // CHANGED
    },
    "nbformat": {
      "description": "Notebook format (major number). Incremented between backwards incompatible changes to the notebook format.",
      "type": "integer",
      "minimum": 4,
      "maximum": 4
      "deprecated": true   // CHANGED
    },
    "cells": [ <no changes> ]
  },
  "definitions": { <no changes> }
}
```

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
