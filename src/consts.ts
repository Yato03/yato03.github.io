// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// Site title and description
export const SITE_LANG = "es";
export const SITE_TAB = "YatoDev";
export const SITE_TITLE = "YatoDev - Blog";
export const SITE_DESCRIPTION = "A tech blog by YatoDev";
export const DATE_FORMAT = "ddd DD MMM YYYY";

// User profile information
export const USER_NAME = "YatoDev";
export const USER_SITE = "https://yato03.github.io";
export const USER_AVATAR = "/profile-pic.png";

// Server and transition settings
export const SERVER_URL = "https://yato03.github.io";

// Theme settings
export const DAISYUI_THEME = {
  light: "winter",
  dark: "dracula",
}
export const CODE_THEME = {
  light: "github-light",
  dark: "github-dark",
}

// Menu items for navigation
export const menuItems = [
  { id: "home", text: "Inicio", href: "/", svg: "material-symbols:home-outline-rounded", target: "_self" }, // Home page
  /*
  { id: "about", text: "Sobre mí", href: "/about", svg: "material-symbols:info-outline-rounded", target: "_self" }, // About page
  */
  {
    id: "blog",
    text: "Blogs",
    href: "/blog",
    svg: "material-symbols:book-2-outline-rounded",
    target: "_self",
    subItems: [
      {
        id: "all",
        text: "Todos",
        href: "/blog",
        svg: "material-symbols:ink-pen-outline-rounded",
        target: "_self",
      },
      // All blog
      {
        id: "publicaciones",
        text: "Publicaciones",
        href: "/blog/categories/Blog",
        svg: "mdi:fountain-pen-tip",
        target: "_self",
      }, // Writeup category
      {
        id: "writeup",
        text: "Writeups",
        href: "/blog/categories/writeup",
        svg: "material-symbols:deployed-code-outline",
        target: "_self",
      }, // Writeup category
    ],
  }, // Blog page with sub-items
  {
    id: "project",
    text: "Proyectos",
    href: "/project",
    svg: "material-symbols:code-blocks-outline",
    target: "_self",
  }, // Projects page
  /*
  {
    id: "friend",
    text: "Friend",
    href: "/friend",
    svg: "material-symbols:supervisor-account-outline-rounded",
    target: "_self",
  }, // Friends page
  */
  {
    id: "contact",
    text: "Contacto",
    href: "mailto:miguelhs3523@gmail.com", // Contact email
    target: "_blank", // Open in a new tab
    svg: "material-symbols:attach-email-outline-rounded",
  },
];

// Social media and contact icons
export const socialIcons = [
  {
    href: "https://github.com/Yato03",
    ariaLabel: "Github",
    title: "Github",
    svg: "ri:github-line",
  },
  {
    href: "https://www.linkedin.com/in/miguel-hern%C3%A1ndez-677a7020b/",
    ariaLabel: "LinkedIn",
    title: "LinkedIn",
    svg: "ri:linkedin-line",
  },
  {
    href: "https://x.com/YatoDev03",
    ariaLabel: "X",
    title: "X",
    svg: "ri:twitter-x-line"
  }
];
