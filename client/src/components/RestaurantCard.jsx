import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const CUISINE_EMOJI = {
  pizza: '??', burger: '??', sushi: '??', chinese: '??',
  italian: '??', mexican: '??', indian: '??', salad: '??',
  dessert: '??', coffee: '?', default: '???'
};

function getCuisineEmoji(type = '') {
  const t = type.toLowerCase();
  for (const [key, emoji] of Object.entries(CUISINE_EMOJI)) {
    if (t.includes(key)) return emoji;
  }
  return CUISINE_EMOJI.default;
}

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const emoji = getCuisineEmoji(restaurant.cuisineType);

  return (
    <div className="r-card card" onClick={() => navigate('/restaurant/' + restaurant.id)}>
      <div className="r-card-image">
        <span className="r-card-emoji">{emoji}</span>
      </div>
      <div className="r-card-body">
        <h3 className="r-card-name">{restaurant.name}</h3>
        {restaurant.cuisineType && (
          <span className="r-card-tag">{restaurant.cuisineType}</span>
        )}
        {restaurant.address && (
          <p className="r-card-info">?? {restaurant.address}</p>
        )}
        {restaurant.openingHours && (
          <p className="r-card-info">?? {restaurant.openingHours}</p>
        )}
      </div>
    </div>
  );
}
