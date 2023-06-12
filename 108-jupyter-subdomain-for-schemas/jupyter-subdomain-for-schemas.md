---
title: subdomain and repository for publishing schemas under jupyter.org
authors: Zach Sailer, Nick Bollweg, Tony Fast
issue-number: "[#107](https://github.com/jupyter/enhancement-proposals/issues/107)"
pr-number: 108
date-started: 2023-04-24
---

# jupyter.org subdomain and repository for publishing schemas


## Summary

Create a subdomain under jupyter.org and a repository for publishing machine- and human-readable JSON Schemas provided by the core Jupyter ecosystem.

## Motivation

Jupyter defines various specifications for interactive computing that are widely used in our world today. Examples include:
* the notebook format
* the kernel messaging specification
* the kernel launching specification (a.k.a. kernelspec)
* widget communication specification
* the Jupyter Server REST API
* the JupyterHub REST API
* Jupyter configuration files
* Jupyter Extension Proposal front matter

Each of these specification have varying level of documentation or validation. Some specifications were never explicitly documented but, due to their critical nature and decade-long existence, have become implicitly fixed in time in reference implementations.

There has been a surge of proposals aimed at backing these specifications with JSON Schemas (the motivation for schematizing these core specs is described in those JEPs). Each JSON schema (should) have an `$id` keyword defining a URI where that schema can be found, enabling other tools and schemas to reference it.

**The URIs for a JSON schema should be static and "always" available.** This JEP aims to provide a single subdomain where all core "Jupyter-verified" schemas can be reliably hosted.

## Guide-level explanation

Jupyter now hosts a subdomain for publishing schemas for humans and computers, schema.jupyter.org, where all core Jupyter JSON Schemas and related tools will be hosted.

This site is built from a new repository, https://github.com/jupyter-standards/schemas, which collects and organizes these schema from across the Jupyter ecosystem.

Any schemas currently hosted in core Jupyter subprojects can find a new home in this repository, updated with the new subdomain, and published under the new URL.

New (and old) schemas can be submitted to the schemas repository by pull request. Members of the individual subprojects should have the authority to publish schemas for the project they represent. If a schema affects multiple subprojects, it should be reviewed and merged by representatives from those subprojects.

There are some rules required of all schemas, where each schema must:

- declare a `$schema`
    - must be a well-known JSON Schema draft, or a metaschema also in this repo
    - conform to declared schema
- declare a `$id` which must
    - be unique across the repository
    - must start with `https://schema.jupyter.org/`
    - must be namespaced by the subproject name (if applicable)
    - must include a version

For example, to create an "event" schema for Jupyter Server, the `$id` field might look like:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "$id": "https://schema.jupyter.org/jupyter_server/some-event/v1/event.json",
  ...
}
```

## Reference-level explanation

The `@jupyter-standards/schemas` repository must provide, at a minimum:

- a humane experience for authoring and reviewing schema-as-authored
- a build/test tool chain which enforces the _schema rules_ mentioned above
- a documentation tool chain for building a human-readable website, doubling as the fully-dereferenceable URL source for machine-readble schema

To encourage the humane authoring of the notoriously-fickle JSON format, it is proposed schema-at-rest may be _authored_ in a number of _de facto_ file formats.

For the most part, validation can be captured in an internal, not-neccessarily-published JSON Schema, with the exception of the `$id` uniqueness rule. This would be easily achieved with an existing testing framework, such as `pytest`, and executed either locally, on mybinder.org or in continuous integration, such as GitHub actions.

The documentation site should likely be based on `sphinx`, which includes in its broad ecosystem good support for JSON Schema-based specifications such as [`sphinx-jsonschema`](https://pypi.org/project/sphinx-jsonschema/), [`sphinxcontrib-openapi`](https://github.com/sphinx-contrib/openapi), [`asyncapi-sphinx-ext`](https://asyncapi-sphinx-ext.readthedocs.io). These would further provide the ability for downstream documentation sites to unambiguously link to constructs in the schema website, via the well-known `objects.inv` file. ReadTheDocs would be an ideal candidate for review, providing many desirable features such as versioned releases, and per-PR review sites, while really any static host (such as GitLab Pages) would be suitable for the canonical URL.

### Notional Workflow

Below, we describe a notional workflow for maturing a new pull request, driven by a Jupyter Extension Proposal, to publishing a new version of the documentation website and schemas.

```{mermaid}
flowchart LR
    classDef external stroke-dasharray:4px
    JEP:::external --> authoring & examples
    subgraph "a pull request"
        subgraph authoring
            direction LR
            .schema.toml
            .schema.yaml
            .schema.json5
        end
        subgraph examples
            direction LR
            .good.example.*
            .bad.example.*
            .bad.example.expected.*
        end
        subgraph canonical
            .schema.json
        end
        subgraph documentation
            .schema.html
            .report.html
            objects.inv
        end
        normalize
        test
        sphinx
        lint
        link-check
        pass-fail
        review
    end
    authoring & examples --> normalize((normalize)) --> .schema.json
    canonical --> sphinx((sphinx)) --> .schema.html
    canonical --> lint((lint)) & test((test)) --> .report.html
    .schema.html --> link-check((link check))
    review --> pass-fail
    lint & test & link-check --> pass-fail{OK?}
    pass-fail --> version
    subgraph website
        version --> latest & stable
    end
