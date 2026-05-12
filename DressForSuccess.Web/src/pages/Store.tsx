import React, { useEffect, useState } from 'react'
import { getProducts, getCategories, Product } from '../api'

const categoryIcon: Record<string, string> = {
  Tops: '👕', Bottoms: '👖', Dresses: '👗', Footwear: '👠',
  Accessories: '👜', Outerwear: '🧥', default: '👗'
}

const Store: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<number[]>([])
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    getCategories().then(r => setCategories(r.data))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts(selected || undefined).then(r => setProducts(r.data)).finally(() => setLoading(false))
  }, [selected])

  const addToCart = (id: number, name: string) => {
    setCart(prev => [...prev, id])
    setCartMsg(`"${name}" added to cart!`)
    setTimeout(() => setCartMsg(''), 2500)
  }

  return (
    <div>
      <div className="hero" style={{ padding: '3rem 1.5rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.2rem' }}>Our Store</h1>
          <p>Professional clothing to help you dress for success. All proceeds support our charity mission.</p>
          {cart.length > 0 && (
            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '0.5rem 1.25rem', borderRadius: '20px' }}>
              🛒 {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
            </div>
          )}
        </div>
      </div>

      <div className="page">
        {cartMsg && <div className="alert alert-success">{cartMsg}</div>}

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <button
            className={`btn btn-sm ${selected === '' ? 'btn-primary' : 'btn-outline'}`}
            style={selected !== '' ? { color: 'var(--primary)', border: '2px solid var(--primary)' } : {}}
            onClick={() => setSelected('')}>
            All Items
          </button>
          {categories.map(c => (
            <button key={c}
              className={`btn btn-sm ${selected === c ? 'btn-primary' : 'btn-outline'}`}
              style={selected !== c ? { color: 'var(--primary)', border: '2px solid var(--primary)' } : {}}
              onClick={() => setSelected(c)}>
              {categoryIcon[c] || categoryIcon.default} {c}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : products.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏪</div><p>No products available in this category.</p></div>
        ) : (
          <div className="products-grid">
            {products.map(p => (
              <div key={p.id} className="product-card">
                <div className="product-img">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                    : <span>{categoryIcon[p.category] || '👗'}</span>}
                </div>
                <div className="product-info">
                  <div className="category">{p.category}</div>
                  <h3>{p.name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="price">${p.price.toFixed(2)}</span>
                    <span className="size">Size: {p.size}</span>
                  </div>
                  <div className="stock">✓ {p.stockQuantity} in stock</div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.9rem' }}
                    onClick={() => addToCart(p.id, p.name)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginTop: '3rem' }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>🛒 Checkout Coming Soon</h3>
            <p className="text-muted">Full e-commerce checkout functionality is being developed. Items are being catalogued — check back soon!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Store

