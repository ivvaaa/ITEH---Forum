from pathlib import Path

path = Path(r'reactapp/src/pages/HomePage.js')
text = path.read_text()

text = text.replace(
"        ) )\n      <section className=\"fuel-section\"",
"        ) )\n      </section>\n\n      <section className=\"fuel-section\""
)

# remove the extra closing section tag before div closing
text = text.replace("\n\n      </section>\n    </div>\n  );\n};", "\n    </div>\n  );\n};")

path.write_text(text)