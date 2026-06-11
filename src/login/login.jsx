import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Login() {
  const [keyUser, setKeyUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // useEffect(() => {
  //   if(window.navigator.onLine == 'off'){
  //     navigate('/notConnected')
  //   }
  //       // window.addEventListener("offline", () => navigate('/notConnected'));

  // });
      useEffect(() => {
      // if(window.navigator.onLine == 'off'){
      //   navigate('/notConnected')
      // }
          if(!navigator.onLine){
            navigate('/notConnected')
    }
  window.addEventListener("offline", (event) => {
        navigate('/notConnected')
  
  })
   window.addEventListener("online", (event) => {
        navigate('/dashboard')
  
  })
          // window.addEventListener("offline", () => navigate('/notConnected'));
  
    });
  // جلب المسار المستهدف ديناميكياً إن وجد في الرابط، أو التوجه للـ dashboard كافتراضي
  const redirectTo = searchParams.get('redirect') || '/app';

  // === 1. الفحص التلقائي الفوري للكوكيز عند إقلاع الصفحة ===
  useEffect(() => {
    const checkActiveCookie = async () => {
      try {
        console.log('بداية فحص الجلسة...');
        const response = await fetch('https://learn-three-steel.vercel.app/api/check-session', {
          method: 'GET',
          // حاسم جداً: يخبر المتصفح بإرسال الكوكيز المحمية (HttpOnly) تلقائياً للسيرفر لفحصها
          credentials: 'include' 
        });
        const data = await response.json();

        if (response.ok && data.success && data.key_user) {
          console.log('تم العثور على جلسة صالحة، جاري التوجيه...');
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.log("لا توجد جلسة نشطة مخزنة في الكوكيز حالياً.");
      } finally {
        // إنهاء حالة التحميل المبدئية لإظهار الواجهة إذا لم ينجح الفحص تلقائياً
        setIsCheckingAuth(false);
      }
    };

    checkActiveCookie();
  }, [navigate, redirectTo]);

  // === 2. معالجة إرسال البيانات يدوياً عند الضغط على الدخول ===
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!keyUser.trim()) {
      setErrorMessage('الرجاء إدخل المفتاح الخاص بك.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('https://learn-three-steel.vercel.app/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // حاسم جداً: يسمح للمتصفح باستقبال وحفظ الكوكيز الأمنة (HttpOnly / Secure) القادمة من رَد السيرفر
        credentials: 'include', 
        body: JSON.stringify({ keyUser: keyUser.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('تم تسجيل الدخول بنجاح وزرع الكوكي!');
        navigate(redirectTo, { replace: true });
      } else {
        setErrorMessage(data.message || 'المفتاح المدخل غير صحيح أو غير مصرح له.');
      }
    } catch (error) {
      console.error('خطأ في الاتصال بالسيرفر:', error);
      setErrorMessage('فشل الاتصال بالسيرفر، يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  // شاشة الانتظار الصامتة أثناء فحص الكوكيز في أول ثانية لمنع وميض الواجهة
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-slate-500 font-semibold text-sm animate-pulse">جاري فحص اتصالك الآمن...</div>
      </div>
    );
  }

  // === 3. واجهة تسجيل الدخول (تظهر فقط إذا لم ينجح الفحص التلقائي) ===
  // return (
  //   <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4" dir="rtl">
  //     <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl max-w-md w-full flex flex-col gap-6">
        
  //       {/* العناوين والترحيب */}
  //       <div className="text-center flex flex-col gap-2">
  //         <h2 className="text-2xl font-bold text-slate-800">تسجيل الدخول</h2>
  //         <p className="text-xs text-slate-400">أدخل المفتاح السري الممنوح لك لفتح لوحة التحكم الخاصة بك</p>
  //       </div>

  //       {/* نموذج الإدخال */}
  //       <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
  //         <div className="flex flex-col gap-1.5">
  //           <label className="text-xs font-bold text-slate-600">المفتاح الخاص بك (User Key)</label>
  //           <input
  //             type="password"
  //             value={keyUser}
  //             onChange={(e) => setKeyUser(e.target.value)}
  //             placeholder="ضع مفتاحك هنا ..."
  //             className="w-full  px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
  //             disabled={isLoading}
  //           />
  //         </div>

  //         {/* التنبيهات والأخطاء */}
  //         {errorMessage && (
  //           <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl font-medium">
  //             {errorMessage}
  //           </div>
  //         )}

  //         {/* زر الدخول */}
  //         <button
  //           type="submit"
  //           disabled={isLoading}
  //           className={`w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-[8px] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
  //             isLoading ? 'opacity-60 cursor-not-allowed' : ''
  //           }`}
  //         >
  //           {isLoading ? (
  //             <span className="flex items-center gap-1.5">
  //               <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
  //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
  //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  //               </svg>
  //               جاري المصادقة...
  //             </span>
  //           ) : (
  //             'دخول '
  //           )}
  //         </button>
  //       </form>

  //     </div>
  //   </div>
  // );
  return (
  <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans transition-colors duration-300 select-none" dir="rtl">
    
    {/* 🌐 شريط التنقل العلوي (Navbar) */}
    <nav className="w-full bg-white border-b border-slate-100 shadow-sm px-6 py-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-2">
        {/* اللوجو الخاص بالمشروع: يدمج بين العقل والدرع الحامي */}
        <div className="bg-slate-950 text-white p-2  text-[25px] rounded-xl shadow-md flex items-center justify-center font-bold gap-[6px] tracking-wider ">
          <img src="/favicon.png" alt="Logo" className="w-10 h-10 mr-2" /> <span className="mr-1 ">تطبيق</span><span className="text-cyan-400 ">إرادة</span>
        </div>
      </div>
      
      {/* مؤشر الأمان والسرية لطمأنة العميل */}
      <div className="flex items-center gap-1.5 text-slate-500 text-[14px] font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
       نحن لا نخزن اي معلومة شخصية متعلقة بك
      </div>
    </nav>

    {/* 🚀 قسم الهيرو الرئيسي (Hero Section Container) */}
    <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
      
      {/* 👉 الجانب الأيمن: العناوين، الوصف، والمميزات التسويقية العميقة */}
      <div className="md:col-span-7 flex flex-col gap-6 text-right">
        <div className="inline-flex self-start items-center gap-2 bg-cyan-50 border border-cyan-100 text-cyan-700 text-[15px] font-bold px-3 py-1 rounded-full shadow-sm">
          🚀 صمم هذا التطبيق خصيصا  لمساعدتك في التعافي من  العادات السيئة و تقوية دماغك
        </div>
        
        <h1 className="text-3xl max-sm:text-[35px] md:text-5xl font-black text-slate-900 leading-tight">
          تدريبنا يخفف و يسيطر على  <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-cyan-600 to-indigo-600"> رغبتك الملحة</span>
        </h1>
        
        <p className="text-slate-600 text-[19px] md:text-base leading-relaxed max-w-xl">
          تطبيق ويب طوره مدمن سابق يعتمد على تقنية مجربة في التخفيف و السيطرة على الرغبة الملحة لفعل عادة سيئة و مضرة . نقوم بحماية فصك الجبهي من الرغبات الحارقة والخلفيات الذهنية المشتتة عبر مساحات عزل تفاعلية آمنة 100% وبدون إعلانات.
        </p>

        {/* مميزات حاسمة تعزز قرار المشترك وتنسف شكوكه */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:gap-0 gap-4 mt-2">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">✔</div>
            <div>
              <h4 className="text-[22px] font-bold text-slate-800">بيئة معقمة وخالية من المثيرات</h4>
              <p className="text-[16px] text-slate-600">لا نضع إعلانات خبيثة أو صور منبثقة تهدد تعافيك.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">✔</div>
            <div>
              <h4 className="text-[22px] font-bold text-slate-800">تقنية علمية</h4>
              <p className="text-[15px] text-slate-600">تقنية تساعد الفص الجبهي لدماغك للتغلب على الرغبة الملحة.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">✔</div>
            <div>
              <h4 className="text-[22px] font-bold text-slate-800">السرية</h4>
              <p className="text-[15px] text-slate-600">نحن لا نطلب بياناتك الشخصية الحساسة، أمانك هو أولويتنا.</p>
            </div>
          </div>

          {/* <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">✔</div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">مزامنة سحابية هادئة</h4>
              <p className="text-[11px] text-slate-400">احفظ انتصاراتك العصبية وسجل تقدمك من أي جهاز عبر الويب.</p>
            </div>
          </div> */}
        </div>
      </div>

      {/* 👈 الجانب الأيسر: الـ Form الأنيق والمحمي داخل الكارد الحركي */}
      <div className="md:col-span-5 w-full flex justify-center md:justify-end">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full flex flex-col gap-6 relative transition-all hover:shadow-cyan-100/50">
          
          {/* لمسة جمالية علوية للـ Form تفيد بالأمان البيومتري أو السري */}
          <div className="absolute -top-4 right-8 bg-slate-900 text-white font-mono text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-md">
            Secure Access Portal
          </div>

          {/* العناوين والترحيب */}
          <div className="text-center flex flex-col gap-1.5 pt-2">
            <h2 className="text-[32px] font-black text-slate-800">بوابة العبور الآمنة</h2>
            <p className="text-[15px] text-slate-500">أدخل المفتاح السري الممنوح لك لفتح التطبيق</p>
          </div>

          {/* نموذج الإدخال */}
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] font-bold text-slate-800">المفتاح الخاص بك (User Key)</label>
              <div className="relative">
                <input
                  type="password"
                  value={keyUser}
                  onChange={(e) => setKeyUser(e.target.value)}
                  placeholder="ضع شفرة الدخول الخاصة بك هنا ..."
                  className="w-full px-4 py-3 text-sm border border-slate-400 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-950 transition-all font-mono placeholder:font-sans"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* التنبيهات والأخطاء بستايل ناعم ومقروء */}
            {errorMessage && (
              <div className="text-xs text-rose-600 bg-rose-50 border border-rose-100 p-3 rounded-xl font-semibold flex items-center gap-2">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* زر الدخول الاحترافي والتفاعلي */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 bg-slate-900 hover:bg-slate-950 text-white font-bold text-[21px] rounded-xl shadow-lg border-b-4 border-slate-950 transition-all flex  items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                isLoading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الدخول...
                </span>
              ) : (
                <span className="flex  items-center gap-1">
                  الدخول 
                </span>
              )}
            </button>
          </form>

          {/* تذكير سفلي للمحافظة على هدوء المتعافي */}
          <div className="text-center text-[14px] text-slate-400 font-medium">
            مفاتيح الدخول يتم توليدها بشكل فريد لحساب واحد.
          </div>
        </div>
      </div>
    </main>

    {/* 📝 فوتر بسيط لإضفاء لمسة المؤسسات الرسمية والتقنية */}
    <footer className="w-full text-center py-4 text-[10px] text-slate-400 bg-white border-t border-slate-100 font-mono">
      © {new Date().getFullYear()}  All Rights Reserved. Confidential Interface
    </footer>
  </div>
);
}