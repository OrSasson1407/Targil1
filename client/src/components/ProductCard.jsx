import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product, restaurant }) {
  const { cart, addItem, removeItem } = useCart();
  const cartItem = cart.items.find(i => i.id === product.id);
  const qty = cartItem?.quantity || 0;

  return (
    <div className="p-card card">
      <div className="p-card-body">
        <div className="p-card-info">
          {product.category && <span className="p-card-cat">{product.category}</span>}
          <h4 className="p-card-name">{product.name}</h4>
          {product.description && <p className="p-card-desc">{product.description}</p>}
          <span className="p-card-price">¤{product.price?.toFixed(2)}</span>
        </div>
        <div className="p-card-action">
          {qty === 0 ? (
            <button className="btn btn-primary add-btn" onClick={() => addItem(restaurant, product)}>
              + Add
            </button>
          ) : (
            <div className="qty-control">
              <button className="qty-btn" onClick={() => removeItem(product.id)}>?</button>
              <span className="qty-val">{qty}</span>
              <button className="qty-btn" onClick={() => addItem(restaurant, product)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
