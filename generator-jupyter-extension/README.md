# Jupyter Extension Project/Repo Generator

## Problem
> _The problem that this enhancement addresses. If possible include code or anecdotes to describe this problem to readers._

Starting an enhancement to the Jupyter ecosystem is currently captured at best
through inspecting code examples in the wild. A great deal of (conflicting)
documentation exists, most of which assumes different and usually high degrees
of familiarity with key technologies.

## Proposed Enhancement
> _A brief (1-2 sentences) overview of the enhancement you are proposing. If
  possible include hypothetical code sample to describe how the solution would
  work to readers._

A generator (or family of generators) of bare-bones but feature complete
extension repositories would provide a concise way to document and make
executable current thinking around best practices related to development of
various kinds of Jupyter 4.x extension features, e.g. server, front-end,
widget, and kernel.

In transitioning to the 5.x line, which is still in flux,
the generator would remain relevant as a repository for
advocated approaches.

## Technical Details
> _A detailed explanation covering relevant algorithms, data structures, an API
  spec, and any other relevant technical information_

### Prior Work

#### Documentation for Getting Started
- [4 Ways to Extend Jupyter Notebook][]

#### Project-Generating Projects
- [Yeoman][]
- [cookiecutter][]
- [paster create][]

#### Generating Jupyter Widgets
- [cookiecutter-ipython-widget][]


### Key Enablers/Assumptions
[Yeoman][], a nodejs library, is probably(?) the most widely-used project
generator, usually targeted at node projects. However, it can basically do
any templated, file-tree based operation. It's also light-hearted and fun.

For proposal purposes, a Yeoman generator plugin, distributed via `npm`, is
advocated, but any other equivalent technology choice at this layer could be
selected at implementation time.

The tentative name would be `generator-jupyter-extension`.

However it is "natively" packaged, this generator could be
provided-as-a-service through one or more of:
- a docker container
- a vagrantfile
- a conda environment
- hosted on mybinder.org


