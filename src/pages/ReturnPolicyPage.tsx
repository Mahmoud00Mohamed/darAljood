import React from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const ReturnPolicyPage: React.FC = () => {
  const sections = [
    {
      id: "overview",
      title: "نظرة عامة",
      icon: Package,
      content: [
        "نحن ملتزمون برضا عملائنا ونقدم سياسة إرجاع مرنة وعادلة.",
        "يمكن إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام.",
        "المنتجات المخصصة تخضع لشروط خاصة للإرجاع.",
        "نهدف لمعالجة جميع طلبات الإرجاع خلال 5-7 أيام عمل.",
      ],
    },
    {
      id: "conditions",
      title: "شروط الإرجاع",
      icon: CheckCircle,
      content: [
        "المنتج يجب أن يكون في حالته الأصلية وغير مستخدم.",
        "يجب أن يكون المنتج في العبوة الأصلية مع جميع الملحقات.",
        "لا يجب أن يحتوي المنتج على أي روائح (عطور، دخان، إلخ).",
        "يجب الاحتفاظ بفاتورة الشراء الأصلية.",
        "المنتجات المخصصة (بشعارات أو نصوص شخصية) لا يمكن إرجاعها إلا في حالة عيب في التصنيع.",
      ],
    },
    {
      id: "process",
      title: "عملية الإرجاع",
      icon: RotateCcw,
      content: [
        "تواصل مع خدمة العملاء عبر واتساب.",
        "قدم رقم الطلب وسبب الإرجاع.",
        "سنرسل لك ملصق الإرجاع المجاني خلال 24 ساعة.",
        "قم بتعبئة المنتج في العبوة الأصلية وألصق الملصق.",
        "سنقوم بجدولة الاستلام من عندك مجاناً.",
        "بعد استلام المنتج وفحصه، سنعالج الاسترداد خلال 3-5 أيام عمل.",
      ],
    },
    {
      id: "timeframes",
      title: "المدد الزمنية",
      icon: Clock,
      content: [
        "فترة الإرجاع: 7 أيام من تاريخ الاستلام.",
        "معالجة طلب الإرجاع: 24-48 ساعة.",
        "استلام المنتج: 2-3 أيام عمل.",
        "فحص المنتج: 1-2 يوم عمل.",
        "معالجة الاسترداد: 3-5 أيام عمل.",
        "وصول المبلغ للحساب: 5-10 أيام عمل حسب البنك.",
      ],
    },
    {
      id: "refunds",
      title: "الاسترداد",
      icon: CheckCircle,
      content: [
        "سيتم استرداد كامل المبلغ المدفوع للمنتج.",
        "تكاليف الشحن الأصلية غير قابلة للاسترداد (إلا في حالة عيب في المنتج).",
        "الاسترداد يتم بنفس طريقة الدفع الأصلية.",
        "في حالة الإرجاع الجزئي، سيتم احتساب الاسترداد بالتناسب.",
      ],
    },
    {
      id: "exchanges",
      title: "الاستبدال",
      icon: RotateCcw,
      content: [
        "يمكن استبدال المنتج بمقاس أو لون مختلف (حسب التوفر).",
        "الاستبدال مجاني إذا كان بسبب عيب في المنتج أو خطأ في الطلب.",
        "للاستبدال لأسباب شخصية، العميل يتحمل تكاليف الشحن.",
        "المنتج الجديد سيتم شحنه بعد استلام المنتج الأصلي وفحصه.",
        "إذا لم يكن المنتج البديل متوفراً، سيتم الاسترداد الكامل.",
      ],
    },
    {
      id: "exceptions",
      title: "الاستثناءات",
      icon: XCircle,
      content: [
        "المنتجات المخصصة بشعارات أو نصوص شخصية.",
        "المنتجات التي تم استخدامها أو غسلها.",
        "المنتجات التالفة بسبب سوء الاستخدام.",
        "المنتجات المعروضة بخصم أكثر من 50%.",
        "المنتجات المشتراة من عروض التصفية النهائية.",
        "المنتجات التي مر عليها أكثر من 7 أيام من تاريخ الاستلام.",
      ],
    },
    {
      id: "defective",
      title: "المنتجات المعيبة",
      icon: AlertCircle,
      content: [
        "إذا وصلك منتج معيب أو تالف، تواصل معنا فوراً.",
        "سنقوم بإرجاع أو استبدال المنتج مجاناً.",
        "لا نتحمل تكاليف الشحن للمنتجات المعيبة.",
        "قد نطلب صوراً للعيب لتسريع عملية المعالجة.",
        "في حالة العيوب المتكررة، سنقدم تعويضاً إضافياً.",
      ],
    },
    {
      id: "contact",
      title: "التواصل",
      icon: Package,
      content: [
        "لبدء عملية الإرجاع، تواصل معنا عبر واتساب:",
        "واتساب: +966536065766",
        "فريق خدمة العملاء جاهز لمساعدتك في جميع خطوات الإرجاع.",
      ],
    },
  ];

  const steps = [
    {
      number: "01",
      title: "تواصل معنا",
      description: "اتصل بخدمة العملاء عبر واتساب وقدم رقم الطلب",
    },
    {
      number: "02",
      title: "احصل على ملصق الإرجاع",
      description: "سنرسل لك ملصق الإرجاع المجاني",
    },
    {
      number: "03",
      title: "قم بالتعبئة",
      description: "ضع المنتج في العبوة الأصلية",
    },
    {
      number: "04",
      title: "جدولة الاستلام",
      description: "سنستلم المنتج من عندك مجاناً",
    },
    {
      number: "05",
      title: "الفحص والمعالجة",
      description: "نفحص المنتج ونعالج الاسترداد",
    },
  ];

  return (
    <div className="min-h-screen bg-white mobile-content-padding">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900">
              سياسة
              <span className="block font-medium text-[#563660]">
                الإرجاع والاستبدال
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              إرجاع واستبدال سهل ومرن لضمان رضاك التام
            </p>
          </motion.div>
        </div>
      </section>

      {/* Return Process Steps */}
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
              خطوات الإرجاع
            </h2>
            <p className="text-lg text-gray-600">
              عملية إرجاع بسيطة في 5 خطوات فقط
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mx-auto mb-4 text-white font-medium">
                  {step.number}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-gray-50">
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
                  className="bg-white rounded-2xl p-8 hover:bg-gray-50 transition-colors duration-200"
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
              تريد إرجاع منتج؟
            </h2>
            <p className="text-lg mb-8 opacity-90">
              فريق خدمة العملاء جاهز لمساعدتك في عملية الإرجاع
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#563660] font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                ابدأ عملية الإرجاع
              </a>
              <a
                href="https://wa.me/+966536065766"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-[#563660] transition-colors duration-200"
              >
                تواصل عبر واتساب
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicyPage;
