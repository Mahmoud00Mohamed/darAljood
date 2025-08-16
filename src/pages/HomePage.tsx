import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Palette,
  Award,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  Trophy,
  Sparkles,
} from "lucide-react";

const images = [
  "/Photo/design1.png",
  "/Photo/design2.png",
  "/Photo/design3.png",
];

const HomePage: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Palette,
      title: "تخصيص كامل",
      description: "اختر الألوان والخامات والشعارات حسب ذوقك الشخصي",
    },
    {
      icon: Award,
      title: "جودة عالية",
      description:
        "نستخدم أفضل الخامات وأحدث التقنيات في التصنيع لضمان جاكيت متقن في كل تفاصيله.",
    },
    {
      icon: Zap,
      title: "تنفيذ سريع",
      description:
        "مدة التنفيذ من شهر إلى 45 يوم، حسب ضغط التصنيع وعدد الطلبات – ونسعى دايمًا نسلمك بأسرع وقت.",
    },
    {
      icon: Shield,
      title: "ضمان الجودة",
      description:
        "نضمن لك إننا نستخدم أجود المواصفات والخامات، لتحصل على جاكيت بتفاصيل تليق فيك من البداية للنهاية.",
    },
  ];

  const stats = [
    { number: "+1,000", label: "عميل راضٍ", icon: Users },
    { number: "+5,000", label: "جاكيت مصنوع", icon: Trophy },
    { number: "99%", label: "معدل الرضا", icon: Star },
    { number: "24/7", label: "دعم العملاء", icon: Clock },
  ];

  return (
    <div className="min-h-screen mobile-content-padding">
      {/* Hero Section */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-20">
          {/* Carousel Section */}
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl mb-6 sm:mb-8">
            {images.map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt={`تصميم جاكيت ${index + 1}`}
                className="w-full h-full object-contain absolute top-0 left-0 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentImage ? 1 : 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link
                to="/customizer"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 bg-[#563660] text-white font-medium text-sm sm:text-base rounded-lg hover:bg-[#4b2e55] transition-colors duration-200 shadow-md"
              >
                ابدأ التصميم الآن
                <ArrowRight className="mr-2 w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2 sm:py-3 border border-gray-300 text-[#563660] font-medium text-sm sm:text-base rounded-lg hover:bg-gray-50/20 transition-colors duration-200 shadow-md"
              >
                تعرف علينا أكثر
              </Link>
            </motion.div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 rtl:space-x-reverse">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors duration-300 ${
                    index === currentImage ? "bg-[#563660]" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white text-gray-900 p-2 sm:p-3 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="font-medium text-xs sm:text-sm">
                  جودة مضمونة 100%
                </span>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 rounded-xl shadow-sm"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-3 sm:mb-4 leading-tight text-gray-900">
              صمم جاكيتك مع{" "}
              <span
                className="font-bold text-transparent bg-gradient-to-r from-[#563660] to-[#7e4a8c] bg-clip-text"
                style={{ fontFamily: "'Scheherazade New', serif" }}
              >
                دار الجود
              </span>
              <span
                className="block text-2xl sm:text-2xl lg:text-3xl font-bold text-[#563660]"
                style={{ fontFamily: "'Scheherazade New', serif" }}
              >
                بأسلوبك الخاص
              </span>
              <span className="block w-16 h-1 bg-[#563660] mx-auto mt-2 sm:mt-3"></span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-xl sm:max-w-2xl mx-auto">
              عيش تجربة التخصيص من أولها لآخرها مع جاكيتات دار الجود. اختر
              الألوان، الخامات، الشعارات وكل التفاصيل اللي تعبر عن ذوقك… وخلك
              مميز بقطعة تشبهك 🧥
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              ليش تختار تصمم جاكيت مع دار الجود؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              لأننا نقدّم لك تجربة تخصيص متكاملة، من الخامة إلى آخر غرزة. بجودة
              عالية، تفاصيل دقيقة، وخيارات تصميم تعكس ذوقك وشخصيتك.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-light text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-6 h-6 text-[#563660]" />
              <span>جاهز تصمّم جاكيتك بأسلوبك؟</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              ابدأ رحلتك مع دار الجود الآن، وخلّك مميز بجاكيت مصمّم على ذوقك
              ويعبّر عنك بكل تفاصيله.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customizer"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#563660] text-white font-medium rounded-lg hover:bg-[#4b2e55] transition-colors duration-200"
              >
                ابدأ التصميم
                <Palette className="mr-2 w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                تحدث معنا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
