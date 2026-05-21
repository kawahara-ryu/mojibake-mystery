// === Audio ===
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(f,t,d,v=0.1){if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=t;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);o.stop(audioCtx.currentTime+d);}
function playCorrect(){playTone(600,'sine',0.1);setTimeout(()=>playTone(800,'sine',0.2),100);}
function playWrong(){playTone(200,'sawtooth',0.3,0.1);}
function playClick(){playTone(800,'square',0.02,0.02);} // タイプライター音を少し小さく
function playHint(){playTone(880,'sine',0.1,0.1); setTimeout(()=>playTone(1760,'sine',0.1,0.1),100);} // ヒント音
function playClear(){[440,554,659,880].forEach((f,i)=>setTimeout(()=>playTone(f,'sine',0.3),i*200));}

// === State ===
let currentStage = 0, totalScore = 0, mistakes = [], timerInterval = null, timeLeft = 0, isProcessing = false, qIndex = 0;
let hintUsed = false;
let typewriterInterval = null, scrambleInterval = null;

const screens = { title: document.getElementById('screen-title'), game: document.getElementById('screen-game'), clear: document.getElementById('screen-clear') };

function startGame() { playClick(); currentStage=0; totalScore=0; mistakes=[]; screens.title.classList.remove('active'); screens.game.classList.add('active'); loadStage(0); }

function loadStage(n) {
    currentStage = n; isProcessing = false; qIndex = 0;
    clearInterval(timerInterval);
    const stages = [gameData.stage1, gameData.stage2, gameData.stage3, gameData.stage4];
    if (n >= stages.length) { showClear(); return; }
    const s = stages[n];
    document.getElementById('stage-title').textContent = s.title;
    document.getElementById('instruction-box').textContent = s.instruction;
    s._shuffled = [...s.questions].sort(() => Math.random() - 0.5);
    
    if (s.timePerQ > 0) {
        document.getElementById('timer').textContent = `--秒`;
    } else {
        document.getElementById('timer').textContent = `∞`;
        document.getElementById('time-bar').style.width = '100%';
    }
    showQuestion();
}

function showQuestion() {
    const stages = [gameData.stage1, gameData.stage2, gameData.stage3, gameData.stage4];
    const s = stages[currentStage];
    if (qIndex >= s._shuffled.length) {
        clearInterval(timerInterval);
        showFeedback(true, `【 捜査完了 】\n${s.title} の証拠はすべて揃った！`, () => loadStage(currentStage + 1));
        return;
    }
    const q = s._shuffled[qIndex];
    document.getElementById('counter').textContent = `証拠 ${qIndex + 1} / ${s._shuffled.length}`;
    
    // ヒントボタンのリセット
    hintUsed = false;
    const hBtn = document.getElementById('hint-btn');
    hBtn.disabled = false;
    hBtn.classList.remove('used');
    hBtn.textContent = "💡 助手に聞く (Time -5秒)";

    // 選択肢の生成
    const optBox = document.getElementById('options');
    optBox.innerHTML = '';
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
    shuffledOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt'; btn.textContent = opt;
        btn.onclick = () => answerQuestion(opt, q, btn);
        optBox.appendChild(btn);
    });

    isProcessing = true; // 演出中は押せない
    optBox.style.pointerEvents = 'none';

    // 文字化け＆タイプライター演出
    runGarbledEffect(`Q: ${q.question}`, () => {
        isProcessing = false;
        optBox.style.pointerEvents = 'auto';
        // タイマー開始（演出が終わってから）
        if (s.timePerQ > 0) {
            startTimer(s.timePerQ, () => {
                isProcessing = true; totalScore -= 5; playWrong();
                mistakes.push({ stage: stages[currentStage].title, question: q.question, answer: q.answer, explanation: q.explanation });
                showFeedback(false, `【 時間切れ 】\n証拠が隠滅されてしまった！\n\n[探偵メモ]\n${q.explanation}`, () => { qIndex++; showQuestion(); });
            });
        }
    });
}

function runGarbledEffect(realText, callback) {
    const el = document.getElementById('evidence-text');
    clearInterval(typewriterInterval);
    clearInterval(scrambleInterval);
    
    const chars = '縺ゅ↑縺倥▲縺九ｋSJISEUCUTF801A4B%$#@!?';
    let scrambleTime = 0;
    
    // 1. ガチャガチャ文字化けフェーズ (500ms)
    scrambleInterval = setInterval(() => {
        let randStr = '';
        for(let j=0; j<Math.min(realText.length, 20); j++) randStr += chars[Math.floor(Math.random()*chars.length)];
        el.textContent = randStr;
        scrambleTime += 50;
        
        if(scrambleTime >= 500) {
            clearInterval(scrambleInterval);
            // 2. 解読＆タイプライターフェーズ
            el.textContent = '';
            let i = 0;
            typewriterInterval = setInterval(() => {
                el.textContent += realText.charAt(i);
                if(i % 3 === 0) playClick();
                i++;
                if (i >= realText.length) {
                    clearInterval(typewriterInterval);
                    if(callback) callback();
                }
            }, 30); // タイプ速度
        }
    }, 50);
}

