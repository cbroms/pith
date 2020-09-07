#!/bin/bash

# static checking
pyflakes .

# type-check source files
mypy .

# let global manager intialize a backend instance
python3.8 managers/global_manager.py

# functionality tests
python3.8 utils/tests/test_utils.py
python3.8 search/tests/test_search.py

# manager tests
python3.8 managers/tests/user_manager_test.py
python3.8 managers/tests/discussion_manager_test.py

# interface tests
#python tests/app_test.py


