import { useState, useEffect } from 'react';
import api from '../utils/api';

export const useBanners = (position = null) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = position ? `/banners?position=${position}` : '/banners';
    api.get(url)
      .then(res => setBanners(res.data))
      .catch(() => setBanners([]))
      .finally(() => setLoading(false));
  }, [position]);

  return { banners, loading };
};