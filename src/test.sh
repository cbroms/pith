#!/bin/bash

# enter test mode
export TEST=true

# static checking
pyflakes .

# type-check source files
mypy .

# let global manager intialize a backend instance
python managers/global_manager.py

# functionality tests
python utils/tests/test_utils.py
python search/tests/test_search.py

# manager tests
python managers/tests/user_manager_test.py
python managers/tests/discussion_manager_test.py

# interface tests
#python tests/app_test.py

# leave test mode
export TEST=false
