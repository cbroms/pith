#!/bin/bash

# type-check source files
mypy src

# run tests
cd src
python utils/tests/test.py
python search/tests/test_search.py
python tests/user_manager_test.py
python tests/discussion_manager_test.py
cd ..
