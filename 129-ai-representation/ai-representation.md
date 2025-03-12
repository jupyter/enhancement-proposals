---
title: AI Representation Protocol for Jupyter
authors: Marc Udoff, Govinda Totla
issue-number: 128
pr-number: 129
date-started: 2025-02-07
---

# AI Representation Protocol for Jupyter

## Summary

This proposal introduces a standardized method, `_ai_repr_(self, **kwargs) -> Dict[str, Any]`, for objects in Jupyter environments to provide context-sensitive representations optimized for AI interactions. The protocol allows flexibility for multimodal or text-only representations and supports user-defined registries for objects lacking native implementations. Additionally, we propose a new messaging protocol for retrieving these representations, facilitating seamless integration into Jupyter AI tools.

## Motivation

Jupyter’s potential to deeply integrate AI is hindered by the lack of a standard mechanism for objects to provide rich, dynamic representations. Users interacting with AI tools should be able to reference variables and objects meaningfully within their notebooks, e.g., “Given `@myvar`, how do I add another row?” or “What’s the best way to do X with `@myvar`?” Existing mechanisms like `_repr_*` are insufficient due to performance concerns and their inability to adapt representations based on user preferences, model requirements, or contextual factors. This proposal addresses these gaps by:

1. Defining a flexible, extensible protocol for AI representations.
2. Enabling custom object representations via registries without requiring upstream changes.
3. Standardizing a messaging protocol for the frontend to retrieve representations.

Expected outcomes include enhanced AI-driven workflows, better support for multimodal interactions, and improved user experience in Jupyter-based AI applications.

While this JEP focuses on Jupyter, it's understood that others may choose to reuse this same function in any python
process. While that would be a good outcome for the community, it is not the goal of this repr to set standards in
Python in general.

## Guide-Level Explanation

### Introducing the `_ai_repr_` Protocol

The `_ai_repr_` method allows objects to define representations tailored for AI interactions. This method returns a dictionary (`Dict[str, Any]`), where keys are MIME types (e.g., `text/plain`, `image/png`) and values are the corresponding representations.

Example:

```python
class CustomChart:
    async def _ai_repr_(self, **kwargs):
        return {
            "text/plain": f"A chart titled {self.title} with series {self.series_names}",
            "image/png": await self.render_image()
        }
```

This allows flexibility:
- For text-only models, the `text/plain` key provides a concise description.
- For multimodal models, `image/png` can render the chart visually.

For specific extensions, they can define new mime-types that give the required data.

In practice, the kwargs should guides the `_ai_repr_` determine what to include in the mime bundle. For a text-only
model, we should not waste time generating the image.

Now I can talk with my mutli-modal LLM. For example, I may say (assuming my plugin substitutes @ for the value form `_ai_repr_`):
> Please generate a caption for @my_chart.

It should be assumed that callers may choose to inject type infromation about these objects as well, making it
even more powerful:
> In @my_tbl, can you help me turn the columns labeled with dates into accumulated monthly columns

In this case, `@my_tbl` would not only give the LLM data about its schema, but we'd know this is Pandas or Polars without
a user having to specify this.

It's possible that we'd want both an async and non-async version supported (or even just a sync version). If so, we can default one to the other:
```
class CustomChart:
    async def _ai_repr_(self, **kwargs):
        return _ai_repr_(**kwargs)
```

#### Using Registries for Unsupported Objects

To support objects that do not implement `_ai_repr_`, users can define custom representations in a registry:

```python
from ai_repr import formatter

def custom_repr(obj):
    return {"text/plain": f"Custom representation of {type(obj).__name__}"}

formatter.register(type(SomeExternalClass), custom_repr)

formatter(SomeExternalClass()) # returns custom_repr
formatter(CustomChart()) # returns _ai_repr_ as above
formatter(ObjectWithNoAIReprOrRegisteredFormatter()) # str(obj)
```

This allows users to make useful representations of all objects they care about now, and extend the mime type of
existing objects without needing to monkey patch anything. This layering is imporant for empowering users quickly in this
space, without forcing any project to adopt nor forcing any user to upgrade a library.

The registry should be free of any dependency to minimize conflicts.

