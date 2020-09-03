#!/bin/bash

# static checking
pyflakes src
# type-check source files
mypy src

# run tests
cd src
python utils/tests/test.py
python search/tests/test_search.py
python managers/tests/user_manager_test.py
python managers/tests/discussion_manager_test.py
#python tests/app_test.py
cd ..
