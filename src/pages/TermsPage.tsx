import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, AlertCircle, CheckCircle } from "lucide-react";

const TermsPage: React.FC = () => {
  const sections = [
    {
      id: "acceptance",
      title: "قبول الشروط",
      icon: CheckCircle,
      content: [
        "باستخدام موقع 'دار الجود' والخدمات المقدمة من خلاله، فإنك توافق على الالتزام بهذه الشروط والأحكام.",
        "إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع أو الخدمات.",
        "نحتفظ بالحق في تعديل هذه الشروط في أي وقت دون إشعار مسبق.",
      ],
    },
    {
      id: "services",
      title: "الخدمات المقدمة",
      icon: FileText,
      content: [
        "نقدم خدمة تصميم وتصنيع الجاكيتات المخصصة حسب طلب العميل.",
        "تشمل خدماتنا: اختيار الألوان والخامات، إضافة الشعارات والنصوص، وتحديد المقاسات.",
        "جميع المنتجات مصنوعة حسب الطلب ولا يمكن إرجاعها إلا في حالات محددة.",
        "نلتزم بمعايير الجودة العالية في جميع منتجاتنا.",
      ],
    },
    {
      id: "orders",
      title: "الطلبات والدفع",
      icon: Shield,
      content: [
        "الحد الأدنى للطلب هو قطعة واحدة.",
        "يجب دفع 50% من قيمة الطلب مقدماً والباقي عند التسليم.",
        "مدة التصنيع تتراوح من شهر إلى 45 يوم حسب حجم الطلب وتعقيد التصميم.",
        "الأسعار المعروضة شاملة ضريبة القيمة المضافة.",
        "نحتفظ بالحق في رفض أي طلب لا يتوافق مع سياساتنا.",
      ],
    },
    {
      id: "intellectual",
      title: "الملكية الفكرية",
      icon: AlertCircle,
      content: [
        "العميل مسؤول عن ضمان حقوق الملكية الفكرية للشعارات والتصاميم المرفوعة.",
        "لا نتحمل أي مسؤولية قانونية تجاه انتهاك حقوق الملكية الفكرية.",
        "نحتفظ بالحق في رفض طباعة أي تصميم يشتبه في انتهاكه لحقوق الملكية الفكرية.",
        "جميع التصاميم والأدوات المتاحة على الموقع محمية بحقوق الطبع والنشر.",
      ],
    },
    {
      id: "quality",
      title: "ضمان الجودة",
      icon: Shield,
      content: [
        "نحرص في دار الجود على تقديم منتجات بجودة عالية، ونتعهد باستخدام أفضل المواد والتقنيات في التصنيع.",
        "يشمل الضمان عيوب المواد أو التصنيع فقط.",
        "لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام.",
      ],
    },
    {
      id: "returns",
      title: "الإرجاع والاستبدال",
      icon: AlertCircle,
      content: [
        "يُقبل إرجاع أو استبدال المنتجات خلال 7 أيام من الاستلام بشرط أن تكون بحالتها الأصلية وغير مستخدمة، مع الإبقاء على التغليف الأصلي.",
        "نهدف إلى رضا عملائنا، لذلك نسعد بخدمتكم في حال وجود أي ملاحظات أو رغبة في الاستبدال.",
      ],
    },
    {
      id: "liability",
      title: "تحديد المسؤولية",
      icon: AlertCircle,
      content: [
        "مسؤوليتنا محدودة بقيمة المنتج المباع فقط.",
        "لا نتحمل مسؤولية أي أضرار غير مباشرة أو تبعية.",
        "العميل مسؤول عن التأكد من صحة المعلومات والتصاميم المقدمة.",
        "نحتفظ بالحق في تعديل أو إلغاء أي طلب في حالة وجود خطأ في السعر أو المعلومات.",
      ],
    },
    {
      id: "privacy",
      title: "الخصوصية وحماية البيانات",
      icon: Shield,
      content: [
        "نلتزم بحماية خصوصية عملائنا وفقاً لسياسة الخصوصية المنشورة.",
        "لا نشارك المعلومات الشخصية مع أطراف ثالثة دون موافقة العميل.",
        "نستخدم المعلومات المقدمة لتنفيذ الطلبات وتحسين خدماتنا فقط.",
        "العميل له الحق في طلب حذف بياناته الشخصية في أي وقت.",
      ],
    },
    {
      id: "disputes",
      title: "حل النزاعات",
      icon: FileText,
      content: [
        "أي نزاع ينشأ عن هذه الشروط يخضع للقوانين السعودية.",
        "نسعى لحل جميع النزاعات ودياً قبل اللجوء للقضاء.",
        "المحاكم السعودية هي المختصة بالنظر في أي نزاع قانوني.",
        "يمكن للعميل تقديم شكوى لوزارة التجارة في حالة عدم الوصول لحل مرضي.",
      ],
    },
    {
      id: "contact",
      title: "معلومات الاتصال",
      icon: FileText,
      content: [
        "للاستفسارات حول هذه الشروط، يرجى التواصل معنا عبر واتساب:",
        "واتساب: +966536065766",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white mobile-content-padding">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900">
              شروط
              <span className="block font-medium text-[#563660]">
                الاستخدام
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              الشروط والأحكام التي تحكم استخدام موقعنا وخدماتنا
            </p>
          </motion.div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-gray-600"
          >
            <p>آخر تحديث: 13 يونيو 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-medium text-gray-900">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
              هل لديك استفسار حول الشروط؟
            </h2>
            <p className="text-lg mb-8 opacity-90">
              فريقنا القانوني جاهز للإجابة على جميع استفساراتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#563660] font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                تواصل معنا
              </a>
              <a
                href="https://wa.me/+966536065766"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-[#563660] transition-colors duration-200"
              >
                راسلنا عبر واتساب
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
