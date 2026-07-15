import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import FormInput from '../components/common/FormInput';
import EmptyState from '../components/common/EmptyState';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const STEPS = ['Cart', 'Address', 'Payment', 'Confirm'];

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay when your order arrives' },
  { value: 'upi', label: 'UPI', hint: 'Pay via any UPI app' },
  { value: 'card', label: 'Card', hint: 'Debit or credit card' },
  { value: 'netbanking', label: 'Netbanking', hint: 'Pay via your bank' },
];

const BuyerCheckout = () => {
  const { cart, setQuantity, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '', lat: '', lng: '' });
  const [locating, setLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  if (totalItems === 0 && !placedOrder) {
    return (
      <DashboardLayout title="Checkout" subtitle="Your cart is empty.">
        <EmptyState title="Your cart is empty" body="Add products from the Browse page to start an order." />
        <button
          onClick={() => navigate('/buyer/dashboard')}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[12px] text-white transition hover:bg-primary/90"
        >
          BROWSE PRODUCTS
        </button>
      </DashboardLayout>
    );
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser — enter coordinates manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setAddress((a) => ({ ...a, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
      },
      () => {
        setError('Could not read your location — enter coordinates manually.');
        setLocating(false);
      }
    );
  };

  const addressValid = address.line1 && address.city && address.state && address.pincode;

  const goNext = () => {
    setError('');
    if (step === 1 && !addressValid) {
      setError('Fill in your full delivery address before continuing.');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/orders/product', {
        items: cart.items.map((i) => ({ product: i.product, quantity: i.quantity })),
        deliveryAddress: {
          line1: address.line1,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          location: {
            type: 'Point',
            coordinates: [address.lng === '' ? 0 : Number(address.lng), address.lat === '' ? 0 : Number(address.lat)],
          },
        },
        productPaymentMethod: paymentMethod,
      });
      setPlacedOrder(data.order);
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <DashboardLayout title="Order placed" subtitle="We've sent your order to the shipper.">
        <div className="mx-auto max-w-md rounded-2xl border border-primary/10 bg-secondary/20 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-primary">Order confirmed</h2>
          <p className="mt-1 text-sm text-muted">
            ₹{placedOrder.productTotal} · Paying via {placedOrder.productPaymentMethod?.toUpperCase()}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate('/buyer/orders')}
              className="rounded-full bg-primary px-5 py-2 font-mono-ls text-[11px] text-white transition hover:bg-primary/90"
            >
              VIEW MY ORDERS
            </button>
            <button
              onClick={() => navigate('/buyer/dashboard')}
              className="rounded-full border border-primary/15 px-5 py-2 font-mono-ls text-[11px] text-primary/70 transition hover:border-primary/40"
            >
              CONTINUE BROWSING
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Checkout" subtitle={cart.shipperName ? `From ${cart.shipperName}` : ''}>
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono-ls text-[11px] font-bold transition ${
                i <= step ? 'bg-primary text-white' : 'border border-primary/20 text-muted/60'
              }`}
            >
              {i + 1}
            </div>
            <span className={`font-mono-ls text-[10px] tracking-wide ${i <= step ? 'text-primary' : 'text-muted/50'}`}>
              {label.toUpperCase()}
            </span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-primary/10'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm text-danger">{error}</div>
      )}

      <div className="mt-6 max-w-2xl">
        {/* Step 0: Cart */}
        {step === 0 && (
          <div>
            <ul className="divide-y divide-primary/10 rounded-xl border border-primary/10">
              {cart.items.map((item) => (
                <li key={item.product} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-primary">{item.name}</p>
                    <p className="font-mono-ls text-[11px] text-muted">₹{item.price} / {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-primary/20 px-1 py-1">
                    <button
                      onClick={() => setQuantity(item.product, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-primary transition hover:bg-primary/10"
                    >
                      −
                    </button>
                    <span className="min-w-[1ch] text-center font-mono-ls text-[12px] font-bold text-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => (item.quantity < item.stock ? setQuantity(item.product, item.quantity + 1) : null)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold text-primary transition hover:bg-primary/10 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="w-16 shrink-0 text-right font-display text-sm font-bold text-primary">
                    ₹{item.price * item.quantity}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
              <span className="font-mono-ls text-[12px] text-primary">TOTAL</span>
              <span className="font-display text-lg font-bold text-primary">₹{totalPrice}</span>
            </div>
          </div>
        )}

        {/* Step 1: Address */}
        {step === 1 && (
          <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono-ls text-[11px] tracking-wide text-primary">DELIVERY ADDRESS</h3>
              <button
                type="button"
                onClick={useMyLocation}
                className="font-mono-ls text-[10px] text-primary/70 hover:text-primary hover:underline"
              >
                {locating ? 'LOCATING…' : 'USE MY LOCATION'}
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormInput
                  label="ADDRESS"
                  name="line1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="Flat / street / area"
                />
              </div>
              <FormInput
                label="CITY"
                name="city"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                placeholder="Chennai"
              />
              <FormInput
                label="STATE"
                name="state"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                placeholder="Tamil Nadu"
              />
              <FormInput
                label="PINCODE"
                name="pincode"
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                placeholder="600001"
              />
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-5 py-4 transition ${
                  paymentMethod === m.value ? 'border-primary bg-primary/5' : 'border-primary/10 hover:border-primary/30'
                }`}
              >
                <div>
                  <p className="font-display text-sm font-semibold text-primary">{m.label}</p>
                  <p className="mt-0.5 text-xs text-muted">{m.hint}</p>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value)}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            ))}
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">ITEMS ({totalItems})</p>
              <ul className="mt-2 space-y-1">
                {cart.items.map((item) => (
                  <li key={item.product} className="flex justify-between text-sm text-primary/90">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-primary/10 pt-3 font-display text-sm font-bold text-primary">
                <span>Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">DELIVER TO</p>
              <p className="mt-1 text-sm text-primary/90">
                {address.line1}, {address.city}, {address.state} — {address.pincode}
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/10 p-5">
              <p className="font-mono-ls text-[11px] text-primary">PAYMENT</p>
              <p className="mt-1 text-sm text-primary/90">
                {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => (step === 0 ? navigate('/buyer/dashboard') : goBack())}
            className="rounded-full border border-primary/15 px-5 py-2.5 font-mono-ls text-[11px] text-primary/70 transition hover:border-primary/40"
          >
            {step === 0 ? 'BACK TO SHOP' : 'BACK'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[11px] text-white transition hover:bg-primary/90"
            >
              CONTINUE
            </button>
          ) : (
            <button
              onClick={placeOrder}
              disabled={placing}
              className="rounded-full bg-primary px-6 py-2.5 font-mono-ls text-[11px] text-white transition hover:bg-primary/90 disabled:opacity-50"
            >
              {placing ? 'PLACING ORDER…' : `PLACE ORDER · ₹${totalPrice}`}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerCheckout;