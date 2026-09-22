// スライドのデータ。player.html?slides=developer から読まれる（TODO-051）。
// 共通の再生エンジンは player.html の中にある。
// 読み手は「player.html を直す人」。docs/Developer.md の要点だけを載せる。

const slidesConfig = {
    title: 'player.html を直す人へ - 開発者向けガイド',
    heading: 'player.html を直す人へ',
    // index.html の一覧に出す説明とアイコン（ytslide index が読む。TODO-089）
    summary: '<span class="font-mono">player.html</span> の作り',
    icon: 'fa-code',
    // このスライド一式だけの読みの置換表（TODO-054）。共通は player.html
    rules: [
        [/archives\/todo/gi, 'アーカイブズ スラッシュ トゥードゥー'],
        [/public_html/gi, 'パブリック エイチティーエムエル'],
        [/Online TTS/gi, 'オンライン ティーティーエス'],
        [/Web Speech/gi, 'ウェブ スピーチ'],
        [/requestAnimationFrame/gi, 'リクエスト アニメーション フレーム'],
        [/container query/gi, 'コンテナ クエリ'],
        [/no-referrer/gi, 'ノー リファラー'],
        [/\bmeta\b/gi, 'メタ'],
        [/\bAudio\b/gi, 'オーディオ'],
        [/\btransform\b/gi, 'トランスフォーム'],
        [/\bCDN\b/gi, 'シーディーエヌ'],
        [/\btools\b/gi, 'ツールズ'],
    ],
};

