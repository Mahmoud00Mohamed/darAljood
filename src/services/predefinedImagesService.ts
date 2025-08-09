import { PredefinedImage } from "../context/ImageLibraryContext";

class PredefinedImagesService {
  private baseUrl = "http://localhost:5173/api";

  /**
   * تحميل الصور الجاهزة من الباك إند
   */
  async loadPredefinedImages(): Promise<PredefinedImage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/predefined-images`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.images)) {
          return data.images;
        }
      }

      // في حالة فشل الباك إند، استخدم البيانات المحلية
      return this.getFallbackImages();
    } catch (error) {
      console.warn("Failed to load from backend, using fallback:", error);
      return this.getFallbackImages();
    }
  }

  /**
   * البيانات الاحتياطية في حالة فشل الباك إند
   */
  private getFallbackImages(): PredefinedImage[] {
    return [
      {
        id: "logo1",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
        name: "شعار 1",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo2",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
        name: "شعار 2",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo3",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
        name: "شعار 3",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo4",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
        name: "شعار 4",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo5",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
        name: "شعار 5",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo6",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
        name: "شعار 6",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo7",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
        name: "شعار 7",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo8",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
        name: "شعار 8",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo9",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
        name: "شعار 9",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo10",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
        name: "شعار 10",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo11",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
        name: "شعار 11",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo12",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
        name: "شعار 12",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo13",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
        name: "شعار 13",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo14",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
        name: "شعار 14",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo15",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
        name: "شعار 15",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo16",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
        name: "شعار 16",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo17",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
        name: "شعار 17",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo18",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
        name: "شعار 18",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo19",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
        name: "شعار 19",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo20",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/8_yoay91.png",
        name: "شعار 20",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo21",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
        name: "شعار 21",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo22",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
        name: "شعار 22",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo23",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
        name: "شعار 23",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo24",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
        name: "شعار 24",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
    ];
  }

  /**
   * التحقق من حالة الاتصال مع الباك إند
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const predefinedImagesService = new PredefinedImagesService();
export default predefinedImagesService;
