import csv, json, sys

def esc(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')

rows = list(csv.DictReader(open('sample.csv', encoding='utf-8')))

out = []
out.append("const slidesConfig = {")
out.append("    title: '自動生成テスト',")
out.append("    heading: '自動生成テスト',")
out.append("};")
out.append("")
out.append("const slideData = [")
for r in rows:
    out.append("    {")
    out.append(f"        title: `{esc(r['title'])}`,")
    out.append(f"        body: `<p>{esc(r['body'])}</p>`,")
    out.append(f"        narration: `{esc(r['narration'])}`,")
    out.append(f"        duration: {int(r['duration'])},")
    out.append("    },")
out.append("];")

open('generated.js', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('wrote generated.js')
