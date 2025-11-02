import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Item } from '@/types';

const Catalog = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items', isAdmin],
    queryFn: async () => {
      let query = supabase.from('items').select('*');
      
      if (!isAdmin) {
        query = query.eq('active', true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Item[];
    },
  });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Catalog</h1>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border p-2 mb-6"
      />

      {isLoading ? (
        <div>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div>No books found</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <Link key={item.id} to={`/book/${item.id}`}>
              <div className="border p-2">
                {item.img_url && <img src={item.img_url} alt={item.name} className="w-full h-40 object-cover mb-2" />}
                <div className="font-bold truncate">{item.name}</div>
                <div className="text-sm text-gray-600 truncate">{item.author || 'Unknown'}</div>
                <div className="font-bold">${(item.price_cents / 100).toFixed(2)}</div>
                {item.stock === 0 && <div className="text-red-600 text-sm">Out of stock</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
