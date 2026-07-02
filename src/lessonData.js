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
};