```


## Rationale and alternatives

Adopting standards-based representations of key Jupyter interfaces encourages broader adoption of, and adherance to, these protocols, improving the portability of Jupyter documents and interoperability of first- and third-party implementations.

Especially in the [packaging](#packaging) case described below, having a single-source-of-truth which can be consumed by both sides of a protocol would increase the Jupyter community's ability to innovate in a way that does not negatively impact the user community.

The primary alternatives is to _do nothing_, keeping interface definitions tightly-bound to their reference implementations. This would preserve, and likely compound, the challenges observed today, where it is unclear _where_ changes need to occur.


## Prior art

The [Debug Adapter Protocol](https://github.com/microsoft/debug-adapter-protocol) (DAP) stores its source of truth in a canonical [JSON Schema](https://github.com/microsoft/debug-adapter-protocol/blob/main/debugAdapterProtocol.json), and from this, generates markdown-based documentation.

In contrast to other protocols managed by the same parent organization, which rely on bespoke documentation and specification language, this approach made it relatively easy for Jupyter to previously integrate with DAP.

## Unresolved questions

## Future possibilities

Once the schema repository and subdomain exists, a number of powerful features can be further enabled.

### Higher-order Specifications

The [OpenAPI](https://openapis.org) and [AsyncAPI](https://asyncapi.com) specification formats provide tool-independent ways to document both REST-like systems as well as RPC-style systems. These augment JSON Schema with the understanding of how _inputs_ and _outputs_ are tied together logically, with concepts like URL paths and operations signatures, which can also be validated.

While a number of Jupyter tools have started using OpenAPI, these are generally static, and are used to drive documentation, but may not be used to drive validation or testing.

Either in the proposed schema repository, or in future siblings, these specifications could be used to document, test, and potentially partially implement, the correct functioning of the Jupyter ecosystem.

### Packaging

As a widely-implemented standard, JSON Schema can be used to build packages, at various levels of specificity, that could be consumed by both Jupyter downstreams.

By centralizing the definition, documentation, and testing of these packages, they can be delivered to Jupyter tools and others harmoniously and efficiently.

#### Schema-at-rest

Leveraging the Jupyter _well-known paths_ for declarative Jupyter configuration and asset discovery, all schema could be delivered via a canonical `jupyter-schemas` package, populating the `{sys.prefix}/share/jupyter/schemas` with a file tree identical to the published site.

#### Typings

A number of languages provide means for declaring the _type system_ embodied in a JSON Schema. Automating the creation, testing, publishing, and documentation of such type-only packages for a language, starting with the core Jupyter tool-authoring languages (Python and TypeScript), would allow for light-weight, static-analysis-friendly ways to keep first- and third-party tools in a conforming state, without incurring any additional runtime dependencies.

Typings would _not_ be able to validate some properties of schema, such as string formats and regular expressions, but _would_ provide the general "shape" of the specification well enough to help a downstream decide if a new version of a particular schema will break their users' software.

#### Validators

In many languages, there are a small number of _de facto_ JSON Schema validator implementations, such as Python's `jsonschema` and TypeScript's `ajv`. With a slightly different template than the _typing_ approach, these could be provided with reasonable dependency constraints, for downstream tools to apply full validation, still leveraging the _typings_ above.

#### Models

A number of other validating, model-based systems can also be derived from schema in a way which would still conform to the _typings_ described above, but offer additional user and developer experience benefits.

For example, in Python such generated packages could include `jupyter-schema-pydantic`, `jupyter-schema-attrs`, types compiled with `jupyter-schema-mypyc`, etc. as well as Jupyter's in-house `jupyter-schema-traitlets` or `jupyter-schema-widgets`.

### Composition

A top-level schema describing the entire Jupyter _vocabulary_, compatible with more recent JSON Schema drafts, can be derived from the schema-as-built.

```json
{
  ...
  "$vocabulary": {
    "{/subproject}{/schema_name}{/version}": True
  },
  ...
}
```

## References

- [JSON schema documentation](https://json-schema.org/)
