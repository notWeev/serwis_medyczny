import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService';
// import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError('Nie udało się pobrać produktów');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="products-page">
      <h1>Nasze produkty</h1>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.ProductID} product={product} />
        ))}
      </div>
    </div>
  );
}
