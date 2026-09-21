#!/usr/bin/env python3
from phonefarm.fleet.rotation import rotate_ip
import sys

for serial in sys.argv[1:]:
    rotate_ip(serial)