### User Experience
Initially, the user experience would be entirely based on the Yeoman (or
whatever) interactive prompt chain. See [Future Work][#future-work] for more
UI directions.

The initial opinions i.e. `♦` are based on an informal assessment of the
sentiment across the various channels (gitter, github, mailing lists), and,
critically, feedback to this proposal. The options are presented roughly in
order of feature dependency.


#### Get Ye Node
```shell
# brew install node
# - or -
# apt-get install nodejs
# - or -
# dnf install nodejs
# - or -
# conda install -c nodejs
# - or -
# ...
```


#### Start the Process
```shell
npm install -g yo generator-jupyter-extension
yo jupyter

        _-----_
       |       |    .------------------------------------.
       |--(o)--|    |  Welcome to the Jupyter Extension  |
      `---------´   |             Generator!             |
       ( _´U`_ )    '------------------------------------'
       /___A___\    > we totally need some Jupyter ASCII art
        |  ~  |     
      __'.___.'__   
    ´   `  |° ´ Y `

    We're so glad that you are interested in helping grow open source,
    exploratory computing with the Jupyter Community. Come visit us at
    http://jupyter.org

    If you need any help, feel free to give a shout!

    Live Chat: http://gitter.im/jupyter
    Mailing List: mailto:jupyter@googlegroups.com
    Office Hours: ???

    If you have problems with the generator, visit:
    https://github.com/jupyter/generator-jupyter-extension

    Let's get going!
```


#### About the Author
```shell
? What is your name?
? What is your email address or website?
? If you are going to release this on GitHub, under what User/Organization?
```


#### License
```shell
Under what term would you like to release this software? (pick one, probably)
  ♢ I won't
  ♦ BSD-3-Clause
  ♢ BSD-2-Clause
  ♢ MIT
  ♢ Apache
  ♢ GPLv3
  ♢ GPLv2
```


#### Natural Name
```shell
? What will you call this project when talking to humans,
  e.g. Super Notebook Extension?
```


#### Tweet
```shell
? What will this project do for a user, in 141 characters?
```


#### Development Line
```shell
What versions of Jupyter do you want to support? (pick some)
  ♢ 3.x (legacy)
  ♦ 4.x (stable)
  ♢ 4.x (development with git)
  ♢ 5.x (experimental with git)
```


#### Extension Point Selection
```shell
What Jupyter x.x-x.x functions would you like to extend? (pick some)
  ♦ JavaScript Notebook (nbextension)
  ♢ JavaScript Dashboard (nbextension)
  ♢ CSS (nbextension)
  ♢ Template (notebook)
  ♢ Server Route (notebook)
  ♢ Widgets (JavaScript-only)
  ♢ Widgets (ipywidgets)
  ♢ Content Manager
  ♢ Kernel (bare)
  ♢ Kernel (ipython-wrapped)
  ♢ Kernel (JavaScript-wrapped)
  ♢ Line Magic (ipython)
  ♢ Cell Magic (ipython)
  ♢ Exporter (nbconvert)
  ♢ Provider (nbviewer)
  ♢ Formatter (nbviewer)
```

> Each of these extension points will:
  - expect some set of files in the templated directory. For
  example, `Javascript Notebook (nbextension)` would create a
  `{pypackage}/static/{jspackage}/js/main.js`. _How_ that file comes to be may
  be direct, i.e. copied directly from the template folder, or it could be
  transpiled from a source file, `{pypackage}/static/src/ts/main.ts`

  If a user selects a larger range of Jupyter versions to support, some
  features might not be present.


#### Server Package Name
```shell
? Ah, I see you are going to be writing some python. What will you call this
  project when importing it in the python server, e.g. superextension?
```

> Assuming a user selected one or more pythonic extension points previously,
  future questions can be:
  - hidden altogether as irrelevant
  - show a reduced set of options, due to incompatibility
  - prepopulated with defaults
  Throughout the rest of this document, phrases like `Ah, I see you are...`
  are human-readable indicators as to how the feature graph is being solved.


#### Browser Module Name
```shell
? Ah, I see you are going to be writing some JavaScript. What will you call
  this project when importing it in the browser, e.g.
  jupyter-js-super-notebook-extension?
```


#### Distribution
```shell
How would you like to distribute your extension? (pick some)
  ♢ I decline
  ♦ PyPi
  ♢ conda
  ♢ npm
```

> Multiple package managers allow for capturing a number of development cases:
  a reference implementation of a widget frontend might be developed and
  bundled with its "host" kernel language, but allow the frontend code to be
  packaged for other kernels to consume.


#### Frontend Code Transpilation
```shell
Ah, I see you are going to be writing some JavaScript. What dialect would you
like to write? (pick one)
  ♢ es5 and requirejs
  ♦ es2015 ne es6 (via babel)
  ♢ typescript
  ♢ coffeescript
```


#### Style Transpilation
```shell
Ah, I see you are going to be writing some CSS. What dialect would you like to
write? (pick one)
  ♢ css
  ♦ less
  ♢ stylus
  ♢ scss
```


#### Documentation
```shell
How would you like to document your extension? (pick some)
  ♢ I won't
  ♦ README.md
  ♢ example notebooks
  ♢ automatically generated HTML docs (esdoc|jsdoc|typedoc, sphinx)
  ♢ literate annotated source (pycco, docco)
```

> Of interest is the "automatic generation" option, which would change based on
  previous opinions expressed by the user.


#### Automation Task Runner
```shell
How would you like to execute common development tasks? (pick one)
  ♢ I won't
  ♦ python setup.py
  ♢ npm
  ♢ gulp
```


#### JavaScript Unit Testing
```shell
Ah, I see you are going to be writing some JavaScript. How would you like to
unit test it? (pick some)
  ♢ I won't
  ♦ mocha
  ♢ karma
  ♢ jasmine
```


#### Python Packaging
```shell
Ah, I see you are going to be writing some Python. How would you like to
specify your setup? (pick one)
  ♢ I won't
  ♦ setup.py
  ♢ flit
```


#### Python Unit Testing
```shell
Ah, I see you are going to be writing some Python. How would you like to unit
test it? (pick one)
  ♢ I won't
  ♦ nose
  ♢ py.test
  ♢ unittest
```


#### Integration/Compliance Testing
```shell
How would you like to test against the Jupyter ecosystem? (pick some)
  ♢ I won't
  ♦ casperjs integration tests
  ♢ tox
  ♢ nosebook
```


#### Continuous Integration
```shell
Ah, I see you are going to run some tests. How would you like to continuously
integrate? (pick some)
  ♢ I won't
  ♦ travis-ci.org
  ♢ anaconda.org
  ♢ circle-ci.org
  ♢ coveralls.io
```


#### Continuous Delivery
```shell
Ah, I see you going to release software. Would you like to continuously deploy
git-tagged versions? (pick some)
  ♢ I won't
  ♦ pypi (via travis-ci.org)
  ♢ conda (via anaconda.org)
  ♢ hub.docker.com
  ♢ mybinder.org
```


#### Continuous Documentation
```shell
Ah, I see you are going to write documentation. Would you like to continuously
document? (choose some)
  ♢ I won't
  ♦ readthedocs.org
  ♢ doc.esdoc.org
  ♢ <user>.github.io
```


#### Linting
```shell
How would you like to ensure code quality?
  ♢ I won't
  ♦ eslint
  ♢ flake8
  ♢ jsonlint
  ♢ tslint
  ♢ coffeelint
```


#### Live Coding
```shell
What would you like to enable in your main live coding (per-save) task?
  (pick some)
  ♢ I won't
  ♦ incremental js/css build
  ♢ linting
  ♢ unit test
  ♢ integration testing (expensive!)
```


#### Commit Hooks
```shell
What would you like to ensure before being able to make a git commit?
  (pick some)
  ♢ I won't
  ♦ frontend build
  ♢ linting
  ♢ coverage
  ♢ documentation coverage
  ♢ unit testing
  ♢ integration testing (expensive!)
```

### And Finally...
```shell
Creating .gitignore...
Creating .travis.yml...
Creating setup.py...
No Javascript found, not creating package.json...
...

WHEW! That's it. Thank you for using the Jupyter extension generator!

Again, we're so glad that you are interested in helping grow open source,
exploratory computing with the Jupyter Community. Come visit us at
http://jupyter.org

If you need any help, feel free to give a shout!

Live Chat: http://gitter.im/jupyter
Mailing List: mailto:jupyter@googlegroups.com
Office Hours: ???

If you have problems with the generator, visit:
https://github.com/jupyter/generator-jupyter-extension

Go get coding!
```

### Thoughts on Algorithms
At its core, the answer to each question above demands a number of features (
e.g. extension point, process, file, etc.)

Each feature can either:
- require that another feature (or type of feature) be present,
- demand that another feature is _not_present or
- express an "affinity" for another feature, such as `CoffeeScript ♥ Jade ♥
  Stylus`

Once all features are known, then files can actually be created: a file can
either appear or not appear based on a feature, and if appearing can include
templated values.

High-level pseudocode for this might be something like:
```python
questions = possible_questions()
features = []

while questions.unanswered(features):
    features += questions.get(features).ask_user(features)

for template in possible_files():
    if template.has_features(features):
        template.write(features)
```

Ideally, the members of `possible_files` and `possible_questions` can be
captured as individual files, discoverable at runtime (yeoman does a fair
amount of globbing, so it's par for the course), helping keep features more
modular, PR-able and extensible.


### Thoughts on Implementation
Writing the generators and opinion questions as
[ES6 classes](http://mammal.io/articles/yeoman-generators-es6/) provides
the most standards-ready and documentable approach to implementing the
generator(s). Indeed, actually using es6 generators may be a lovely way to clean
up some of the "callback hell" for which node is so maligned.


### Future Work
If this proposal is implemented, future work could include:
- a `jupyter extend` subcommand :)
- project-scaffold-as-a-service in the browser, specifically the Jupyter
  Workbench: make phosphide the prescribed IDE suite to build new extensions
- storing the choices made in `package.json` would provide a way to
  drive the creation of a searchable, discoverable, end-user experience
  spanning the entire ecosystem, tied together by a rich feature graph, i.e.
  `http://more.jupyter.org`, integrating project health

## Pros
> _A list of pros that this implementation has over other potential
  implementations._

- The end-user experience should improve, as more, higher-quality,
  better-documented extensions are made available through user's packaging
  channels that more consistently work with one another
- The developer experience of beginning a Jupyter extension would be far simpler
  and less pitfall-prone than the existing method of read doc, ask questions,
  read code, etc.
- The Jupyter extension documentation maintainer experience would shift focus to
  talking about features and process, and writing minimum viable examples:
  decisions can be captured more succinctly and seem less like "busy work".

## ... and Cons
> _A list of cons that this implementation has._

- Creation, much less maintenance of the feature/process graph, with specific
  resolutions for different combinations, will constitute a significant effort,
  and will need to track to almost all of the public APIs: merely creating
  examples of a few key combinations would be less involved work, but would
  require more human eyes to maintain confidently vs a testable scaffolding
  system.
- Documentation of the generator itself would constitute an additional burden
- Picking [Yeoman][] will reduce cross-language opportunity, vs. the more
  historically-used ecosystem base (Python)
- Developers would have to install nodejs


## Interested Contributors
> _A list of individuals who would be interested in contributing to this
  enhancement should it be accepted._


@bollwyvl

[4 Ways to Extend Jupyter Notebook]: http://mindtrove.info/4-ways-to-extend-jupyter-notebook/
[Yeoman]: http://yeoman.io
[paster create]: http://pythonpaste.org/script/developer.html#id6
[cookiecutter]: https://github.com/audreyr/cookiecutter
[cookiecutter-ipython-widget]: https://github.com/bollwyvl/cookiecutter-ipython-widget
