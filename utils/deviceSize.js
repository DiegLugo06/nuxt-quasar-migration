import { computed } from 'vue';

export const useDeviceSize = () => {
  const deviceSize = computed(() => {
    if (typeof window === 'undefined') return 'md';
    const width = window.innerWidth;
    if (width < 640) return 'xs'; // Mobile
    if (width < 768) return 'sm'; // Small tablets
    if (width < 1024) return 'md'; // Tablets
    if (width < 1280) return 'lg'; // Small desktops
    return 'xl'; // Large desktops
  });

  const getResponsiveLabel = (mobileLabel, desktopLabel) => {
    return computed(() => deviceSize.value === 'xs' ? mobileLabel : desktopLabel);
  };

  return {
    deviceSize,
    getResponsiveLabel
  };
};

