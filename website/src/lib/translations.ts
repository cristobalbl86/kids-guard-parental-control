export type Locale = 'en' | 'es';

export const translations = {
  en: {
    // Header / Nav
    nav: {
      features: 'Features',
      benefits: 'Benefits',
      screenshots: 'Screenshots',
      techStack: 'Tech Stack',
      contact: 'Contact',
      download: 'Download',
    },

    // Hero
    hero: {
      badge: 'Free on Google Play',
      titleLine1: 'Take control of',
      titleLine2: "your child's device",
      description:
        'Lock volume levels, set screen time limits, and protect settings with a hardware-encrypted PIN. Real enforcement at the Android system level.',
      langLabel: 'English & Spanish',
      scrollToExplore: 'Scroll to explore',
      phoneName: 'Kids Guard',
      phoneSubtitle: 'Parental Control',
    },

    // Features
    features: {
      badge: 'Features',
      title: 'Everything you need to keep kids safe',
      description:
        'Real enforcement at the Android system level. Not just suggestions \u2014 actual locks that children cannot bypass.',
      items: [
        {
          title: 'Volume Control',
          description:
            'Lock device volume at any level. Native Android enforcement instantly reverts unauthorized changes \u2014 even when kids press hardware buttons.',
        },
        {
          title: 'Screen Time Limits',
          description:
            'Set daily limits from 15 minutes to 8 hours. A full-screen lock overlay activates automatically when time expires.',
        },
        {
          title: 'PIN Protection',
          description:
            '4-digit PIN stored with hardware-level encryption. Exponential lockout after failed attempts prevents brute-force access.',
        },
        {
          title: 'Parent Verification',
          description:
            "A simple math problem during setup ensures only adults can configure parental controls. Kids can't bypass it.",
        },
        {
          title: 'Background Enforcement',
          description:
            'Runs as a foreground service to keep settings enforced. Automatically restarts after device reboot.',
        },
        {
          title: 'Bilingual Support',
          description:
            'Full English and Spanish support with automatic device language detection. No configuration needed.',
        },
      ],
    },

    // Benefits
    benefits: {
      badge: 'Benefits',
      title: 'Good for parents. Good for kids.',
      description:
        "Setting healthy boundaries helps the whole family. Here's how Kids Guard benefits everyone.",
      forParents: 'For Parents',
      forKids: 'For Kids',
      parents: [
        {
          title: 'Real Enforcement',
          description:
            'Volume locks at the native level \u2014 changes are reverted instantly, not after a delay.',
        },
        {
          title: 'Peace of Mind',
          description:
            'Set it and forget it. Controls stay active even when the app is in the background.',
        },
        {
          title: 'Easy Setup',
          description:
            'Get up and running in under a minute. No accounts, no cloud, no complexity.',
        },
        {
          title: 'Secure by Design',
          description:
            'PIN is hardware-encrypted. No data leaves the device. Fully GDPR/COPPA compliant.',
        },
        {
          title: 'Free to Use',
          description:
            'All features available for free. No premium tiers or hidden paywalls.',
        },
      ],
      kids: [
        {
          title: 'Consistent Rules',
          description:
            'Clear, predictable limits help kids understand boundaries.',
        },
        {
          title: 'Fair Time Management',
          description:
            'Screen time limits encourage balanced device usage and healthier habits.',
        },
        {
          title: 'Device Still Usable',
          description:
            'Kids can use their device normally within the limits set by parents.',
        },
        {
          title: 'No Surprises',
          description:
            'Remaining screen time is visible, so kids can plan their usage.',
        },
      ],
    },

    // Screenshots
    screenshots: {
      badge: 'Screenshots',
      title: 'See it in action',
      description:
        'A clean, intuitive interface designed for parents. No clutter, no confusion \u2014 just the controls you need.',
      labels: [
        'Welcome Screen',
        'Home Dashboard',
        'Parent Settings',
        'Screen Time',
        'PIN Entry',
      ],
      scrollHint: 'Scroll horizontally to see more screens',
      replaceWithScreenshot: 'Replace with screenshot',
    },

    // TechStack
    techStack: {
      badge: 'Built With',
      title: 'Modern tech stack',
      description:
        'Built with proven technologies for reliability, performance, and security.',
    },

    // DownloadCTA
    downloadCTA: {
      title: "Ready to protect your child's device?",
      description:
        'Download Kids Guard for free. Set up in under a minute. No accounts, no cloud, no complexity.',
      androidRequired: 'required',
    },

    // Footer
    footer: {
      product: 'Product',
      legal: 'Legal',
      developer: 'Developer',
      privacyPolicy: 'Privacy Policy',
      allRightsReserved: 'All rights reserved.',
      madeWith: 'Made with',
      forFamilies: 'for families',
      downloadOnGooglePlay: 'Download on Google Play',
    },

    // Contact page
    contact: {
      badge: 'Contact',
      title: 'Get in touch',
      description:
        "Have questions, feedback, or suggestions? We'd love to hear from you.",
      independentDeveloper: 'Independent Developer',
      remoteDeveloper: 'Remote Developer',
      aboutDeveloper:
        "Kids Guard is an independently developed app focused on giving parents real control over their children's Android devices. All feedback helps make the app better.",
      sendAMessage: 'Send a message',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'you@example.com',
      subject: 'Subject',
      subjectPlaceholder: "What's this about?",
      message: 'Message',
      messagePlaceholder: 'Your message...',
      sendButton: 'Send Message',
      sending: 'Sending...',
      messageSent: 'Message Sent!',
      thankYou: "Thank you for reaching out. We'll get back to you soon.",
      sendAnother: 'Send another message',
      formNotConfigured:
        'Contact form is not yet configured. Please email us directly.',
      formError:
        'Failed to send message. Please try again or email us directly.',
    },

    // Privacy page
    privacy: {
      title: 'Privacy Policy for Kids Guard - Parental Control',
      effectiveDate: 'Effective Date',
      lastUpdated: 'Last Updated',
      introduction: 'Introduction',
      introText:
        'This privacy policy applies to the Kids Guard - Parental Control mobile application (\u201cApp\u201d) for Android devices. This policy describes how we handle information in connection with the App.',
      developerInfo: 'Developer Information',
      appName: 'App Name',
      developerLabel: 'Developer',
      contactEmail: 'Contact Email',
      contactLabel: 'Contact',
      appPackage: 'App Package',
      infoWeCollect: 'Information We Collect',
      infoStoredLocally: 'Information Stored Locally',
      infoStoredLocallyDesc:
        'The App stores the following information locally on your device only:',
      parentPIN: 'Parent PIN',
      parentPINDesc: 'A PIN code you create to protect parent settings',
      volumeSettings: 'Volume Settings',
      volumeSettingsDesc: 'Your configured volume level and lock status',
      brightnessSettings: 'Brightness Settings',
      brightnessSettingsDesc:
        'Your configured brightness level and lock status',
      adTimestamps: 'Ad Display Timestamps',
      adTimestampsDesc: 'When ads were last shown (for frequency control)',
      importantLocalStorage:
        "Important: All this information is stored locally on your device using Android's secure storage. We do not transmit this data to any servers or third parties.",
      infoWeDoNotCollect: 'Information We Do NOT Collect',
      infoWeDoNotCollectDesc:
        'We do NOT collect, store, or transmit:',
      noCollectItems: [
        'Personal information (name, email, phone number, address)',
        'Device identifiers (beyond what AdMob collects - see below)',
        'Location data',
        'Photos, contacts, or other personal files',
        'Usage analytics or behavioral data',
        'Any data from your device outside the app',
      ],
      thirdPartyServices: 'Third-Party Services',
      googleAdMob: 'Google AdMob',
      adMobDesc:
        'The App uses Google AdMob to display advertisements. AdMob may collect certain information to serve personalized ads:',
      deviceInfo: 'Device Information',
      deviceInfoDesc: 'Device model, operating system version',
      advertisingID: 'Advertising ID',
      advertisingIDDesc: 'Google Advertising ID for ad personalization',
      usageData: 'Usage Data',
      usageDataDesc: 'Ad interaction data',
      adMobGoverned: "AdMob's data collection is governed by Google's Privacy Policy:",
      googlePrivacyPolicy: 'Google Privacy Policy',
      adMobPrivacyInfo: 'AdMob Privacy Information',
      adSettings: 'Ad Settings',
      adSettingsDesc: 'You can opt out of personalized ads by visiting:',
      adSettingsPath:
        'Android Settings > Google > Ads > Opt out of Ads Personalization',
      noOtherThirdParty: 'No Other Third-Party Services',
      noOtherThirdPartyDesc:
        'The App does not use any other third-party services, analytics, crash reporting, or data collection tools.',
      howWeUseInfo: 'How We Use Information',
      howWeUseInfoDesc:
        'The information stored locally on your device is used solely for:',
      appFunctionality: 'App Functionality',
      appFuncItems: [
        'Verifying parent PIN for access control',
        'Enforcing volume and brightness settings',
        'Managing ad display frequency (max once per 6 hours)',
      ],
      noOtherPurposes: 'No Other Purposes',
      noOtherPurposesDesc:
        'We do not use your information for marketing, profiling, or any other purposes.',
      dataSecurity: 'Data Security',
      localStorage: 'Local Storage',
      localStorageDesc:
        "All app data is stored locally on your device using Android's secure storage mechanisms",
      pinSecurity: 'PIN Security',
      pinSecurityDesc:
        'Parent PIN is stored using Android Keychain with hardware encryption',
      noTransmission: 'No Transmission',
      noTransmissionDesc:
        "No app data is transmitted over the internet (except AdMob's standard ad requests)",
      childrenPrivacy: "Children's Privacy",
      childrenPrivacyDesc:
        'This App is designed for parents to use, not children. The App is not directed at children under 13.',
      childrenItems: [
        'The App does not knowingly collect personal information from children',
        'The App requires a parent PIN to access settings',
        "The App is a parental control tool, not a children's app",
      ],
      childrenContact:
        'If you believe we have inadvertently collected information from a child under 13, please contact us immediately.',
      dataRetention: 'Data Retention and Deletion',
      localData: 'Local Data',
      localDataItems: ['All app data is stored on your device'],
      deleteDataIntro: 'You can delete all app data by:',
      deleteDataItems: [
        'Uninstalling the App, OR',
        'Going to Android Settings > Apps > Kids Guard > Storage > Clear Data',
      ],
      adMobData: 'AdMob Data',
      adMobDataItems: [
        'AdMob data is managed by Google',
        'To reset your advertising ID: Android Settings > Google > Ads > Reset advertising ID',
      ],
      deleteGoogleData: 'To delete Google account data: Visit',
      myActivity: 'My Activity',
      yourRights: 'Your Rights',
      yourRightsDesc: 'You have the right to:',
      access: 'Access',
      accessDesc:
        'View all data stored by the App (stored locally on your device)',
      delete: 'Delete',
      deleteDesc:
        'Delete all app data by clearing storage or uninstalling',
      optOut: 'Opt-out',
      optOutDesc: 'Opt out of personalized ads via Android settings',
      contactRight: 'Contact',
      contactRightDesc: 'Contact us with questions or concerns',
      changesToPolicy: 'Changes to This Privacy Policy',
      changesToPolicyDesc:
        'We may update this Privacy Policy from time to time. Changes will be posted in the App and on this page. Continued use of the App after changes constitutes acceptance of the updated policy.',
      compliance: 'Compliance',
      complianceDesc: 'This App and Privacy Policy comply with:',
      complianceItems: [
        'Google Play Developer Program Policies',
        'Android Developer Policy',
        'General Data Protection Regulation (GDPR) - for EU users',
        'California Consumer Privacy Act (CCPA) - for California users',
        "Children's Online Privacy Protection Act (COPPA)",
      ],
      contactUs: 'Contact Us',
      contactUsDesc:
        "If you have questions, concerns, or requests regarding this Privacy Policy or the App's data practices, please",
      contactUsLink: 'contact us',
      orEmailAt: 'or email us at',
      responseTime: 'Response Time: We aim to respond within 48 hours.',
      summary: 'Summary',
      whatWeCollect: 'What we collect',
      whatWeCollectDesc:
        'Nothing personally identifiable. Only local app settings.',
      whatWeShare: 'What we share',
      whatWeShareDesc: "Nothing. We don't transmit your data.",
      thirdParties: 'Third parties',
      thirdPartiesDesc:
        "Only Google AdMob for ads (governed by Google's policies).",
      yourControl: 'Your control',
      yourControlDesc:
        'Uninstall or clear app data to remove everything.',
      lastUpdatedNote:
        'This privacy policy was last updated on January 3, 2026. Please review periodically for updates.',
    },
  },

  es: {
    // Header / Nav
    nav: {
      features: 'Funciones',
      benefits: 'Beneficios',
      screenshots: 'Capturas',
      techStack: 'Tecnolog\u00eda',
      contact: 'Contacto',
      download: 'Descargar',
    },

    // Hero
    hero: {
      badge: 'Gratis en Google Play',
      titleLine1: 'Toma el control del',
      titleLine2: 'dispositivo de tu hijo',
      description:
        'Bloquea el volumen, establece l\u00edmites de tiempo de pantalla y protege la configuraci\u00f3n con un PIN cifrado por hardware. Control real a nivel del sistema Android.',
      langLabel: 'Ingl\u00e9s y Espa\u00f1ol',
      scrollToExplore: 'Despl\u00e1zate para explorar',
      phoneName: 'Kids Guard',
      phoneSubtitle: 'Control Parental',
    },

    // Features
    features: {
      badge: 'Funciones',
      title: 'Todo lo que necesitas para proteger a tus hijos',
      description:
        'Control real a nivel del sistema Android. No son solo sugerencias \u2014 son bloqueos reales que los ni\u00f1os no pueden evadir.',
      items: [
        {
          title: 'Control de Volumen',
          description:
            'Bloquea el volumen del dispositivo a cualquier nivel. El control nativo de Android revierte los cambios al instante, incluso con los botones f\u00edsicos.',
        },
        {
          title: 'L\u00edmites de Tiempo de Pantalla',
          description:
            'Establece l\u00edmites diarios de 15 minutos a 8 horas. Una pantalla de bloqueo se activa autom\u00e1ticamente cuando se agota el tiempo.',
        },
        {
          title: 'Protecci\u00f3n con PIN',
          description:
            'PIN de 4 d\u00edgitos almacenado con cifrado a nivel de hardware. Bloqueo exponencial tras intentos fallidos para prevenir accesos no autorizados.',
        },
        {
          title: 'Verificaci\u00f3n de Padres',
          description:
            'Un problema matem\u00e1tico simple durante la configuraci\u00f3n asegura que solo los adultos puedan configurar los controles parentales.',
        },
        {
          title: 'Control en Segundo Plano',
          description:
            'Se ejecuta como servicio en primer plano para mantener la configuraci\u00f3n activa. Se reinicia autom\u00e1ticamente tras reiniciar el dispositivo.',
        },
        {
          title: 'Soporte Biling\u00fce',
          description:
            'Soporte completo en ingl\u00e9s y espa\u00f1ol con detecci\u00f3n autom\u00e1tica del idioma del dispositivo. Sin configuraci\u00f3n necesaria.',
        },
      ],
    },

    // Benefits
    benefits: {
      badge: 'Beneficios',
      title: 'Bueno para padres. Bueno para ni\u00f1os.',
      description:
        'Establecer l\u00edmites saludables ayuda a toda la familia. As\u00ed es como Kids Guard beneficia a todos.',
      forParents: 'Para Padres',
      forKids: 'Para Ni\u00f1os',
      parents: [
        {
          title: 'Control Real',
          description:
            'El volumen se bloquea a nivel nativo \u2014 los cambios se revierten al instante, sin demora.',
        },
        {
          title: 'Tranquilidad',
          description:
            'Configura y olvida. Los controles permanecen activos incluso con la app en segundo plano.',
        },
        {
          title: 'Configuraci\u00f3n F\u00e1cil',
          description:
            'Listo en menos de un minuto. Sin cuentas, sin nube, sin complicaciones.',
        },
        {
          title: 'Seguro por Dise\u00f1o',
          description:
            'El PIN est\u00e1 cifrado por hardware. Ning\u00fan dato sale del dispositivo. Cumple con GDPR/COPPA.',
        },
        {
          title: 'Gratis',
          description:
            'Todas las funciones disponibles gratis. Sin planes premium ni costos ocultos.',
        },
      ],
      kids: [
        {
          title: 'Reglas Consistentes',
          description:
            'L\u00edmites claros y predecibles ayudan a los ni\u00f1os a entender los l\u00edmites.',
        },
        {
          title: 'Gesti\u00f3n Justa del Tiempo',
          description:
            'Los l\u00edmites de tiempo de pantalla fomentan un uso equilibrado y h\u00e1bitos m\u00e1s saludables.',
        },
        {
          title: 'Dispositivo Funcional',
          description:
            'Los ni\u00f1os pueden usar su dispositivo normalmente dentro de los l\u00edmites establecidos.',
        },
        {
          title: 'Sin Sorpresas',
          description:
            'El tiempo restante de pantalla es visible, para que los ni\u00f1os planifiquen su uso.',
        },
      ],
    },

    // Screenshots
    screenshots: {
      badge: 'Capturas',
      title: 'M\u00edralo en acci\u00f3n',
      description:
        'Una interfaz limpia e intuitiva dise\u00f1ada para padres. Sin desorden, sin confusi\u00f3n \u2014 solo los controles que necesitas.',
      labels: [
        'Pantalla de Bienvenida',
        'Panel Principal',
        'Configuraci\u00f3n',
        'Tiempo de Pantalla',
        'Ingreso de PIN',
      ],
      scrollHint: 'Despl\u00e1zate horizontalmente para ver m\u00e1s pantallas',
      replaceWithScreenshot: 'Reemplazar con captura',
    },

    // TechStack
    techStack: {
      badge: 'Construido Con',
      title: 'Tecnolog\u00eda moderna',
      description:
        'Construido con tecnolog\u00edas probadas para confiabilidad, rendimiento y seguridad.',
    },

    // DownloadCTA
    downloadCTA: {
      title: '\u00bfListo para proteger el dispositivo de tu hijo?',
      description:
        'Descarga Kids Guard gratis. Configuraci\u00f3n en menos de un minuto. Sin cuentas, sin nube, sin complicaciones.',
      androidRequired: 'requerido',
    },

    // Footer
    footer: {
      product: 'Producto',
      legal: 'Legal',
      developer: 'Desarrollador',
      privacyPolicy: 'Pol\u00edtica de Privacidad',
      allRightsReserved: 'Todos los derechos reservados.',
      madeWith: 'Hecho con',
      forFamilies: 'para familias',
      downloadOnGooglePlay: 'Descargar en Google Play',
    },

    // Contact page
    contact: {
      badge: 'Contacto',
      title: 'Ponte en contacto',
      description:
      '\u00bfTienes preguntas, comentarios o sugerencias? Nos encantar\u00eda saber de ti.',
      independentDeveloper: 'Desarrollador Independiente',
      remoteDeveloper: 'Desarrollador Remoto',
      aboutDeveloper:
        'Kids Guard es una aplicaci\u00f3n desarrollada de forma independiente, enfocada en dar a los padres control real sobre los dispositivos Android de sus hijos. Todos los comentarios ayudan a mejorar la app.',
      sendAMessage: 'Enviar un mensaje',
      name: 'Nombre',
      namePlaceholder: 'Tu nombre',
      email: 'Correo electr\u00f3nico',
      emailPlaceholder: 'tu@ejemplo.com',
      subject: 'Asunto',
      subjectPlaceholder: '\u00bfDe qu\u00e9 se trata?',
      message: 'Mensaje',
      messagePlaceholder: 'Tu mensaje...',
      sendButton: 'Enviar Mensaje',
      sending: 'Enviando...',
      messageSent: '\u00a1Mensaje Enviado!',
      thankYou: 'Gracias por escribirnos. Te responderemos pronto.',
      sendAnother: 'Enviar otro mensaje',
      formNotConfigured:
        'El formulario a\u00fan no est\u00e1 configurado. Por favor, env\u00edanos un correo directamente.',
      formError:
        'Error al enviar el mensaje. Int\u00e9ntalo de nuevo o env\u00edanos un correo.',
    },

    // Privacy page
    privacy: {
      title: 'Pol\u00edtica de Privacidad de Kids Guard - Control Parental',
      effectiveDate: 'Fecha de vigencia',
      lastUpdated: '\u00daltima actualizaci\u00f3n',
      introduction: 'Introducci\u00f3n',
      introText:
        'Esta pol\u00edtica de privacidad se aplica a la aplicaci\u00f3n m\u00f3vil Kids Guard - Control Parental (\u201cApp\u201d) para dispositivos Android. Esta pol\u00edtica describe c\u00f3mo manejamos la informaci\u00f3n en relaci\u00f3n con la App.',
      developerInfo: 'Informaci\u00f3n del Desarrollador',
      appName: 'Nombre de la App',
      developerLabel: 'Desarrollador',
      contactEmail: 'Correo de Contacto',
      contactLabel: 'Contacto',
      appPackage: 'Paquete de la App',
      infoWeCollect: 'Informaci\u00f3n que Recopilamos',
      infoStoredLocally: 'Informaci\u00f3n Almacenada Localmente',
      infoStoredLocallyDesc:
        'La App almacena la siguiente informaci\u00f3n solo localmente en tu dispositivo:',
      parentPIN: 'PIN de Padres',
      parentPINDesc:
        'Un c\u00f3digo PIN que creas para proteger la configuraci\u00f3n de padres',
      volumeSettings: 'Configuraci\u00f3n de Volumen',
      volumeSettingsDesc:
        'Tu nivel de volumen configurado y estado de bloqueo',
      brightnessSettings: 'Configuraci\u00f3n de Brillo',
      brightnessSettingsDesc:
        'Tu nivel de brillo configurado y estado de bloqueo',
      adTimestamps: 'Marcas de Tiempo de Anuncios',
      adTimestampsDesc:
        'Cu\u00e1ndo se mostraron los anuncios por \u00faltima vez (para control de frecuencia)',
      importantLocalStorage:
        'Importante: Toda esta informaci\u00f3n se almacena localmente en tu dispositivo usando el almacenamiento seguro de Android. No transmitimos estos datos a ning\u00fan servidor ni a terceros.',
      infoWeDoNotCollect: 'Informaci\u00f3n que NO Recopilamos',
      infoWeDoNotCollectDesc:
        'NO recopilamos, almacenamos ni transmitimos:',
      noCollectItems: [
        'Informaci\u00f3n personal (nombre, correo, tel\u00e9fono, direcci\u00f3n)',
        'Identificadores del dispositivo (m\u00e1s all\u00e1 de lo que AdMob recopila - ver abajo)',
        'Datos de ubicaci\u00f3n',
        'Fotos, contactos u otros archivos personales',
        'An\u00e1lisis de uso o datos de comportamiento',
        'Cualquier dato de tu dispositivo fuera de la app',
      ],
      thirdPartyServices: 'Servicios de Terceros',
      googleAdMob: 'Google AdMob',
      adMobDesc:
        'La App usa Google AdMob para mostrar anuncios. AdMob puede recopilar cierta informaci\u00f3n para mostrar anuncios personalizados:',
      deviceInfo: 'Informaci\u00f3n del Dispositivo',
      deviceInfoDesc: 'Modelo del dispositivo, versi\u00f3n del sistema operativo',
      advertisingID: 'ID de Publicidad',
      advertisingIDDesc:
        'ID de publicidad de Google para personalizaci\u00f3n de anuncios',
      usageData: 'Datos de Uso',
      usageDataDesc: 'Datos de interacci\u00f3n con anuncios',
      adMobGoverned:
        'La recopilaci\u00f3n de datos de AdMob est\u00e1 regida por la Pol\u00edtica de Privacidad de Google:',
      googlePrivacyPolicy: 'Pol\u00edtica de Privacidad de Google',
      adMobPrivacyInfo: 'Informaci\u00f3n de Privacidad de AdMob',
      adSettings: 'Configuraci\u00f3n de Anuncios',
      adSettingsDesc:
        'Puedes optar por no recibir anuncios personalizados visitando:',
      adSettingsPath:
        'Configuraci\u00f3n de Android > Google > Anuncios > No participar en personalizaci\u00f3n de anuncios',
      noOtherThirdParty: 'Sin Otros Servicios de Terceros',
      noOtherThirdPartyDesc:
        'La App no usa ning\u00fan otro servicio de terceros, an\u00e1lisis, reportes de errores ni herramientas de recolecci\u00f3n de datos.',
      howWeUseInfo: 'C\u00f3mo Usamos la Informaci\u00f3n',
      howWeUseInfoDesc:
        'La informaci\u00f3n almacenada localmente en tu dispositivo se usa exclusivamente para:',
      appFunctionality: 'Funcionalidad de la App',
      appFuncItems: [
        'Verificar el PIN de padres para control de acceso',
        'Aplicar la configuraci\u00f3n de volumen y brillo',
        'Gestionar la frecuencia de anuncios (m\u00e1ximo una vez cada 6 horas)',
      ],
      noOtherPurposes: 'Sin Otros Prop\u00f3sitos',
      noOtherPurposesDesc:
        'No usamos tu informaci\u00f3n para marketing, perfilado ni ning\u00fan otro prop\u00f3sito.',
      dataSecurity: 'Seguridad de Datos',
      localStorage: 'Almacenamiento Local',
      localStorageDesc:
        'Todos los datos de la app se almacenan localmente usando los mecanismos de almacenamiento seguro de Android',
      pinSecurity: 'Seguridad del PIN',
      pinSecurityDesc:
        'El PIN de padres se almacena usando Android Keychain con cifrado por hardware',
      noTransmission: 'Sin Transmisi\u00f3n',
      noTransmissionDesc:
        'Ning\u00fan dato de la app se transmite por internet (excepto las solicitudes est\u00e1ndar de anuncios de AdMob)',
      childrenPrivacy: 'Privacidad de los Ni\u00f1os',
      childrenPrivacyDesc:
        'Esta App est\u00e1 dise\u00f1ada para que la usen los padres, no los ni\u00f1os. La App no est\u00e1 dirigida a menores de 13 a\u00f1os.',
      childrenItems: [
        'La App no recopila intencionalmente informaci\u00f3n personal de ni\u00f1os',
        'La App requiere un PIN de padres para acceder a la configuraci\u00f3n',
        'La App es una herramienta de control parental, no una app para ni\u00f1os',
      ],
      childrenContact:
        'Si crees que hemos recopilado informaci\u00f3n de un menor de 13 a\u00f1os, cont\u00e1ctanos inmediatamente.',
      dataRetention: 'Retenci\u00f3n y Eliminaci\u00f3n de Datos',
      localData: 'Datos Locales',
      localDataItems: [
        'Todos los datos de la app est\u00e1n almacenados en tu dispositivo',
      ],
      deleteDataIntro: 'Puedes eliminar todos los datos de la app:',
      deleteDataItems: [
        'Desinstalando la App, O',
        'Yendo a Configuraci\u00f3n de Android > Apps > Kids Guard > Almacenamiento > Borrar datos',
      ],
      adMobData: 'Datos de AdMob',
      adMobDataItems: [
        'Los datos de AdMob son gestionados por Google',
        'Para restablecer tu ID de publicidad: Configuraci\u00f3n de Android > Google > Anuncios > Restablecer ID de publicidad',
      ],
      deleteGoogleData:
        'Para eliminar datos de tu cuenta de Google: Visita',
      myActivity: 'Mi Actividad',
      yourRights: 'Tus Derechos',
      yourRightsDesc: 'Tienes derecho a:',
      access: 'Acceso',
      accessDesc:
        'Ver todos los datos almacenados por la App (almacenados localmente en tu dispositivo)',
      delete: 'Eliminaci\u00f3n',
      deleteDesc:
        'Eliminar todos los datos de la app borrando el almacenamiento o desinstalando',
      optOut: 'Exclusi\u00f3n',
      optOutDesc:
        'No participar en anuncios personalizados a trav\u00e9s de la configuraci\u00f3n de Android',
      contactRight: 'Contacto',
      contactRightDesc: 'Contactarnos con preguntas o inquietudes',
      changesToPolicy: 'Cambios a Esta Pol\u00edtica de Privacidad',
      changesToPolicyDesc:
        'Podemos actualizar esta Pol\u00edtica de Privacidad de vez en cuando. Los cambios se publicar\u00e1n en la App y en esta p\u00e1gina. El uso continuado de la App despu\u00e9s de los cambios constituye la aceptaci\u00f3n de la pol\u00edtica actualizada.',
      compliance: 'Cumplimiento',
      complianceDesc: 'Esta App y Pol\u00edtica de Privacidad cumplen con:',
      complianceItems: [
        'Pol\u00edticas del Programa de Desarrolladores de Google Play',
        'Pol\u00edtica de Desarrolladores de Android',
        'Reglamento General de Protecci\u00f3n de Datos (GDPR) - para usuarios de la UE',
        'Ley de Privacidad del Consumidor de California (CCPA) - para usuarios de California',
        'Ley de Protecci\u00f3n de la Privacidad Infantil en L\u00ednea (COPPA)',
      ],
      contactUs: 'Cont\u00e1ctanos',
      contactUsDesc:
        'Si tienes preguntas, inquietudes o solicitudes sobre esta Pol\u00edtica de Privacidad o las pr\u00e1cticas de datos de la App, por favor',
      contactUsLink: 'cont\u00e1ctanos',
      orEmailAt: 'o env\u00edanos un correo a',
      responseTime:
        'Tiempo de respuesta: Nos proponemos responder en 48 horas.',
      summary: 'Resumen',
      whatWeCollect: 'Lo que recopilamos',
      whatWeCollectDesc:
        'Nada identificable personalmente. Solo configuraci\u00f3n local de la app.',
      whatWeShare: 'Lo que compartimos',
      whatWeShareDesc: 'Nada. No transmitimos tus datos.',
      thirdParties: 'Terceros',
      thirdPartiesDesc:
        'Solo Google AdMob para anuncios (regido por las pol\u00edticas de Google).',
      yourControl: 'Tu control',
      yourControlDesc:
        'Desinstala o borra los datos de la app para eliminar todo.',
      lastUpdatedNote:
        'Esta pol\u00edtica de privacidad fue actualizada por \u00faltima vez el 3 de enero de 2026. Rev\u00edsala peri\u00f3dicamente para actualizaciones.',
    },
  },
};

export type Translations = typeof translations.en;
