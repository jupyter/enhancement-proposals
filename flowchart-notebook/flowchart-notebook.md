# Jupyter Flowchart Notebook

## Problem
Code can be inherently hard for some users to understand as a solely text-based medium, yet other graphical IDEs/Languages are not
suited for professional use. 

## Proposed Enhancement

Provide a UI that formats groups of Cells into flowchart diagrams to improve readability. Each cell should have basic customization options such as edge shape, background color, etc. By converting code to a medium that is both text-based and graphical, users that are either less familiar with programming or instead prefer graphical development environments will have a better time understanding the code that they're using. I'm aiming to provide a UI similar to Node-RED.

## Detail Explanation

Jupyter is already set up to support a flowchart-based UI. A standard Jupyter notebook already takes the form of a linear,
sequential flowchart. By implementing basic multithreading techniques, flowcharts can be run multiple branches concurrently. Flowcharts also graphically stratify code, and branching charts with logic operations can vastly improve readability of code that makes heavy use of if/else/elif statements.

## Pros and Cons

Pros associated with this implementation include:
* Code becomes easier to write and modify for users that prefer graphical environments
* Improved readability of logic-heavy code
* Concurrently-running code will be easier to read and write than if multithreading was implemented manually

Cons associated with this implementation include:
* Branching programs would be inherently more complicated than sequential programs. Because of this added complexity, users writing branching programs might be led to make their otherwise simple programs more complicated than necessary due to the more options that are available.
* Large branched programs could become visually messy, and spaghetti code could become very complicated to manage.
* Retrofitting/Refactoring could become a much more tedious process

## Interested Contributors
@CharlesAverill