Both the registry and repr on objects are intended to be fully backwards compatible.

### Messaging Protocol

A new message type, `ai_repr_request`, allows the frontend to retrieve representations dynamically. The content of a `ai_repr_request` message includes the following:

```json
{
    "type": "ai_repr_request",
    "content": {
        "object_name": "<str>",        # The name of the object whose representation is requested
        "kwargs": {                     # Optional context-specific parameters for representation customization
            "<key>": "<value>"
        }
    }
}
```
- **`object_name`**: (Required) The name of the variable or object in the kernel namespace for which the representation is being requested.
- **`kwargs`**: (Optional) Key-value pairs allowing customization of the representation (e.g., toggling multimodal outputs, adjusting verbosity).

The kernel returns a response containing the representation of the requested object. The response format is as follows:

```json
{
    "type": "ai_repr_reply",
    "content": {
        "data": {
            "text/plain": "<str>",        # Plain-text representation
            "image/png": "<base64>"      # Optional, other MIME types as needed
        },
        "metadata": {
            "<mime-type>": {              # Metadata associated with specific MIME types
                "<key>": "<value>"
            }
        },
        "transient": {
            "display_id": "<str>"        # Optional runtime-specific metadata
        }
    }
}
```
- **`data`**: A dictionary of MIME-typed representations for the object.
- **`metadata`**: A dictionary of metadata associated with the data, including global metadata and MIME-type-specific sub-dictionaries.
- **`transient`**: A dictionary of transient metadata, not intended to be persisted, such as a `display_id` for session-specific tracking.


##### Example

```python
msg = {
    "type": "ai_repr_request",
    "content": {
        "object_name": "myvar",
        "kwargs": {"multimodal": False}
    }
}
```

This allows for front end plugins enable the variable reference features (`@myvar`) noted above. Because it can pass kwargs,
it has fine-grained control over passsing relevant information to reprs.

### Reference-Level Explanation

#### Design Details

- **Method Signature**: `_ai_repr_(**kwargs) -> Dict[str, Any]`

  - Must return at least one MIME type.
  - Supports context-specific hints via `kwargs` (e.g., `multimodal`, `context_window`).

- **Registries**: Allow user-defined representations for unsupported objects via `ai_repr`.

  That is, in the kernel, we run `await ai_repr.formatter(myvar)` to get the representation.

- **Messaging Protocol**:

  - Define `ai_repr_request` as a new message type.
  - Ensure it supports asynchronous processing for slow operations (e.g., rendering images).

#### Interactions with Existing Features

- Builds on Jupyter’s existing `_repr_*` ecosystem but focuses on AI-specific needs.
- Compatible with existing kernel and frontend architectures.

### Rationale and Alternatives

#### Rationale

- Standardization ensures consistent, predictable behavior across libraries.
- Flexible MIME bundles cater to diverse AI model requirements.
- Registries accelerate adoption without waiting for upstream changes.

#### Alternatives

- **Extend `_repr_*` methods**: Lacks flexibility for passing model specific features (e.g., multimodal) and context-specific needs (e.g., using more/less of a context window).
- **Functional API only**: A single top-level function could work but limits extensibility and modularity.
- **Ignore standardization**: Risks fragmented, incompatible implementations.

### Prior Art

- **IPython’s `_repr_*` methods**: Provides the foundation but lacks AI-specific extensions.
- **Multimodal frameworks**: Other ecosystems (e.g., Hugging Face) emphasize context-aware representations.

### Future Possibilities

- Develop AI-specific registries for popular libraries (e.g., pandas, matplotlib) or make PRs to add this natively.

This proposal lays the groundwork for seamless AI integration in Jupyter, empowering users to derive greater insights and efficiencies from their notebooks.

# Unresolved questions

- Should we support both or one of async/sync `_ai_repr_()`?
- What are good recommended `kwargs` to pass in `ai_repr_request`?
- How should this relate to `repr_*`, if at all?
- What is the right default for objects without reprs/formatters defined? `str(obj)`, `None`, or `_repr_`?
- Should thread-safety be required so that this can be called via a comm?
- Can `ai_repr_request` be canceled?
