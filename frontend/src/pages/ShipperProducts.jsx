import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import EmptyState from '../components/common/EmptyState';
import ProductModal from '../components/common/ProductModal';
import {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const ShipperProducts = () => {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalTarget, setModalTarget] = useState(null); // null = closed, {} = new, product = edit
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getMyProducts()
      .then(({ data }) => {
        if (!cancelled) setProducts(data.products || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your products right now.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    if (filter === 'all') return products;
    if (filter === 'active') return products.filter((p) => p.isActive);
    return products.filter((p) => !p.isActive);
  }, [products, filter]);

  const handleSave = async (payload) => {
    if (modalTarget?._id) {
      const { data } = await updateProduct(modalTarget._id, payload);
      setProducts((prev) => prev.map((p) => (p._id === data.product._id ? data.product : p)));
    } else {
      const { data } = await createProduct(payload);
      setProducts((prev) => [data.product, ...(prev || [])]);
    }
  };

  const handleToggle = async (product) => {
    setBusyId(product._id);
    try {
      if (product.isActive) {
        await deleteProduct(product._id);
        setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, isActive: false } : p)));
      } else {
        const { data } = await updateProduct(product._id, { isActive: true });
        setProducts((prev) => prev.map((p) => (p._id === product._id ? data.product : p)));
      }
    } catch {
      setError('Could not update that product right now.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="Products" subtitle="Your catalog — what buyers see and order from.">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full border px-4 py-1.5 font-mono-ls text-[11px] tracking-wide transition ${
                filter === f.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-primary/15 text-[#5B7A70] hover:border-primary/40'
              }`}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalTarget({})}
          className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-primary transition hover:shadow-glow"
        >
          + Add product
        </button>
      </div>

      <div className="mt-6">
        {products === null ? (
          <p className="text-sm text-[#5B7A70]">Loading…</p>
        ) : error && !products.length ? (
          <p className="text-sm text-danger">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No products yet"
            body="Add items to your catalog so buyers can find and order them."
            actionLabel="Add a product"
            onAction={() => setModalTarget({})}
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-primary/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 bg-secondary/20 font-mono-ls text-[11px] tracking-wide text-[#5B7A70]">
                  <th className="px-4 py-3 font-medium">PRODUCT</th>
                  <th className="px-4 py-3 font-medium">CATEGORY</th>
                  <th className="px-4 py-3 font-medium">PRICE</th>
                  <th className="px-4 py-3 font-medium">STOCK</th>
                  <th className="px-4 py-3 font-medium">WEIGHT/UNIT</th>
                  <th className="px-4 py-3 font-medium">STATUS</th>
                  <th className="px-4 py-3 font-medium">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-secondary/10">
                    <td className="px-4 py-3 text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{p.category}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">
                      ₹{p.price} <span className="text-[11px]">/ {p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-[#5B7A70]">{p.stock}</td>
                    <td className="px-4 py-3 text-[#5B7A70]">{p.weightPerUnit} kg</td>
                    <td className={`px-4 py-3 font-mono-ls text-xs ${p.isActive ? 'text-success' : 'text-[#5B7A70]'}`}>
                      {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalTarget(p)}
                          className="rounded-full border border-primary/15 px-3 py-1 text-[11px] font-semibold text-primary transition hover:border-primary/40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggle(p)}
                          disabled={busyId === p._id}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition disabled:opacity-60 ${
                            p.isActive
                              ? 'border-danger/30 text-danger hover:border-danger/60'
                              : 'border-primary/15 text-primary hover:border-primary/40'
                          }`}
                        >
                          {busyId === p._id ? '…' : p.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && products?.length > 0 && <p className="mt-4 text-xs text-warning">{error}</p>}

      {modalTarget && (
        <ProductModal
          product={modalTarget._id ? modalTarget : null}
          onSubmit={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ShipperProducts;