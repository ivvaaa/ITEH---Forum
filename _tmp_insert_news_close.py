from pathlib import Path

path = Path(r'reactapp/src/pages/HomePage.js')
text = path.read_text()

pattern = ")}\n      <section className=\"fuel-section\""
replacement = ")}\n      </section>\n\n      <section className=\"fuel-section\""

if pattern not in text:
    raise SystemExit('pattern not found')

text = text.replace(pattern, replacement, 1)
path.write_text(text)