import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { loginWithGoogle, logout } from '../firebase';
import { LogOut, Save, Plus, Trash2, Edit2, Image as ImageIcon, Settings, Send, ExternalLink } from 'lucide-react';

const GOOGLE_SHEET_WEBHOOK_URL = (import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyyrsGcQFdWP3phHNNVVK31guLY0LUkAyFXSUJyGmwx2rXPR_3SjOBoRnmyzXfOfwN1Fg/exec').trim();

const getDriveDirectLink = (url: string) => {
  if (!url) return '';
  if (url.includes('drive.google.com/file/d/')) {
    const id = url.split('/d/')[1].split('/')[0];
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  if (url.includes('drive.google.com/uc?id=')) {
    const id = url.split('id=')[1].split('&')[0];
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
};

export default function AdminPanel() {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('hero');
  const [heroData, setHeroData] = useState<any>({});
  const [promotions, setPromotions] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Fetch Hero
    const unsubHero = onSnapshot(doc(db, 'content', 'hero'), (doc) => {
      if (doc.exists()) {
        setHeroData(doc.data());
      } else {
        // Default data
        setHeroData({
          title: "Nơi Tôn Vinh",
          subtitle: "Làn Da Hoàn Mỹ",
          description: "PJ CLINIC là địa chỉ làm đẹp uy tín với đội ngũ chuyên gia giàu kinh nghiệm, công nghệ hiện đại và cá nhân hóa phác đồ mang đến kết quả tốt nhất.",
          backgroundImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop",
          phone: "0818 999 099",
          bookingUrl: "https://pjspa.myspa.vn/dat-hen"
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/hero'));

    // Fetch Contact
    const unsubContact = onSnapshot(doc(db, 'content', 'contact'), (doc) => {
      if (doc.exists()) {
        setContactData(doc.data());
      } else {
        setContactData({
          address: "Số 102 Thích Quảng Đức, Phú Hòa, Thủ Dầu Một, Bình Dương",
          phone: "0818 999 099",
          email: "info.pjclinicbd@gmail.com",
          workingHours: "09:00 - 19:00",
          facebookUrl: "#",
          tiktokUrl: "#"
        });
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/contact'));

    // Fetch Promotions
    const unsubPromos = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromotions(data.sort((a: any, b: any) => a.order - b.order));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'promotions'));

    return () => {
      unsubHero();
      unsubContact();
      unsubPromos();
    };
  }, [user, isAdmin]);

  const handleSaveHero = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'content', 'hero'), heroData);
      alert('Lưu thành công!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content/hero');
      alert('Lỗi khi lưu!');
    }
    setIsSaving(false);
  };

  const handleSaveContact = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'content', 'contact'), contactData);
      alert('Lưu thành công!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'content/contact');
      alert('Lỗi khi lưu!');
    }
    setIsSaving(false);
  };

  const handleAddPromo = async () => {
    const newPromo = {
      title: "Ưu đãi mới",
      desc: "Mô tả ưu đãi",
      img: "https://lh3.googleusercontent.com/d/1qfNHIQGWAocUPKXbtfIUfOON75ldNE7S",
      tag: "HOT DEAL",
      order: promotions.length
    };
    try {
      await setDoc(doc(collection(db, 'promotions')), newPromo);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'promotions');
    }
  };

  const handleUpdatePromo = async (id: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'promotions', id), { [field]: value });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `promotions/${id}`);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa?')) {
      try {
        await deleteDoc(doc(db, 'promotions', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `promotions/${id}`);
      }
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const queryParts = [
        `date=${encodeURIComponent(dateStr)}`,
        `code=TEST_CONNECTION`,
        `name=${encodeURIComponent('Người kiểm tra hệ thống')}`,
        `info=${encodeURIComponent('KIỂM TRA KẾT NỐI GOOGLE SHEETS')}`,
        `phone=0000000000`,
        `email=test@system.com`,
        `address=${encodeURIComponent('Hệ thống')}`,
        `note=${encodeURIComponent('Đây là tin nhắn kiểm tra tự động')}`,
        `payment=${encodeURIComponent('Thành công')}`,
        `status=${encodeURIComponent('Kiểm tra')}`,
        `mailSent=X`,
        `zaloSent=X`
      ];

      const finalUrl = `/api/proxy-sheet?url=${encodeURIComponent(GOOGLE_SHEET_WEBHOOK_URL)}&${queryParts.join('&')}`;

      console.log("URL KIỂM TRA GỬI QUA PROXY:");
      console.log(finalUrl);

      // Gửi qua Proxy
      await fetch(finalUrl);

      alert('Đã gửi yêu cầu kiểm tra! Vui lòng kiểm tra Google Sheet của bạn.\n\nNếu vẫn không thấy, hãy thử nút "Mở link kiểm tra thủ công" bên dưới để chẩn đoán lỗi.');
    } catch (error) {
      console.error("Lỗi khi kiểm tra Webhook:", error);
      alert('Lỗi khi gửi yêu cầu kiểm tra. Vui lòng kiểm tra console để biết chi tiết.');
    }
    setIsTestingWebhook(false);
  };

  const getManualTestUrl = () => {
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const data: any = {
      date: dateStr,
      code: 'MANUAL_TEST',
      name: 'Kiểm tra thủ công',
      info: 'KIỂM TRA THỦ CÔNG QUA TRÌNH DUYỆT',
      phone: '0000000000',
      status: 'Manual'
    };
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => params.append(key, data[key]));
    return `${GOOGLE_SHEET_WEBHOOK_URL}${GOOGLE_SHEET_WEBHOOK_URL.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-stone-800">Đăng nhập Quản trị viên</h1>
          <button 
            onClick={loginWithGoogle}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
          >
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-stone-800">Không có quyền truy cập</h1>
          <p className="text-stone-600 mb-6">Tài khoản của bạn không có quyền quản trị.</p>
          <button 
            onClick={logout}
            className="py-2 px-6 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 text-white p-6 flex flex-col">
        <h2 className="text-2xl font-serif font-bold mb-8 text-rose-400">PJ Admin</h2>
        <nav className="flex-1 space-y-2">
          {[
            { id: 'hero', label: 'Hero Section' },
            { id: 'promotions', label: 'Ưu đãi' },
            { id: 'contact', label: 'Liên hệ & Footer' },
            { id: 'system', label: 'Hệ thống' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-rose-600 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-2 text-stone-400 hover:text-white transition-colors py-3"
        >
          <LogOut className="w-5 h-5" /> Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
          
          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-stone-800">Chỉnh sửa Hero Section</h3>
                <button 
                  onClick={handleSaveHero}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tiêu đề chính</label>
                  <input 
                    type="text" 
                    value={heroData.title || ''} 
                    onChange={e => setHeroData({...heroData, title: e.target.value})}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tiêu đề phụ (Chữ nghiêng)</label>
                  <input 
                    type="text" 
                    value={heroData.subtitle || ''} 
                    onChange={e => setHeroData({...heroData, subtitle: e.target.value})}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả</label>
                  <textarea 
                    value={heroData.description || ''} 
                    onChange={e => setHeroData({...heroData, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Link Hình nền (URL)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={heroData.backgroundImage || ''} 
                      onChange={e => setHeroData({...heroData, backgroundImage: e.target.value})}
                      className="flex-1 p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                    {heroData.backgroundImage && (
                      <img src={getDriveDirectLink(heroData.backgroundImage)} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-stone-200" referrerPolicy="no-referrer" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={heroData.phone || ''} 
                      onChange={e => setHeroData({...heroData, phone: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Link Đặt lịch</label>
                    <input 
                      type="text" 
                      value={heroData.bookingUrl || ''} 
                      onChange={e => setHeroData({...heroData, bookingUrl: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Promotions Tab */}
          {activeTab === 'promotions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-stone-800">Quản lý Ưu đãi</h3>
                <button 
                  onClick={handleAddPromo}
                  className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm ưu đãi
                </button>
              </div>
              
              <div className="space-y-6">
                {promotions.map((promo, index) => (
                  <div key={promo.id} className="p-6 border border-stone-200 rounded-xl bg-stone-50 relative">
                    <button 
                      onClick={() => handleDeletePromo(promo.id)}
                      className="absolute top-4 right-4 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Tên ưu đãi</label>
                        <input 
                          type="text" 
                          value={promo.title} 
                          onChange={e => handleUpdatePromo(promo.id, 'title', e.target.value)}
                          className="w-full p-2 border border-stone-200 rounded focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Nhãn (Tag)</label>
                        <input 
                          type="text" 
                          value={promo.tag} 
                          onChange={e => handleUpdatePromo(promo.id, 'tag', e.target.value)}
                          className="w-full p-2 border border-stone-200 rounded focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-stone-500 mb-1">Mô tả / Giá</label>
                        <input 
                          type="text" 
                          value={promo.desc} 
                          onChange={e => handleUpdatePromo(promo.id, 'desc', e.target.value)}
                          className="w-full p-2 border border-stone-200 rounded focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Thứ tự hiển thị</label>
                        <input 
                          type="number" 
                          value={promo.order} 
                          onChange={e => handleUpdatePromo(promo.id, 'order', Number(e.target.value))}
                          className="w-full p-2 border border-stone-200 rounded focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1">Link Hình ảnh</label>
                        <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={promo.img} 
                            onChange={e => handleUpdatePromo(promo.id, 'img', e.target.value)}
                            className="flex-1 p-2 border border-stone-200 rounded focus:ring-1 focus:ring-rose-500 outline-none"
                          />
                          {promo.img && (
                            <img src={getDriveDirectLink(promo.img)} alt="Preview" className="w-10 h-10 object-cover rounded border border-stone-200" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {promotions.length === 0 && <p className="text-stone-500 text-center py-8">Chưa có ưu đãi nào.</p>}
              </div>
            </motion.div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-stone-800">Thông tin Liên hệ</h3>
                <button 
                  onClick={handleSaveContact}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ</label>
                  <input 
                    type="text" 
                    value={contactData.address || ''} 
                    onChange={e => setContactData({...contactData, address: e.target.value})}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={contactData.phone || ''} 
                      onChange={e => setContactData({...contactData, phone: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={contactData.email || ''} 
                      onChange={e => setContactData({...contactData, email: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Thời gian làm việc</label>
                  <input 
                    type="text" 
                    value={contactData.workingHours || ''} 
                    onChange={e => setContactData({...contactData, workingHours: e.target.value})}
                    className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Facebook URL</label>
                    <input 
                      type="text" 
                      value={contactData.facebookUrl || ''} 
                      onChange={e => setContactData({...contactData, facebookUrl: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">TikTok URL</label>
                    <input 
                      type="text" 
                      value={contactData.tiktokUrl || ''} 
                      onChange={e => setContactData({...contactData, tiktokUrl: e.target.value})}
                      className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-2xl font-bold text-stone-800 mb-6">Cấu hình Hệ thống</h3>
              
              <div className="p-6 border border-stone-200 rounded-xl bg-stone-50">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-rose-600" />
                  <h4 className="text-lg font-semibold text-stone-800">Tích hợp Google Sheets</h4>
                </div>
                
                <p className="text-stone-600 mb-6 text-sm">
                  Sử dụng công cụ này để kiểm tra xem kết nối giữa Website và Google Sheets của bạn đã hoạt động chính xác chưa.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-stone-200">
                    <p className="text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">Webhook URL hiện tại</p>
                    <code className="text-xs break-all text-rose-600 font-mono">{GOOGLE_SHEET_WEBHOOK_URL}</code>
                  </div>

                  <button 
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook}
                    className="flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-stone-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> {isTestingWebhook ? 'Đang gửi...' : 'Gửi thử dữ liệu đến Google Sheets'}
                  </button>

                  <a 
                    href={getManualTestUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 py-3 rounded-lg font-medium transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" /> Mở link kiểm tra thủ công (Mở tab mới)
                  </a>
                </div>

                <div className="mt-8 p-4 bg-rose-50 rounded-lg border border-rose-100">
                  <h5 className="text-sm font-bold text-rose-800 mb-2">Hướng dẫn khắc phục nếu không có dữ liệu:</h5>
                  <ul className="text-xs text-rose-700 space-y-2 list-disc pl-4">
                    <li>Đảm bảo bạn đã dán đúng mã Script vào <strong>Apps Script</strong>.</li>
                    <li>Bạn phải nhấn <strong>Triển khai (Deploy)</strong> -&gt; <strong>Triển khai mới (New deployment)</strong>.</li>
                    <li>Quan trọng: Phần <strong>Quyền truy cập (Who has access)</strong> phải chọn là <strong>"Bất kỳ ai" (Anyone)</strong>.</li>
                    <li>Nếu bạn cập nhật mã Script, bạn phải <strong>Triển khai lại</strong> và chọn <strong>Phiên bản mới</strong>.</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
