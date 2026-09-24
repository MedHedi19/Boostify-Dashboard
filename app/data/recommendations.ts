// Recommendations based on Personality Color (R, J, V, B) and VARK Learning Style (V, A, R, K)

const recommendationsFr = {
  J: {
    A: { title: "Auditif", items: ["🎤 Prise de parole & storytelling", "🧠 Intelligence émotionnelle", "🎧 Coaching oral & podcast learning"] },
    V: { title: "Visuel", items: ["🎨 Communication visuelle & personal branding", "📊 Présentation dynamique & pitch visuel", "🎥 Storytelling vidéo & réseaux sociaux"] },
    K: { title: "Kinesthésique", items: ["🤝 Animation d'équipe & workshops", "🎭 Expression scénique & public speaking", "🚀 Créativité en action & brainstorming dynamique"] },
    R: { title: "Reader (Lecteur)", items: ["📘 Communication persuasive écrite", "✍️ Copywriting & storytelling textuel", "📚 Développement de l'influence par l'écriture"] }
  },
  B: {
    V: { title: "Visuel", items: ["🎨 Communication visuelle & personal branding", "📊 Organisation, mind mapping & gestion du temps", "🎥 Création de supports visuels & vidéo learning"] },
    A: { title: "Auditif", items: ["🎧 Écoute active & analyse critique", "🧠 Structuration de pensée par l'oral", "🎤 Argumentation logique & débat structuré"] },
    K: { title: "Kinesthésique", items: ["🛠️ Résolution de problèmes par la pratique", "📐 Méthodologies agiles & expérimentation", "🔬 Analyse terrain & gestion de projet pratique"] },
    R: { title: "Reader (Lecteur)", items: ["📘 Analyse documentaire & recherche approfondie", "✍️ Rédaction technique & reporting professionnel", "📚 Veille stratégique & synthèse écrite"] }
  },
  V: {
    K: { title: "Kinesthésique", items: ["🤝 Leadership terrain & travail en équipe", "🛠️ Apprentissage par projet & simulations professionnelles", "🚀 Développement des soft skills par la pratique"] },
    A: { title: "Auditif", items: ["🎧 Écoute empathique & médiation", "🤝 Communication bienveillante & feedback constructif", "🧠 Coaching d'équipe & facilitation de groupe"] },
    V: { title: "Visuel", items: ["📊 Gestion visuelle de projet & planification", "🎨 Design thinking & cartographie collaborative", "🎥 Communication visuelle pour l'accompagnement"] },
    R: { title: "Reader (Lecteur)", items: ["📘 Documentation collaborative & partage de connaissances", "✍️ Communication écrite empathique", "📚 Développement personnel par la lecture partagée"] }
  },
  R: {
    R: { title: "Reader (Lecteur)", items: ["📘 Méthodologie d'apprentissage & prise de notes efficaces", "✍️ Communication écrite & rédaction professionnelle", "📚 Développement personnel par la lecture guidée"] },
    A: { title: "Auditif", items: ["🎤 Leadership vocal & prise de décision orale", "🧠 Négociation & persuasion par la parole", "🎧 Management directif & communication d'impact"] },
    V: { title: "Visuel", items: ["📊 Pilotage visuel & tableaux de bord", "🎨 Communication percutante & design d'impact", "🎥 Présentation stratégique & pitch de décision"] },
    K: { title: "Kinesthésique", items: ["🚀 Prise d'initiative & gestion de crise", "🛠️ Leadership par l'action & management opérationnel", "🤝 Conduite du changement par la pratique"] }
  }
};

const recommendationsEn = {
  J: {
    A: { title: "Auditory", items: ["🎤 Public speaking & storytelling", "🧠 Emotional intelligence", "🎧 Oral coaching & podcast learning"] },
    V: { title: "Visual", items: ["🎨 Visual communication & personal branding", "📊 Dynamic presentation & visual pitch", "🎥 Video storytelling & social media"] },
    K: { title: "Kinesthetic", items: ["🤝 Team facilitation & workshops", "🎭 Stage performance & public speaking", "🚀 Creativity in action & dynamic brainstorming"] },
    R: { title: "Reader", items: ["📘 Persuasive written communication", "✍️ Copywriting & textual storytelling", "📚 Influence development through writing"] }
  },
  B: {
    V: { title: "Visual", items: ["🎨 Visual communication & personal branding", "📊 Organization, mind mapping & time management", "🎥 Visual content creation & video learning"] },
    A: { title: "Auditory", items: ["🎧 Active listening & critical analysis", "🧠 Structuring thought through speech", "🎤 Logical argumentation & structured debate"] },
    K: { title: "Kinesthetic", items: ["🛠️ Problem-solving through practice", "📐 Agile methodologies & experimentation", "🔬 Field analysis & practical project management"] },
    R: { title: "Reader", items: ["📘 Documentary analysis & in-depth research", "✍️ Technical writing & professional reporting", "📚 Strategic monitoring & written synthesis"] }
  },
  V: {
    K: { title: "Kinesthetic", items: ["🤝 Field leadership & teamwork", "🛠️ Project-based learning & professional simulations", "🚀 Soft skills development through practice"] },
    A: { title: "Auditory", items: ["🎧 Empathetic listening & mediation", "🤝 Caring communication & constructive feedback", "🧠 Team coaching & group facilitation"] },
    V: { title: "Visual", items: ["📊 Visual project management & planning", "🎨 Design thinking & collaborative mapping", "🎥 Visual communication for support"] },
    R: { title: "Reader", items: ["📘 Collaborative documentation & knowledge sharing", "✍️ Empathetic written communication", "📚 Personal development through shared reading"] }
  },
  R: {
    R: { title: "Reader", items: ["📘 Learning methodology & effective note-taking", "✍️ Written communication & professional writing", "📚 Personal development through guided reading"] },
    A: { title: "Auditory", items: ["🎤 Vocal leadership & oral decision-making", "🧠 Negotiation & persuasion through speech", "🎧 Directive management & impactful communication"] },
    V: { title: "Visual", items: ["📊 Visual piloting & dashboards", "🎨 Impactful communication & impact design", "🎥 Strategic presentation & decision pitch"] },
    K: { title: "Kinesthetic", items: ["🚀 Initiative & crisis management", "🛠️ Leadership through action & operational management", "🤝 Change management through practice"] }
  }
};

