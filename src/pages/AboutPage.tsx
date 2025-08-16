import React from "react";
import { motion } from "framer-motion";
import { Target, Heart } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-[30px] mobile-content-padding">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full aspect-square sm:aspect-[16/9] rounded-2xl overflow-hidden">
            <img
              src="/Photo/design2.png"
              alt="Hero Background"
              className="w-full h-full object-cover  rounded-2xl"
            />
          </div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-center pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 text-[#EF4444]">
                قصتنا مع
                <span className="block font-medium text-[#563660]">
                  التميّز والإبداع
                </span>
              </h1>
              <p className="text-base sm:text-lg text-[#1F1F1F] max-w-2xl mx-auto leading-relaxed font-bold">
                في دار الجود، نؤمن إن التميز يبدأ من التفاصيل
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* باقي السكاشن بدون تغيير */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
                قصتنا
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  منذ انطلاقتنا في عام 2019، بدأنا بتصميم عبايات التخرج بخامات
                  فاخرة وتفاصيل تليق بكل خريجة. واليوم نكمل رحلتنا بإضافة خط
                  الجاكيتات المصممة حسب الطلب، لنقدّم لك قطع تجمع بين الجودة،
                  الذوق، والتفرد.
                </p>
                <p>
                  في دار الجود، نؤمن إن التميز يبدأ من التفاصيل. كل جاكيت نصنعه
                  هو قصة، وكل عميل هو جزء من رحلتنا.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/Photo/design5.png"
                  alt="ورشة التصنيع"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-2xl font-light">2019</div>
                  <div className="text-sm opacity-90">سنة التأسيس</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                رؤيتنا
              </h3>
              <p className="text-gray-600 leading-relaxed">
                أن نكون الخيار الأول في تصميم جاكيتات التخرج المخصصة، وننشر
                ثقافة التميز بأسلوب يجمع بين الإبداع والجودة.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
            >
              <div className="w-12 h-12 bg-[#563660] rounded-lg flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 mb-4">
                مهمتنا
              </h3>
              <p className="text-gray-600 leading-relaxed">
                نخيط لك فكرة، وتلبسها واقع. نصمّم لك جاكيت يعكس ذوقك، بجودة تليق
                فيك، وتفاصيل تخلّي كل قطعة تحكي عنك.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
