---
title: Cell ID Addition to Notebook Format
authors: Matthew Seal ([@MSeal](https://github.com/MSeal)) and Carol Willing ([@willingc](https://github.com/willingc))
issue-number: 61
pr-number: 62
date-started: "2020-08-27"
type: S - [Standards Track](https://www.python.org/dev/peps/#pep-types-key)
---

# Cell ID Addition to Notebook Format

## Problem

Modern applications need a mechanism for referencing and recalling particular cells within a notebook. Referencing and recalling cells are needed across notebooks' mutation inside a specific notebook session and in future notebook sessions. 

Some application examples include:

- generating URL links to specific cells
- associating an external document to the cell for applications like code reviews, annotations, or comments
- comparing a cell's output across multiple runs

### Existing limitation

Traditionally custom `tags` on cells have been used to track particular use-cases for cell activity. Custom `tags` work well for some things like identifying the class of content within a cell (e.g., papermill `parameters` cell tag). The `tags` approach falls short when an application needs to associate a cell with an action or resource **dynamically**. Additionally, the lack of a cell id field has led to applications generating ids in different proprietary or non-standard ways (e.g. `metadata["cell_id"] = "some-string"` vs `metadata[application_name]["id"] = cell_guuid`).

### Scope of the JEP

Most resource applications include ids as a standard part of the resource / sub-resources. **This proposal focuses only on a cell ID**. 

Out of scope for this proposal is an overall notebook id field. The sub-resource of cells is often treated relationally, so even without adding a notebook id; thin scope change would improve the quality of abstractions built on-top of notebooks. The intention is to focus on notebook id patterns after cell ids.

## The Motivation for a JEP

The responses to these two questions define requiring a JEP:

*1. Does the proposal/implementation PR impact multiple orgs, or have widespread community impact?*

- Yes, this JEP updates nbformat.

*2. Does the proposal/implementation change an invariant in one or more orgs?*

- Yes, the JEP proposes a unique cell identifier.

This proposal covers both questions.

## Proposed Enhancement

### Adding an `id` field

This change would add an `id` field to each cell type in the [4.4 json_schema](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.4.schema.json). Specifically, the [raw_cell](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.4.schema.json#L114), [markdown](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.4.schema.json#L151), and [code_cell](https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.4.schema.json#L184) required sections would add the `id` field with the following schema:

```
"id": {
    "description": "A str field representing the identifier of this particular cell.",
    "type": "string",
    "pattern": "^[a-zA-Z0-9-]+$",
    "minLength": 2,
    "maxLength": 36
}
```

This change is **not** an addition to the cells' `metadata` space, which has an `additionalProperties: true` attribute. This is adding to the cell definitions directly at the same level as `metadata`, in which scope `additionalProperties` is false and there's no potential for collision of existing notebook keys with the addition.

#### Required Field

The `id` field in cells would _always_ be **required** for any future nbformat versions (4.5+). In contrast to an *optional* field, the required field avoids applications having to conditionally check if an id is present or not.

Relaxing the field to *optional* would lead to undesirable behavior. An optional field would lead to partial implementation in applications and difficulty in having consistent experiences with build on top of the id change.

#### Reason for Character Restrictions (pattern, min/max length)

The [RFC 3986 (Uniform Resource Identifier (URI): Generic Syntax)](https://www.ietf.org/rfc/rfc3986.txt) defines the unreserved characters allowed for URI generation. Since IDs should be usable as referencable points in web requests, we want to restrict characters to at least these characters. Of these remaining non-alphanumeric reserved characters (`-`, `.`, `_`, and `~`) three of them have semantic meaning or are restricted in URL generation leaving only alphanumeric and `-` as legal characters we want to support. This extra restriction also helps with storage of ids in databases, where non-ascii characters in identifiers can oftentimes lead to query, storage, or application bugs when not handled correctly. Since we don't have a pre-existing strong need for such characters (`.`, `_`, and `~`) in our `id` field, we propose not introducing the additional complexity of allowing these other characters here.

The length restrictions are there for a few reasons. First, you don't want empty strings in your ids, so enforce some natural minimum. We could use 1 or 2 for accepting bascially any id pattern, or be more restrictive with a higher minimum to reserve a wider combination of min length ids (`63^k` combinations). Second, you want a fixed max length for string identifiers for indexable ids in many database solutions for both performance and ease of implementation concerns. These will certainly be used in recall mechanisms so ease of database use should be a strong criterion. Third, a UUID string takes 36 characters to represent (with the `-` characters), and we likely want to support this as a supported identity pattern for certain applications that want this.

### Updating older formats

Older formats can be loaded by nbformat and trivially updated to 4.5 format by running `str(uuid.uuid4())[:8]` to populate the new id field. See the [Case: loading notebook without cell id](#Case-loading-notebook-without-cell-id) section for more options for auto-filling ids.

### Alternative Schema Change

Originally a UUID schema was proposed with:

```
"id": {
    "description": "A UUID field representing the identifier of this particular cell.",
    "type": "uuid"
}
```
where the `id` field uses the `uuid` type indicator to resolve its value. This is effectively a more restrictive variant of the string regex above. The `uuid` alternative has been dropped as the primary proposed pattern to better support the existing aforementioned `id` generating schemes and to avoid large URI / content generation by direct insertion of the cell id. If `uuid` were adopted instead applications with custom ids would have to do more to migrate existing documents and byte-compression patterns would be needed for shorter URL generation tasks.

The `uuid` type was recently [added to json-schema](https://json-schema.org/draft/2019-09/release-notes.html) referencing [RFC.4122](https://xml2rfc.tools.ietf.org/public/rfc/bibxml/reference.RFC.4122.xml) which is linked for those unfamiliar with it.

As an informational data point, the [jupyterlab-interactive-dashboard-editor](https://github.com/jupytercalpoly/jupyterlab-interactive-dashboard-editor/tree/master/src) uses UUID for their cell ID.

### Reference implementation

The nbformat [PR#189](https://github.com/jupyter/nbformat/pull/189) has a full (unreviewed) working change of the proposal applied to nbformat. Outside of tests and the cell id uniqueness check the change can be captured with this diff:

```
diff --git a/nbformat/v4/nbformat.v4.schema.json b/nbformat/v4/nbformat.v4.schema.json
index e3dedf2..4f192e6 100644
--- a/nbformat/v4/nbformat.v4.schema.json
+++ b/nbformat/v4/nbformat.v4.schema.json
@@ -1,6 +1,6 @@
 {
     "$schema": "http://json-schema.org/draft-04/schema#",
-    "description": "Jupyter Notebook v4.4 JSON schema.",
+    "description": "Jupyter Notebook v4.5 JSON schema.",
     "type": "object",
     "additionalProperties": false,
     "required": ["metadata", "nbformat_minor", "nbformat", "cells"],
@@ -98,6 +98,14 @@
     },
 
     "definitions": {
+        "cell_id": {
+            "description": "A string field representing the identifier of this particular cell.",
+            "type": "string",
+            "pattern": "^[a-zA-Z0-9-]+$",
+            "minLength": 2,
+            "maxLength": 36
+        },
+
         "cell": {
             "type": "object",
             "oneOf": [
@@ -111,8 +119,9 @@
             "description": "Notebook raw nbconvert cell.",
             "type": "object",
             "additionalProperties": false,
-            "required": ["cell_type", "metadata", "source"],
+            "required": ["id", "cell_type", "metadata", "source"],
             "properties": {
+                "id": {"$ref": "#/definitions/cell_id"},
                 "cell_type": {
                     "description": "String identifying the type of cell.",
                     "enum": ["raw"]
@@ -148,8 +157,9 @@
             "description": "Notebook markdown cell.",
             "type": "object",
             "additionalProperties": false,
-            "required": ["cell_type", "metadata", "source"],
+            "required": ["id", "cell_type", "metadata", "source"],
             "properties": {
+                "id": {"$ref": "#/definitions/cell_id"},
                 "cell_type": {
                     "description": "String identifying the type of cell.",
                     "enum": ["markdown"]
@@ -181,8 +191,9 @@
             "description": "Notebook code cell.",
             "type": "object",
             "additionalProperties": false,
-            "required": ["cell_type", "metadata", "source", "outputs", "execution_count"],
+            "required": ["id", "cell_type", "metadata", "source", "outputs", "execution_count"],
             "properties": {
+                "id": {"$ref": "#/definitions/cell_id"},
                 "cell_type": {
                     "description": "String identifying the type of cell.",
                     "enum": ["code"]
```

## Recommended Application / Usage of ID field

1. Applications should manage id fields as they wish within the rules if they want to have consistent id patterns.
2. Applications that don't care should use the default id generation of the underlying notebook save/load mechanisms.
3. When loading from older formats, cell ids should be filled out with a unique value.
4. UUIDs are one valid, simple way of ensuring uniqueness, but not necessary.
    - Lots of large random strings in notebooks can be frustrating
    - 128-bit UUIDs are also vast overkill for the level of uniqueness we need within a notebook with <1000 candidates for collisions. They make for opaque URLs, noise in the files, etc
    - Human-readable strings are preferable defaults for ids that will be used in links / visible
5. Uniqueness across notebooks is not a goal.
    - A managed ecosystem might make use of uniqueness across documents, but the spec doesn't expect this behavior
6. Users should not need to directly view or edit cell ids.
    - Applications need not make any user interface changes to support the 4.5 format with ids added. If they wish to display cell ids they can but generally they should be invisible to the end user unless they're programmatically referencing a cell.

### Case: loading notebook without cell id

#### Option A: strings from an integer counter

A valid strategy, when populating cell ids from a notebook on import from another id-less source or older format version, to use e.g. strings from an integer counter. 

In fact, if an editor app keeps track of current cell ids, the following strategy ensures uniqueness:

```python
cell_id_counter = 0
existing_cell_ids = set()

def get_cell_id(cell_id=None):
    """Return a new unique cell id

    if cell_id is given, use it if available (e.g. preserving cell id on paste, while ensuring no collisions)
    """
    global cell_id_counter

    if cell_id and cell_id not in existing_cell_ids:
        # requested cell id is available
        existing_cell_ids.add(cell_id)
        return cell_id

    # generate new unique id
    cell_id = f"id{cell_id_counter}"
    while cell_id in existing_cell_ids:
       cell_id_counter += 1
       cell_id = f"id{cell_id_counter}"
    existing_cell_ids.add(cell_id)
    cell_id_counter += 1
    return cell_id

def free_cell_id(cell_id):
    """record that a cell id is no longer in use"""
    existing_cell_ids.remove(cell_id)
```

#### Option B: 64-bit random id

If bookkeeping of current cell ids is not desirable, a 64-bit random id (11 chars without padding in b64) has a 10^-14 chance of collisions on 1000 cells, while an 8-char b64 string (48b) is still 10^-9.

```python
def get_cell_id(id_length=8):
    # Ok technically this isn't exactly a 64-bit k-length string... but it's close and easy to implement
    return str(uuid.uuid4())[:id_length]
```

#### Option C: Join human-readable strings from a corpus randomly 

One frequently used pattern for generating human recognizable ids is to combine common words together instead of arbitrarily random bits. Things like `danger-noodle` is a lot easier to remember or reference for a person than `ZGFuZ2VyLW5vb2RsZQ==`. Below would be how this is achieved, though it requires a set of names to use in id generation. There are dependencies in Python, as well as corpus csv files, for this that make it convenient but it would have to add to the install dependencies.

```python
def get_cell_id(num_words=2):
    return "-".join(random.sample(name_corpus, num_words))
```

#### Preference

Use Option B. Option C is also viable but adds a corpus requirement to the id generation step.

## Questions

1. How is splitting cells handled?
   - One cell (second part of the split) gets a new cell ID
2. What if I copy and paste (surely you do not want duplicate ids...)
   - On paste give the pasted cell a different ID if there's already one with the same ID as being pasted. The copied cell should have a new id
3. What if you cut-paste (surely you want to keep the id)?
   - On paste give the pasted cell a different ID if there's already one with the same ID as being pasted. For cut this means the id can be preserved because there's no conflict on resolution of the move action
4. What if you cut-paste, and paste a second time?
   - On paste give the pasted cell a different ID if there's already one with the same ID as being pasted. In this case the second paste needs a new id
5. How should loaders handle notebook loading errors?
   - On notebook load, if an older format update and fill in ids. If an invalid id format for a 4.5+ file, then raise a validation error like we do for other schema errors. We could auto-correct for bad ids if that's deemed appropriate.
6. Would cell ID be changed if the cell content changes, or just created one time when the cell is created? As an extreme example: What if the content of the cell is cut out entirely and pasted into a new cell? My assumption is the ID would remain the same, right?
   - Correct. It stays the same once created.
7. So if nbformat >= 4.5 loads in a pre 4.5 notebook, then a cell ID would be generated and added to each cell?
   - Yes.
8. If a cell is cut out of a notebook and pasted into another, should the cell ID be retained?
   - No. Much like copying contents out of one document into another -- you have a new cell with equivalent contends and a new id.
9. What are the details when splitting cells?
   - One cell (preferably the one with the top half of the code) keeps the id, the other gets a new id. This could be adjusted if folks want a different behavior without being a huge problem so long as we're consistent.

## Pros and Cons

Pros associated with this implementation include:

- Enables scenarios that require us to reason about cells as if they were independent entities
- Used by Colab, among others, for many many years, and it is generally useful. This JEP would standardize to minimize fragmentation and differing approaches.
- Allows apps that want to reference specific cells within a notebook
- Makes reasoning about cells unambiguous (e.g. associate comments to a cell)

Cons associated with this implementation include:

- lack of UUID and a "notebook-only" uniqueness guarantee makes merging two notebooks difficult without managing the ids so they remain unique in the resulting notebook
- applications have to add default ID generation if not using nbformat (or not python) for this (took 1 hour to add the proposal PR to nbformat with tests included)

## Relevant Issues, PR, and discussion

Pre-proposal discussion:

- [JEP issue #61: Proposal: 4.5 Format Cell ID](https://github.com/jupyter/enhancement-proposals/issues/61)
- [Notes from JEP Draft: Cell ID/Information Bi-weekly Meeting](https://hackmd.io/AkuHK5lPQ5-0BBTF8-SPzQ?view)
- [nbformat PR#189: Adds this proposal to nbformat](https://github.com/jupyter/nbformat/pull/189)

Out of scope for this proposal (notebook ID):

- [nbformat issue #148: Adding unique ID to the notebook metadata](https://github.com/jupyter/nbformat/issues/148)

## Interested

@MSeal, @ellisonbg, @minrk, @jasongrout, @takluyver, @Carreau, @rgbkrk, @choldgraf, @SylvainCorlay, @willingc, @captainsafia, @ivanov, @yuvipanda, @bollwvyl, @blois, @betatim, @echarles, @tonyfast

---

# Appendix 1: Additional Information

In this JEP, we have tried to address the majority of comments made during the
pre-proposal period. This appendix highlights this feedback and additional items.

## Pre-proposal Feedback

Feedback can be found in the pre-proposal discussions listed [above](#Relevant-Issues-PR-and-discussion). Additional feedback can be found in [Notes from JEP Draft: Cell ID/Information Bi-weekly Meeting](https://hackmd.io/AkuHK5lPQ5-0BBTF8-SPzQ?view).

[Min's detailed feedback](https://github.com/jupyter/enhancement-proposals/issues/61#issuecomment-672752443) was taken and incorporated into the JEP.

### $id ref Conclusion

We had a follow-up conversation with Nick Bollweg and Tony Fast about JSON schema and JSON-LD. In the course of the bi-weekly meeting, we discussed $id ref. From further review of how the [\$id property](https://json-schema.org/understanding-json-schema/structuring.html#the-id-property) works in JSON Schema we determined that the use for this flag is orthogonal to actual proposed usecase presented here. A future JEP may choose to pursue using this field for another use in the future, but we're going to keep it out of scope for this JEP.

## Implementation Question

### Auto-Update

A decision should be made to determine whether or not to auto-update older notebook formats to 4.5. Our recommendation would be to auto-update to 4.5.

### Auto-Fill on Save

In the event of a content save for 4.5 with no id, we can either raise a ValidationError (as the example PR does right now) or auto-fill the missing id with a randomly generated id. We'd prefer the latter pattern, provided that given invalid ids still raise a ValidationError.