const recommendationsAr = {
  J: {
    A: { title: "سمعي", items: ["🎤 التحدث العام وسرد القصص", "🧠 الذكاء العاطفي", "🎧 التدريب الشفهي والبودكاست"] },
    V: { title: "بصري", items: ["🎨 التواصل المرئي والعلامة التجارية الشخصية", "📊 العرض الديناميكي والعرض المرئي", "🎥 سرد القصص بالفيديو ووسائل التواصل الاجتماعي"] },
    K: { title: "حركي", items: ["🤝 تسهيل الفريق وورش العمل", "🎭 الأداء المسرحي والتحدث أمام الجمهور", "🚀 الإبداع في العمل والعصف الذهني الديناميكي"] },
    R: { title: "قارئ", items: ["📘 التواصل الكتابي المقنع", "✍️ كتابة النصوص وسرد القصص النصي", "📚 تطوير التأثير من خلال الكتابة"] }
  },
  B: {
    V: { title: "بصري", items: ["🎨 التواصل المرئي والعلامة التجارية الشخصية", "📊 التنظيم والخرائط الذهنية وإدارة الوقت", "🎥 إنشاء محتوى مرئي والتعلم بالفيديو"] },
    A: { title: "سمعي", items: ["🎧 الاستماع النشط والتحليل النقدي", "🧠 تنظيم الفكر من خلال الكلام", "🎤 الحجة المنطقية والنقاش المنظم"] },
    K: { title: "حركي", items: ["🛠️ حل المشكلات من خلال الممارسة", "📐 المنهجيات الرشيقة والتجريب", "🔬 التحليل الميداني وإدارة المشاريع العملية"] },
    R: { title: "قارئ", items: ["📘 التحليل الوثائقي والبحث المتعمق", "✍️ الكتابة التقنية والتقارير المهنية", "📚 المراقبة الاستراتيجية والتوليف الكتابي"] }
  },
  V: {
    K: { title: "حركي", items: ["🤝 القيادة الميدانية والعمل الجماعي", "🛠️ التعلم القائم على المشاريع والمحاكاة المهنية", "🚀 تطوير المهارات الناعمة من خلال الممارسة"] },
    A: { title: "سمعي", items: ["🎧 الاستماع التعاطفي والوساطة", "🤝 التواصل الرعوي والملاحظات البناءة", "🧠 تدريب الفريق وتيسير المجموعة"] },
    V: { title: "بصري", items: ["📊 إدارة المشاريع المرئية والتخطيط", "🎨 التفكير التصميمي ورسم الخرائط التعاونية", "🎥 التواصل المرئي للدعم"] },
    R: { title: "قارئ", items: ["📘 التوثيق التعاوني ومشاركة المعرفة", "✍️ التواصل الكتابي التعاطفي", "📚 التطوير الشخصي من خلال القراءة المشتركة"] }
  },
  R: {
    R: { title: "قارئ", items: ["📘 منهجية التعلم وتدوين الملاحظات الفعال", "✍️ التواصل الكتابي والكتابة المهنية", "📚 التطوير الشخصي من خلال القراءة الموجهة"] },
    A: { title: "سمعي", items: ["🎤 القيادة الصوتية واتخاذ القرارات الشفهية", "🧠 التفاوض والإقناع من خلال الكلام", "🎧 الإدارة التوجيهية والتواصل المؤثر"] },
    V: { title: "بصري", items: ["📊 القيادة المرئية ولوحات المعلومات", "🎨 التواصل المؤثر والتصميم ذو التأثير", "🎥 العرض الاستراتيجي وعرض القرار"] },
    K: { title: "حركي", items: ["🚀 المبادرة وإدارة الأزمات", "🛠️ القيادة من خلال العمل والإدارة التشغيلية", "🤝 إدارة التغيير من خلال الممارسة"] }
  }
};


export { recommendationsFr, recommendationsEn, recommendationsAr };
export default recommendationsFr;
