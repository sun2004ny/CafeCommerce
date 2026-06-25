import { useState, useEffect, useCallback } from 'react';
import { env } from '../config/env.js';

const DUMMY_BASE = 'https://dummyjson.com/products';
const PAGE_LIMIT = 12;

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${env.apiUrl}/api/products/categories`);
        if (res.ok) {
          const data = await res.json();
          if (data.categories?.length) {
            setCategories(data.categories);
            return;
          }
        }
      } catch {
        /* fallback below */
      }
      fetch(`${DUMMY_BASE}/categories`)
        .then((r) => r.json())
        .then((data) => setCategories(data.map((c) => (typeof c === 'string' ? c : c.name || c.slug))))
        .catch(() => {});
    };
    loadCategories();
  }, []);

  const fetchFromBackend = async (reset, currentSkip) => {
    const qs = new URLSearchParams({
      limit: String(PAGE_LIMIT),
      skip: String(reset ? 0 : currentSkip),
    });
    if (search) qs.set('search', search);
    if (category) qs.set('category', category);
    if (sortBy) qs.set('sortBy', sortBy);

    const res = await fetch(`${env.apiUrl}/api/products?${qs}`);
    if (!res.ok) throw new Error('Backend unavailable');
    return res.json();
  };

  const fetchFromDummy = async (reset, currentSkip) => {
    const currentSkipVal = reset ? 0 : currentSkip;
    let url;
    if (search) {
      url = `${DUMMY_BASE}/search?q=${encodeURIComponent(search)}&limit=${PAGE_LIMIT}&skip=${currentSkipVal}`;
    } else if (category) {
      url = `${DUMMY_BASE}/category/${encodeURIComponent(category)}?limit=${PAGE_LIMIT}&skip=${currentSkipVal}`;
    } else {
      url = `${DUMMY_BASE}?limit=${PAGE_LIMIT}&skip=${currentSkipVal}`;
    }
    if (sortBy) {
      const [field, order] = sortBy.split('-');
      url += `&sortBy=${field}&order=${order}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  };

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const currentSkip = reset ? 0 : skip;
      let data;

      if (!useFallback) {
        try {
          data = await fetchFromBackend(reset, currentSkip);
          if (!data.products?.length && !search && !category && reset) {
            setUseFallback(true);
            data = await fetchFromDummy(reset, currentSkip);
          }
        } catch {
          setUseFallback(true);
          data = await fetchFromDummy(reset, currentSkip);
        }
      } else {
        data = await fetchFromDummy(reset, currentSkip);
      }

      const newProducts = data.products || [];
      setTotal(data.total || 0);

      if (reset) {
        setProducts(newProducts);
        setSkip(PAGE_LIMIT);
        setHasMore(newProducts.length < (data.total || 0));
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setSkip((s) => s + PAGE_LIMIT);
        setHasMore(currentSkip + newProducts.length < (data.total || 0));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [skip, search, category, sortBy, useFallback]);

  useEffect(() => {
    setSkip(0);
    setProducts([]);
    setHasMore(true);
    fetchProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sortBy]);

  const loadMore = () => {
    if (!loading && hasMore) fetchProducts(false);
  };

  return {
    products, loading, error, search, setSearch,
    category, setCategory, categories,
    sortBy, setSortBy, total, hasMore, loadMore,
  };
}
