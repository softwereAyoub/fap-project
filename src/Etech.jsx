import React, { useState, useEffect, useRef } from 'react';

// خوارزمية التوليد اللانهائي لتسلسلات التحفيز البصري والسمعي الذكي
const generateSequence = (level) => {
  const size = 9; 
  const sequenceLength = 2 + level; 
  const newSequence = [];
  
  for (let i = 0; i < sequenceLength; i++) {
    const randomGridId = Math.floor(Math.random() * size);
    newSequence.push(randomGridId);
  }
  
  const displayTime = Math.max(300, 900 - (level * 50)); 
  return { sequence: newSequence, displayTime };
};

export default function Etech() {
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState('SETUP'); // SETUP, IDLE, FLASHING, USER_INPUT, SUCCESS, FAILED, COMPLETED
  const [levelData, setLevelData] = useState(() => generateSequence(1));
  const [userSequence, setUserSequence] = useState([]);
  const [activeCard, setActiveCard] = useState(null);
  const [score, setScore] = useState(0);
  const [focusIndex, setFocusIndex] = useState(100); 
  const [statusMessage, setStatusMessage] = useState('اختر مدة التدريب العصبي للبدء ⏱️');
  const [timeLeft, setTimeLeft] = useState(0); 

  // الميزات السابقة: الإحصائيات والوضع المضيء
  const [victoryCount, setVictoryCount] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // جلب البيانات المخزنة محلياً عند تشغيل التطبيق لأول مرة
  useEffect(() => {
    const savedVictories = localStorage.getItem('neuro_victories');
    if (savedVictories) {
      setVictoryCount(parseInt(savedVictories, 10));
    }
    
    const savedTheme = localStorage.getItem('neuro_theme');
    if (savedTheme === 'light') {
      setIsLightMode(true);
    }
  }, []);

  // إدارة العداد التنازلي الشامل للجلسة
  useEffect(() => {
    if (gameState !== 'SETUP' && gameState !== 'COMPLETED' && timeLeft > 0) {
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            clearTimeout(timerRef.current);
            setGameState('COMPLETED');
            setStatusMessage('🎉 عظيم! أنهيت جلسة التدريب كاملة بنجاح وتطهير كامل للدماغ!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [gameState, timeLeft]);

  // تبديل الثيم وحفظ الخيار
  const toggleTheme = () => {
    setIsLightMode(prev => {
      const nextMode = !prev;
      localStorage.setItem('neuro_theme', nextMode ? 'light' : 'dark');
      return nextMode;
    });
  };

  // دالة تسجيل الانتصار القاسي على الرغبة الحارقة
  const handleRegisterVictory = () => {
    const newCount = victoryCount + 1;
    setVictoryCount(newCount);
    localStorage.setItem('neuro_victories', newCount.toString());
    setStatusMessage(`🔥 تم تسجيل الانتصار رقم ${newCount}! فصك الجبهي يرسخ قوته الآن.`);
  };

  const handleSelectDuration = (minutes) => {
    setTimeLeft(minutes * 60);
    setGameState('IDLE');
    setStatusMessage('اضغط على انطلاق لبدء تمرين التركيز الخارق! 🧠');
  };

  // ميزة الخروج وسط الجلسة وإعادة الضبط الآمن
  const handleExitSession = () => {
    clearInterval(countdownRef.current);
    clearTimeout(timerRef.current);
    setActiveCard(null);
    setUserSequence([]);
    setLevel(1);
    setLevelData(generateSequence(1));
    setScore(0);
    setFocusIndex(100);
    setTimeLeft(0);
    setGameState('SETUP');
    setStatusMessage('تم إلغاء الجلسة وإعادة صيانة المؤشرات. اختر مدة جديدة ⏱️');
  };

  const triggerAudioFeedback = (id) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 200 + (id * 50); 
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.2);
      setTimeout(() => audioCtx.close(), 250);
    } catch (e) {
      console.log("Audio context blocked");
    }
  };

  const startNeuroFlash = async () => {
    if (timeLeft <= 0) return;
    setUserSequence([]);
    setGameState('FLASHING');
    setStatusMessage('راقب الوميض بعناية شديدة ولا تفقد التركيز! ⚡');

    const { sequence, displayTime } = levelData;

    for (let i = 0; i < sequence.length; i++) {
      if (timeLeft <= 0) break;
      await new Promise(resolve => {
        setActiveCard(sequence[i]);
        triggerAudioFeedback(sequence[i]);
        timerRef.current = setTimeout(() => {
          setActiveCard(null);
          timerRef.current = setTimeout(resolve, 150); 
        }, displayTime);
      });
    }

    if (timeLeft > 0) {
      setGameState('USER_INPUT');
      setStatusMessage('الآن! أعد تكرار النمط بنفس الترتيب تماماً ⚡');
    }
  };

  const handleCardClick = (id) => {
    if (gameState !== 'USER_INPUT') return;

    const currentStep = userSequence.length;
    const expectedId = levelData.sequence[currentStep];
    const updatedSequence = [...userSequence, id];
    setUserSequence(updatedSequence);

    setActiveCard(id);
    setTimeout(() => setActiveCard(null), 150);

    if (id !== expectedId) {
      setStatusMessage('🔴 تشتت الانتباه! أعد تصفير المساحة والتركيز من جديد...');
      setGameState('FAILED');
      setFocusIndex(prev => Math.max(20, prev - 15));
      
      timerRef.current = setTimeout(() => {
        setUserSequence([]); 
        setLevelData(generateSequence(1)); 
        setLevel(1);
        if (timeLeft > 0) {
          setGameState('IDLE');
          setStatusMessage('تم إخلاء الذاكرة. اضغط انطلاق وتحدّ نفسك مرة أخرى! 🔄');
        }
      }, 1500);
      return;
    }

    if (updatedSequence.length === levelData.sequence.length) {
      setScore(prev => prev + (level * 150));
      setFocusIndex(prev => Math.min(100, prev + 5));
      setStatusMessage('🎉 مذهل! خلايا دماغك تترابط وتنتصر على الضبابية والتشتت!');
      setGameState('SUCCESS');
    }
  };

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setLevelData(generateSequence(nextLvl));
    setGameState('IDLE');
    setStatusMessage(`جاهز للمستوى العالي ${nextLvl}؟ اضغط انطلاق وعزز انتباهك! 🚀`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const brainHealingPercentage = Math.min(100, victoryCount * 5);

  return (
    <div className={`min-h-screen font-sans p-4 flex flex-col items-center justify-between rtl transition-colors duration-300 ${isLightMode ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'}`} dir="rtl">
      
      {/* البار العلوي المساعد: تغيير المود + زر الإحصائيات */}
      <div className="w-full max-w-md flex justify-between items-center mb-2 px-1">
        <button 
          onClick={() => setShowStats(!showStats)} 
          className={`text-[15px] font-bold px-3 py-1.5 rounded-lg border transition-all ${isLightMode ? 'bg-white border-slate-300 text-slate-700 shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
        >
          {showStats ? '⬅️ العودة للتمرين' : '📊 إحصائيات'}
        </button>
        
        <button 
          onClick={toggleTheme} 
          className={`text-sm p-1.5 rounded-lg border transition-all ${isLightMode ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-900 border-slate-800'}`}
        >
          {isLightMode ? '🌙 الوضع المظلم' : '☀️ الوضع المضيء'}
        </button>
      </div>

      {showStats ? (
        /* 📊 لوحة تحليلات ونمو خلايا الدماغ المتطورة (Stats View) */
        <main className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl flex flex-col gap-5 my-auto ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <h2 className="text-center font-black text-[21px] text-cyan-500">لوحة المتابعة </h2>
          
          <div className={`p-4 rounded-2xl border text-center ${isLightMode ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-900'}`}>
            <span className="text-slate-400 block text-[16px] mb-1">إجمالي الجلسات التي اكملتها</span>
            <span className="text-3xl font-black text-emerald-500 font-mono">{victoryCount} مرة 🔥</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[15px] font-bold text-slate-400">
              <span>معدل التطور</span>
              <span className="text-cyan-400">{brainHealingPercentage}%</span>
            </div>
            <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 border ${isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${Math.max(5, brainHealingPercentage)}%` }}
              ></div>
            </div>
          </div>

          <blockquote className={`text-[15px] leading-relaxed p-3 rounded-xl border-r-4 border-cyan-500 ${isLightMode ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950/50 text-slate-400 border-slate-800'}`}>
            {brainHealingPercentage === 0 ? (
              "لم تبدأ بعد. مع كل دقيقة تقاوم فيها الرغبة وتلعب، يتدفق الدم لإيقاظ الخلايا العصبية الكسولة وتسميك قشرة القرار."
            ) : brainHealingPercentage < 40 ? (
              "مرحلة الإنعاش الأولي: الفص الجبهي يستعيد إشاراته الكهربائية تدريجياً، ومكابح الإرادة بدأت بالعمل مجدداً."
            ) : brainHealingPercentage < 80 ? (
              "مرحلة البناء التشابكي الكثيف: المادة الرمادية تتوسع، والذاكرة العاملة تطرد التخيلات القديمة بمرونة مذهلة."
            ) : (
              "حالة الليونة والاستقرار العالي: الفص الجبهي يمتلك الآن سيطرة كاملة وقدرة حديدية على فلترة الاندفاعات."
            )}
          </blockquote>
        </main>
      ) : (
        /* 🕹️ واجهة اللعبة الرئيسية المستقرة */
        <>
          {/* الهيدر: لوحة تحليل البيانات العصبية والعداد التنازلي */}
          <header className={`w-full max-w-md border rounded-2xl p-4 shadow-2xl flex justify-between items-center text-xs ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div>
              <span className="text-slate-400 block text-[15px] mb-0.5">مستوى جودة الانتباه</span>
              <span className="text-sm font-black text-cyan-500">
                {gameState === 'SETUP' ? 'في الانتظار' : `المستوى الحالي ${level}`}
              </span>
            </div>
            <div className={`text-center px-4 py-1.5 rounded-xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-slate-400 block text-[15px] mb-0.5">الوقت المتبقي للجلسة</span>
              <span className={`text-[15px] font-bold font-mono ${timeLeft < 30 && gameState !== 'SETUP' ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`}>
                {gameState === 'SETUP' ? '--:--' : formatTime(timeLeft)} ⏱️
              </span>
            </div>
            <div className="text-left">
              <span className="text-slate-400 block text-[15px] mb-0.5">مؤشر التركيز الصافي</span>
              <span className={`text-[15px] font-black ${focusIndex > 70 ? 'text-emerald-500' : focusIndex > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                {focusIndex}% {focusIndex > 70 ? '🟢 حاد' : focusIndex > 40 ? '🟡 متوسط' : '🔴 مشتت'}
              </span>
            </div>
          </header>

          {/* شاشة الرسائل الإرشادية الفورية */}
          <div className={`w-full max-w-md my-3 border rounded-xl p-3 text-center text-[17px] font-semibold shadow-inner ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <p className={gameState === 'FAILED' ? 'text-rose-500 animate-pulse' : gameState === 'SUCCESS' || gameState === 'COMPLETED' ? 'text-emerald-500 font-bold' : isLightMode ? 'text-slate-600' : 'text-slate-300'}>
              {statusMessage}
            </p>
          </div>

          {/* شاشة اختيار مدة التمرين والتحمل (تمت إضافة الـ 5 دقائق هنا) */}
          {gameState === 'SETUP' ? (
            <main className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl flex flex-col  gap-4 my-auto ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-center text-[16px] font-bold mb-2 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>حدد مدة التدريب وعزل الصور الذهنية:</h3>
              <div className="grid grid-cols-2 gap-3">
                {[5, 10, 15, 20, 30].map((minutes) => {

                  if(minutes != 30){
                    return(
                       <button
                    key={minutes}
                    onClick={() => handleSelectDuration(minutes)}
                    className={`border font-bold p-4 rounded-2xl transition-all duration-150 text-center active:scale-95 text-xs flex flex-col items-center justify-center gap-1 ${isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-cyan-500 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-white hover:border-cyan-500 hover:bg-slate-900'}`}
                  >
                    <span className="text-lg font-black text-cyan-500">{minutes}</span>
                    <span className="text-slate-400 text-[15px]">دقيقة تركيز </span>
                  </button>
                    )
                  }else{
                   return(
                           <button
                    key={minutes}
                    onClick={() => handleSelectDuration(minutes)}
                    className={`border font-bold p-4 rounded-2xl transition-all duration-150 text-center active:scale-95 text-xs flex flex-col items-center justify-center gap-1 minutes30 ${isLightMode ? 'bg-slate-50 border-slate-200 text-slate-800 hover:border-cyan-500 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-white hover:border-cyan-500 hover:bg-slate-900'}`}
                  >
                    <span className="text-lg font-black text-cyan-500">{minutes}</span>
                    <span className="text-slate-400 text-[15px]">دقيقة تركيز </span>
                  </button>
                   )
                  }
                }
                 
                )}
              </div>
            </main>
          ) : gameState === 'COMPLETED' ? (
            /* شاشة الاكتمال النهائي مع زر التغلب البطل */
            <main className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 my-auto text-center ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="text-5xl animate-bounce">👑</div>
              <h2 className="text-emerald-500 font-black text-base">اكتمل التطهير بنجاح!</h2>
              <p className={`text-xs leading-relaxed max-w-xs ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                رصيدك الإجمالي اليوم <span className="text-amber-500 font-bold">{score} XP</span>. الفص الجبهي الآن مستيقظ وممتلئ بالأكسجين، ومساحة الذاكرة البصرية تم تفريغها بالكامل.
              </p>
              
              <button
                onClick={handleRegisterVictory}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-all text-center border-b-4 border-rose-700 animate-pulse"
              >
                لقد تغلبت على الرغبة الحارقة بنجاح! 🔥
              </button>

              <button
                onClick={() => {
                  setScore(0);
                  setLevel(1);
                  setFocusIndex(100);
                  setGameState('SETUP');
                  setStatusMessage('اختر مدة التدريب العصبي للبدء ⏱️');
                }}
                className={`mt-2 w-full font-bold py-3 rounded-xl text-[16px] shadow-md transition-all active:scale-95 border ${isLightMode ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'}`}
              >
                بدء جلسة إنقاذ جديدة 🔄
              </button>
            </main>
          ) : (
            /* لوحة التحفيز العصبي البصري ثلاثية الأبعاد */
            <main className={`w-full max-w-xs aspect-square grid grid-cols-3 grid-rows-3 gap-2 p-3 rounded-3xl border-2 shadow-2xl relative ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              {[...Array(9)].map((_, id) => {
                const isActive = activeCard === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleCardClick(id)}
                    disabled={gameState !== 'USER_INPUT'}
                    className={`rounded-2xl transition-all duration-150 relative overflow-hidden active:scale-95 border ${
                      isActive 
                        ? 'bg-gradient-to-br from-cyan-400 to-indigo-500 border-white shadow-[0_0_25px_rgba(34,211,238,0.6)] scale-95' 
                        : isLightMode ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    } ${gameState === 'USER_INPUT' ? 'cursor-pointer shadow-md' : 'cursor-default'}`}
                  >
                    <span className={`absolute inset-0 flex items-center justify-center font-mono text-xs font-bold transition-opacity ${isActive ? 'text-white text-base opacity-100 font-black' : 'text-slate-400 opacity-20'}`}>
                      {id + 1}
                    </span>
                  </button>
                );
              })}
            </main>
          )}

          {/* عداد النقرات المتبقية للمستخدم لمنع التشتت */}
          <div className="text-[15px] text-slate-400 my-2 h-4 font-medium">
            {gameState === 'USER_INPUT' && `تم إدخال (${userSequence.length} من أصل ${levelData.sequence.length}) خطوات`}
          </div>

          {/* أزرار مركز التحكم السفلي للعبة */}
          <footer className="w-full max-w-md pt-2  flex flex-col gap-2">
            {gameState === 'SETUP' || gameState === 'COMPLETED' ? (
              <div className="text-center text-[10px] text-slate-500 py-4 font-mono">
                Neuro-Buffer Neuroplasticity Eng. v3.1
              </div>
            ) : (
              <>
                {/* أزرار اللعب العادية */}
                {gameState === 'IDLE' || gameState === 'FAILED' ? (
                  <button
                    onClick={startNeuroFlash}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-xl text-[16px] shadow-xl border-b-4 border-cyan-800 active:scale-95 transition-all text-center"
                  >
                    إطلق نبضة وميض التركيز 🚀
                  </button>
                ) : gameState === 'SUCCESS' ? (
                  <button
                    onClick={nextLevel}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-[16px] shadow-xl border-b-4 border-emerald-800 active:scale-95 transition-all text-center"
                  >
                    الانتقال للمستوى الأعلى 🚀
                  </button>
                ) : (
                  <button
                    disabled
                    className={`w-full font-bold py-4 rounded-xl text-[16px] border-b-4 text-center cursor-not-allowed ${isLightMode ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-slate-800 border-slate-950 text-slate-500'}`}
                  >
                    {gameState === 'FLASHING' ? '⚡ استوعب الوميض بـعـيـنـيـك...' : '📥 أعد كتابة الشفرة الآن...'}
                  </button>
                )}

                {/* زر الخروج المضاف: يظهر فقط عندما تبدأ أي جلسة لعب بنشاط */}
                <button
                  onClick={handleExitSession}
                  className={`w-full py-2.5 text-[16px] font-bold rounded-xl transition-all active:scale-95 text-center border border-dashed ${isLightMode ? 'border-rose-300 text-rose-600 hover:bg-rose-50' : 'border-rose-900/50 text-rose-400 hover:bg-rose-950/20'}`}
                >
                  🚪 إنهاء الجلسة والخروج فوراً
                </button>
              </>
            )}
          </footer>
        </>
      )}
    </div>
  );
}