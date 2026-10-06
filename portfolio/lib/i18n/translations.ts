export type Lang = 'es' | 'en';

export const translations = {
  es: {
    hero: {
      tagline: 'Explorando Tecnología, Música y Economía',
      ctaPrimary: 'Ver Proyectos',
      ctaSecondary: 'Conocer más',
    },
    about: {
      heading: 'Apasionado por herramientas que resuelven problemas reales.',
      headingParts: {
        prefix: 'Apasionado por',
        word1: 'herramientas',
        mid: 'que',
        word2: 'resuelven',
        mid2: 'problemas',
        word3: 'reales',
      },
      bio1: 'Desde muy joven me formé sin saberlo en ingeniería, con un fuerte interés en la mecánica automotriz, lo que despertó mi pasión por la física y la tecnología. Trabajé en proyectos de desarrollo de software, diseño de circuitos electrónicos, sistemas de control y reconocimiento de imágenes.',
      bio2: 'Actualmente soy ingeniero electrónico graduado en la FIUBA y me dedico al desarrollo de software para automatización industrial y sistemas IIoT.',
      skills: ['Python', 'TIA Portal', 'AutoCAD', 'Power Automate', 'Next.js', 'TypeScript', 'SQL'],
    },
    projects: {
      heading: 'Proyectos.',
      binexa: 'Conversor entre binario, decimal, hexadecimal y octal en tiempo real.',
      openVision: 'Herramienta minimalista para testear modelos de visión computacional en el browser.',
      centralMap: 'Calcula el centro geográfico entre múltiples direcciones y lo visualiza en un mapa interactivo.',
      tpp: 'Sistema de potencia eléctrica para satélites CubeSat con gestión de baterías en C/STM32.',
      linda: 'App de localización en tiempo real con privacidad garantizada mediante TEE y blockchain.',
      votacion: 'Sistema de votación para asambleas barriales con resultados en tiempo real.',
      voice2text: 'Transcripción de voz a texto en tiempo real usando modelos de IA en el browser.',
      omarchyDocker: 'Widget de Docker para Omarchy: contenedores, estado, controles y enlaces a servicios desde la barra.',
      omarchyVoxtype: 'Indicador de estado del dictado por voz (Voxtype) en la barra de Omarchy.',
      omarchyPower: 'Cambia a modo ahorro y apaga las pantallas tras un tiempo de inactividad, para Omarchy.',
      btParking: 'Para no perder el auto: detecta el Bluetooth del vehículo y guarda dónde estacionaste.',
    },
    contact: {
      heading: '¿Hablamos?',
    },
    footer: {
      built: 'Next.js · TypeScript · Tailwind · Framer Motion · GSAP',
    },
    cv: {
      back: '← Volver',
      spanish: 'ES',
      english: 'EN',
      download: 'Descargar',
    },
  },
  en: {
    hero: {
      tagline: 'Exploring Tech, Music & Economics',
      ctaPrimary: 'View Projects',
      ctaSecondary: 'Learn more',
    },
    about: {
      heading: 'Passionate about tools that solve real problems.',
      headingParts: {
        prefix: 'Passionate about',
        word1: 'tools',
        mid: 'that',
        word2: 'solve',
        mid2: 'real',
        word3: 'problems',
      },
      bio1: 'From an early age I unknowingly trained myself in engineering, with a strong interest in automotive mechanics, which sparked my passion for physics and technology. I have worked on software development projects, electronic circuit design, control systems, and image recognition.',
      bio2: 'I am currently an electronic engineer graduated from FIUBA, focused on software development for industrial automation and IIoT systems.',
      skills: ['Python', 'TIA Portal', 'AutoCAD', 'Power Automate', 'Next.js', 'TypeScript', 'SQL'],
    },
    projects: {
      heading: 'Projects.',
      binexa: 'Real-time converter between binary, decimal, hexadecimal and octal.',
      openVision: 'Minimalist tool to test computer vision models in the browser.',
      centralMap: 'Calculates the geographic center between multiple addresses and visualizes it on an interactive map.',
      tpp: 'Electrical power system for CubeSat satellites with battery management in C/STM32.',
      linda: 'Real-time location app with privacy guaranteed by TEE and blockchain.',
      votacion: 'Voting system for neighborhood assemblies with real-time results.',
      voice2text: 'Real-time speech-to-text transcription using AI models in the browser.',
      omarchyDocker: 'Docker widget for Omarchy: containers, status, controls and service links right in the bar.',
      omarchyVoxtype: 'Voice dictation (Voxtype) state indicator for the Omarchy bar.',
      omarchyPower: 'Switches to power-saver and turns displays off after idle, for Omarchy.',
      btParking: "Never lose your car: detects the car's Bluetooth and remembers where you parked.",
    },
    contact: {
      heading: "Let's talk?",
    },
    footer: {
      built: 'Next.js · TypeScript · Tailwind · Framer Motion · GSAP',
    },
    cv: {
      back: '← Back',
      spanish: 'ES',
      english: 'EN',
      download: 'Download',
    },
  },
};

export type Translations = typeof translations.es;
