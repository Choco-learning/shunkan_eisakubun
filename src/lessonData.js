// ============================================================
//  lessonData.js  —  レッスン教材データ(アプリ本体から分離)
// ============================================================
//
//  ■ このファイルの役割
//    課ごとの「練習の中身」だけをまとめた場所です。
//    App.jsx はこのデータを汎用的に読み込むだけなので、
//    新しい課を足したいときは【このファイルに追記するだけ】でOK。
//    App.jsx 本体を触る必要はありません。
//
//  ■ 課の追加のしかた(例:第14課)
//    下の LESSONS の中に、lesson13 と同じ形で lesson14 を足します:
//
//      lesson14: {
//        id: "lesson14",
//        label: "第14課",
//        subtitle: "〜てください / 〜ています ...",
//        points: [ { id, label, subtitle, explain:[...], run:[...] }, ... ],
//      }
//
//    → 追加した瞬間、アプリの「課別レッスン」画面に自動で出てきます。
//
//  ■ 各データの意味
//    points ... その課の文法ポイント(①②③...)の配列
//      explain ... ①「文法を英語で説明する」練習の問題たち
//      run     ... ②「練習B/Cを英語で進行する(授業運営)」練習の問題たち
//    1問 = { ja: 日本語で"何を言うか/説明するか", en: お手本の英語, hint: 短いヒント }
//      ・ja  … アプリが読み上げる指示(日本語)
//      ・en  … 採点の基準になる自然なお手本(唯一の正解ではない)
//      ・hint … 答えに詰まったとき用の軽いヒント(答えそのものは書かない)
// ============================================================

