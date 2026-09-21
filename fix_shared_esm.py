from pathlib import Path
import re

base = Path('smart-device-cloud/shared/src')
pattern = re.compile(r"((?:from|import\s+[^'\";]+\s+from|export\s+\*\s+from|export\s+\*\s+as\s+\w+\s+from)\s+['\"])((?:\.\.?\/)[^'\"]+?)(['\"])" )

for path in base.rglob('*.ts'):
    if path.name.endswith('.d.ts'):
        continue
    text = path.read_text(encoding='utf-8')
    orig = text

    def add_js(match):
        prefix, spec, suffix = match.groups()
        if spec.startswith(('./', '../')) and not any(spec.endswith(ext) for ext in ('.js', '.ts', '.json', '.mjs', '.cjs', '.node')):
            return prefix + spec + '.js' + suffix
        return match.group(0)

    text = pattern.sub(add_js, text)
    if text != orig:
        path.write_text(text, encoding='utf-8')
        print(path)