// 助手ヒント機能
function useHint() {
    if(hintUsed || isProcessing) return;
    hintUsed = true;
    playHint();
    const hBtn = document.getElementById('hint-btn');
    hBtn.disabled = true;
    hBtn.classList.add('used');
    hBtn.textContent = "💡 助手（対応済）";
    
    // タイムペナルティ
    const stages = [gameData.stage1, gameData.stage2, gameData.stage3, gameData.stage4];
    if (stages[currentStage].timePerQ > 0) {
        timeLeft -= 5;
        if(timeLeft < 0) timeLeft = 0;
        updateTimer();
    }
    
    // 不正解を2つ消す
    const q = stages[currentStage]._shuffled[qIndex];
    const btns = Array.from(document.querySelectorAll('.quiz-opt'));
    const wrongBtns = btns.filter(b => b.textContent !== q.answer);
    
    wrongBtns.sort(() => Math.random() - 0.5);
    if(wrongBtns.length >= 1) wrongBtns[0].classList.add('hidden-opt');
    if(wrongBtns.length >= 2) wrongBtns[1].classList.add('hidden-opt');
}

function answerQuestion(selected, q, btn) {
    if (isProcessing) return; isProcessing = true;
    clearInterval(timerInterval);
    playClick();
    const stages = [gameData.stage1, gameData.stage2, gameData.stage3, gameData.stage4];
    
    if (selected === q.answer) {
        playCorrect(); btn.classList.add('correct'); totalScore += 15;
        showFeedback(true, `【 推理成功 】\nその通りだ！\n\n[探偵メモ]\n${q.explanation}`, () => { qIndex++; showQuestion(); });
    } else {
        playWrong(); btn.classList.add('wrong'); totalScore -= 5;
        document.querySelectorAll('.quiz-opt').forEach(b => { if (b.textContent === q.answer) b.classList.add('correct'); });
        mistakes.push({ stage: stages[currentStage].title, question: q.question, answer: q.answer, explanation: q.explanation });
        showFeedback(false, `【 推理失敗 】\n見当外れだ！\n\n[探偵メモ]\n${q.explanation}`, () => { qIndex++; showQuestion(); });
    }
}

function showClear() {
    playClear(); screens.game.classList.remove('active'); screens.clear.classList.add('active');
    
    // 探偵ランクの判定
    let rank = "";
    if (mistakes.length === 0) rank = "🏆 名探偵ボクバナナ";
    else if (mistakes.length <= 2) rank = "🥇 優秀な調査員";
    else if (mistakes.length <= 5) rank = "🥈 三流探偵";
    else rank = "🥉 迷探偵（窓際族）";
    
    document.getElementById('rank-display').textContent = rank;
    document.getElementById('score-display').textContent = `探偵スコア: ${totalScore} 点`;
    document.getElementById('password-text').textContent = gameData.password;
    
    const area = document.getElementById('review-area');
    if (!mistakes.length) { area.innerHTML = '<p class="review-perfect">完璧な推理だ！君は名探偵になれる素質がある！</p>'; return; }
    area.innerHTML = '';
    mistakes.forEach(m => { const c=document.createElement('div'); c.className='review-card'; c.innerHTML=`<div class="review-stage">${m.stage}</div><div class="review-q">Q: ${m.question}</div><div class="review-a">正解: ${m.answer}</div><div class="review-exp">${m.explanation}</div>`; area.appendChild(c); });
}

function startTimer(sec, cb) { 
    timeLeft=sec; updateTimer(); clearInterval(timerInterval); 
    timerInterval=setInterval(()=>{
        timeLeft--; updateTimer();
        if(timeLeft<=0){ clearInterval(timerInterval); if(cb)cb(); }
    },1000); 
}

function updateTimer() { 
    const el=document.getElementById('timer'); 
    el.textContent=`${timeLeft}秒`; 
    el.className='timer-box '+(timeLeft<=5?'timer-danger':''); 
    
    // ひらめきゲージの更新
    const stages = [gameData.stage1, gameData.stage2, gameData.stage3, gameData.stage4];
    const maxTime = stages[currentStage].timePerQ || 1;
    const bar = document.getElementById('time-bar');
    if(stages[currentStage].timePerQ > 0) {
        const pct = Math.max(0, (timeLeft / maxTime) * 100);
        bar.style.width = pct + '%';
        bar.style.backgroundColor = timeLeft <= 5 ? 'var(--danger-color)' : 'var(--accent-main)';
    }
}

function showFeedback(ok, text, cb) { 
    const ov=document.getElementById('feedback-overlay'); 
    document.getElementById('feedback-title').textContent=ok?'⭕ 推理成功':'❌ 証拠不十分'; 
    document.getElementById('feedback-title').style.color=ok?'var(--success-color)':'var(--danger-color)'; 
    document.getElementById('feedback-text').innerText=text; 
    ov.classList.remove('hidden'); ov._cb=cb; 
}

function closeFeedback() { 
    playClick(); 
    document.getElementById('feedback-overlay').classList.add('hidden'); 
    const ov=document.getElementById('feedback-overlay'); 
    if(ov._cb)ov._cb(); 
}
