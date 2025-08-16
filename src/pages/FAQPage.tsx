import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Clock,
} from "lucide-react";

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const categories = [
    { id: "all", name: "جميع الأسئلة", icon: HelpCircle },
    { id: "customization", name: "التخصيص", icon: Package },
    { id: "payment", name: "الدفع", icon: CreditCard },
    { id: "shipping", name: "الشحن", icon: Truck },
    { id: "returns", name: "الإرجاع", icon: RefreshCw },
    { id: "general", name: "عام", icon: Clock },
  ];

  const faqs = [
    {
      id: 1,
      category: "customization",
      question: "كيف يمكنني تخصيص جاكيتي؟",
      answer:
        "يمكنك تخصيص جاكيتك من خلال أداة التصميم المتقدمة في موقعنا. يمكنك اختيار الألوان، الخامات، إضافة الشعارات والنصوص، وتحديد المقاسات. كل خيار يتم عرضه مباشرة على نموذج ثلاثي الأبعاد للجاكيت.",
    },
    {
      id: 2,
      category: "customization",
      question: "ما هي أنواع الخامات المتاحة؟",
      answer: "تشمل القطن والجلد الصناعي بافضل الخامات.",
    },
    {
      id: 3,
      category: "customization",
      question: "هل يمكنني إضافة شعاري الخاص؟",
      answer:
        "نعم، يمكنك رفع شعارك الخاص بدقة لا تقل عن 300 DPI، ويفضل أن تكون الصورة بدون خلفية وبدقة عالية.",
    },
    {
      id: 4,
      category: "payment",
      question: "ما هي طرق الدفع المتاحة؟",
      answer:
        "نقبل جميع طرق الدفع الرئيسية: بطاقات الائتمان (فيزا، ماستركارد)، مدى، أبل باي، STC Pay.",
    },
    {
      id: 5,
      category: "payment",
      question: "هل يمكنني الدفع بالتقسيط؟",
      answer:
        "نعم، نوفر خيارات الدفع بالتقسيط من خلال شركائنا تابي وتمارا. يمكنك تقسيم المبلغ على 4 دفعات بدون فوائد أو رسوم إضافية.",
    },
    {
      id: 6,
      category: "shipping",
      question: "كم تستغرق مدة التصنيع والشحن؟",
      answer:
        "مدة التصنيع تتراوح من شهر إلى 45 يوم حسب ضغط الطلبات وعدد القطع. وفي بعض الحالات، قد تمتد المدة إذا كان هناك ضغط في الإنتاج، ويتم إبلاغ العميل مسبقًا. بعد انتهاء التصنيع، يتم الشحن خلال 2 إلى 3 أيام عمل إلى جميع مناطق المملكة.",
    },
    {
      id: 7,
      category: "shipping",
      question: "هل الشحن مجاني؟",
      answer:
        "نعم، الشحن مجاني لجميع أنحاء المملكة العربية السعودية للطلبات التي تزيد عن 500 ريال. للطلبات الأقل، رسوم الشحن 25 ريال فقط.",
    },
    {
      id: 8,
      category: "shipping",
      question: "هل يمكنني تتبع طلبي؟",
      answer:
        "بالطبع! ستحصل على رقم تتبع فور شحن طلبك. يمكنك تتبع حالة الطلب من خلال موقعنا أو تطبيق شركة الشحن مباشرة.",
    },
    {
      id: 9,
      category: "returns",
      question: "ما هي سياسة الإرجاع؟",
      answer:
        "نوفر ضمان استرداد كامل خلال 7 أيام من تاريخ الاستلام إذا لم تكن راضياً عن المنتج. المنتج يجب أن يكون في حالته الأصلية وغير مستخدم.",
    },
    {
      id: 10,
      category: "returns",
      question: "كيف يمكنني إرجاع المنتج؟",
      answer:
        "تواصل معنا عبر خدمة العملاء وسنرسل لك ملصق الإرجاع المجاني. قم بتعبئة المنتج في العبوة الأصلية وألصق الملصق، وسنقوم بجدولة الاستلام من عندك.",
    },
    {
      id: 13,
      category: "general",
      question: "ما هو الحد الأدنى للطلب؟",
      answer:
        "الحد الأدنى للطلب هو قطعة واحدة. هذا يضمن جودة الإنتاج وتوفير أفضل الأسعار لعملائنا.",
    },
    {
      id: 14,
      category: "general",
      question: "هل تقدمون خصومات للطلبات الكبيرة؟",
      answer:
        "نعم، نقدم خصومات تدريجية: 10% للطلبات من 25-49 قطعة، 15% للطلبات من 50-99 قطعة، و20% للطلبات 100 قطعة فأكثر.",
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white mobile-content-padding">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full aspect-square sm:aspect-[16/9] rounded-2xl overflow-hidden">
            <img
              src="/Photo/design7.png"
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
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 text-[#EF4444]">
                الأسئلة
                <span className="block font-medium text-[#563660]">
                  الشائعة
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#1F1F1F] max-w-2xl mx-auto leading-relaxed font-bold">
                إجابات شاملة على جميع استفساراتك حول خدماتنا ومنتجاتنا
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث في الأسئلة الشائعة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#563660] focus:border-transparent transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors duration-200 ${
                    activeCategory === category.id
                      ? "bg-[#563660] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-6 text-right flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-lg font-medium text-gray-900 flex-1">
                    {faq.question}
                  </span>
                  {openFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-[#563660] flex-shrink-0 mr-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mr-4" />
                  )}
                </button>

                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لم نجد أي نتائج
              </h3>
              <p className="text-gray-600">
                جرب البحث بكلمات مختلفة أو تصفح فئة أخرى
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-[#563660]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-light mb-6">
              لم تجد إجابة لسؤالك؟
            </h2>
            <p className="text-lg mb-8 opacity-90">
              فريق خدمة العملاء جاهز لمساعدتك على مدار الساعة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#563660] font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                تواصل معنا
              </a>
              <a
                href="tel:+966111234567"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-[#563660] transition-colors duration-200"
              >
                اتصل بنا الآن
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
