import React, { useState, useEffect } from 'react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { FaLock, FaTags, FaCreditCard, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const BuyCreditsModal = ({ show, onClose, onUnlocked }) => {
  const [catalog, setCatalog] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paying, setPaying] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState(null);

  useEffect(() => {
    if (!show) return;
    fetchCatalog();
  }, [show]);

  useEffect(() => {
    if (couponCode) return;
    setAppliedCoupon(null);
    setCouponError('');
  }, [couponCode]);

  const fetchCatalog = async () => {
    try {
      setFetching(true);
      const res = await API.get('/payments/catalog');
      setCatalog(res.data.catalog || {});
    } catch (err) {
      setCatalog({});
      toast.error(err.response?.data?.message || 'Payments are currently unavailable.');
    } finally {
      setFetching(false);
    }
  };

  const clearCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const selectPurpose = (purpose) => {
    setSelectedPurpose(purpose);
    clearCoupon();
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!selectedPurpose) {
      toast.error('Select a plan first.');
      return;
    }
    if (!code) {
      setCouponError('Enter a coupon code.');
      return;
    }
    try {
      setCouponApplying(true);
      setCouponError('');
      const res = await API.post('/payments/apply-coupon', {
        purpose: selectedPurpose,
        couponCode: code
      });
      setAppliedCoupon({
        code: res.data.code,
        discountType: res.data.discountType,
        discountValue: res.data.discountValue,
        baseAmountPaise: res.data.baseAmountPaise,
        discountPaise: res.data.discountPaise,
        finalAmountPaise: res.data.finalAmountPaise
      });
      setCouponCode(code);
      toast.success(`Coupon ${code} applied!`);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || 'This coupon code is not valid.');
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePay = async () => {
    if (!selectedPurpose) return;
    try {
      setPaying(true);
      const res = await API.post('/payments/create-order', {
        purpose: selectedPurpose,
        couponCode: appliedCoupon?.code || undefined
      });

      const rzp = new Razorpay({
        key: res.data.keyId,
        order_id: res.data.orderId,
        amount: res.data.amount,
        currency: 'INR',
        name: 'HireSmart AI',
        description: 'Unlimited Full Access',
        handler: async (response) => {
          try {
            await API.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            toast.success('Payment received — your access unlocks in a moment.');
            if (onUnlocked) onUnlocked(true);
            onClose();
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || 'Verification failed. If you paid, access will unlock shortly.');
          }
        },
        modal: { ondismiss: () => setPaying(false) }
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start payment.');
      if ((err.response?.data?.message || '').toLowerCase().includes('expired') && appliedCoupon) {
        clearCoupon();
        setSelectedPurpose(null);
      }
    } finally {
      setPaying(false);
    }
  };

  const finalAmount = appliedCoupon ? (appliedCoupon.finalAmountPaise / 100) : (selectedPurpose ? catalog[selectedPurpose] : 0);
  const baseAmount = selectedPurpose ? catalog[selectedPurpose] : 0;

  if (!show) return null;

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" role="dialog" onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="modal-header border-0 p-4 pb-2">
            <div className="d-flex align-items-center gap-2">
              <span className="rounded-3 p-2" style={{ background: '#eee8ff', color: '#6337e8' }}>
                <FaCreditCard size={18} />
              </span>
              <h5 className="modal-title fw-extrabold mb-0">Unlock Full Access</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4 pt-2">
            <p className="text-muted small mb-3">
              One payment unlocks <strong>everything</strong> — unlimited mock interviews, AI evaluation, ATS resume checks and certificates. No monthly fees.
            </p>

            {fetching ? (
              <div className="text-center text-muted py-4">
                <FaSpinner className="fa-spin me-2" /> Loading plans...
              </div>
            ) : catalog && Object.keys(catalog).length === 0 ? (
              <div className="alert alert-warning d-flex align-items-center gap-2">
                <FaLock /> Payments are not enabled yet. Contact your administrator.
              </div>
            ) : (
              <div className="row g-3">
                {Object.entries(catalog).map(([purpose, basePrice]) => {
                  const selected = selectedPurpose === purpose;
                  return (
                    <div className="col-md-6" key={purpose}>
                      <button
                        type="button"
                        className="btn w-100 text-start p-3 border rounded-3"
                        style={{
                          borderColor: selected ? '#4F46E5' : '#E2E8F0',
                          background: selected ? '#EEF2FF' : '#FFFFFF',
                          boxShadow: selected ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
                        }}
                        onClick={() => selectPurpose(purpose)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong>{purpose.replace(/_/g, ' ')} — Unlimited</strong>
                        </div>
                        <div className="fs-4 fw-extrabold" style={{ color: selected ? '#4F46E5' : '#1e293b' }}>
                          ₹{basePrice}
                        </div>
                        <small className="text-muted">One-time · Lifetime access</small>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* COUPON APPLICATION */}
            {selectedPurpose && (
              <div className="mt-3 border rounded-3 p-3" style={{ background: '#F8FAFC' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="input-group-text border-0" style={{ background: '#F8FAFC' }}>
                    <FaTags />
                  </span>
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-bold text-nowrap"
                      onClick={clearCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn fw-bold text-white text-nowrap"
                      style={{ background: '#4F46E5' }}
                      onClick={applyCoupon}
                      disabled={couponApplying || !couponCode.trim()}
                    >
                      {couponApplying ? <FaSpinner className="fa-spin" /> : 'Apply'}
                    </button>
                  )}
                </div>

                {couponError && (
                  <div className="d-flex align-items-center gap-2 text-danger small mt-2">
                    <FaTimesCircle /> {couponError}
                  </div>
                )}

                {appliedCoupon && (
                  <div className="mt-3">
                    <div className="d-flex align-items-center justify-content-between small fw-semibold text-success mb-1">
                      <span className="d-flex align-items-center gap-2">
                        <FaCheckCircle /> Coupon {appliedCoupon.code} applied
                      </span>
                      {appliedCoupon.discountType === 'PERCENT'
                        ? `${appliedCoupon.discountValue}% OFF`
                        : `₹${appliedCoupon.discountValue} OFF`}
                    </div>
                    <div className="border-top pt-2" style={{ borderColor: '#E2E8F0' }}>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Original price</span>
                        <span>₹{baseAmount}</span>
                      </div>
                      <div className="d-flex justify-content-between small text-danger">
                        <span>Coupon discount</span>
                        <span>− ₹{appliedCoupon.discountPaise / 100}</span>
                      </div>
                      <div className="d-flex justify-content-between fw-extrabold fs-5 mt-1" style={{ color: '#1e293b' }}>
                        <span>Total to pay</span>
                        <span>₹{finalAmount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 bg-light p-3 px-4">
            <button type="button" className="btn btn-outline-secondary fw-bold px-4" onClick={onClose}>
              Later
            </button>
            <button
              type="button"
              className="btn fw-bold px-4 text-white"
              style={{ background: '#4F46E5' }}
              onClick={handlePay}
              disabled={paying || !selectedPurpose}
            >
              {paying ? <FaSpinner className="fa-spin me-2" /> : <FaCreditCard className="me-2" />}
              {selectedPurpose ? `Pay ₹${finalAmount}` : 'Select a plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCreditsModal;