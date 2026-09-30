# TODO-121 verifier report

- 1. `uv run pytest -q`: 30 passed, exit 0. 一致。
- 2. `load_rules` の `return rules` を `return rules[:-1]` に一時改変: `test_all_slides_rules_load` が FAILED（他のテストも落ちた。下記）。戻した。
  - 出力: `AssertionError: [('TODO', 'トゥードゥー', re.IGNORECASE), ...]` / `Right contains one more item: ('考え方', 'かんがえかた', 0)`
  - 落ちたテスト一覧は返事参照（rg "^FAILED" の結果は下の追記）
- 3. player.html の SPEECH_RULES 先頭に `[/\bfoo\b/gi, 'フー'],` を一時追加: 30 passed。通る。戻した。
- 終了後 `git diff --stat`: TODO.md と tests/test_measure.py のみ。
- 判断が要る点: なし。境界: 表の開始行・終了行は空白 8 個の完全一致（`lines.index`）。インデントが変わるとテストは ValueError で落ちる（実測せず、読んだだけ）。
