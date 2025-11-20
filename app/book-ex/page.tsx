import { supabaseServer } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import Link from 'next/link';
import { BookDetailClient } from './BookDetailClient';

// Types
type Search = Record<string, string | string[]>;

interface BookItem {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
  img_url?: string;
  active: boolean;
  created_at?: string;
}

/**
 * Server action to add an item to the user's cart
 * Creates a new cart if user doesn't have one
 */
async function addToCart(formData: FormData) {
  'use server';
  
  // Get form data
  const qty = Number(formData.get('qty') ?? 1);
  const itemId = String(formData.get('item_id'));
  const supa = await supabaseServer();

  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Sign in required.');

  const { data: existing } = await supa.from('carts').select('id').eq('user_id', user.id).maybeSingle();
  let cartId = existing?.id;
  
  if (!cartId) {
    const { data: created, error: ce } = await supa.from('carts').insert({ user_id: user.id }).select('id').single();
    if (ce) throw ce;
    cartId = created.id;
  }

  const { error: upErr } = await supa.from('cart_items').upsert(
    { cart_id: cartId, item_id: itemId, qty },
    { onConflict: 'cart_id,item_id' }
  );
  if (upErr) throw upErr;

  revalidatePath(`/book-ex?id=${itemId}`);
}

async function BookDetails({ id }: { id: string }) {
  const s = await supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  
  let isAdmin = false;
  if (user) {
    const { data: profile } = await s.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'admin';
  }

  const queryBase = s.from('items')
    .select('id,name,stock,created_at,price_cents,img_url,active')
    .eq('id', id);

  const query = isAdmin ? queryBase : queryBase.eq('active', true);
  const { data: item, error: queryError } = await query.single();

  if (queryError || !item) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-md text-center bg-white rounded-lg shadow-md p-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {queryError ? "Error Loading Book" : "Book Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {queryError 
              ? "There was an error loading this book. Please try again." 
              : "This book is not available or doesn't exist."}
          </p>
          {!user && (
            <p className="text-sm text-gray-500 mb-4">
              Try signing in to view more items.
            </p>
          )}
          <Link 
            href="/" 
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Fetch related books (same price range or recently added)
  const priceRange = 500; // $5 range
  const { data: relatedBooks } = await s
    .from('items')
    .select('id,name,price_cents,img_url,stock')
    .neq('id', item.id)
    .eq('active', true)
    .gte('price_cents', item.price_cents - priceRange)
    .lte('price_cents', item.price_cents + priceRange)
    .limit(4);

  return (
    <BookDetailClient 
      item={item} 
      relatedBooks={relatedBooks || []}
      isAuthenticated={!!user}
      addToCartAction={addToCart}
    />
  );
}

/**
 * Main book details page component
 * Handles parameter validation and loading states
 */
export default async function BookEx({ searchParams }: { searchParams: Promise<Search> }) {
  // Get and validate book ID
  const params = await searchParams;
  const id = String(params?.['id'] ?? '');
  
  // Show error if no book ID provided
  if (!id) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">
          Please select a book from the catalog.
        </div>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Show book details with loading state
  return (
    <Suspense fallback={<div className="p-6">Loading book details...</div>}>
      <BookDetails id={id} />
    </Suspense>
  );
}