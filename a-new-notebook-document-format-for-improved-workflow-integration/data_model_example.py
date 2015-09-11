# This file contains an example for the proposed data model implemented
# as Python data structures.

import hashlib

def sha1(s):
    return hashlib.sha1(s.encode('utf-8')).hexdigest()

layer1 = {'language': 'python3',
          'code': ["import math",
                   "x = math.pi\nmath.cos(x)"]}

layer2 = {'code': layer1,
          'environment': "Python 3.4.3 (default, Apr 15 2015, 21:03:06)\n[GCC 4.2.1 Compatible Apple LLVM 6.1.0 (clang-602.0.49)] on darwin",
          'log': [{'hash': sha1(layer1['code'][0]),
                   'outputs': {'console': {'data': "",
                                           'hash': sha1("")}}},
                  {'hash': sha1(layer1['code'][1]),
                   'outputs': {'console': {'data': "-1.0",
                                           'hash': sha1("-1.0")}}}]}

layer3 = {'language': 'python3',
          'execution': [layer2],
          'cells': [{'type': 'documentation',
                     'format': 'markdown',
                     'data': "# The cosine function\n"},
                    {'type': 'documentation',
                     'format': 'markdown',
                     'data': "First we import the math module:\n"},
                    {'type': 'execution_record',
                     'data': (0, 0)},
                    {'type': 'documentation',
                     'format': 'markdown',
                     'data': "Now we can compute the cosine:\n"},
                    {'type': 'execution_record',
                     'data': (0, 1)},]}
