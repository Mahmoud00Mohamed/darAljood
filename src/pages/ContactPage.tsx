import React from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, MessageCircle, Instagram } from "lucide-react";

const ContactPage: React.FC = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "الهاتف",
      details: ["0536065766"],
      color: "text-blue-600",
    },
    {
      icon: MapPin,
      title: "العنوان",
      details: ["المملكة العربية السعودية"],
      color: "text-red-600",
    },
  ];

  const socialMedia = [
    { name: "Instagram", icon: Instagram, href: "#", color: "bg-pink-500" },
    { name: "TikTok", icon: Instagram, href: "#", color: "bg-black" },
  ];

  return (
    <div className="min-h-screen bg-white pt-[30px] mobile-content-padding">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full aspect-square sm:aspect-[16/9] rounded-2xl overflow-hidden">
            <img
              src="/Photo/design6.png"
              alt="Hero Background"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 text-[#563660]">
                تواصل
                <span className="block font-medium text-[#563660]">معنا</span>
              </h1>
              <p className="text-base sm:text-lg text-[#1F1F1F] max-w-2xl mx-auto leading-relaxed font-bold">
                نحن هنا للإجابة على جميع استفساراتك ومساعدتك في تصميم جاكيتك
                المثالي
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div
                    className={`w-12 h-12 ${info.color} bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {info.title}
                  </h3>
                  <div className="space-y-1">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WhatsApp Button & Social Media */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* WhatsApp Button */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-2xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-500" />
                تواصل معنا
              </h2>
              <a
                href="https://wa.me/966536065766"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                تواصل عبر واتساب
              </a>
            </motion.div>

            {/* Social Media & Quick Response */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Social Media */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  تابعنا على وسائل التواصل
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {socialMedia.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className={`flex items-center gap-3 p-3 ${social.color} text-white rounded-lg hover:opacity-90 transition-opacity duration-200`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {social.name}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Response */}
              <div className="bg-[#563660] rounded-2xl p-6 text-white">
                <h3 className="text-lg font-medium mb-2">استجابة سريعة</h3>
                <p className="mb-4 text-sm opacity-90">
                  نلتزم بالرد على جميع الاستفسارات خلال 24 ساعة كحد أقصى
                </p>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">
                    متوسط وقت الاستجابة: 2-4 ساعات
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
