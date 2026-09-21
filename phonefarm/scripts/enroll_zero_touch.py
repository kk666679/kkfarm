#!/usr/bin/env python3
from phonefarm.fleet.zero_touch import enrollment_url
import os

print(enrollment_url(os.environ.get("ZERO_TOUCH_ACCOUNT", "REPLACE_ME")))