const slideData = [
    // Slide 1
    {
        title: 'player.html を直す人へ',
        duration: 12,
        narration: 'これはplayer.htmlの再生エンジンを直す人向けの説明です。スライドを足したいだけならUsersGuide.mdで足ります。こちらはコードを触るときに読んでください。',
        render: function() {
            return `
                <div class="flex flex-col items-start justify-center h-full px-[4cqw] py-[1.5cqw] space-y-[1.5cqw]">
                    <span class="text-sky-400 font-bold tracking-widest flex items-center gap-[1cqw]" style="font-size: clamp(1rem, 2.1cqw, 1.5rem);">
                        <i class="fa-solid fa-code text-lime-400"></i> DEVELOPER GUIDE
                    </span>
                    <h1 class="font-extrabold text-slate-50 leading-tight" style="font-size: clamp(1.8rem, 4.6cqw, 3.6rem);">
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-lime-400">player.html</span> を直す人へ
                    </h1>
                    <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(1.1rem, 2.6cqw, 2.0rem);">
                        再生エンジンを直すときに、先に知っておきたいこと
                    </p>
                    <div class="text-slate-400 font-medium mt-[0.8cqw]" style="font-size: clamp(0.8rem, 1.6cqw, 1.15rem);">docs/Developer.md より</div>
                </div>
            `;
        }
    },
    // Slide 2
    {
        title: 'リポジトリの構成',
        duration: 21,
        narration: 'リポジトリの中身は player.html が本体、slides の下にスライドデータがあります。duration を測ったり動画に書き出したりするコマンドは、ytslide という CLI をインストールして使います。プレイヤー自体はビルドも依存関係のインストールも不要で、CDN から Tailwind などを読み込みます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-folder-tree text-lime-400"></i> リポジトリの構成
                    </h2>
                    <div class="overflow-x-auto rounded-xl border border-slate-700/80 mb-[1.2cqw]">
                        <table class="w-full text-left text-slate-200" style="font-size: clamp(0.9rem, 1.95cqw, 1.4rem);">
                            <thead class="bg-slate-800 text-sky-400 font-bold border-b border-slate-700">
                                <tr><th class="p-[1cqw]">ファイル・コマンド</th><th class="p-[1cqw]">役割</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                                <tr><td class="p-[1cqw] font-mono text-lime-400">player.html</td><td class="p-[1cqw]">外枠の HTML・CSS と再生ロジック。これ1つが本体</td></tr>
                                <tr><td class="p-[1cqw] font-mono text-lime-400">slides/&lt;名前&gt;.js</td><td class="p-[1cqw]">スライドのデータ</td></tr>
                                <tr><td class="p-[1cqw] font-mono text-sky-400">ytslide measure</td><td class="p-[1cqw]">読み上げ秒数を測り duration に書き込む</td></tr>
                                <tr><td class="p-[1cqw] font-mono text-sky-400">ytslide video</td><td class="p-[1cqw]">スライド一式を MP4 と .srt に書き出す</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.2cqw] text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">
                        <i class="fa-solid fa-circle-info text-sky-400 mr-[0.6cqw]"></i>
                        ビルドも依存関係のインストールも不要。Tailwind・Google Fonts・FontAwesome は CDN 頼み
                    </div>
                </div>
            `;
        }
    },
    // Slide 3
    {
        title: '場所を選ばない',
        duration: 16,
        narration: 'player.html がローカルを指すのはスライドデータだけで、しかも相対パスです。player.html と同じ場所に slides を置けば、public_htmlの外でもそのまま動きます。ネット接続だけは必要です。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-location-dot text-lime-400"></i> 場所を選ばない
                    </h2>
                    <div class="bg-sky-950/40 border border-sky-500/40 rounded-xl p-[1.4cqw] mb-[1.4cqw] text-sky-300 font-bold" style="font-size: clamp(1.0rem, 2.2cqw, 1.6rem);">
                        <i class="fa-solid fa-lightbulb text-lime-400 mr-[0.8cqw]"></i>
                        ローカルを指すのは slides/&lt;名前&gt;.js だけ。しかも相対パス
                    </div>
                    <div class="grid grid-cols-2 gap-[1.4cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.6cqw]">
                            <i class="fa-solid fa-folder-open text-lime-400 mb-[0.8cqw]" style="font-size: clamp(1.5rem, 3cqw, 2.2rem);"></i>
                            <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">player.html と slides を同じディレクトリに置けば public_html の外でも動く</p>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.6cqw]">
                            <i class="fa-solid fa-wifi text-sky-400 mb-[0.8cqw]" style="font-size: clamp(1.5rem, 3cqw, 2.2rem);"></i>
                            <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">ネット接続は必須。TTS・フォント・アイコンを外部から取得するため</p>
                        </div>
                    </div>
                    <div class="mt-[1.2cqw] text-slate-400 font-medium" style="font-size: clamp(0.8rem, 1.6cqw, 1.15rem);">※ file:// で直接開いても、表示から読み上げまで動く（Online Voice で確認）</div>
                </div>
            `;
        }
    },
    // Slide 4
    {
        title: '全体の作り',
        duration: 18,
        narration: '全体はHTMLとslideDataと再生ロジックの3段構成です。player.htmlはURLで指定された名前から、slides配下のファイルを読み込み、その中のslideDataを再生ロジックが参照します。読み込む順番は入れ替えられません。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-layer-group text-lime-400"></i> 全体の作り
                    </h2>
                    <div class="grid grid-cols-3 gap-[1.4cqw] items-center text-center mb-[1.4cqw]">
                        <div class="bg-slate-800/80 border border-sky-500/50 p-[1.5cqw] rounded-xl">
                            <div class="text-sky-400 font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">HTML</div>
                            <div class="text-slate-300 font-medium mt-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">外枠と骨組み</div>
                        </div>
                        <div class="bg-slate-800/80 border border-lime-500 p-[1.5cqw] rounded-xl">
                            <div class="text-lime-400 font-mono font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">slideData</div>
                            <div class="text-slate-300 font-medium mt-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">slides/&lt;名前&gt;.js</div>
                        </div>
                        <div class="bg-slate-800/80 border border-sky-500/50 p-[1.5cqw] rounded-xl">
                            <div class="text-sky-400 font-bold" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">再生ロジック</div>
                            <div class="text-slate-300 font-medium mt-[0.4cqw]" style="font-size: clamp(0.82rem, 1.6cqw, 1.2rem);">player.html 内の script</div>
                        </div>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw] text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">
                        <code class="text-lime-300">?slides=&lt;名前&gt;</code> から <code class="text-lime-300">slides/&lt;名前&gt;.js</code> を document.write で先に読み込む。
                        再生ロジックより先に読ませる順番は入れ替えられない
                    </div>
                </div>
            `;
        }
    },
    // Slide 5
    {
        title: '再生ロジック',
        duration: 12,
        narration: '経過時間はrequestAnimationFrameで進みますが、実際のスライド送りは読み上げが終わったタイミングで起きます。時間軸には速度倍率をかけず、読み上げの速度だけに掛けます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-play text-lime-400"></i> 再生ロジック
                    </h2>
                    <div class="space-y-[1.2cqw] text-slate-200 font-medium">
                        <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.4cqw] flex items-start gap-[1.2cqw]">
                            <i class="fa-solid fa-clock text-lime-400 mt-[0.2cqw] flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                            <div style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">progressバーは requestAnimationFrame で進むが、<strong class="text-lime-400">実際のスライド送りは読み上げの終了イベント</strong>で起きる</div>
                        </div>
                        <div class="bg-rose-950/40 border border-rose-500/40 rounded-xl p-[1.4cqw] flex items-start gap-[1.2cqw]">
                            <i class="fa-solid fa-triangle-exclamation text-rose-400 mt-[0.2cqw] flex-shrink-0" style="font-size: clamp(1.2rem, 2.6cqw, 1.8rem);"></i>
                            <div class="text-rose-300" style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);"><strong>BASE_SPEED_MULTIPLIER</strong> を掛けるのは読み上げ速度だけ。時間軸にも掛けるとバーだけ先走る</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 6
    {
        title: 'duration は実測値',
        duration: 12,
        narration: 'durationにはOnline TTSの音声を実際に測った秒数を入れています。読み上げの置換表を直したら、対象のスライドのdurationをytslide measureで測り直してください。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-stopwatch text-lime-400"></i> duration は実測値
                    </h2>
                    <p class="text-slate-200 mb-[1.5cqw] font-medium" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);">
                        Online TTS の音声を BASE_SPEED_MULTIPLIER 倍で再生した実測秒数を入れる。目分量ではない。
                    </p>
                    <div class="bg-slate-900 border border-slate-800 rounded-xl p-[1.2cqw] font-mono text-slate-200 mb-[1.2cqw]" style="font-size: clamp(0.85rem, 1.8cqw, 1.3rem);">
                        ytslide measure --slides &lt;名前&gt; --all --write
                    </div>
                    <div class="bg-amber-950/40 border border-amber-500/40 rounded-xl p-[1.2cqw] text-amber-300 font-medium flex items-center gap-[1cqw]" style="font-size: clamp(0.9rem, 1.85cqw, 1.35rem);">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 flex-shrink-0"></i>
                        prepareSpeechText の置換表を直したら、対象スライドの duration を測り直す
                    </div>
                </div>
            `;
        }
    },
    // Slide 7
    {
        title: '読み上げの2系統',
        duration: 12,
        narration: '読み上げにはOnline TTSとWeb Speechの2系統があり、既定はOnline TTSです。どちらも読み終わりのイベントが来ないことがあるので、安全タイマーで次へ進めます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-volume-high text-lime-400"></i> 読み上げの2系統
                    </h2>
                    <div class="overflow-x-auto rounded-xl border border-slate-700/80 mb-[1.2cqw]">
                        <table class="w-full text-left text-slate-200" style="font-size: clamp(0.9rem, 1.95cqw, 1.4rem);">
                            <thead class="bg-slate-800 text-sky-400 font-bold border-b border-slate-700">
                                <tr><th class="p-[1cqw]">モード</th><th class="p-[1cqw]">実装</th><th class="p-[1cqw]">制限</th></tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 bg-slate-900/40 font-medium">
                                <tr><td class="p-[1cqw] font-bold text-lime-400">online（既定）</td><td class="p-[1cqw]">Google Translate TTS を Audio で再生</td><td class="p-[1cqw]">TTS_MAX_CHARS で分割</td></tr>
                                <tr><td class="p-[1cqw] font-bold text-sky-400">speech</td><td class="p-[1cqw]">Web Speech API</td><td class="p-[1cqw]">長い発話が途中で切れる</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="bg-slate-800/60 border border-slate-700/80 rounded-xl p-[1.2cqw] text-slate-200 font-medium" style="font-size: clamp(0.9rem, 1.9cqw, 1.35rem);">
                        どちらも読み終わりイベントが来ないことがあるので、安全タイマーで次へ進める
                    </div>
                </div>
            `;
        }
    },
    // Slide 8
    {
        title: '副作用のある実装',
        duration: 14,
        narration: '実装を直すときに気をつけることが3つあります。Audio要素は使い回すこと、Web Speechは文章を分けて読ませること、no-referrerのmetaタグを外さないことです。どれも実機で確かめて分かりました。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-rose-400 mb-[1.4cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.35rem, 3.0cqw, 2.4rem);">
                        <i class="fa-solid fa-triangle-exclamation text-rose-400"></i> 副作用のある実装
                    </h2>
                    <div class="space-y-[1cqw] text-slate-200 font-medium">
                        <div class="bg-rose-950/30 border border-rose-500/40 rounded-xl p-[1.2cqw] flex items-start gap-[1cqw]">
                            <i class="fa-solid fa-volume-xmark text-rose-400 mt-[0.15cqw] flex-shrink-0" style="font-size: clamp(1.1rem, 2.3cqw, 1.6rem);"></i>
                            <div style="font-size: clamp(0.88rem, 1.85cqw, 1.35rem);"><strong class="text-rose-300">Audio 要素は1個を使い回す。</strong>作り直すと Android Chrome で自動再生がブロックされる</div>
                        </div>
                        <div class="bg-rose-950/30 border border-rose-500/40 rounded-xl p-[1.2cqw] flex items-start gap-[1cqw]">
                            <i class="fa-solid fa-scissors text-rose-400 mt-[0.15cqw] flex-shrink-0" style="font-size: clamp(1.1rem, 2.3cqw, 1.6rem);"></i>
                            <div style="font-size: clamp(0.88rem, 1.85cqw, 1.35rem);"><strong class="text-rose-300">Web Speech は splitForSpeech で分けて読ませる。</strong>1つにまとめると Chrome が15秒ほどで打ち切る</div>
                        </div>
                        <div class="bg-rose-950/30 border border-rose-500/40 rounded-xl p-[1.2cqw] flex items-start gap-[1cqw]">
                            <i class="fa-solid fa-meta text-rose-400 mt-[0.15cqw] flex-shrink-0" style="font-size: clamp(1.1rem, 2.3cqw, 1.6rem);"></i>
                            <div style="font-size: clamp(0.88rem, 1.85cqw, 1.35rem);"><strong class="text-rose-300">no-referrer の meta タグを外さない。</strong>外すと Online TTS が 404 で出なくなる</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 9
    {
        title: 'レイアウト',
        duration: 14,
        narration: 'レイアウトはcqwとclampで書き、pxやremの直書きは避けます。幅768px未満とタッチ画面はcontainer queryとは別の経路で、枠全体をtransformで縮小します。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-expand text-lime-400"></i> レイアウト
                    </h2>
                    <div class="grid grid-cols-2 gap-[1.4cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.6cqw]">
                            <div class="text-lime-400 font-bold mb-[0.6cqw]" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><i class="fa-solid fa-ruler-combined mr-[0.6cqw]"></i>cqw と clamp()</div>
                            <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">container query で拡大縮小。px・rem の直書きは 16:9 を縮めたときに崩れる</p>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[1.6cqw]">
                            <div class="text-sky-400 font-bold mb-[0.6cqw]" style="font-size: clamp(1.0rem, 2.1cqw, 1.55rem);"><i class="fa-solid fa-mobile-screen mr-[0.6cqw]"></i>狭い画面・タッチ画面</div>
                            <p class="text-slate-200 font-medium leading-relaxed" style="font-size: clamp(0.9rem, 1.9cqw, 1.4rem);">幅768px未満か pointer:coarse は別経路。枠全体を transform: scale() で縮める</p>
                        </div>
                    </div>
                    <div class="mt-[1.2cqw] text-slate-400 font-medium" style="font-size: clamp(0.8rem, 1.6cqw, 1.15rem);">字幕バナーだけは枠の外にあり縮小されない</div>
                </div>
            `;
        }
    },
    // Slide 10
    {
        title: '直書きしない値',
        duration: 9,
        narration: 'スライドの枚数や合計時間は書きません。slideDataの長さとdurationの合計から、再生開始時に自動で埋め込まれます。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.8cqw] flex items-center gap-[1cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-ban text-lime-400"></i> 直書きしない値
                    </h2>
                    <div class="grid grid-cols-2 gap-[2cqw]">
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw] text-center">
                            <div class="text-lime-400 font-mono font-bold mb-[0.6cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">SLIDE nn / NN</div>
                            <p class="text-slate-200 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">slideData.length から自動で埋まる</p>
                        </div>
                        <div class="bg-slate-800/60 border border-slate-700 rounded-xl p-[2cqw] text-center">
                            <div class="text-sky-400 font-mono font-bold mb-[0.6cqw]" style="font-size: clamp(1.15rem, 2.5cqw, 1.85rem);">total-time-display</div>
                            <p class="text-slate-200 font-medium" style="font-size: clamp(0.95rem, 2.0cqw, 1.45rem);">duration の合計で initPlaylist() が上書き</p>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    // Slide 11
    {
        title: 'まとめ',
        duration: 15,
        narration: 'player.htmlを直すときは、再生ロジックと読み上げの仕組み、副作用のある3つの注意点、cqwによるレイアウトを押さえてください。細かい経緯はarchives/todo以下にあります。',
        render: function() {
            return `
                <div class="flex flex-col h-full justify-center px-[3cqw]">
                    <h2 class="font-bold text-sky-400 mb-[1.5cqw] flex items-center gap-[0.8cqw]" style="font-size: clamp(1.4rem, 3.2cqw, 2.5rem);">
                        <i class="fa-solid fa-flag-checkered text-lime-400"></i> まとめ
                    </h2>
                    <div class="space-y-[0.8cqw] text-slate-200 mb-[1.2cqw] font-medium">
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-play text-lime-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">スライド送りは読み上げの終了で起きる。時間軸に速度倍率を掛けない</span>
                        </div>
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-triangle-exclamation text-rose-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">Audio の使い回し・Web Speech の分割・no-referrer は外さない</span>
                        </div>
                        <div class="bg-slate-800/60 p-[1cqw] rounded-lg border border-slate-700 flex items-center gap-[1.2cqw]">
                            <i class="fa-solid fa-expand text-sky-400 flex-shrink-0" style="font-size: clamp(1.2rem, 2.4cqw, 1.7rem);"></i>
                            <span style="font-size: clamp(0.95rem, 2.0cqw, 1.5rem);">レイアウトは cqw と clamp()。幅768px未満とタッチ画面は別経路</span>
                        </div>
                    </div>
                    <div class="bg-sky-950/60 border border-sky-500/60 rounded-xl p-[1cqw] text-center text-sky-300 font-bold" style="font-size: clamp(0.85rem, 1.9cqw, 1.4rem);">
                        個々の経緯は archives/todo/ に1件1ファイルで記録されている
                    </div>
                </div>
            `;
        }
    },
];
