import { useEffect, useState } from 'react';

const useTablet = (): [boolean] => {
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const resize = () => {
      setIsTablet(document.body.clientWidth <= 960);
    };

    resize();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return [isTablet];
};

export default useTablet;
