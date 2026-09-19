// スライドのデータ。player.html?slides=claude-memo から読まれる（TODO-041）。
// 共通の再生エンジンは player.html の中にある。

const slidesConfig = {
    title: 'Claude Code 活用法 - プレゼン動画プレイヤー',
    heading: '私の Claude Code の使い方',
    // このスライド一式だけの読みの置換表（TODO-054）。共通は player.html
    rules: [
        [/ccstatusline/gi, 'シーシー ステータス ライン'],
        [/\/clear/gi, 'スラッシュ クリア'],
        [/\/goal/gi, 'スラッシュ ゴール'],
        [/\/doctor/gi, 'スラッシュ ドクター'],
        [/\/rc/gi, 'スラッシュ アールシー'],
        [/\/login/gi, 'スラッシュ ログイン'],
        [/tmux/gi, 'ティーマックス'],
        [/pyright-lsp/gi, 'パイライト エルエスピー'],
        [/ponytail/gi, 'ポニーテール'],
        [/codegraph/gi, 'コードグラフ'],
        [/git worktree/gi, 'ギット ワークツリー'],
        [/auto-mode/gi, 'オートモード'],
        [/\bmain\b/gi, 'メイン'],
        [/\bimplementer\b/gi, 'インプリメンター'],
    ],
};

        const slideData = [
            // Slide 1
            {
                title: '私の Claude Code の使い方',
                duration: 10,
                narration: 'みなさんこんにちは。私のClaude Codeの使い方をご紹介します。ネット情報をもとに、自己流にアレンジしながら試行錯誤中です。',
                render: function() {
                    return `
                        <div class="flex flex-col items-start justify-center h-full px-[4cqw] py-[1.5cqw] space-y-[1.5cqw]">
                            <span class="text-sky-400 font-bold tracking-widest flex items-center gap-[1cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">
                                <i class="fa-solid fa-terminal text-lime-400"></i> WORKFLOW PRESENTATION
                            </span>
                            <h1 class="font-extrabold text-slate-50 leading-tight whitespace-nowrap" style="font-size: clamp(1.8rem, 5cqw, 3.8rem);">
                                私の <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">Claude Code</span> の使い方
                            </h1>
                            <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(1.15rem, 2.8cqw, 2.1rem);">
                                ネット情報をもとに、自分なりに試行錯誤している方法について
                            </p>
                            <div class="text-slate-400 font-medium mt-[0.8cqw]" style="font-size: clamp(0.8rem, 1.6cqw, 1.15rem);">2026-09</div>
                        </div>
                    `;
                }
            },
            // Slide 2
            {
                title: '全体の概要',
                duration: 21,
                narration: 'このあとの流れです。まず、常時稼働させている利用環境。続いて、最も重要な TODO.md によるタスク管理と、マルチエージェントでの役割分担。そのあとに、日々の基本的な使い方と、その他の工夫。最後に、現状の課題とまとめ、の順にご紹介します。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-list-ol text-lime-400"></i> 全体の概要
                            </h2>
                            <div class="grid grid-cols-2 gap-[1.2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-lime-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">1. 利用環境</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">Raspberry Pi 5 + tmux で常時稼働</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-sky-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">2. TODO.md 運用【最重要】</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">タスクを一元管理し、いつでも再開できる</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-lime-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">3. 役割分担</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">マルチエージェントでモデルを使い分ける</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-sky-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">4. 基本的な使い方</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">自然な日本語、設定も AI に、/clear、plugin と MCP、スマホ連携</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-lime-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">5. その他の工夫</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">複数アカウント運用、Codex との共存</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.3cqw]">
                                    <div class="text-sky-400 font-bold mb-[0.4cqw]" style="font-size: clamp(1.05rem, 2.4cqw, 1.8rem);">6. 現状の課題とまとめ</div>
                                    <div class="text-slate-100 font-medium" style="font-size: clamp(0.9rem, 2.0cqw, 1.45rem);">現状の課題と、運用スタイルの総括</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 3
            {
                title: '利用環境とセットアップ',
                duration: 19,
                narration: '私の利用環境のポイントは、Claude Code のセッションを常に起動しっぱなしにできる点です。常時稼働の Raspberry Pi 5 上で tmux を起動し、その中で Claude Code を動かしています。PC から SSH でログインすれば、いつでも以前のセッションを再開できます。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-server text-lime-400"></i> 利用環境
                            </h2>
                            <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.4cqw] mb-[1.5cqw] text-sky-300 font-bold flex items-center gap-[1.2cqw]" style="font-size: clamp(1.05rem, 2.3cqw, 1.7rem);">
                                <i class="fa-solid fa-lightbulb text-lime-400" style="font-size: clamp(1.3rem, 2.8cqw, 2.1rem);"></i>
                                <span>ポイント: Claude Code のセッションは、起動しっぱなしにできる</span>
                            </div>
                            <div class="grid grid-cols-4 gap-[1.4cqw] mb-[1.5cqw]">
                                <div class="bg-slate-800/60 p-[1.4cqw] rounded-xl border border-slate-700 text-center">
                                    <div class="text-slate-400 font-bold uppercase mb-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">マシン</div>
                                    <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.2cqw, 1.6rem);">Raspberry Pi 5</div>
                                    <div class="text-lime-400 mt-[0.4cqw] font-bold" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">24時間常時稼働</div>
                                </div>
                                <div class="bg-slate-800/60 p-[1.4cqw] rounded-xl border border-slate-700 text-center">
                                    <div class="text-slate-400 font-bold uppercase mb-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">セッション維持</div>
                                    <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.2cqw, 1.6rem);">tmux</div>
                                    <div class="text-sky-400 mt-[0.4cqw] font-bold" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">常時セッション保持</div>
                                </div>
                                <div class="bg-slate-800/60 p-[1.4cqw] rounded-xl border border-slate-700 text-center">
                                    <div class="text-slate-400 font-bold uppercase mb-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">エディタ</div>
                                    <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.2cqw, 1.6rem);">Emacs</div>
                                    <div class="text-slate-400 mt-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">(たまに Neovim)</div>
                                </div>
                                <div class="bg-slate-800/60 p-[1.4cqw] rounded-xl border border-slate-700 text-center">
                                    <div class="text-slate-400 font-bold uppercase mb-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">SSH端末</div>
                                    <div class="text-slate-100 font-bold" style="font-size: clamp(1.05rem, 2.2cqw, 1.6rem);">Alacritty</div>
                                    <div class="text-slate-400 mt-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">マルチ端末接続</div>
                                </div>
                            </div>
                            <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw] text-center text-slate-200 font-mono font-bold" style="font-size: clamp(0.98rem, 2.1cqw, 1.55rem);">
                                SSHで Raspberry Pi 5 にログイン &rarr; tmux を起動 &rarr; その中で claude を起動
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 4
            {
                title: '【最重要】TODO.md によるタスク管理',
                duration: 23,
                narration: '運用の中で最も重要なのが TODO.md によるタスク管理です。作業に着手する前に必ず項目を立てることで、万が一セッションが切れても TODO.md から確実に再開できます。利用者の要望から AI が TODO を起草し、承認までの間に壁打ちしながら内容を精査します。承認後はスラッシュゴールで完走させます。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.2cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-list-check text-lime-400"></i> 【最重要】TODO.md によるタスク管理
                            </h2>
                            <p class="text-slate-200 mb-[2cqw] font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">着手前に必ず項目を立てるので、セッションが切れても TODO.md から再開できる。</p>
                            <div class="grid grid-cols-4 gap-[1.5cqw] items-stretch text-center">
                                <div class="bg-slate-800/80 border border-sky-500/50 p-[1.5cqw] rounded-xl">
                                    <div class="text-sky-400 font-bold" style="font-size: clamp(0.9rem, 1.8cqw, 1.35rem);">1. 要望</div>
                                    <div class="text-slate-100 font-bold my-[0.3cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">「○○したい」</div>
                                    <div class="text-slate-300 font-medium" style="font-size: clamp(0.82rem, 1.6cqw, 1.25rem);">利用者の一言</div>
                                </div>
                                <div class="bg-slate-800/80 border border-lime-500 p-[1.5cqw] rounded-xl shadow-lg shadow-lime-500/10">
                                    <div class="text-lime-400 font-bold" style="font-size: clamp(0.9rem, 1.8cqw, 1.35rem);">2. 起草・壁打ち・承認</div>
                                    <div class="text-lime-400 font-mono font-bold my-[0.3cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">TODO.md</div>
                                    <div class="text-slate-300 font-medium" style="font-size: clamp(0.82rem, 1.6cqw, 1.25rem);">AI起草 &rarr; 壁打ちで精査 &rarr; 承認</div>
                                </div>
                                <div class="bg-slate-800/80 border border-sky-500/50 p-[1.5cqw] rounded-xl">
                                    <div class="text-sky-400 font-bold" style="font-size: clamp(0.9rem, 1.8cqw, 1.35rem);">3. 完走</div>
                                    <div class="text-slate-100 font-mono font-bold my-[0.3cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">/goal</div>
                                    <div class="text-slate-300 font-medium" style="font-size: clamp(0.82rem, 1.6cqw, 1.25rem);">完了まで自動走破</div>
                                </div>
                                <div class="bg-slate-800/80 border border-slate-700 p-[1.5cqw] rounded-xl">
                                    <div class="text-slate-400 font-bold" style="font-size: clamp(0.9rem, 1.8cqw, 1.35rem);">4. 保存</div>
                                    <div class="text-slate-300 font-mono my-[0.3cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">archives/</div>
                                    <div class="text-slate-300 font-medium" style="font-size: clamp(0.82rem, 1.6cqw, 1.25rem);">決着・目次保存</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 5
            {
                title: 'TODO.md 運用の具体ルール',
                duration: 18,
                narration: 'TODO.md 運用のルールとしては、大きな作業も小さな作業も例外なくすべて項目化します。そしてスラッシュゴールで一気に完走させます。ファイルを無駄に分割せず TODO.md 一本に集約し、運用のルール自体も AI と相談しながらブラッシュアップしていきます。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-clipboard-list text-lime-400"></i> TODO.md 運用の具体ルール
                            </h2>
                            <div class="space-y-[1.2cqw] text-slate-200 font-medium">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-check-double text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>すべての作業を例外なく項目化:</strong> 大小問わず必ず TODO に起草</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-person-running text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong class="font-mono text-sky-400">/goal TODO-NNN</strong> で完了まで止まらず走らせる</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-file text-amber-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>ファイル分割をしない:</strong> plan.md や task.md に分けず TODO.md 1本に集約</div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw] flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-seedling text-purple-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><strong>ルール自体も AI と直す:</strong> <span class="font-mono bg-slate-900 px-[0.5cqw] py-[0.1cqw] rounded text-slate-200" style="font-size: clamp(0.85rem, 1.7cqw, 1.25rem);">~/.claude/CLAUDE.md</span> へ自動反映</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 6
            {
                title: 'マルチエージェントで役割分担',
                duration: 23,
                narration: 'マルチエージェントで役割分担を行っています。全体指揮とレビューには知能の高い Opus を、実装や検証には高速な Sonnet を、日本語校正には Haiku を割り当てています。直接ファイルを編集できるのは main と implementer だけに制限しています。ただし、担当とモデルは固定ではなく、タスクの内容に応じて main が判断します。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-network-wired text-lime-400"></i> マルチエージェントで役割分担
                            </h2>
                            <div class="grid grid-cols-2 gap-[1.8cqw] items-center">
                                <div class="bg-sky-950/60 border border-sky-500/60 p-[2cqw] rounded-xl text-center">
                                    <div class="text-sky-400 font-bold mb-[0.6cqw]" style="font-size: clamp(1.25rem, 2.6cqw, 1.9rem);">main (Opus / リーダー役)</div>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.0cqw, 1.45rem);">割り振り / 進行管理 / 最終報告<br><span class="text-lime-400 font-bold mt-[0.4cqw] inline-block">※ リポジトリ編集権限あり</span></p>
                                </div>
                                <div class="space-y-[1cqw]">
                                    <div class="bg-slate-800/80 p-[1cqw] rounded-lg border border-slate-700 flex justify-between items-center font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                                        <span><strong class="text-lime-400">implementer</strong> (Sonnet)</span>
                                        <span class="text-slate-200">実装・修正 (編集権限あり)</span>
                                    </div>
                                    <div class="bg-slate-800/80 p-[1cqw] rounded-lg border border-slate-700 flex justify-between items-center font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                                        <span><strong class="text-sky-400">reviewer</strong> (Opus)</span>
                                        <span class="text-slate-200">コードをレビュー</span>
                                    </div>
                                    <div class="bg-slate-800/80 p-[1cqw] rounded-lg border border-slate-700 flex justify-between items-center font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                                        <span><strong class="text-lime-400">verifier</strong> (Sonnet)</span>
                                        <span class="text-slate-200">動かして動作検証</span>
                                    </div>
                                    <div class="bg-slate-800/80 p-[1cqw] rounded-lg border border-slate-700 flex justify-between items-center font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">
                                        <span><strong class="text-rose-400">wording</strong> (Haiku)</span>
                                        <span class="text-slate-200">日本語に校正</span>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-[1.4cqw] px-[1.4cqw] py-[0.8cqw] rounded-lg bg-lime-950/50 border border-lime-500/60 text-lime-300 font-bold text-center" style="font-size: clamp(1.0rem, 2.0cqw, 1.4rem);">※ 担当とモデルは固定ではなく、タスクの内容に応じて main が判断する</p>
                        </div>
                    `;
                }
            },
            // Slide 7
            {
                title: 'TODO.md の実際の記述例',
                duration: 25,
                narration: 'こちらが TODO.md の実際の記述例です。タスク管理と役割分担を組み合わせた実例になっています。ヘッダー部分に残数の管理状況や次回発行IDを記録し、タスクごとに担当エージェント、実施する具体的なステップ、ツールによる検証結果まで明記します。決着したタスクはアーカイブファイルへ集約し、コンテキスト量を最小限に保ちます。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.3rem, 2.8cqw, 2.1rem);">
                                <i class="fa-solid fa-file-lines text-lime-400"></i> TODO.md の実際の記述例
                            </h2>
                            <div class="bg-slate-950 border border-slate-800 rounded-xl p-[1.4cqw] font-mono text-slate-200 leading-normal space-y-[0.7cqw] overflow-hidden shadow-inner" style="font-size: clamp(0.82rem, 1.75cqw, 1.3cqw);">
                                <div class="text-sky-400 font-bold border-b border-slate-800 pb-[0.4cqw] flex justify-between items-center">
                                    <span># TODO.md - Claude Code Task Board</span>
                                    <span class="text-slate-400 font-normal" style="font-size: clamp(0.75rem, 1.5cqw, 1.1rem);">v2.4</span>
                                </div>
                                <div class="text-slate-300" style="font-size: clamp(0.75rem, 1.5cqw, 1.1rem);">ステータス: 進行中 (残1件 / 累計 55 件完了) · 次回 ID: TODO-057</div>
                                
                                <div class="text-lime-400 font-bold pt-[0.2cqw]">## [進行中] TODO-056 モジュール構成とクラス構成の刷新</div>
                                <div class="text-sky-300 bg-slate-900/80 px-[0.7cqw] py-[0.15cqw] rounded border border-slate-800 inline-block" style="font-size: clamp(0.75rem, 1.5cqw, 1.1rem);">
                                    担当: main (Opus/設計) &rarr; implementer (Sonnet/実装) &rarr; verifier (Sonnet/検証)
                                </div>
                                
                                <div class="text-slate-200 pl-[0.8cqw] space-y-[0.4cqw]">
                                    <div class="flex items-center gap-[0.5cqw]"><span class="text-lime-400 font-bold">[x]</span> <span>責務・依存関係の抽出と設計書作成 (<code class="text-amber-300">docs/design-4.md</code>)</span></div>
                                    <div class="flex items-center gap-[0.5cqw]"><span class="text-lime-400 font-bold">[x]</span> <span>インターフェース定義とリファクタリング実施 (<code class="text-sky-300">pyright-lsp</code> にて型検証)</span></div>
                                    <div class="flex items-center gap-[0.5cqw]"><span class="text-amber-400 font-bold">[/]</span> <span>単体テスト実行と結果検証 (<code class="text-lime-300 font-bold">pytest tests/ --cov</code>)</span></div>
                                    <div class="flex items-center gap-[0.5cqw]"><span class="text-slate-400">[ ]</span> <span>旧 API 呼び出し箇所の追随修正 (<code class="text-amber-300">src/</code> 配下 12 箇所)</span></div>
                                </div>

                                <div class="text-slate-300 font-bold pt-[0.2cqw] border-t border-slate-800/80">## 完了済みアーカイブ</div>
                                <div class="text-slate-400 pl-[0.8cqw]" style="font-size: clamp(0.75rem, 1.5cqw, 1.1rem);">
                                    <div>- TODO-001 ~ TODO-055: <span class="underline text-slate-300">archives/todo/2026-09-history.md</span> へ移動・集約済み</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 8
            {
                title: '自然な日本語で対話する',
                duration: 19,
                narration: '対話は「○○したい」とシンプルに伝えるだけで十分です。プロンプトをガチガチに作り込む必要はなく、基本は auto-mode で AI に任せます。足りない情報は AI から質問してくれます。プロンプトエンジニアリングよりも、共通のルール作りが重要だと感じています。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-comments text-lime-400"></i> 自然な日本語で対話
                            </h2>
                            <div class="grid grid-cols-3 gap-[2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw] flex flex-col justify-between">
                                    <div class="text-sky-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-comment-dots"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">「○○したい」で十分</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">指示文を作り込まず、一言伝えて AI と壁打ち対話。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw] flex flex-col justify-between">
                                    <div class="text-lime-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-robot"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">AI を縛らず、任せる</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">基本は auto-mode。足りない情報は AI から聞かせる。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw] flex flex-col justify-between">
                                    <div class="text-amber-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-gears"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">プロンプトよりルール</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">大事なのはプロンプトエンジニアリングよりルール設定。</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 9
            {
                title: 'AI の設定も AI にやってもらう',
                duration: 19,
                narration: 'CLAUDE.md などの設定ファイルは、人間が手で編集しないようにしています。人間が書いた曖昧さや矛盾がそのままハルシネーションの原因になるため、修正も AI に指示して書かせます。プラグインや MCP の設定も任せつつ、入れ過ぎに注意してスラッシュドクターで点検しています。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-sliders text-lime-400"></i> AI の設定も AI にやってもらう
                            </h2>
                            <div class="grid grid-cols-3 gap-[2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                                    <div class="text-sky-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-file-code"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">CLAUDE.md 自作禁止</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">人間が書いた矛盾がハルシネーションの元。修正も AI に書かせる。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                                    <div class="text-lime-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-plug"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">plugin / MCP 管理</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">プラグインの設定も AI に任せる。ただし入れ過ぎには十分注意。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw]">
                                    <div class="text-amber-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 2.8rem);"><i class="fa-solid fa-user-doctor"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">/doctor で点検</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">設定の矛盾や環境の健康状態を Anthropic 推奨コマンドで定期チェック。</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 10
            {
                title: 'トークン節約に効くコマンド：/clear',
                duration: 21,
                narration: 'トークン節約に最も手軽で効くのがスラッシュクリアです。話題が変わったりコミットが終わったタイミングで、文脈をリセットします。AI自身にクリアの適切なタイミングを判定させて、スラッシュクリアできますと言わせるルールも組み込んでいます。なお、要約の脱落を防ぐためスラッシュコンパクトはほとんど使いません。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-broom text-lime-400"></i> トークン節約に効くコマンド /clear
                            </h2>
                            <div class="space-y-[1.2cqw] text-slate-200">
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-start gap-[1.2cqw]">
                                    <i class="fa-solid fa-circle-check text-lime-400 mt-[0.2cqw] flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);" class="font-medium">
                                        <strong class="text-slate-100 font-mono text-lime-400">/clear</strong> で話題が変わったら即リセット。文脈を消してトークンを削減。
                                    </div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-start gap-[1.2cqw]">
                                    <i class="fa-solid fa-code-commit text-sky-400 mt-[0.2cqw] flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);" class="font-medium">
                                        目安は <strong>Git のコミット直後</strong> や一区切りついたタイミング。
                                    </div>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-start gap-[1.2cqw]">
                                    <i class="fa-solid fa-brain text-purple-400 mt-[0.2cqw] flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                                    <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);" class="font-medium">
                                        適切なタイミングを AI に判定させて <strong>「/clear できます」</strong> と提案させる。
                                    </div>
                                </div>
                                <div class="bg-rose-950/40 border border-rose-500/40 rounded-xl p-[1.1cqw] text-rose-300 flex items-center gap-[1cqw] font-medium" style="font-size: clamp(0.9rem, 1.8cqw, 1.35rem);">
                                    <i class="fa-solid fa-triangle-exclamation text-rose-400 flex-shrink-0" style="font-size: clamp(1.1rem, 2.2cqw, 1.6rem);"></i>
                                    <span>※ 情報要約による脱落を防ぐため <code class="bg-slate-900 px-[0.6cqw] py-[0.2cqw] rounded text-rose-300 font-mono">/compact</code> はほとんど使わない</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 11
            {
                title: '実際に使っている plugin と MCP',
                duration: 19,
                narration: '実際に導入しているプラグインと MCP です。Python の型チェックを行う pyright-lsp や、過剰な実装を止める ponytail、コード構造を効率よく検索する codegraph などが活躍しています。数を増やせばいいわけではないため、使っていないものは見直しています。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-puzzle-piece text-lime-400"></i> 実際に使っている plugin と MCP
                            </h2>
                            <div class="overflow-x-auto rounded-xl border border-slate-700/80">
                                <table class="w-full text-left text-slate-200" style="font-size: clamp(0.92rem, 2.0cqw, 1.45rem);">
                                    <thead class="bg-slate-800 text-sky-400 font-bold border-b border-slate-700">
                                        <tr>
                                            <th class="p-[1cqw]">種類</th>
                                            <th class="p-[1cqw]">名前</th>
                                            <th class="p-[1cqw]">用途</th>
                                            <th class="p-[1cqw]">呼び出し回数</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                                        <tr><td class="p-[1cqw]">plugin</td><td class="p-[1cqw] font-mono font-bold text-lime-400">pyright-lsp</td><td class="p-[1cqw]">Python の型と定義を渡す</td><td class="p-[1cqw] font-mono">1173 回</td></tr>
                                        <tr><td class="p-[1cqw]">plugin</td><td class="p-[1cqw] font-mono font-bold text-lime-400">ponytail</td><td class="p-[1cqw]">過剰な実装を止める (YAGNI)</td><td class="p-[1cqw] font-mono">651 回</td></tr>
                                        <tr><td class="p-[1cqw]">MCP</td><td class="p-[1cqw] font-mono font-bold text-sky-400">codegraph</td><td class="p-[1cqw]">コード構造を引く。grepより安い</td><td class="p-[1cqw] font-mono">常用</td></tr>
                                        <tr><td class="p-[1cqw]">MCP</td><td class="p-[1cqw] font-mono font-bold text-sky-400">Claude Docs</td><td class="p-[1cqw]">資料作成</td><td class="p-[1cqw] font-mono">常用</td></tr>
                                        <tr><td class="p-[1cqw]">plugin</td><td class="p-[1cqw] font-mono text-slate-400">claude-code-setup</td><td class="p-[1cqw]">設定の相談</td><td class="p-[1cqw] font-mono">2 回</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <p class="text-slate-400 mt-[1cqw] text-right font-medium" style="font-size: clamp(0.8rem, 1.6cqw, 1.15rem);">※ 呼び出し回数は ~/.claude.json pluginUsage より抽出</p>
                        </div>
                    `;
                }
            },
            // Slide 12
            {
                title: 'スマホ連携：/rc',
                duration: 15,
                narration: 'スラッシュリモートコントロールを使うことで、スマホの Claude アプリからラズパイのセッションに接続できます。TODO.md による運用ルールが固まっているため、出先からの短い指示でも AI が自律的に作業を進めてくれます。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-mobile-screen-button text-lime-400"></i> スマホ連携 /rc
                            </h2>
                            <div class="grid grid-cols-2 gap-[2.2cqw] items-center">
                                <div class="space-y-[1.5cqw] text-slate-200">
                                    <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.8cqw]">
                                        <div class="text-lime-400 font-mono font-bold mb-[0.5cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">/rc (remote-control)</div>
                                        <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);" class="font-medium">スマホの Claude アプリと接続。出先で状況確認も指示出しも可能。</div>
                                    </div>
                                    <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.8cqw]">
                                        <div class="text-sky-400 font-bold mb-[0.5cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">自律的な進捗</div>
                                        <div style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);" class="font-medium">TODO.md の運用ルールが固まっていれば、短文指示でタスクが完了。</div>
                                    </div>
                                </div>
                                <div class="bg-slate-900 border border-slate-800 rounded-xl p-[2.5cqw] text-center">
                                    <i class="fa-solid fa-mobile-button text-sky-400 mb-[1.2cqw] animate-bounce" style="font-size: clamp(3.5rem, 7cqw, 5.5rem);"></i>
                                    <div class="text-slate-100 font-bold leading-relaxed" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">外出先から命令投下 &rarr; ラズパイの Claude Code が実行</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 13
            {
                title: '知っておくと便利な小技',
                duration: 17,
                narration: '便利なおすすめ小技です。プロンプト入力中に Ctrl-G を押すと愛用の外部エディタが起動し、長い指示を落ち着いて書くことができます。また ccstatusline を使うと、ステータスラインに残トークンやモデル情報が常時表示されて非常に重宝しています。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.4cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-lightbulb text-lime-400"></i> 知っておくと便利な小技
                            </h2>
                            <div class="grid grid-cols-2 gap-[1.4cqw] mb-[1.2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                                    <div class="text-lime-400 font-mono font-bold mb-[0.4cqw] flex items-center gap-[0.5cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">
                                        <i class="fa-solid fa-keyboard text-lime-400"></i> Ctrl-G
                                    </div>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.92rem, 1.9cqw, 1.4rem);">プロンプト入力中に Ctrl-G で外部エディタが立ち上がる。使い慣れたエディタで長文指示を落ち着いて書ける。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.4cqw]">
                                    <div class="text-sky-400 font-mono font-bold mb-[0.4cqw] flex items-center gap-[0.5cqw]" style="font-size: clamp(1.1rem, 2.4cqw, 1.75rem);">
                                        <i class="fa-solid fa-sliders text-sky-400"></i> ccstatusline
                                    </div>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(0.92rem, 1.9cqw, 1.4rem);"><code class="bg-slate-900 px-[0.5cqw] py-[0.1cqw] rounded text-sky-300 font-mono" style="font-size: clamp(0.82rem, 1.7cqw, 1.25rem);">npx ccstatusline@latest</code> でステータスラインをカスタマイズ。残トークンやモデルを可視化。</p>
                                </div>
                            </div>

                            <!-- PDFスライド15ページ目の実機スクリーンショット完全忠実再現領域 -->
                            <div class="bg-[#141414] border border-slate-700/80 rounded-xl overflow-hidden shadow-xl relative">
                                <div class="p-[1.4cqw] font-mono overflow-x-auto whitespace-nowrap select-none" style="font-size: clamp(0.8rem, 1.65cqw, 1.2rem);">
                                    <!-- Top terminal line with prompt and divider -->
                                    <div class="text-slate-200 font-bold border-b border-slate-700/80 pb-[0.4cqw] mb-[0.8cqw] flex items-center">
                                        <span>&gt;</span>
                                    </div>

                                    <!-- Pill Badges Line -->
                                    <div class="flex items-center gap-[1cqw] my-[0.4cqw]">
                                        <!-- Pill 1: Opus 5 | medium -->
                                        <div class="inline-flex items-center rounded-full overflow-hidden font-bold shadow-md" style="font-size: clamp(0.75rem, 1.55cqw, 1.15rem);">
                                            <span class="bg-[#0084ff] text-white pl-[0.8cqw] pr-[0.4cqw] py-[0.15cqw] flex items-center">Opus 5</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#0084ff] bg-[#c59500] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#c59500] text-slate-950 pl-[0.4cqw] pr-[0.8cqw] py-[0.15cqw] flex items-center">medium</span>
                                        </div>

                                        <!-- Pill 2: 5h | 0% | [Loading] -->
                                        <div class="inline-flex items-center rounded-full overflow-hidden font-bold shadow-md" style="font-size: clamp(0.75rem, 1.55cqw, 1.15rem);">
                                            <span class="bg-[#4d4d4d] text-slate-100 pl-[0.8cqw] pr-[0.4cqw] py-[0.15cqw] flex items-center">5h</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#4d4d4d] bg-[#00b4a2] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#00b4a2] text-slate-950 px-[0.4cqw] py-[0.15cqw] flex items-center">0%</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#00b4a2] bg-[#e2e8f0] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#e2e8f0] text-slate-900 pl-[0.4cqw] pr-[0.8cqw] py-[0.15cqw] flex items-center">[Loading]</span>
                                        </div>

                                        <!-- Pill 3: Week | 14% | 09-22 16:00 -->
                                        <div class="inline-flex items-center rounded-full overflow-hidden shadow-md" style="font-size: clamp(0.75rem, 1.55cqw, 1.15rem);">
                                            <span class="bg-[#0084ff] text-white pl-[0.8cqw] pr-[0.4cqw] py-[0.15cqw] flex items-center font-bold">Week</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#0084ff] bg-[#c59500] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#c59500] text-slate-950 px-[0.4cqw] py-[0.15cqw] flex items-center font-bold">14%</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#c59500] bg-[#4d4d4d] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#4d4d4d] text-slate-100 pl-[0.4cqw] pr-[0.8cqw] py-[0.15cqw] flex items-center font-mono">09-22 16:00</span>
                                        </div>

                                        <!-- Pill 4: master | ✗ * -->
                                        <div class="inline-flex items-center rounded-full overflow-hidden font-bold shadow-md" style="font-size: clamp(0.75rem, 1.55cqw, 1.15rem);">
                                            <span class="bg-[#00b4a2] text-slate-950 pl-[0.8cqw] pr-[0.4cqw] py-[0.15cqw] flex items-center">master</span>
                                            <svg class="w-[0.5cqw] self-stretch fill-[#00b4a2] bg-[#e2e8f0] shrink-0" viewBox="0 0 8 16" preserveAspectRatio="none"><path d="M0 0 L8 8 L0 16 Z"/></svg>
                                            <span class="bg-[#e2e8f0] text-slate-950 pl-[0.4cqw] pr-[0.8cqw] py-[0.15cqw] flex items-center">✗ *</span>
                                        </div>

                                        <!-- Pill 5: wifi on -->
                                        <div class="inline-flex items-center rounded-full bg-[#0084ff] text-white px-[0.8cqw] py-[0.15cqw] font-bold shadow-md" style="font-size: clamp(0.75rem, 1.55cqw, 1.15rem);">
                                            <i class="fa-solid fa-wifi mr-[0.4cqw]" style="font-size: clamp(0.65rem, 1.2cqw, 0.95rem);"></i>on
                                        </div>
                                    </div>

                                    <!-- Bottom Auto mode line -->
                                    <div class="flex items-center gap-[0.4cqw] pt-[0.4cqw] font-mono" style="font-size: clamp(0.8rem, 1.65cqw, 1.2rem);">
                                        <span class="text-amber-400 font-bold">▸▸ auto mode on</span>
                                        <span class="text-slate-400">(shift+tab to cycle) · ← for agents</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 14
            {
                title: 'トークン上限対策：複数アカウント運用',
                duration: 17,
                narration: 'トークン制限に達した場合は、月単位で複数アカウントを利用します。解約忘れを防ぐために契約直後に解約手続きを行い、限界に達したらスラッシュログインで別アカウントに切り替えます。作業セッションはそのままでスムーズに継続可能です。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-users text-lime-400"></i> トークン不足のときは月単位で複数アカウント
                            </h2>
                            <div class="grid grid-cols-2 gap-[2.2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw]">
                                    <i class="fa-solid fa-calendar-xmark text-rose-400 mb-[1.2cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"></i>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">契約直後に即解約</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">解約し忘れによる無駄な自動更新を確実に防ぐテクニック。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw]">
                                    <i class="fa-solid fa-right-left text-sky-400 mb-[1.2cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"></i>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">/login でスムーズ切替</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">限界に達してもアカウントを切り替えて作業セッションはそのまま継続可能。</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 15
            {
                title: 'OpenAI Codex との共存について',
                duration: 16,
                narration: 'OpenAI Codex との併用についても試行中です。git worktree を利用してブランチと作業ディレクトリを完全に分けることで、混乱や干渉を防いでいます。また Codex の環境設定も Codex 自身に行わせる運用にしています。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-code-branch text-lime-400"></i> Codex との共存について
                            </h2>
                            <div class="grid grid-cols-2 gap-[2.2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw]">
                                    <i class="fa-solid fa-code-fork text-sky-400 mb-[1.2cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"></i>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">git worktree で環境分離</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">お試しで OpenAI Codex を併用。ブランチと作業空間を分けて干渉を防止。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw]">
                                    <i class="fa-solid fa-gears text-lime-400 mb-[1.2cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"></i>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">Codex の設定は Codex 自体に</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">Codex の環境設定も Codex 自身に行わせる。※ Astra はトークン消費が激しいため不使用。</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 16
            {
                title: '現状の課題',
                duration: 18,
                narration: '現在感じている課題は2点です。1つ目はトークン消費。スラッシュクリアと複数アカウントで凌いでいますが、長時間の開発ではまだ足りません。2つ目は、日々のメモに愛用している Obsidian と Claude Code のスムーズな連携方法を模索中であることです。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> 現状の課題
                            </h2>
                            <div class="grid grid-cols-2 gap-[2.2cqw]">
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw] flex flex-col justify-between">
                                    <div class="text-rose-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"><i class="fa-solid fa-coins"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">トークン消費の削減</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">/clear と複数アカウントで凌いでいるが、長時間の開発ではまだ足りない。</p>
                                </div>
                                <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2.2cqw] flex flex-col justify-between">
                                    <div class="text-purple-400 mb-[1cqw]" style="font-size: clamp(1.8rem, 4cqw, 3rem);"><i class="fa-solid fa-note-sticky"></i></div>
                                    <h3 class="font-bold text-slate-100 mb-[0.8cqw]" style="font-size: clamp(1.25rem, 2.7cqw, 2.0rem);">Obsidian メモアプリ連携</h3>
                                    <p class="text-slate-200 leading-relaxed font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">日々のナレッジを蓄積している Obsidian と AI のシームレスな連携方法の確立。</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            },
            // Slide 17
            {
                title: 'まとめ',
                duration: 24,
                narration: 'まとめです。Raspberry Pi 5 と tmux による常時稼働、TODO.md への一元管理、役割に応じたモデルの使い分け、AI を縛らずルール作りを重視すること、こまめなスラッシュクリア。このほか、スマホ連携や複数アカウント運用もご紹介しました。自己流ですので、ぜひご意見やダメ出しをコメントで教えてください。',
                render: function() {
                    return `
                        <div class="flex flex-col h-full justify-center px-[3cqw]">
                            <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                                <i class="fa-solid fa-flag-checkered text-lime-400"></i> まとめ
                            </h2>
                            <div class="space-y-[0.6cqw] text-slate-200 mb-[1.1cqw] font-medium">
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-server text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>Raspberry Pi 5 + ssh + tmux:</strong> 常時起動環境でいつでも復帰可能</span>
                                </div>
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-list-check text-purple-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>TODO.md でタスク管理を集約:</strong> セッションが切れても継続可能</span>
                                </div>
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-users-gear text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>役割でモデルを使い分ける:</strong> Opus / Sonnet / Haiku を担当ごとに</span>
                                </div>
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-handshake text-amber-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>AI を縛らず、頼って任せる:</strong> 指示の矛盾をなくしルール設定を重視</span>
                                </div>
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-broom text-rose-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>話題が変わったら /clear:</strong> 一番手軽で最も効果的なトークン節約術</span>
                                </div>
                                <div class="bg-slate-800/60 p-[0.8cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                                    <i class="fa-solid fa-toolbox text-teal-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                                    <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>その他の便利な使い方:</strong> スマホ連携・複数アカウント・小技も紹介</span>
                                </div>
                                </div>
                            <div class="bg-sky-950/60 border border-sky-500/60 rounded-xl p-[0.8cqw] text-center text-sky-300 font-bold" style="font-size: clamp(0.8rem, 1.8cqw, 1.35rem);">
                                ※ 自己流です。ぜひご意見・ダメ出しをコメントでお願いします！
                            </div>
                        </div>
                    `;
                }
            }
        ];
