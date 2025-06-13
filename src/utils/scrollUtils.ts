// Valid section IDs and pages
export const VALID_SECTIONS = ['start', 'games', 'about', 'join', 'delegate'] as const;
export const VALID_PAGES = ['ambassador'] as const;
export type SectionId = typeof VALID_SECTIONS[number];
export type PageId = typeof VALID_PAGES[number];

export const scrollToSection = (sectionId: SectionId) => {
  // Validate section ID
  if (!VALID_SECTIONS.includes(sectionId)) {
    console.warn(`Invalid section ID: ${sectionId}`);
    return null;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    const headerOffset = 80; // Height of the fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    return sectionId;
  }
  return null;
};

export const handleHashChange = () => {
  const hash = window.location.hash.slice(1); // Remove the # symbol
  
  if (hash && VALID_SECTIONS.includes(hash as SectionId)) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToSection(hash as SectionId);
    }, 100);

    // If coming from a page, reload to ensure proper scroll
    if (document.referrer.includes('#')) {
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  } else if (hash && VALID_PAGES.includes(hash as PageId)) {
    // Handle page navigation
    return hash;
  } else if (hash) {
    // If hash is invalid, default to start
    window.location.hash = 'start';
  }
  return null;
};

export const isValidPage = (hash: string): boolean => {
  return VALID_PAGES.includes(hash as PageId);
};