export const LESSONS = {
    lesson1: {
    id: "lesson1",
    label: "第1課",
    subtitle: "Nです / じゃありません / ですか・だれ / NのN / も / 〜歳",
    points: [
      // ---------------------------------------------------
      // 文法① N₁はN₂です(名前・国・仕事)
      // ---------------------------------------------------
      {
        id: "g1",
        label: "① N₁はN₂です",
        subtitle: "name / nationality / job",
        explain: [
          {
            ja: "「は」が主題を表し、「です」が文末につくという基本の形を、初級者にわかるように英語で説明する",
            en: "は marks the topic — the person we're talking about. です comes at the end, and it works like am, is, or are. So the pattern is: topic, plus は, plus a word, plus です.",
            hint: "topic marker + です = am/is/are",
          },
          {
            ja: "「は」は「は」と書くが「わ」と読むことを英語で説明する",
            en: "One thing to watch: the topic marker is written は, but here we read it 'wa,' not 'ha.' It's the only word like this, so just remember it.",
            hint: "written は, read 'wa'",
          },
          {
            ja: "国籍の言い方(国の名前＋人)を、例を挙げて英語で説明する",
            en: "For a nationality, just add 人 after the country name. アメリカ plus 人 is アメリカ人 — American. So テイラーさんはアメリカ人です means 'Mr. Taylor is American.'",
            hint: "country + 人",
          },
          {
            ja: "仕事の言い方(「です」の前に職業を置く)を、例を挙げて英語で説明する",
            en: "For a job, just put the job before です. テイラーさんは会社員です — 'Mr. Taylor is a company employee.' The pattern doesn't change at all.",
            hint: "job goes before です",
          },
          {
            ja: "他の人の職業には「先生」、自分の職業には「教師」を使うことを英語で説明する",
            en: "One small point about teachers. When you talk about someone else, you say 先生. But for your own job, you say 教師. You don't call yourself 先生.",
            hint: "先生 for others, 教師 for yourself",
          },
          {
            ja: "「あなた」は語彙としては習うが、名前がわかっているときは名前を使うことを英語で説明する",
            en: "あなた means 'you,' but in real conversation Japanese people rarely use it when they know your name. They use the name instead — テイラーさんは会社員ですか. Learn the word, but use names.",
            hint: "use the name, not あなた",
          },
          {
            ja: "自己紹介の3文セット(名前・出身・仕事)の型を英語で説明する",
            en: "For a self-introduction, you can use three short sentences: 私はテイラーです — I'm Taylor. アメリカから来ました — I'm from America. 会社員です — I'm a company employee. Name, country, job.",
            hint: "name → 〜から来ました → job",
          },
        ],
        run: [
          {
            ja: "練習B(国)を始める。やり方を説明して、例を見せる",
            en: "Okay, let's practice. Look at the cue and make a sentence. For example, テイラーさん and アメリカ人 becomes テイラーさんはアメリカ人です — 'Mr. Taylor is American.' Ready? Number one.",
            hint: "look at the cue and make a sentence",
          },
          {
            ja: "生徒が黙ってしまったので、文の前半を一緒に言って続きを待つ",
            en: "Let's start it together. グプタさんは... and then? Take your time.",
            hint: "start the sentence together, then wait",
          },
          {
            ja: "生徒がまだ答えられないので、二択にして助ける",
            en: "No problem, let's make it easier. Is he インド人 or アメリカ人? Just pick one.",
            hint: "give two choices",
          },
          {
            ja: "生徒が「テイラーさんアメリカ人です」と「は」を落としたので、やさしく直して言い直させる",
            en: "Very close! You just need the topic marker. テイラーさん... は... アメリカ人です. Can you try the whole sentence again?",
            hint: "gently name the missing piece, then have them repeat",
          },
          {
            ja: "練習B(仕事)に移る。同じやり方だと伝えて例を見せる",
            en: "Great. Now let's do the same thing with jobs. Example: テイラーさん and 会社員 becomes テイラーさんは会社員です. Let's start with number one — ワンさん.",
            hint: "signal the switch, show one example",
          },
          {
            ja: "練習Cの自己紹介の会話を導入する。まず聞かせて、そのあと生徒がAをやると伝える",
            en: "Now a short conversation. Listen first, then you'll be A. はじめまして。テイラーです。アメリカから来ました。どうぞよろしく。Okay — now you're A. Introduce yourself the same way.",
            hint: "listen first, then swap roles",
          },
          {
            ja: "Talk about yourselfに入る。無口な生徒のために、まず自分が例を見せる",
            en: "Now tell me about yourself — your name, your country, and your job. I'll go first. 私はヒカリです。日本から来ました。教師です。Okay, your turn.",
            hint: "model it yourself first",
          },
          {
            ja: "生徒が正しく言えたのでほめて、Can-do checkに進む",
            en: "That was perfect — really natural. Let's check today's goal. Can you say your name, your nationality, and your job? I think you just did!",
            hint: "praise, then move to the can-do check",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法② N₁はN₂じゃありません
      // ---------------------------------------------------
      {
        id: "g2",
        label: "② N₁はN₂じゃありません",
        subtitle: "is not",
        explain: [
          {
            ja: "「じゃありません」が「です」の否定であることを英語で説明する",
            en: "じゃありません is simply the negative of です. It means 'is not.' The rest of the sentence doesn't change — you just swap です for じゃありません.",
            hint: "negative of です — same word order",
          },
          {
            ja: "「じゃありません」と「ではありません」の使い分けを英語で説明する",
            en: "You'll hear two forms. じゃありません is for everyday conversation. ではありません is more formal — you use it in writing or in a speech. For now, じゃありません is fine.",
            hint: "じゃ = spoken, では = formal/written",
          },
          {
            ja: "「いいえ、〜じゃありません。〜です。」と訂正する型を英語で説明する",
            en: "When you correct someone, the natural pattern is two sentences. First the negative, then the right answer. いいえ、テイラーさんは学生じゃありません。会社員です. No, he isn't a student. He's a company employee.",
            hint: "negative first, then the correct fact",
          },
        ],
        run: [
          {
            ja: "練習B(肯定文を否定文に変える)を始める。例を見せて1番を指名する",
            en: "Let's practice the negative. I'll give you a cue, and you make a negative sentence. Example: グプタさん and 医者 becomes グプタさんは医者じゃありません. Okay, number one.",
            hint: "cue → negative sentence, with one example",
          },
          {
            ja: "練習C(先生がわざと間違えて、生徒が直す)のやり方を説明する",
            en: "Now let's switch it around. I'm going to say something wrong about our characters, and you correct me. Say いいえ, then the negative, then the right answer. Ready?",
            hint: "explain the correction game before starting",
          },
          {
            ja: "生徒が沈黙したので、否定文の出だしだけ言って続きを待つ",
            en: "Let's do it together. いいえ、テイラーさんは... and then? What's he not?",
            hint: "feed the opening, wait for the rest",
          },
          {
            ja: "生徒が「学生じゃないです」と言ったので、この課の形に直す",
            en: "That's understandable, and you'll hear it, but in this lesson we practice じゃありません. So: テイラーさんは学生じゃありません. One more time, with me.",
            hint: "accept, then redirect to the target form",
          },
          {
            ja: "Talk about yourselfで、生徒に自分について否定文を言わせる",
            en: "Now about you. Tell me one thing you are not, and then what you are. Like this: 私は学生じゃありません。教師です. Your turn.",
            hint: "model, then hand it over",
          },
          {
            ja: "宿題の指示を出す",
            en: "For homework, write two sentences about yourself using じゃありません — what you're not, and what you are. Please send them to me before the next lesson.",
            hint: "state what, how many, and when",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法③ N₁はN₂ですか(＋だれ／どなた)
      // ---------------------------------------------------
      {
        id: "g3",
        label: "③ N₁はN₂ですか / だれ・どなた",
        subtitle: "yes-no questions, who",
        explain: [
          {
            ja: "文末に「か」をつけると疑問文になり、語順は変わらないことを英語で説明する",
            en: "To make a question, just add か at the end. That's it — the word order doesn't change at all. テイラーさんは会社員です becomes テイラーさんは会社員ですか.",
            hint: "add か — no word-order change",
          },
          {
            ja: "はい／いいえの答え方を英語で説明する",
            en: "You answer with はい for yes, or いいえ for no. And with いいえ, it's natural to add the correct answer: いいえ、学生じゃありません。医者です.",
            hint: "はい / いいえ + the correct fact",
          },
          {
            ja: "「だれ」と「どなた」の違い(丁寧さ)を英語で説明する",
            en: "To ask who someone is, use だれ — あの人はだれですか. どなた is the polite version, so use it for someone older or in a formal situation: あの方はどなたですか.",
            hint: "だれ = plain, どなた = polite",
          },
          {
            ja: "「あの人」と「あの方」の対応関係を英語で説明する",
            en: "Notice that the words match in politeness. あの人 goes with だれ, and the polite あの方 goes with どなた. Keep the pair together.",
            hint: "あの人+だれ / あの方+どなた",
          },
        ],
        run: [
          {
            ja: "練習B(質問を作って答える)を始める。例を2つ(はい・いいえ)見せる",
            en: "Now let's make questions. I'll give you a name and a word, and you ask the question and answer it. Yes example: テイラーさん、アメリカ人 becomes テイラーさんはアメリカ人ですか。はい、アメリカ人です. Now number one.",
            hint: "show both a yes and a no example",
          },
          {
            ja: "生徒に質問する側をやらせる(役割を交代する)",
            en: "Now let's switch. This time you ask me the questions, and I'll answer. Ask me about キムさん first.",
            hint: "role reversal — student asks",
          },
          {
            ja: "生徒が黙っているので、はい／いいえの二択にして答えやすくする",
            en: "Let's make it simple. Just はい or いいえ. Is ワンさん a student? はい or いいえ?",
            hint: "reduce to a yes/no choice",
          },
          {
            ja: "練習C(名前を確かめる会話)を導入し、役を決める",
            en: "Here's a short conversation for checking a name. I'll be A, you'll be B. 失礼ですが、お名前は？ Go ahead.",
            hint: "assign roles, then start",
          },
          {
            ja: "生徒が「か」を落として上げ調子だけで質問したので、直す",
            en: "Good intonation, but Japanese questions need か at the end. テイラーさんは会社員ですか. Try it once more with か.",
            hint: "point out the missing か, have them redo",
          },
          {
            ja: "生徒がよくできたのでほめて、次の文法項目へ移る",
            en: "Nice — your questions sound really natural now. Let's move on to the next pattern.",
            hint: "praise, then transition",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法④ N₁のN₂(所属)
      // ---------------------------------------------------
      {
        id: "g4",
        label: "④ N₁のN₂",
        subtitle: "affiliation (company / school)",
        explain: [
          {
            ja: "「の」が2つの名詞をつなぐこと、ここでは所属＋身分であることを英語で説明する",
            en: "の connects two nouns. Here, the first noun is the group — a company or a school — and the second is the position. ABCテックの社員 — an employee of ABC Tech.",
            hint: "group + の + position",
          },
          {
            ja: "英語と語順が逆になること(大きい方が先)を英語で説明する",
            en: "Notice the order is the opposite of English. In English you say 'a student at Mirai University' — the person first. In Japanese the big group comes first: みらい大学の学生.",
            hint: "big group first, opposite of English",
          },
          {
            ja: "所属を入れた自己紹介の型を英語で説明する",
            en: "You can put this straight into your self-introduction. はじめまして。テイラーです。ABCテックの社員です。どうぞよろしくお願いします.",
            hint: "add 〜の〜です to the self-intro",
          },
        ],
        run: [
          {
            ja: "練習B(名前・会社・仕事の3要素で文を作る)を始める。例を見せる",
            en: "This time the cue has three parts: a name, a company, and a job. Example: サントスさん、つばめ航空、社員 becomes サントスさんはつばめ航空の社員です. Number one, please.",
            hint: "explain the three-part cue, then one example",
          },
          {
            ja: "生徒が「社員のABCテック」と語順を間違えたので、やさしく直す",
            en: "Almost! Remember, the company comes first in Japanese. So it's ABCテックの社員です. Let's say it together.",
            hint: "name the word-order slip, then repeat together",
          },
          {
            ja: "練習C(同僚を紹介する会話)を導入する。1対1なので先生が2役やると伝える",
            en: "Now an introduction scene. I'll play both 田中さん and myself, and you'll be テイラーさん. Just say your line: はじめまして, and then your company and job.",
            hint: "teacher covers two roles in a 1-to-1 lesson",
          },
          {
            ja: "Talk about yourselfで、自分の所属を言わせる",
            en: "Now your turn. Tell me where you belong — your company or your school, and your position. 私は…の…です.",
            hint: "prompt with the sentence frame",
          },
          {
            ja: "宿題の指示を出す",
            en: "For homework, write two sentences with 〜の〜 about your own company or school. Send them to me before we meet again.",
            hint: "what, how many, by when",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法⑤ N₁もN₂です
      // ---------------------------------------------------
      {
        id: "g5",
        label: "⑤ N₁もN₂です",
        subtitle: "too / also",
        explain: [
          {
            ja: "「も」が「は」に代わって「〜も(also)」の意味になることを英語で説明する",
            en: "When the second person is the same as the first, you don't use は — you use も instead. も means 'too' or 'also.' テイラーさんは会社員です。グプタさんも会社員です.",
            hint: "replace は with も — 'too'",
          },
          {
            ja: "「も」を使うとき「は」は消えることを英語で説明する",
            en: "Important: も replaces は. You never say はも together. Just グプタさんも, not グプタさんはも.",
            hint: "も replaces は — never both",
          },
          {
            ja: "「〜も〜ですか」に「いいえ」で答えるときは「は」に戻ることを英語で説明する",
            en: "Here's the tricky part. If the answer is no, は comes back. Question: シティさんもブラジル人ですか. Answer: いいえ、シティさんはブラジル人じゃありません。インドネシア人です.",
            hint: "negative answer → back to は",
          },
        ],
        run: [
          {
            ja: "練習B(2文セットで「も」の文を作る)を始める。例を見せる",
            en: "Now let's practice も. I'll give you two people. You say the first sentence, then the second one with も. Example: 田中さん、日本人、鈴木さん becomes 田中さんは日本人です。鈴木さんも日本人です. Number one.",
            hint: "two-sentence pattern, one example",
          },
          {
            ja: "生徒が「鈴木さんはも日本人です」と言ったので、直す",
            en: "Good try — but も takes the place of は, so we don't need both. It's 鈴木さんも日本人です. Say it with me.",
            hint: "も replaces は — correct and repeat",
          },
          {
            ja: "練習C(「〜もですか」と質問して、いいえで答える)を進行する",
            en: "Now I'll ask you a も question, and this time the answer is no. Watch the particle — it goes back to は. サントスさんはブラジル人です。田中さんもブラジル人ですか？",
            hint: "flag the particle switch before asking",
          },
          {
            ja: "生徒が「は」に戻せたので、その点を具体的にほめる",
            en: "Excellent — you switched back to は. That's exactly the part most students forget. Well done.",
            hint: "praise the specific thing they got right",
          },
          {
            ja: "宿題を出して、次の項目に進む",
            en: "For homework, write two sentences with も. Now, one last pattern for today.",
            hint: "homework, then transition",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法⑥ Nは―歳です(＋何歳／おいくつ)
      // ---------------------------------------------------
      {
        id: "g6",
        label: "⑥ Nは―歳です / 何歳・おいくつ",
        subtitle: "age",
        explain: [
          {
            ja: "年齢の言い方(数字＋歳)を英語で説明する",
            en: "To say an age, you put the number before 歳. テイラーさんは28歳です — Mr. Taylor is twenty-eight years old. That's the whole pattern.",
            hint: "number + 歳",
          },
          {
            ja: "1歳・8歳・10歳の音の変化を英語で説明する",
            en: "Three ages change sound, so listen carefully. One is いっさい, eight is はっさい, and ten is じゅっさい. They double the consonant. The rest are regular.",
            hint: "いっさい / はっさい / じゅっさい",
          },
          {
            ja: "「何歳」と「おいくつ」の使い分けを英語で説明する",
            en: "To ask an age, say 何歳ですか. The polite version is おいくつですか — use that with someone older than you.",
            hint: "何歳 = plain, おいくつ = polite",
          },
          {
            ja: "実際には大人に年齢を聞くのは失礼になり得るので、登場人物で練習することを英語で説明する",
            en: "One cultural note: in real life, asking an adult their age can be rude, especially a woman's. So we'll practice with the characters in the book, not with real people.",
            hint: "cultural note — practice with characters",
          },
        ],
        run: [
          {
            ja: "練習B(登場人物の年齢を言う)を始める。例を見せる",
            en: "Let's practice ages. Look at the character and tell me how old they are. Example: テイラーさん, twenty-eight, becomes テイラーさんは28歳です. Number one — ミュラーさん.",
            hint: "look at the character, say the age",
          },
          {
            ja: "生徒が「じゅうさい」と言ったので、「じゅっさい」に直す",
            en: "Careful with that one — ten is じゅっさい, not じゅうさい. Listen: じゅっさい. Now you try.",
            hint: "correct the sound change, model, repeat",
          },
          {
            ja: "練習C(年上の人には「おいくつですか」を使う)に切り替える指示を出す",
            en: "Now, ミュラーさん is fifty-two, so he's older than you. Which question do you use? Right — おいくつですか. Go ahead and ask.",
            hint: "make them choose the polite form",
          },
          {
            ja: "年齢クイズ(二択)で、無口な生徒でも答えられるようにする",
            en: "Let's do a quick quiz. Look at ワンさん. How old do you think he is — 20歳 or 29歳? Just guess.",
            hint: "two-choice guessing game",
          },
          {
            ja: "Can-do checkを読み上げて、生徒に一問実際にやらせる",
            en: "Let's check today's goal. Can you ask and tell someone's age? Try it now — ask me about 田中さん.",
            hint: "read the can-do, then have them do it live",
          },
          {
            ja: "宿題の指示を出して、レッスンを締める",
            en: "For homework, look at the character cards and write three people's ages. Great work today — see you next time!",
            hint: "homework, then a warm close",
          },
        ],
      },
    ],
  },

  lesson13: {
    id: "lesson13",
    label: "第13課",
    subtitle: "Nが欲しいです / 〈ます形〉たいです / 〈場所〉へ〜に行きます",
    points: [
      // ---------------------------------------------------
      // 文法① Nが欲しいです
      // ---------------------------------------------------
      {
        id: "g1",
        label: "① Nが欲しいです",
        subtitle: "I want N",
        explain: [
          {
            ja: "「Nが欲しいです」の基本の意味と、なぜ「を」ではなく「が」を使うのかを、初級者にわかるように英語で説明する",
            en: "When you want something, you say 'N ga hoshii desu.' 'Hoshii' is an adjective, not a verb, so the thing you want is marked with が, not を.",
            hint: "hoshii = i-adjective → the thing takes が",
          },
          {
            ja: "「欲しいです」の否定形と、質問の作り方を英語で説明する",
            en: "The negative is 'hoshikunai desu,' and to ask someone, you say 'nani ga hoshii desu ka' — meaning 'what do you want?'",
            hint: "negative + question form",
          },
          {
            ja: "「欲しいです」は自分の欲求や相手に尋ねるときだけに使い、第三者には使えないことを英語で説明する",
            en: "Be careful — 'hoshii desu' only works for your own wants, or for asking the listener. You can't use it to say what a third person wants.",
            hint: "1st person / listener only, not a 3rd person",
          },
          {
            ja: "人に物を勧めるときは「〜が欲しいですか」ではなく「〜はいかがですか」を使うことを英語で説明する",
            en: "When you offer something to a guest, don't ask 'hoshii desu ka' — it can sound blunt. Use 'ikaga desu ka' instead, which means 'would you like some?'",
            hint: "offering → いかがですか, not 欲しいですか",
          },
          {
            ja: "「欲しい」がい形容詞なので、「好き」や「わかる」と同じく対象に「が」を取ることを、例を挙げて英語で説明する",
            en: "Think of it the same way as 好き or わかる — the thing takes が. So 'I want water' is 'mizu ga hoshii desu.'",
            hint: "same particle pattern as 好き / わかる",
          },
        ],
        run: [
          {
            ja: "入れ替え練習を始める。例文「わたしは時間が欲しいです」を示し、「休み・お金・いい仕事」で言い換えるよう英語で指示する",
            en: "Let's try a substitution drill. The example is 'watashi wa jikan ga hoshii desu.' Now say it with these: a day off, money, and a good job.",
            hint: "start a substitution drill + give the cue words",
          },
          {
            ja: "「どんな〜が欲しいですか」の練習に入り、「どんなパソコンが欲しいですか」と英語で質問して生徒に答えさせる",
            en: "Now let's practice 'what kind of.' Here's my question: what kind of computer do you want? Try answering with 'hoshii desu.'",
            hint: "ask a 'what kind of...' question, prompt them to answer",
          },
          {
            ja: "「おはよう日本」のインタビューのロールプレイを始めると伝え、自分がインタビュアー役・生徒が回答者役だと英語で説明する",
            en: "Let's do a role-play. I'll be a TV interviewer from a morning show, and you're the person I stop on the street. Ready to give it a go?",
            hint: "set up a role-play + assign the roles",
          },
          {
            ja: "生徒の答えがとても自然だったことを英語で褒める",
            en: "That was really natural — great job!",
            hint: "praise natural output",
          },
          {
            ja: "生徒が「を」を使ってしまったので、「欲しい」には「が」を使うことをやさしく訂正し、もう一度言わせる",
            en: "Small correction — with 'hoshii' we use が, not を. So it's 'kuruma ga hoshii desu.' Want to try that once more?",
            hint: "gentle correction → remodel → invite a retry",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法② 〈ます形〉たいです
      // ---------------------------------------------------
      {
        id: "g2",
        label: "② 〈ます形〉たいです",
        subtitle: "I want to do V",
        explain: [
          {
            ja: "動詞のます形に「たい」をつけて「〜したい」という願望を表すことを、例を挙げて英語で説明する",
            en: "To say you want to do something, take the masu-form of a verb, drop 'masu,' and add 'tai.' So 'tabemasu' becomes 'tabetai desu' — I want to eat.",
            hint: "masu-form → drop masu → + tai",
          },
          {
            ja: "「たいです」がい形容詞と同じ活用で、否定形が「たくないです」になることを英語で説明する",
            en: "'Tai desu' conjugates just like an i-adjective, so the negative is 'takunai desu.' For example, 'kyou wa hatarakitakunai desu' — I don't want to work today.",
            hint: "conjugates like an i-adjective; negative = takunai",
          },
          {
            ja: "「行きます」と「行きたいです」の違い(事実・予定 vs 願望)を英語で説明する",
            en: "'Ikimasu' just states a plan or fact — I'm going. 'Ikitai desu' expresses a wish — I want to go, though it may not be decided yet.",
            hint: "plan / fact  vs  wish",
          },
          {
            ja: "「たいです」も自分か相手にだけ使い、第三者の希望には使えないことを英語で説明する",
            en: "Like 'hoshii desu,' 'tai desu' is only for your own wish or for asking the listener — not for a third person's wish.",
            hint: "1st person / listener only",
          },
          {
            ja: "「たい」の前は「を」も「が」も使え、「が」は対象を少し強調することを英語で説明する",
            en: "Before 'tai,' you can use either を or が — both are natural. が just puts a little more focus on the thing you want.",
            hint: "を or が both OK; が = light emphasis",
          },
        ],
        run: [
          {
            ja: "「ます形→たい／たくない」の変換練習を始めると英語で伝え、「行きます」を変換するよう指示する",
            en: "Let's do a transformation drill. I'll give you a masu-form verb, and you change it to the 'tai' form. First one: 'ikimasu' — go ahead.",
            hint: "start a transformation drill, give the first cue",
          },
          {
            ja: "「何を〜たいですか」の練習で、「何を買いたいですか」と英語で質問し、車を使って答えさせる",
            en: "Now here's a question — what do you want to buy? Try answering with a car.",
            hint: "ask the question + give the cue",
          },
          {
            ja: "「のどがかわきましたね」から始まる会話練習を一緒にやろうと英語で伝える",
            en: "Let's try a short conversation. I'll start with 'nodo ga kawakimashita ne' — you're thirsty too. Let's take it from there.",
            hint: "set up the conversation drill",
          },
          {
            ja: "生徒に自分の後について繰り返すよう、焦らなくていいと添えてやさしく英語で指示する",
            en: "Please repeat after me, okay? Take your time, there's no rush.",
            hint: "repeat-after-me instruction + reassure",
          },
          {
            ja: "生徒がこのパターンで上達していることを英語で励ます",
            en: "You're really improving with this pattern — keep it up!",
            hint: "encourage their progress",
          },
        ],
      },

      // ---------------------------------------------------
      // 文法③ 〈場所〉へ〈ます形〉／Nに行きます
      // ---------------------------------------------------
      {
        id: "g3",
        label: "③ 〈場所〉へ〜に行きます",
        subtitle: "Go somewhere to do V",
        explain: [
          {
            ja: "移動の目的を言うとき「に」を使い、その前に動詞のます形か、動作を表す名詞(散歩・買い物など)が来ることを英語で説明する",
            en: "To give the purpose of a trip, use 'ni.' Before 'ni' you put either a verb in its masu-form, or an action noun like 'sanpo' or 'kaimono.'",
            hint: "purpose of movement = に; before it: masu-stem or action noun",
          },
          {
            ja: "「に」の前が「を」を取る動詞のとき、その「を」を動詞につけたまま残すことを「お土産を買いに行きます」を例に英語で説明する",
            en: "When the verb normally takes を, keep it on the verb. So it's 'omiyage wo kai ni ikimasu' — not 'omiyage ni ikimasu.'",
            hint: "keep を on the verb; don't drop the verb",
          },
          {
            ja: "「散歩・買い物」のような動作名詞は直接置けるが、「車・本」のような普通名詞は動詞が必要なことを英語で説明する",
            en: "Action nouns like 'sanpo' or 'kaimono' go straight before 'ni ikimasu.' But an object like 'kuruma' or 'hon' needs a verb — 'kuruma wo mi ni ikimasu.'",
            hint: "action noun = OK directly; object noun needs a verb",
          },
          {
            ja: "「へ」と「で」の違い(へ=移動の方向・行き先、で=動作が起きる場所)を英語で説明する",
            en: "Watch the difference between 'e' and 'de.' 'E' marks the direction you move toward, while 'de' marks where an action actually happens.",
            hint: "へ = direction / destination;  で = place of action",
          },
          {
            ja: "質問のしかた「どこへ行きますか」「何をしに行きますか」を英語で説明する",
            en: "To ask, you can say 'doko e ikimasu ka' — where are you going — or 'nani wo shi ni ikimasu ka' — what are you going there to do?",
            hint: "two question patterns: どこへ / 何をしに",
          },
        ],
        run: [
          {
            ja: "「場所＋目的」の練習を始め、例「銀行へお金を借りに行きます」を示して、図書館の文を作らせる",
            en: "Let's practice place plus purpose. The example is 'ginkou e okane wo kari ni ikimasu.' Now try making one about the library.",
            hint: "give the example → prompt a new sentence",
          },
          {
            ja: "「公園へ行きます・散歩します」の二文を一文にまとめる練習だと英語で説明し、例を示して次をやらせる",
            en: "For this one, you'll combine two sentences into one. 'Go to the park' plus 'take a walk' becomes 'kouen e sanpo ni ikimasu.' Let's try the next one.",
            hint: "explain 'combine two into one' + model it",
          },
          {
            ja: "「どこへ〜に行きますか」の質問練習を始め、「どこへ遊びに行きますか」と英語で質問して、文で答えさせる",
            en: "Now I'll ask you some 'where' questions. Where do you go to hang out? Try to answer in a full sentence, okay?",
            hint: "ask the where-question + prompt a full sentence",
          },
          {
            ja: "レストランでの会話ロールプレイを始めると伝え、自分が店員役をやると英語で説明する",
            en: "Let's try a restaurant role-play. I'll be the staff, and you're the customer ordering lunch. Whenever you're ready.",
            hint: "set up the restaurant role-play + assign roles",
          },
          {
            ja: "生徒が「お土産に行きます」と言ってしまったので、動詞を入れて「お土産を買いに行きます」と言うようやさしく訂正する",
            en: "Almost! You need the verb in there — it's 'omiyage wo kai ni ikimasu,' with 'kau.' Give it one more try.",
            hint: "correct the dropped-verb error → remodel → retry",
          },
        ],
      },
    ],
  },
    lesson14: {
    id: "lesson14",
    label: "第14課",
    subtitle: "〈て形〉ください / ましょうか / ています",
    points: [
      {
        id: "01",
        label: "① 〈て形〉ください",
        subtitle: "指示・依頼・勧め",
        explain: [
          { ja: "「te-form + ください」の3つの使い方を説明してください。", en: "Te-form + ください has three uses. First, instructions: write your name here please. Second, requests — say すみませんが first: excuse me, please speak more slowly. Third, invitations — say どうぞ: please come in.", hint: "instructions, requests, invitations" },
          { ja: "「書きます」「飲みます」「食べます」が動詞の3グループに分かれる理由を説明してください。", en: "Japanese verbs have three groups. Look at the sound just before ます. Group 1: the sound is an 'i' sound — like write, drink. Group 2: the sound is an 'e' sound — like eat. Group 3 is special: します, 来ます, and 勉強します.", hint: "sound before ます — i sound, e sound, or special" },
          { ja: "「き → いて」「み → んで」「し → して」のte形の変化ルールを説明してください。", en: "The te-form rules for Group 1 depend on the final sound. き becomes いて — 書きます, 書いて. み and び become んで — 飲みます, 飲んで. し becomes して — 話します, 話して. い, ち, り become って.", hint: "ki, mi/bi, shi, i/chi/ri patterns" },
          { ja: "「行きます → 行って」という例外を説明してください。", en: "One exception: 行きます, to go. The normal rule would give いきて, but the real form is 行って. It is the only exception in Group 1. Just memorize this one.", hint: "exception in Group 1" },
          { ja: "「漢字の読み方」「コピーの使い方」の「〜方」の意味と作り方を説明してください。", en: "To say 'how to' — how to read, how to use — take off ます and add 方. yomikata means how to read. Connect with の: kanji no yomikata. Students sometimes use を, so gently correct it to の.", hint: "masu-stem + 方, connect with の" },
          { ja: "「もう少し」「もう一杯」のような「もう」の意味を説明してください。", en: "もう + an amount means more. More time — もう少し. One more cup — もう一杯. It is often used in requests: please speak a little more slowly.", hint: "more time, more quantity" },
        ],
        run: [
          { ja: "練習Bを始める。動詞をて形＋くださいに変える練習だと伝え、例（パスポートを見せます→見せてください）を示してから1番を促してください。", en: "Let's do a drill. Change the verb and make a 〜てください sentence. For example, パスポートを見せます becomes パスポートを見せてください. OK, number one, please.", hint: "start drill B-1, show example, call number 1" },
          { ja: "生徒が「書きてください」と言った。て形が違うことをやさしく訂正して、もう一度言わせてください。", en: "Almost! It's not 書きて — the te-form is 書いて. So, 書いてください. Let's try that once more.", hint: "gentle correction of the te-form" },
          { ja: "依頼の練習に移る。「すみませんが」で始めるよう指示し、例を示してから1番を促してください。", en: "Now let's practice requests. Start with すみませんが. For example, すみませんが、ちょっと手伝ってください. Your turn — number one, please.", hint: "transition to requests, model すみませんが" },
          { ja: "勧めの練習に移る。「どうぞ」で始めるよう指示し、例を示してください。", en: "This time, invitations. Begin with どうぞ. For example, どうぞ入ってください. Go ahead, number one.", hint: "transition to invitations, model どうぞ" },
          { ja: "生徒が黙ってしまった。文の前半を一緒に言って続きを引き出してください（無口対応）。", en: "Let's do it together. ここに名前と住所を…? Go on, you finish it.", hint: "silent-student support, start the sentence together" },
          { ja: "会話練習（タクシー）に入る。役割を割り振り、まず一緒に読もうと促し、次に役を交代すると伝えてください。", en: "Now a real situation — a taxi. You're Taylor, I'm the driver. Let's read it together first, then we'll switch roles.", hint: "set up the role-play, assign roles, then swap" },
        ],
      },
      {
        id: "02",
        label: "② 〈ます形〉ましょうか",
        subtitle: "申し出（offer）",
        explain: [
          { ja: "「ましょうか」を使った申し出と「ましょう」（6課）の違いを説明してください。", en: "Masu-form + ましょうか is an offer. Shall I help you? Only the speaker does the action. But 行きましょう from Lesson 6 means let's go together. Both people act together. The context shows which one.", hint: "offer vs suggestion, speaker vs together" },
          { ja: "「荷物を持ちましょうか」という申し出に対して「ええ、お願いします」と「いいえ、けっこうです」で答える違いを説明してください。", en: "To accept an offer: ええ、お願いします — yes, please. To decline: いいえ、けっこうです — no, thank you. Say it with a smile to sound warm.", hint: "accept with ええ, decline with いいえ" },
          { ja: "「ましょうか」のイントネーションが重要だと説明してください。", en: "Intonation matters. Masu-form + ましょうか rises at the end, like a question. If you lower it, it sounds like you already decided. Model the rising intonation clearly.", hint: "rising intonation, question tone" },
        ],
        run: [
          { ja: "「ましょうか」の練習Bを始める。動詞を「〜ましょうか」に変えて申し出る練習だと伝え、例（荷物を持ちます→荷物を持ちましょうか）を示してください。", en: "Let's practice offering help. Change the verb to 〜ましょうか. For example, 荷物を持ちます becomes 荷物を持ちましょうか. Ready? Number one, please.", hint: "start offer drill, show example, call number 1" },
          { ja: "生徒の「ましょうか」が下がり調子だった。質問のように語尾を上げるよう、やさしく直してもう一度言わせてください。", en: "Nice! One small thing — let it rise at the end, like a question: 持ちましょうか? Try it once more.", hint: "correct falling intonation, model rising" },
          { ja: "受け答えの練習に移る。あなたが申し出るので、生徒に「ええ、お願いします」で受けるよう指示してください。", en: "Now let's do a mini-exchange. I'll make an offer, and you accept with ええ、お願いします. Here we go.", hint: "set up accept-response practice" },
          { ja: "今度は生徒に「いいえ、けっこうです」で丁寧に断るよう指示し、笑顔を添えるとよいと伝えてください。", en: "This time, decline politely with いいえ、けっこうです. Add a smile so it sounds warm. Ready?", hint: "set up polite-decline practice, add warmth tip" },
        ],
      },
      {
        id: "03",
        label: "③ 〈て形〉います",
        subtitle: "今していること（progressive action）",
        explain: [
          { ja: "「te形 + います」の意味を説明してください。", en: "Te-form + います means an action happening right now. Taylor is making a phone call now. The question is 何をしていますか — what are you doing? The negative is ていません — not doing.", hint: "action happening now, progressive" },
          { ja: "「今、雨が降っていますか」に対して「はい、降っています」と「はい、います」の違いを説明してください。", en: "Important: answer with the same verb. Is it raining? Yes, it is raining — はい、降っています. Not はい、います. Repeat the verb: 降っています or 降っていません.", hint: "repeat the verb in the answer" },
          { ja: "「読みます」と「読んでいます」の時間的な違いを説明してください。", en: "読みます talks about the future or a habit. 読んでいます means the action is happening right now. For example, レポートを書いています means I'm writing the report at this moment.", hint: "future/habit vs now" },
        ],
        run: [
          { ja: "「〜ています」の練習Bを始める。「今、何をしていますか」に絵や語を見て「〜ています」で答える練習だと伝え、例（コーヒーを飲みます→コーヒーを飲んでいます）を示してください。", en: "Let's practice. I'll ask 何をしていますか, and you answer with 〜ています. For example, コーヒーを飲みます becomes コーヒーを飲んでいます. Number one, please.", hint: "start ています drill, show example" },
          { ja: "生徒が「はい、います」と答えた。動詞を繰り返して「はい、降っています」と言うよう、やさしく訂正してください。", en: "Close! Repeat the verb instead: not はい、います, but はい、降っています. Let's try again.", hint: "correct はい、います, repeat the verb" },
          { ja: "生徒が黙ってしまった。ペンを持って書くふりをし、「何をしていますか」と聞いて、必要なら自分で「レポートを書いています」と答えてみせてください（無口対応）。", en: "Let me act it out — look, I'm holding a pen. 何をしていますか? … レポートを書いています. Now you try one.", hint: "silent-student support, act out and model" },
          { ja: "生徒がうまく言えたので、はっきり褒めて次の問題へ進めてください。", en: "That was great — really natural! Let's move on to the next one.", hint: "praise and move on" },
          { ja: "練習を締める。よくできたと伝え、今日のゴール（今していることが言える）を確認してから次へ進むと伝えてください。", en: "Nice work today. You can now say what someone is doing right now. Let's check that off and keep going.", hint: "wrap up, confirm the can-do, transition" },
        ],
      },
    ],
  },



  // ============================================================
  //  ▼ Dec先生レッスン復習(英語レッスンで習った内容)
  //    group: "dec" を付けると、アプリの課選択画面で
  //    「Dec先生レッスン復習」のグループに分かれて表示されます。
  //    activityLabels / activityHints で「練習の種類」の表示も課ごとに変えられます。
  // ============================================================
  dec01: {
    id: "dec01",
    label: "Dec先生レッスン復習",
    subtitle: "自己紹介 / 教室英語 / 語彙説明 / スモールトーク",
    group: "dec",
    activityLabels: { explain: "① 表現を言う", run: "② 実演・やりとり" },
    activityHints: {
      explain: "レッスンで習った表現を、一文ずつ英語で言う練習です。",
      run: "実際の場面を想定して、続けて英語でやりとりする練習です。",
    },
    points: [
      {
        id: "01",
        label: "① 教師としての自己紹介",
        subtitle: "online first lesson",
        explain: [
          { ja: "オンラインの初回レッスンで、名前と職業をシンプルに名乗る", en: "Hi, I'm Hikari. I'm a Japanese teacher. Today, we'll practise basic Japanese conversation.", hint: "name → job → today's plan" },
          { ja: "冬は特にシチューやスープを作るのが好き、と趣味を一言添える", en: "I like cooking, especially stew and soup in winter.", hint: "especially + season" },
          { ja: "間違えても大丈夫、いつでも質問していい、と安心させる", en: "Please don't worry if you make mistakes. You can ask me questions anytime.", hint: "don't worry if... / anytime" },
          { ja: "ネパール・ミャンマー・中国など、いろいろな国の生徒を教えていると伝える", en: "I teach students from different countries, including Nepal, Myanmar, and China.", hint: "from different countries, including..." },
          { ja: "自己紹介を通しで言う(名前 → 担当 → 生徒 → 今日の内容 → 安心の一言)", en: "Hi, I'm Hikari. I'm your Japanese teacher. I teach students from different countries, including Nepal, Myanmar, and China. In today's lesson, we'll practise basic Japanese conversation. Please don't worry if you make mistakes. You can ask me questions anytime.", hint: "the full five-move version" },
          { ja: "最近転職したこと(前は会社勤め、今は日本語学校で教えている)を英語で言う", en: "My name is Hikari. Recently I changed my job. I used to work in an office, but now I teach at a Japanese language school.", hint: "used to work ... but now" },
          { ja: "子どもを迎えに行って家に連れて帰った、と英語で言う", en: "I have two children, and I picked them up and brought them home.", hint: "pick up / bring home" },
          { ja: "日本語の文法を英語で説明するのは難しい、と正直に伝える", en: "Explaining Japanese grammar in English is difficult, and talking with the students can be difficult too.", hint: "explaining ... is difficult" },
        ],
        run: [
          { ja: "レッスン冒頭。生徒に挨拶して、調子を尋ねる", en: "Hi, good to see you. How are you today?", hint: "greet → ask how they are" },
          { ja: "自己紹介のあと、生徒にも自己紹介をお願いする", en: "Now, could you introduce yourself? Just your name, your country, and what you do.", hint: "could you...? / name, country, job" },
          { ja: "生徒の答えを受けて、あいづちを打ってからレッスンに入る", en: "That sounds nice. Thank you. Now, let's start today's lesson.", hint: "react → move on" },
          { ja: "生徒が緊張しているので、リラックスさせてから始める", en: "Please relax. We'll go slowly, and you can ask me questions anytime.", hint: "reassure before starting" },
        ],
      },
      {
        id: "02",
        label: "② 教室で使う指示の英語",
        subtitle: "classroom instructions",
        explain: [
          { ja: "私のあとについて繰り返してください、と指示する", en: "Please repeat after me.", hint: "repeat after me (NOT 'speak after me')" },
          { ja: "まず聞いてください、と指示する", en: "Please listen first.", hint: "listen first" },
          { ja: "これを書き取ってください、と指示する", en: "Please write this down.", hint: "write ... down" },
          { ja: "一緒に練習しましょう、と誘う", en: "Let's practise together.", hint: "let's + together" },
          { ja: "文を一つ作れますか、と尋ねる", en: "Can you make one sentence?", hint: "make one sentence" },
          { ja: "その文を声に出して読んでください、と指示する", en: "Please read the sentence aloud.", hint: "read ... aloud" },
          { ja: "例を出しますね、と前置きする", en: "I'll give you an example.", hint: "give you an example" },
          { ja: "もう一度やってみましょう、と促す", en: "Let's try one more time.", hint: "one more time" },
          { ja: "質問はありますか、と確認する", en: "Do you have any questions?", hint: "any questions" },
          { ja: "「もう一回言って」を正しい形で言う(Please say one more. は不自然)", en: "Please say it one more time.", hint: "say IT one more time" },
        ],
        run: [
          { ja: "「おはようございます」をリピートさせる", en: "Please repeat after me: おはようございます.", hint: "repeat after me + the target phrase" },
          { ja: "生徒が言えたのでほめて、次は文を作らせる", en: "Good. Now, please make one sentence.", hint: "praise → next task" },
          { ja: "生徒が黙ってしまったので、まず聞かせてから一緒にやると伝える", en: "No problem. Please listen first, and then let's practise together.", hint: "listen first → together" },
          { ja: "書き取らせてから、声に出して読ませる", en: "Please write this down. Now, please read the sentence aloud.", hint: "write → read aloud" },
          { ja: "うまくできなかったので、励ましてもう一度やらせる", en: "Don't worry. Let's try one more time.", hint: "reassure → retry" },
          { ja: "練習の締めに、ほめてから質問がないか確認する", en: "Good job. Do you have any questions?", hint: "praise → check questions" },
        ],
      },
      {
        id: "03",
        label: "③ 語彙をやさしく説明する",
        subtitle: "word → simple meaning → example",
        explain: [
          { ja: "説明の型(語 → やさしい意味 → 例)そのものを英語で伝える", en: "I'll explain it in three steps: the word, a simple meaning, and one example.", hint: "word, meaning, example" },
          { ja: "「おいしい」を型に沿って説明する", en: "おいしい means delicious. We use it when food tastes good. For example, このラーメンはおいしいです — this ramen is tasty.", hint: "means ... / we use it when ... / for example" },
          { ja: "「便利」を型に沿って説明する", en: "便利 means convenient. We use it when something is useful and easy. For example, smartphones are convenient.", hint: "useful and easy" },
          { ja: "「大丈夫」を型に沿って説明する", en: "大丈夫 means OK, or fine. We use it to check if someone is all right, and also to say 'no problem.' For example, 大丈夫ですか — are you OK?", hint: "two uses: check / no problem" },
          { ja: "「もったいない」を型に沿って説明する", en: "もったいない is used when something good is wasted. For example, when you throw away food that is still fine to eat, we say もったいない.", hint: "something good is wasted" },
          { ja: "「よろしくお願いします」は直訳が難しいことを説明する", en: "This phrase is difficult to translate directly. We use it when we meet someone, start working together, or ask for help. The English meaning changes depending on the situation.", hint: "no direct translation; depends on the situation" },
        ],
        run: [
          { ja: "語彙説明の前に、簡単に説明しますね、と前置きする", en: "I'll explain this word in a simple way — the meaning first, and then one example.", hint: "set up the explanation" },
          { ja: "説明のあと、生徒にその語を使った文を作らせる", en: "Now, can you make one sentence with おいしい?", hint: "make one sentence with ..." },
          { ja: "生徒が意味を取り違えたので、やさしく直してもう一つ例を出す", en: "Almost. That's a little different. Let me give you another example.", hint: "gentle correction → another example" },
          { ja: "この語を自分の国の言葉でどう言うか聞いてみる", en: "How do you say this word in your language? I'm curious.", hint: "in your language" },
          { ja: "難しい語だったので、今は完璧に覚えなくていいと伝える", en: "This one is difficult, so please don't worry. You'll get used to it.", hint: "reassure about a hard word" },
        ],
      },
      {
        id: "04",
        label: "④ 生徒とのスモールトーク",
        subtitle: "before / after class",
        explain: [
          { ja: "今日はどうだったか聞く", en: "How was your day?", hint: "how was ..." },
          { ja: "今日は仕事だったか聞く", en: "Did you work today?", hint: "did you ...?" },
          { ja: "学校はどうだったか聞く", en: "How was school?", hint: "how was ..." },
          { ja: "今週日本語を勉強したか聞く", en: "Did you study Japanese this week?", hint: "this week" },
          { ja: "週末は何をしたか聞く", en: "What did you do at the weekend?", hint: "at the weekend" },
          { ja: "日本食は好きか聞く", en: "Do you like Japanese food?", hint: "do you like ...?" },
          { ja: "日本に来たことがあるか聞く", en: "Have you ever been to Japan?", hint: "have you ever been ...?" },
        ],
        run: [
          { ja: "生徒の話に「いいですね」と反応する", en: "That sounds nice.", hint: "that sounds ..." },
          { ja: "忙しかったという話に反応する", en: "That sounds busy.", hint: "that sounds ..." },
          { ja: "興味を示して聞き返す", en: "Really? That's interesting. Tell me more.", hint: "show interest → ask for more" },
          { ja: "できたことをほめる", en: "Good job.", hint: "short praise" },
          { ja: "難しいと言う生徒を励ます", en: "Don't worry. Let's practise together.", hint: "reassure + invite" },
          { ja: "生徒の集中が切れてきたので、一緒にやろうと促す(engaged を使って)", en: "If you're not engaged, it's easy to lose focus. Let's do this part together.", hint: "engaged = focused / taking part" },
        ],
      },
    ],
  },

  decWaGa: {
    id: "decWaGa",
    label: "は・が の説明(別枠)",
    subtitle: "は と が の違いを英語で説明する",
    group: "dec",
    activityLabels: { explain: "① 英語で説明", run: "② 授業での進め方" },
    activityHints: {
      explain: "「は」と「が」の違いを、初級者にわかるように英語で説明する練習です。",
      run: "説明の導入・確認・訂正など、授業の進め方を英語で言う練習です。",
    },
    points: [
      {
        id: "01",
        label: "① は = 主題",
        subtitle: "topic marker",
        explain: [
          { ja: "「は」が主題(今、話題にしていること)を示すことを英語で説明する", en: "は marks the topic — the thing we want to talk about. 今日は暑いです means 'as for today, it's hot.' We're talking about today.", hint: "topic = what we want to talk about" },
          { ja: "「は」を使うと、聞き手に「今の話題はこれだ」と伝わることを英語で説明する", en: "The topic marker tells the listener what the sentence is about. Once you say 今日は, the listener understands that today is the subject.", hint: "tells the listener the subject" },
          { ja: "初級者向けに、一言でまとめて英語で言う", en: "Simple version: は introduces the topic, and が points out which one. Don't worry — you'll get a feel for it with practice.", hint: "one-line summary" },
        ],
        run: [
          { ja: "今日は「は」と「が」の違いをやると英語で伝え、まず聞くよう指示する", en: "Today, I'll explain the difference between は and が. Please listen first, and then we'll practise together.", hint: "announce the topic → listen first" },
          { ja: "説明のあと、質問がないか確認してから練習に入る", en: "That was a lot. Do you have any questions before we practise?", hint: "check questions → move to practice" },
        ],
      },
      {
        id: "02",
        label: "② が = 比較・選び出し",
        subtitle: "comparison / new information",
        explain: [
          { ja: "「が」は比べたり、どれか一つを選び出したりするときに使うことを英語で説明する", en: "が is used when we pick one thing out, often to compare. If we want to compare today and yesterday, we use が: 今日が暑いです — today is the hot one.", hint: "pick one out / compare" },
          { ja: "「が」を使うと「何かを比べている」と相手に伝わることを英語で説明する", en: "When you use が, people understand you are comparing something, or answering the question 'which one?'", hint: "comparing / which one" },
          { ja: "「誰が来ましたか」の答えにも「が」を使うことを例で説明する", en: "Look at the question 誰が来ましたか — who came? The answer keeps が: 田中さんが来ました. New information takes が.", hint: "question with が → answer with が" },
          { ja: "自分も二つの助詞を混同することがある、と正直に伝える", en: "To be honest, I sometimes mix up the two particles myself, so please take your time.", hint: "mix up the two particles" },
        ],
        run: [
          { ja: "二つの例文を並べて、違いに気づかせる", en: "Look at these two sentences. Can you tell me the difference between は and が here?", hint: "compare two sentences → elicit" },
          { ja: "生徒が「が」を使うべきところで「は」を使ったので、やさしく直してもう一度言わせる", en: "Almost! Here we're comparing, so we need が. Let's try that sentence one more time.", hint: "gentle correction → retry" },
          { ja: "生徒の集中が切れてきたので、一緒にやろうと促してから続ける", en: "This part is difficult, so let's do it together. If you're not engaged, it's easy to lose focus.", hint: "re-engage → continue" },
        ],
      },
    ],
  },

};
