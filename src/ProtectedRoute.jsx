import React, { useState, useEffect } from 'react';
import { Navigate, useLocation,useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation(); // التقاط المسار الحالي الذي يطلبه المستخدم ديناميكياً
    const navigate = useNavigate();
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

  
  useEffect(() => {

    const verifySession = async () => {
      try {
        const res = await fetch('https://learn-three-steel.vercel.app/api/check-session', { credentials: 'include' });
        const data = await res.json();
        
        // لن يقبل الدخول إلا إذا أرجع السيرفر نجاح الفحص الحي بالداتابيز
        if (res.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);
  // useEffect(() => {
  //   if(navigator.connection){
  //     navigate('/notConnected')
  //   }
  //       // window.addEventListener("offline", () => navigate('/notConnected'));

  // });

  if (isAuthenticated === null) {
    return <div className="p-10 text-center text-sm text-slate-500 animate-pulse" dir="rtl">جاري فحص صلاحية الحساب...</div>;
  }

  // إذا انقضت صلاحية الـ Key في الداتابيز، يتم طرده فوراً لصفحة الـ Login مع تشفير المسار الذي كان يحاول فتحه ليعود له لاحقاً
  if (!isAuthenticated) {
    return <Navigate to={`/?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}