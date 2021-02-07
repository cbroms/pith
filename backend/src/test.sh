#!/bin/bash

# static checking
pyflakes .

# type-check source files
mypy .

# functionality tests
python3.8 utils/tests/test_utils.py
#python3.8 search/tests/test_search.py

# manager tests
#python3.8 managers/tests/board_manager_test.py
#python3.8 managers/tests/discussion_manager_test.py
