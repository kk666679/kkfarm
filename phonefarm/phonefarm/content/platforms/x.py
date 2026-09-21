from .base import Platform


class X(Platform):
    name = "x"
    char_limit = 280
    hashtag_limit = 2


cat <<'EOF' > phonefarm/content/platforms/linkedin.py
from .base import Platform


class LinkedIn(Platform):
    name = "linkedin"
    char_limit = 3000
    hashtag_limit = 5
