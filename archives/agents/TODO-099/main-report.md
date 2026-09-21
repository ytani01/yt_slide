# main の検証記録

- `UV_CACHE_DIR=/tmp/yt-slide-codex-uv-cache uv sync --frozen --extra video`
  で作業ツリー専用 `.venv` を準備。既存の tool install は変更していない。
- 導入直前の既存コマンド: `ytslide 0.7.2.dev6+gbfd7755f9`。
- `UV_CACHE_DIR=/tmp/yt-slide-codex-uv-cache uv run --frozen pytest`:
  **25 passed in 4.40s**。CLI 3、index 6、measure 8、video 8。
- 初回の依存取得は sandbox の DNS 制限で失敗。昇格して取得済み。
- sandbox 内の Chromium 起動は `sandbox_host_linux.cc` の権限エラーで失敗。
  ブラウザの実測は昇格実行で行う。
- 最初の TODO 見直しで参照先の存在・未完了チェックの維持・Python >=3.13
  を確認。`git diff --check` は成功。

手順とブラウザの検証結果は別担当の verify-report.md に記録する。
