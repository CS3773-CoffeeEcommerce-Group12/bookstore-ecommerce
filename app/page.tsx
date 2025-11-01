import { supabaseServer } from '@/lib/supabase/server';
import { Card } from '@/components/ui';
import Link from 'next/link';

// Type for URL search parameters
type Search = Record<string, string | string[]>;

export default async function Page({ searchParams }: { searchParams: Promise<Search> }) {
  // Get and parse search parameters
  const params = await searchParams;
  const q = String(params?.q ?? '');               // Search query
  const sort = String(params?.sort ?? 'created_at'); // Sort field
  const available = String(params?.available) === '1'; // In stock filter

  // Initialize Supabase client
  const supabase = await supabaseServer();
  
  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user 
    ? await supabase.from('profiles').select('role').eq('id', user.id).single() 
    : { data: null };
  const isAdmin = profile?.role === 'admin';

  // Build the base query
  let query = supabase
    .from('items')
    .select('id, name, price_cents, stock, img_url, active, created_at');

  // Add search filter if query exists
  if (q) {
    query = query.ilike('name', `%${q.trim()}%`);
  }
  
  // Apply visibility and stock filters
  if (!isAdmin) {
    // Regular users only see active items
    query = query.eq('active', true);
  }
  
  // Apply stock filter if requested
  if (available) {
    query = query.gt('stock', 0);
  }
  
  // Apply sorting based on selection
  if (sort === 'price_low') {
    query = query.order('price_cents', { ascending: true });
  } else if (sort === 'price_high') {
    query = query.order('price_cents', { ascending: false });
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Execute query
  const { data: items, error } = await query;
  if (error) return <div className="p-6 text-red-600">Error: {error.message}</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">
              📚 Book Catalog
            </h1>
            <p className="text-gray-600">Discover your next great read</p>
          </div>
          {isAdmin && (
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Filters Card */}
        <Card padding="md" className="bg-white/80 backdrop-blur-sm border border-purple-100">
          <form className="flex flex-col sm:flex-row flex-wrap gap-3" aria-label="catalog filters">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="q" className="sr-only">Search</label>
              <input 
                id="q" 
                name="q" 
                placeholder="🔍 Search by book name..." 
                defaultValue={q} 
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white" 
              />
            </div>

            {/* Sort Dropdown */}
            <div className="min-w-[180px]">
              <label htmlFor="sort" className="sr-only">Sort by</label>
              <select 
                id="sort" 
                name="sort" 
                defaultValue={sort} 
                className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white" 
                aria-label="Sort items"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            {/* Availability Toggle */}
            <label className="flex items-center gap-2 px-4 py-2 border border-purple-200 rounded-lg bg-white hover:bg-purple-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                name="available" 
                value="1" 
                defaultChecked={available}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">In Stock Only</span>
            </label>

            {/* Apply Button */}
            <button 
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
            >
              Apply Filters
            </button>
          </form>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {items?.length === 0 ? (
            <p>No items found. Try adjusting your filters.</p>
          ) : (
            <p>Showing <span className="font-semibold text-purple-700">{items?.length || 0}</span> {items?.length === 1 ? 'book' : 'books'}</p>
          )}
        </div>

        {/* Items Grid - Responsive: 1 col mobile, 2 tablet, 4 desktop */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items?.map((item) => (
            <Card key={item.id} padding="none" hover className="overflow-hidden bg-white/90 backdrop-blur-sm border border-purple-100">
              {/* Book Image */}
              <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-indigo-100">
                {item.img_url ? (
                  <img 
                    src={item.img_url} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-300">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                
                {/* Stock Badge */}
                {item.stock > 0 ? (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-md">
                    In Stock ({item.stock})
                  </span>
                ) : (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-full shadow-md">
                    Out of Stock
                  </span>
                )}

                {/* Admin Only Badge */}
                {isAdmin && !item.active && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-md">
                    Inactive
                  </span>
                )}
              </div>

              {/* Book Details */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
                  {item.name}
                </h3>
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ${(item.price_cents / 100).toFixed(2)}
                </div>
                
                {/* Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Link 
                    href={`/book-ex?id=${item.id}`} 
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Empty State */}
        {items?.length === 0 && (
          <Card padding="lg" className="text-center bg-white/80 backdrop-blur-sm border border-purple-100">
            <div className="py-12">
              <svg className="w-24 h-24 mx-auto text-purple-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No books found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <Link href="/" className="inline-block px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg">
                Clear Filters
              </Link>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
