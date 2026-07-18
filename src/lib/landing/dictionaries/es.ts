import type { Dictionary } from "./types"

// Español — idioma por defecto de la landing. Toda la copy visible vive aquí.
export const es: Dictionary = {
   meta: {
      title: "La Muralla | Gestión de proyectos",
      description:
         "La Muralla organiza el trabajo de tu equipo en tableros kanban e incidencias, con sprints, seguimiento en tiempo real y auditorías. Solicita una demo gratuita.",
      ogTitle: "La Muralla — Gestión de proyectos por tableros e incidencias",
      ogDescription:
         "Tableros kanban, sprints, incidencias y seguimiento en tiempo real para tu equipo. Agenda una demo de 30 minutos en Google Meet.",
      keywords: [
         "gestión de proyectos",
         "tableros kanban",
         "gestión de incidencias",
         "sprints",
         "seguimiento de tareas",
         "La Muralla",
         "Cartagena Corporation",
      ],
   },

   nav: {
      skipToContent: "Saltar al contenido",
      brandAlt: "La Muralla",
      hero: "Inicio",
      timeline: "Cómo funciona",
      stories: "Historias",
      schedule: "Agendar demo",
      faq: "Preguntas frecuentes",
      login: "Iniciar sesión",
      requestDemo: "Solicitar demo",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      language: "Idioma",
      switchToEs: "Español",
      switchToEn: "Inglés",
   },

   hero: {
      eyebrow: "Gestión de proyectos",
      h1: "La plataforma para gestionar tu trabajo",
      phrases: [
         "Organiza el trabajo de tu equipo en tableros kanban.",
         "Da seguimiento a cada incidencia en tiempo real.",
         "Planifica sprints y entrega tus proyectos a tiempo.",
         "Crea tareas en segundos con ayuda de la IA.",
         "Mide el rendimiento de tu equipo con auditorías.",
         "Cuando el caos de tareas frena a tu equipo, La Muralla lo ordena.",
      ],
      directAnswer:
         "La Muralla es una plataforma de gestión de proyectos que organiza el trabajo de tu equipo en tableros kanban e incidencias. Planifica sprints, arrastra tus tareas entre estados y sigue el progreso en tiempo real, todo en un solo lugar.",
      cta: "Solicitar Demo",
      secondaryCta: "Iniciar sesión",
      stats: [
         { value: "+12", label: "tableros activos" },
         { value: "+340", label: "incidencias gestionadas" },
         { value: "99.9%", label: "uptime" },
      ],
      demo: {
         badge: "Demo en vivo",
         title: "Pruébalo aquí mismo",
         hint: "Crea una incidencia y arrástrala entre columnas.",
         addIssue: "Nueva incidencia",
         reset: "Reiniciar",
         emptyColumn: "Sin incidencias",
         newType: "Tarea",
         columns: { todo: "Por hacer", doing: "En curso", done: "Hecho" },
         seed: [
            { title: "Tableros kanban", description: "Organiza el trabajo en columnas por estado.", status: "done", type: "Core" },
            { title: "Seguimiento en tiempo real", description: "El estado de cada incidencia, al instante.", status: "done", type: "Colaboración" },
            { title: "Sprints y planificación", description: "Agrupa el trabajo con fechas y objetivos.", status: "doing", type: "Planificación" },
            { title: "Notificaciones", description: "Avisos cuando algo cambia de estado.", status: "doing", type: "Colaboración" },
            { title: "Creación con IA", description: "Redacta tareas en lenguaje natural.", status: "todo", type: "IA" },
            { title: "Auditorías", description: "Mide el rendimiento de cada sprint.", status: "todo", type: "Analítica" },
            { title: "Adjuntos e imágenes", description: "El contexto viaja con cada incidencia.", status: "todo", type: "Core" },
         ],
         form: {
            title: "Nueva incidencia",
            desc: "Añade una incidencia a tu tablero de prueba.",
            titleLabel: "Título",
            titlePlaceholder: "Ej: Configurar el tablero del equipo",
            descLabel: "Descripción",
            descPlaceholder: "Describe la incidencia…",
            imageLabel: "Imagen (opcional)",
            imageHint: "PNG o JPG, hasta 2 MB",
            imageRemove: "Quitar imagen",
            cancel: "Cancelar",
            create: "Crear incidencia",
            titleRequired: "El título es obligatorio",
         },
      },
   },

   timeline: {
      eyebrow: "Cómo funciona",
      heading: "De cero a un equipo organizado en cuatro pasos",
      subheading:
         "La Muralla te acompaña desde que creas tu primer tablero hasta que entregas el proyecto.",
      steps: [
         {
            title: "Crea un tablero",
            description:
               "Organiza tu flujo de trabajo en tableros y define los estados de tus incidencias.",
         },
         {
            title: "Planifica tus sprints",
            description:
               "Agrupa el trabajo en sprints con fechas y objetivos claros para tu equipo.",
         },
         {
            title: "Gestiona las incidencias",
            description:
               "Crea tareas con título, descripción e imágenes; asígnalas y arrástralas entre estados.",
         },
         {
            title: "Mide y entrega",
            description:
               "Sigue el progreso en tiempo real y revisa las auditorías para entregar a tiempo.",
         },
      ],
   },

   stories: {
      eyebrow: "Historias de clientes",
      heading: "Equipos que ya construyen con La Muralla",
      subheading: "Así usan La Muralla equipos de producto, ingeniería y operaciones.",
      dragHint: "Arrastra para explorar",
      items: [
         {
            role: "Product Manager",
            quote:
               "Pasamos de hojas de cálculo a tableros kanban en una tarde. Ahora todo el equipo ve el estado de cada incidencia en tiempo real.",
         },
         {
            role: "Tech Lead",
            quote:
               "El drag & drop entre estados hace que actualizar el sprint sea instantáneo. Ya nadie pregunta «¿en qué vas?».",
         },
         {
            role: "Scrum Master",
            quote:
               "Planificar sprints con fechas y objetivos nos ordenó por completo. Entregamos a tiempo tres releases seguidos.",
         },
         {
            role: "CTO",
            quote:
               "Crear tareas con ayuda de la IA nos ahorra horas cada semana. Describimos la incidencia y La Muralla la redacta.",
         },
         {
            role: "Operations Lead",
            quote:
               "Las auditorías nos dan visibilidad real del rendimiento. Sabemos exactamente dónde se frena el trabajo.",
         },
         {
            role: "Engineering Manager",
            quote:
               "Las notificaciones en tiempo real mantienen a todos alineados sin reuniones interminables.",
         },
         {
            role: "Design Lead",
            quote:
               "Adjuntar imágenes a cada incidencia acabó con los malentendidos. El contexto viaja con la tarea.",
         },
         {
            role: "Founder",
            quote:
               "Un solo lugar para tableros, sprints e incidencias. La Muralla reemplazó tres herramientas.",
         },
      ],
   },

   schedule: {
      eyebrow: "Solicita una demo",
      heading: "Agenda una demo de 30 minutos",
      subheading:
         "Elige una franja libre en la semana y reserva una sesión en Google Meet con nuestro equipo.",
      durationNote: "Sesiones de 30 minutos en Google Meet",
      prevWeek: "Semana anterior",
      nextWeek: "Semana siguiente",
      today: "Hoy",
      weekLabel: "Semana del",
      legendFree: "Disponible",
      legendBusy: "Ocupado",
      busy: "Ocupado",
      scheduleHere: "Agendar demo",
      loading: "Cargando disponibilidad…",
      noSlots: "No hay franjas disponibles esta semana.",
      modal: {
         title: "Agendar demo",
         subtitle: "Sesión de 30 min en Google Meet",
         fullName: "Nombre completo",
         fullNamePlaceholder: "Tu nombre y apellido",
         company: "Empresa",
         companyPlaceholder: "Nombre de tu empresa",
         email: "Correo electrónico",
         emailPlaceholder: "tucorreo@empresa.com",
         phone: "Teléfono",
         phonePlaceholder: "+57 300 000 0000",
         comment: "Comentario (opcional)",
         commentPlaceholder: "Cuéntanos qué te gustaría ver en la demo…",
         commentCounter: "{n}/500",
         close: "Cerrar",
         confirm: "Confirmar",
         required: "Completa los campos obligatorios",
         invalidEmail: "Ingresa un correo electrónico válido",
      },
      consent: {
         title: "Confirma tu solicitud",
         intro: "Al agendar una demo:",
         point1:
            "Das tu consentimiento para el tratamiento de tus datos personales con el fin de gestionar la sesión.",
         point2:
            "Se agendará una sesión de Google Meet y recibirás la invitación en el correo que indicaste.",
         back: "Volver",
         accept: "Aceptar y agendar",
         sending: "Agendando…",
      },
      successToast: "¡Listo! Te enviamos la invitación a tu correo.",
      errorToast: "No pudimos agendar la demo. Inténtalo de nuevo.",
   },

   faq: {
      eyebrow: "Preguntas frecuentes",
      heading: "Preguntas frecuentes sobre La Muralla",
      subheading: "Todo lo que necesitas saber antes de empezar.",
      items: [
         {
            q: "¿Qué es La Muralla?",
            a: "La Muralla es una plataforma de gestión de proyectos que organiza el trabajo de tu equipo en tableros kanban e incidencias, con sprints, seguimiento en tiempo real y auditorías.",
         },
         {
            q: "¿Para qué se usa La Muralla?",
            a: "Se usa para planificar sprints, crear y asignar incidencias, arrastrarlas entre estados y medir el rendimiento del equipo, todo desde un solo lugar.",
         },
         {
            q: "¿La Muralla usa tableros kanban?",
            a: "Sí. Cada tablero organiza tus incidencias en columnas por estado, y puedes arrastrarlas entre columnas para actualizar su progreso al instante.",
         },
         {
            q: "¿Puedo crear incidencias con imágenes?",
            a: "Sí. Cada incidencia admite título, descripción e imágenes adjuntas, para que el contexto viaje siempre con la tarea.",
         },
         {
            q: "¿Cómo agendo una demo?",
            a: "Elige una franja libre en el calendario de esta página, completa tus datos y recibirás una invitación a una sesión de 30 minutos en Google Meet.",
         },
      ],
   },

   footer: {
      tagline:
         "Gestión de proyectos por tableros kanban e incidencias. Construido por Cartagena Corporation.",
      sections: [
         {
            heading: "Producto",
            links: [
               { label: "Inicio", href: "#inicio" },
               { label: "Cómo funciona", href: "#como-funciona" },
               { label: "Historias", href: "#historias" },
               { label: "Agendar demo", href: "#agendar" },
            ],
         },
         {
            heading: "Empresa",
            links: [
               { label: "Cartagena Corporation", href: "https://cartagenacorporation.com" },
               { label: "Preguntas frecuentes", href: "#faq" },
            ],
         },
         {
            heading: "Acceso",
            links: [
               { label: "Iniciar sesión", href: "/login" },
               { label: "Solicitar demo", href: "#agendar" },
            ],
         },
      ],
      legal: [
         { label: "Política de privacidad", href: "/es/legal#privacidad" },
         { label: "Tratamiento de datos personales", href: "/es/legal#tratamiento" },
      ],
      rights: "Cartagena Corporation. Todos los derechos reservados.",
      login: "Iniciar sesión",
      requestDemo: "Solicitar demo",
   },

   jsonLd: {
      appName: "La Muralla",
      appCategory: "BusinessApplication",
      appDescription:
         "Plataforma de gestión de proyectos con tableros kanban, incidencias, sprints, seguimiento en tiempo real y auditorías.",
      orgDescription:
         "Cartagena Corporation construye software de gestión de proyectos, incluida La Muralla.",
      offerDescription: "Demo gratuita de 30 minutos en Google Meet",
   },

   legalPage: {
      title: "Política de privacidad y tratamiento de datos",
      updated: "Documento en preparación — sujeto a revisión legal.",
      intro:
         "En La Muralla, de Cartagena Corporation, protegemos tus datos personales. Esta página describe cómo los recopilamos, para qué los usamos y qué derechos tienes.",
      sections: [
         {
            id: "privacidad",
            heading: "Política de privacidad",
            body: [
               "Recopilamos los datos que nos proporcionas al solicitar una demo (nombre completo, empresa, correo electrónico y teléfono) con el único fin de agendar y gestionar la sesión.",
               "No compartimos tus datos con terceros ajenos a la prestación del servicio, salvo obligación legal o requerimiento de una autoridad competente.",
               "Puedes solicitar el acceso, la rectificación o la eliminación de tus datos en cualquier momento escribiendo a nuestro equipo.",
            ],
         },
         {
            id: "tratamiento",
            heading: "Tratamiento de datos personales",
            body: [
               "Al agendar una demo otorgas tu consentimiento para el tratamiento de tus datos personales conforme a la legislación vigente.",
               "La base legal del tratamiento es tu consentimiento explícito, que puedes retirar en cualquier momento sin efecto retroactivo.",
               "Conservamos tus datos únicamente durante el tiempo necesario para gestionar tu solicitud y cumplir las obligaciones legales aplicables.",
            ],
         },
      ],
      back: "Volver al inicio",
   },
}
