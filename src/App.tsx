import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, MapPin, Mail, Clock, Star, ChevronRight, Menu, X, 
  MessageCircle, CheckCircle2, Sparkles, Droplets, Wind, Sun, Heart, 
  Quote, CalendarHeart, ArrowRight
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, onSnapshot, addDoc } from 'firebase/firestore';
import { AuthProvider } from './AuthContext';
import AdminPanel from './components/AdminPanel';

const IconMap: Record<string, any> = {
  Sparkles, Heart, Wind, Sun, Droplets, CheckCircle2
};

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

const Navbar = ({ onBookClick }: { onBookClick: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-8 h-8 ${isScrolled ? 'text-rose-600' : 'text-white'}`} />
            <span className={`text-2xl font-serif font-bold tracking-wider ${isScrolled ? 'text-stone-800' : 'text-white'}`}>
              PJ CLINIC
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['Trang chủ', 'Ưu đãi', 'Liên hệ'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className={`text-sm font-medium uppercase tracking-wider hover:text-rose-500 transition-colors ${isScrolled ? 'text-stone-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
            <Link 
              to="/admin"
              className={`text-sm font-medium uppercase tracking-wider hover:text-rose-500 transition-colors ${isScrolled ? 'text-stone-600' : 'text-white/90'}`}
            >
              Admin
            </Link>
            <button 
              onClick={onBookClick}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider transition-all ${
                isScrolled 
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg hover:shadow-rose-600/30' 
                  : 'bg-white text-stone-900 hover:bg-rose-50'
              }`}
            >
              ĐẶT HẸN NGAY
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-stone-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-stone-800' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t mt-3"
          >
            <div className="flex flex-col px-4 py-6 space-y-4">
              {['Trang chủ', 'Ưu đãi', 'Liên hệ'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-stone-600 font-medium uppercase tracking-wider text-sm py-2 border-b border-stone-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link 
                to="/admin"
                className="text-stone-600 font-medium uppercase tracking-wider text-sm py-2 border-b border-stone-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Admin
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBookClick();
                }}
                className="bg-rose-600 text-white text-center py-3 rounded-full font-semibold tracking-wider mt-4"
              >
                ĐẶT HẸN NGAY
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ data, onBookClick }: { data: any, onBookClick: () => void }) => {
  const imageUrl = getDriveDirectLink(data.backgroundImage) || "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop";

  return (
    <section id="trang-chủ" className="relative h-[45vh] md:h-[65vh] min-h-[350px] md:min-h-[500px] flex items-end justify-center pb-8 md:pb-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 bg-stone-900">
        <img 
          key={imageUrl}
          src={imageUrl} 
          alt="Spa Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        {/* Hidden text because the poster image already contains text */}
        <div className="hidden">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium tracking-widest uppercase mb-6 border border-white/30">
            Đánh thức vẻ đẹp tự nhiên
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-bold mb-6 leading-tight">
            {data.title} <br className="hidden md:block" />
            <span className="text-rose-300 italic font-light">{data.subtitle}</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mb-10 font-light">
            {data.description}
          </p>
        </div>
      </div>
    </section>
  );
};

const Promotions = ({ promos, onBookClick }: { promos: any[], onBookClick: () => void }) => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  return (
    <section id="ưu-đãi" className="pt-12 pb-24 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-block py-1.5 px-4 bg-rose-100 text-rose-600 rounded-full font-bold tracking-wider uppercase text-sm mb-4 animate-pulse">
            🔥 Ưu đãi có hạn
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-800 mb-6">
            CHƯƠNG TRÌNH KHUYẾN MÃI
          </h2>
          <div className="w-24 h-1 bg-rose-500 mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {promos.map((promo, index) => (
            <motion.div 
              key={promo.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl bg-white flex flex-col border-2 border-transparent hover:border-rose-400 transition-all group"
            >
              <div 
                className="relative overflow-hidden cursor-zoom-in"
                onClick={() => setSelectedImg(promo.img)}
              >
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg animate-pulse">
                  {promo.tag || 'HOT DEAL'}
                </div>
                <motion.img 
                  src={promo.img} 
                  alt={promo.title} 
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-stone-900 px-6 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    Phóng to
                  </span>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-b from-white to-rose-50/50 border-t border-rose-100">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <CalendarHeart className="w-5 h-5 animate-pulse" />
                  ĐĂNG KÝ NHẬN ƯU ĐÃI
                </button>
                <p className="text-center text-xs text-rose-600 mt-3 font-medium flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Số lượng ưu đãi có hạn!
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out backdrop-blur-sm"
            >
              <button 
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110] bg-black/20 hover:bg-black/40 p-2 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImg(null);
                }}
              >
                <X className="w-8 h-8" />
              </button>
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                src={selectedImg}
                alt="Khuyến mãi chi tiết"
                className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl cursor-default"
                onClick={(e) => e.stopPropagation()}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-16 relative">
          <div className="absolute inset-0 bg-rose-400 blur-3xl opacity-20 rounded-full w-64 h-64 mx-auto"></div>
          <button 
            onClick={onBookClick}
            className="relative inline-flex px-10 py-5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-full font-bold tracking-widest transition-all items-center gap-3 shadow-[0_0_40px_rgba(225,29,72,0.4)] hover:shadow-[0_0_60px_rgba(225,29,72,0.6)] hover:-translate-y-1 scale-105 animate-bounce"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            ĐẶT LỊCH NGAY - GIỮ ƯU ĐÃI
          </button>
          <p className="mt-4 text-stone-500 font-medium">Chỉ mất 30 giây để giữ chỗ - Không cần thanh toán trước</p>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ data }: { data: any }) => {
  return (
    <footer id="liên-hệ" className="bg-stone-900 text-stone-300 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-rose-500" />
              <span className="text-2xl font-serif font-bold tracking-wider text-white">
                PJ CLINIC
              </span>
            </div>
            <p className="text-stone-400 mb-6 leading-relaxed">
              Địa chỉ làm đẹp uy tín với đội ngũ chuyên gia giàu kinh nghiệm, công nghệ hiện đại và cá nhân hóa phác đồ mang đến kết quả tốt nhất.
            </p>
            <div className="flex gap-4">
              <a href={data.facebookUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer">
                <span className="text-white font-bold">f</span>
              </a>
              <a href={data.tiktokUrl} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-rose-600 transition-colors cursor-pointer">
                <span className="text-white font-bold">tk</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6">Liên Hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-1" />
                <span>{data.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-rose-500 shrink-0" />
                <a href={`tel:${data.phone?.replace(/ /g, '')}`} className="hover:text-rose-400 transition-colors">{data.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rose-500 shrink-0" />
                <a href={`mailto:${data.email}`} className="hover:text-rose-400 transition-colors">{data.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6">Thời Gian Làm Việc</h4>
            <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700">
              <div className="flex items-center gap-3 mb-4 text-white">
                <Clock className="w-5 h-5 text-rose-500" />
                <span className="font-medium">Thứ 2 - Chủ Nhật</span>
              </div>
              <p className="text-2xl font-light text-rose-300">{data.workingHours}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-6">Thông Tin</h4>
            <ul className="space-y-3">
              {['Giới thiệu', 'Các dịch vụ', 'Ưu đãi', 'Bí quyết làm đẹp', 'Tuyển dụng', 'Chính sách bảo mật', 'Điều khoản sử dụng'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-rose-400 transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-stone-600" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} PJ CLINIC. All rights reserved.
          </p>
          <div className="text-sm text-stone-500">
            <Link to="/admin" className="hover:text-rose-400 transition-colors">Admin Panel</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const BookingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', service: 'Giảm mỡ', otherService: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferCode, setTransferCode] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [manualCheckRequested, setManualCheckRequested] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  const services = [
    { name: "Giảm mỡ", price: 199000 },
    { name: "Xử lý rạn da", price: 199000 },
    { name: "Phục hồi da nhiễm Corticoid", price: 249000 },
    { name: "Xử lý hôi nách", price: 1990000 },
    { name: "Tắm trắng", price: 499000 },
    { name: "Xử lý thâm, mụn", price: 99000 },
    { name: "Khác", price: 99000 }
  ];

  useEffect(() => {
    if (isOpen) {
      // Tạo mã chuyển khoản ngẫu nhiên khi mở modal
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      setTransferCode(`PJCLINIC${randomDigits}`);
      setPaymentVerified(false);
      setManualCheckRequested(false);
      setShowConfirmButton(false);
      setStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    let pollInterval: any;
    let timerTimeout: any;

    if (step === 3 && !paymentVerified && !manualCheckRequested) {
      // Bắt đầu đếm ngược 1 phút để hiện nút xác nhận thủ công
      timerTimeout = setTimeout(() => {
        setShowConfirmButton(true);
      }, 60000);

      // Bắt đầu kiểm tra Google Sheet liên tục (mỗi 5 giây)
      pollInterval = setInterval(async () => {
        const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyGgg8UNHazYD91G9kvMY5DN_KAKBDs8QC2TCjgyy9y1kdTrZ5U7P7_Qts9odwfutFfqg/exec';
        if (!webhookUrl) return;

        try {
          const response = await fetch(`${webhookUrl}?transferCode=${transferCode}`);
          const data = await response.json();
          
          if (data.status === 'success') {
            // Kiểm tra cả cột H (paymentStatus) và cột I (bookingStatus) theo yêu cầu
            if (data.paymentStatus === 'Đã chuyển khoản' || data.bookingStatus === 'Đã chuyển khoản') {
              setPaymentVerified(true);
              clearInterval(pollInterval);
              clearTimeout(timerTimeout);
            }
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
        }
      }, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timerTimeout) clearTimeout(timerTimeout);
    };
  }, [step, transferCode, paymentVerified, manualCheckRequested]);

  const getSelectedPrice = () => {
    const selected = services.find(s => s.name === formData.service);
    return selected ? selected.price : 99000;
  };

  const sendToGoogleSheets = async (paymentStatus: string, bookingStatus: string) => {
    const webhookUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyGgg8UNHazYD91G9kvMY5DN_KAKBDs8QC2TCjgyy9y1kdTrZ5U7P7_Qts9odwfutFfqg/exec';
    if (!webhookUrl) return;

    try {
      const finalService = formData.service === 'Khác' ? formData.otherService : formData.service;
      const payload = {
        date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        transferCode: transferCode,
        name: formData.name,
        service: `${finalService} (${getSelectedPrice().toLocaleString('vi-VN')} VNĐ)`,
        phone: formData.phone,
        email: formData.email || '',
        address: '', 
        note: '',    
        paymentStatus: paymentStatus,
        bookingStatus: bookingStatus
      };

      console.log("Sending fixed payload to Google Sheets:", payload);

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
      });
      console.log("Google Sheets request sent (no-cors)");
    } catch (sheetError) {
      console.error("Lỗi khi lưu vào Google Sheets:", sheetError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra định dạng số điện thoại (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số bắt đầu bằng số 0.');
      return;
    }

    // Kiểm tra định dạng email (nếu có điền)
    if (formData.email) {
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(formData.email)) {
        alert('Email không đúng định dạng. Ví dụ: abc@gmail.com');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const finalService = formData.service === 'Khác' ? formData.otherService : formData.service;
      
      // 1. Lưu vào Firestore
      await addDoc(collection(db, 'bookings'), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: finalService,
        amount: getSelectedPrice(),
        transferCode: transferCode,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setStep(2);
    } catch (err: any) {
      console.error("Firestore booking error:", err);
      setError('Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      try {
        handleFirestoreError(err, OperationType.CREATE, 'bookings');
      } catch (e) {
        // handleFirestoreError throws, we catch it here to avoid crashing
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {paymentVerified ? (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h3 className="text-3xl font-serif font-bold text-stone-800 mb-4">Chúc mừng!</h3>
            <p className="text-stone-600 mb-8">
              Hệ thống đã xác nhận thanh toán của bạn thành công. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch hẹn.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold tracking-wider transition-colors"
            >
              ĐÓNG
            </button>
          </div>
        ) : manualCheckRequested ? (
          <div className="p-8 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <MessageCircle className="w-10 h-10" />
            </motion.div>
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-4">Thông báo</h3>
            <p className="text-stone-600 mb-8">
              Tôi sẽ kiểm tra thủ công và liên hệ lại với bạn trong thời gian sớm nhất. Cảm ơn bạn đã kiên nhẫn!
            </p>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold tracking-wider transition-colors"
            >
              ĐÓNG
            </button>
          </div>
        ) : step === 1 ? (
          <div className="p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">Đặt Lịch Hẹn</h3>
              <p className="text-stone-500 text-sm">Vui lòng để lại thông tin, chúng tôi sẽ liên hệ lại ngay.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Số điện thoại *</label>
                <input 
                  type="tel" 
                  required
                  pattern="0[0-9]{9}"
                  title="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  placeholder="Ví dụ: 0912345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Dịch vụ quan tâm *</label>
                <select 
                  required
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all bg-white"
                >
                  {services.map(s => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {formData.service === 'Khác' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-stone-700 mb-1">Tên dịch vụ khác *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.otherService}
                    onChange={e => setFormData({...formData, otherService: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                    placeholder="Nhập tên dịch vụ bạn muốn"
                  />
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Địa chỉ Email</label>
                <input 
                  type="email" 
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Vui lòng nhập đúng định dạng email (ví dụ: abc@gmail.com)"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
                  placeholder="Nhập địa chỉ email (không bắt buộc)"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold tracking-wider transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
              </button>
            </form>
          </div>
        ) : step === 2 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">Đăng ký thành công!</h3>
            <p className="text-stone-600 text-sm mb-8">
              Cảm ơn bạn đã tin tưởng PJ CLINIC. Vui lòng chọn bước tiếp theo:
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  sendToGoogleSheets('Chờ thanh toán', 'Đã đặt lịch');
                  setStep(3);
                }}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                THANH TOÁN GIỮ ƯU ĐÃI
              </button>
              
              <button 
                onClick={() => {
                  sendToGoogleSheets('Thanh toán sau', 'Đã đặt lịch');
                  onClose();
                }}
                className="w-full py-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold tracking-wider transition-colors"
              >
                ĐẶT LỊCH (THANH TOÁN SAU)
              </button>
              
              <button 
                onClick={() => {
                  sendToGoogleSheets('Cần tư vấn', 'Đã đặt lịch');
                  onClose();
                }}
                className="w-full py-4 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl font-bold tracking-wider transition-colors"
              >
                TƯ VẤN THÊM QUA ZALO
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2">Thanh Toán</h3>
            <p className="text-stone-600 text-sm mb-4">
              Quét mã QR để thanh toán giữ chỗ ưu đãi.
            </p>
            
            <div className="bg-rose-50 p-4 rounded-xl mb-6 border border-rose-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-500">Dịch vụ:</span>
                <span className="font-bold text-stone-800">{formData.service === 'Khác' ? formData.otherService : formData.service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Số tiền:</span>
                <span className="font-bold text-rose-600">{getSelectedPrice().toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-6 flex flex-col items-center">
              <img 
                src={`https://qr.sepay.vn/img?acc=962476LINQ&bank=BIDV&amount=${getSelectedPrice()}&des=${transferCode}&template=compact`} 
                alt="QR Code Thanh Toán" 
                className="max-w-[200px] h-auto rounded-lg shadow-sm mb-4"
              />
              <div className="text-xs text-stone-500 bg-white px-3 py-2 rounded-lg border border-stone-100 w-full">
                <p className="mb-1 text-center">Nội dung chuyển khoản:</p>
                <p className="font-mono font-bold text-stone-800 text-sm select-all text-center">{transferCode}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {showConfirmButton && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setManualCheckRequested(true)}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold tracking-wider transition-colors shadow-lg shadow-amber-500/20"
                >
                  XÁC NHẬN ĐÃ THANH TOÁN
                </motion.button>
              )}
              
              <button 
                onClick={onClose}
                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-bold tracking-wider transition-colors"
              >
                HOÀN TẤT
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-stone-400 text-xs">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
              Đang chờ hệ thống xác nhận thanh toán...
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const LandingPage = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [heroData, setHeroData] = useState<any>({
    title: "Nơi Tôn Vinh",
    subtitle: "Làn Da Hoàn Mỹ",
    description: "PJ CLINIC là địa chỉ làm đẹp uy tín với đội ngũ chuyên gia giàu kinh nghiệm, công nghệ hiện đại và cá nhân hóa phác đồ mang đến kết quả tốt nhất.",
    backgroundImage: "https://lh3.googleusercontent.com/d/1ooQAMHM7mwr9Ma5OKALEkYiOPh7GI9Ml",
    phone: "0818 999 099",
    bookingUrl: "https://pjspa.myspa.vn/dat-hen"
  });
  
  const [contactData, setContactData] = useState<any>({
    address: "Số 102 Thích Quảng Đức, Phú Hòa, Thủ Dầu Một, Bình Dương",
    phone: "0818 999 099",
    email: "info.pjclinicbd@gmail.com",
    workingHours: "09:00 - 19:00",
    facebookUrl: "#",
    tiktokUrl: "#"
  });

  const [promotions, setPromotions] = useState<any[]>([
    {
      title: "Chương trình ưu đãi 1",
      desc: "",
      tag: "HOT DEAL",
      img: "https://lh3.googleusercontent.com/d/1qfNHIQGWAocUPKXbtfIUfOON75ldNE7S",
      order: 0
    },
    {
      title: "Chương trình ưu đãi 2",
      desc: "",
      tag: "NEW",
      img: "https://lh3.googleusercontent.com/d/1pDwW-0AWKpzZagGwSZug2pS1L-WrZFaE",
      order: 1
    },
    {
      title: "Chương trình ưu đãi 3",
      desc: "",
      tag: "HOT",
      img: "https://lh3.googleusercontent.com/d/1J9CxfBDjC2Bgb8CjGKTMfuN-UigRJIui",
      order: 2
    },
    {
      title: "Chương trình ưu đãi 4",
      desc: "",
      tag: "SPECIAL",
      img: "https://lh3.googleusercontent.com/d/1-bA6vwwZkRcg4NMnfBfVNR2eo0Xb-oNz",
      order: 3
    },
    {
      title: "Chương trình ưu đãi 5",
      desc: "",
      tag: "HOT",
      img: "https://lh3.googleusercontent.com/d/1dQ5_w3PuvPdM-ntTVs-pwVZFfjowvUar",
      order: 4
    },
    {
      title: "Chương trình ưu đãi 6",
      desc: "",
      tag: "NEW",
      img: "https://lh3.googleusercontent.com/d/1gl_SNzYySmAS3CUYJT2O1mysuj7Qr60Q",
      order: 5
    }
  ]);

  useEffect(() => {
    const unsubHero = onSnapshot(doc(db, 'content', 'hero'), (doc) => {
      if (doc.exists()) setHeroData(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/hero'));
    const unsubContact = onSnapshot(doc(db, 'content', 'contact'), (doc) => {
      if (doc.exists()) setContactData(doc.data());
    }, (error) => handleFirestoreError(error, OperationType.GET, 'content/contact'));
    const unsubPromos = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPromotions(data.sort((a: any, b: any) => a.order - b.order));
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'promotions'));

    return () => {
      unsubHero();
      unsubContact();
      unsubPromos();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-rose-200 selection:text-rose-900">
      <Navbar onBookClick={() => setIsBookingModalOpen(true)} />
      <Hero data={heroData} onBookClick={() => setIsBookingModalOpen(true)} />
      <Promotions promos={promotions} onBookClick={() => setIsBookingModalOpen(true)} />
      <Footer data={contactData} />

      <AnimatePresence>
        <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} />
      </AnimatePresence>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
        <a 
          href={`https://zalo.me/${contactData.phone?.replace(/ /g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-bounce"
          title="Chat Zalo"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

