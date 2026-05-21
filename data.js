const gameData = {
    title: "文字コード探偵「文字化け事件簿」",
    password: "絵文字の『😂』もUnicodeだと知って急にITっぽく多用する校長先生",

    // ===== STAGE 1: ASCII解読 =====
    stage1: {
        title: "STAGE 1: ASCII暗号の解読",
        instruction: "世界で最も基本的な文字コード「ASCII」を使って、犯人の残したメッセージを解読しろ！",
        timePerQ: 25,
        questions: [
            { question: "英数字や記号など、128種類の文字を7ビット（または8ビット）で表現するアメリカ発の文字コードは？", answer: "ASCII", options: ["JISコード", "ASCII", "Unicode", "EUC"], explanation: "ASCII（アスキー）はすべての文字コードの基礎だ！半角のアルファベットや数字しか表現できないぜ。" },
            { question: "ASCIIコード表において、16進数の「41」はアルファベット大文字の「A」である。では、「42」は何の文字？", answer: "B", options: ["a", "B", "C", "b"], explanation: "41がAなら、順番に増えて42はBだ！単純な暗号みたいで面白いだろ？" },
            { question: "ASCIIコード表において、大文字の「A」は「41(16進数)」だが、小文字の「a」は「61(16進数)」である。では、大文字「C(43)」の小文字「c」は何？", answer: "63(16進数)", options: ["63(16進数)", "44(16進数)", "53(16進数)", "83(16進数)"], explanation: "大文字と小文字は常に「20(16進数)」ずれているんだ！だから 43 + 20 = 63 になる！" },
            { question: "日本語の「ひらがな」や「漢字」は、ASCIIコードで表現できる？", answer: "できない", options: ["できる", "できない"], explanation: "ASCIIは最大256文字しか登録できないから、何万文字もある日本語は絶対に入らないんだニャ！" }
        ]
    },

    // ===== STAGE 2: 文字コード判定 =====
    stage2: {
        title: "STAGE 2: 日本語コードの系譜",
        instruction: "日本語を表現するために作られた様々な文字コードの特徴を当てろ！",
        timePerQ: 20,
        questions: [
            { question: "日本の規格で作られ、かつて電子メールなどで標準的に使われていた「ISO-2022-JP」とも呼ばれる文字コードは？", answer: "JISコード", options: ["シフトJIS", "EUC", "JISコード", "Unicode"], explanation: "JISコードは古き良き日本の標準コードだ。半角カタカナを使うとバグる原因になったりしたぜ。" },
            { question: "Microsoft社などが開発し、WindowsやMacで長年使われてきた日本語文字コードは？", answer: "シフトJIS", options: ["ASCII", "シフトJIS", "Unicode", "EUC"], explanation: "パソコン普及期を支えたのがシフトJISだ。「髙（はしごだか）」などの機種依存文字問題を引き起こした犯人でもある！" },
            { question: "UNIX系のOS（Linuxなど）でよく使われていた日本語文字コードは？", answer: "EUC", options: ["JISコード", "シフトJIS", "EUC", "Unicode"], explanation: "EUC（Extended UNIX Code）は、サーバーの世界でよく使われていたんだ！" },
            { question: "これらの日本語文字コードは、通常1文字を何バイトで表現する？", answer: "2バイト", options: ["1バイト", "2バイト", "3バイト", "4バイト"], explanation: "漢字やひらがなは種類が多すぎるので、1バイト（256通り）では足りない。2バイト（65536通り）使って表現するんだ！" }
        ]
    },

    // ===== STAGE 3: 文字化け捜査 =====
    stage3: {
        title: "STAGE 3: 文字化けの真相",
        instruction: "「縺ゅ↑縺」…不気味な文字化けの原因を突き止めろ！",
        timePerQ: 20,
        questions: [
            { question: "「文字化け」が発生する最も根本的な原因はどれ？", answer: "保存した文字コードと、表示する文字コードが違うから", options: ["ウイルスに感染したから", "パソコンの性能が低いから", "保存した文字コードと、表示する文字コードが違うから", "英語を無理やり日本語に翻訳したから"], explanation: "「シフトJIS」で保存したファイルを、「UTF-8」だと思い込んで開くと、デタラメな文字が当てはめられて化けるんだ！" },
            { question: "特定のパソコンやOSでしか正しく表示されない文字（例：丸囲みの数字やローマ数字）を何という？", answer: "機種依存文字", options: ["絶対依存文字", "機種依存文字", "環境非依存文字", "ローカル文字"], explanation: "Windows固有の文字をMacで開くと化ける現象だ！最近はUnicodeのおかげで減ってきたぜ。" },
            { question: "「シフトJIS」で作成したWebページを、ブラウザが間違って「EUC」で読み込むとどうなる？", answer: "文字化けする", options: ["自動的に翻訳される", "文字化けする", "パソコンが壊れる", "綺麗に表示される"], explanation: "文字の割り当て表が違うから、探偵の俺でも読めない暗号（文字化け）になっちまうんだ！" }
        ]
    },

    // ===== STAGE 4: Unicode百科 =====
    stage4: {
        title: "STAGE 4: 世界統一コードの謎",
        instruction: "世界中の文字を統一する「Unicode」の謎を解け！制限時間なし！",
        timePerQ: 0,
        questions: [
            { question: "世界中のすべての文字を、1つの文字コード体系で表現しようとする国際標準の規格は？", answer: "Unicode", options: ["JISコード", "ASCII", "Unicode", "シフトJIS"], explanation: "日本語もアラビア語もハングルも、全部まとめて管理するのがUnicode（ユニコード）だ！" },
            { question: "現在のWebページで最も標準的に使われている、Unicodeの符号化方式はどれ？", answer: "UTF-8", options: ["UTF-8", "UTF-16", "シフトJIS", "EUC"], explanation: "今あなたがみているこのWebページも「UTF-8」で書かれているぜ！文字化けに強い最強のコードだ！" },
            { question: "Unicodeに登録されており、世界中で「Emoji」として通じるようになったものは？", answer: "絵文字", options: ["顔文字", "絵文字", "アスキーアート", "象形文字"], explanation: "📱や😂などの絵文字も、実はUnicodeとして世界標準で登録されている文字なんだぜ！" },
            { question: "UTF-8において、ひらがなや漢字などの日本語は通常1文字あたり何バイトになる？", answer: "3バイト", options: ["1バイト", "2バイト", "3バイト", "4バイト"], explanation: "アルファベットは1バイトだけど、日本語は3バイト使うのがUTF-8の特徴だ！シフトJIS（2バイト）より少しデータが大きくなるニャ。" }
        ]
    }
};
