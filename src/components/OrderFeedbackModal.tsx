import React, { useState } from 'react';
import { Order, OrderFeedback } from '../types/ink';
import { 
  Star, 
  X, 
  Check, 
  MessageSquare, 
  Sparkles, 
  ThumbsUp, 
  ShieldCheck, 
  Award, 
  Truck, 
  Package, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface OrderFeedbackModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitFeedback: (orderId: string, feedback: OrderFeedback) => void;
  existingFeedback?: OrderFeedback;
}

const RATING_DESCRIPTIONS: Record<number, { label: string; desc: string }> = {
  1: { label: 'Poor / Problematic', desc: 'Significant tack, viscosity, or delivery transit issues.' },
  2: { label: 'Below Expectations', desc: 'Required press adjustment or notable delays.' },
  3: { label: 'Satisfactory / Acceptable', desc: 'Standard commercial performance meeting basic specs.' },
  4: { label: 'Very Good', desc: 'Smooth press run, crisp dot gain, and punctual dispatch.' },
  5: { label: 'Outstanding / Flawless', desc: 'Exceptional delta E match, fast setting, zero press downtime!' }
};

const SUGGESTED_TAGS = [
  'Sharp Dot Reproduction',
  'Fast Setting & Drying',
  'Zero Set-off / Rub Proof',
  'Perfect Viscosity & Tack',
  'Flawless Delta E Match',
  'Punctual Dock Delivery',
  'Airtight Nitrogen Sealing',
  'Clean Press Wash-up',
  'Responsive Logistics Partner',
  'Excellent Density on Coated Art'
];

export const OrderFeedbackModal: React.FC<OrderFeedbackModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmitFeedback,
  existingFeedback
}) => {
  if (!isOpen) return null;

  const [rating, setRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Sub-ratings
  const [inkQuality, setInkQuality] = useState<number>(existingFeedback?.subRatings?.inkQuality || 5);
  const [deliverySpeed, setDeliverySpeed] = useState<number>(existingFeedback?.subRatings?.deliverySpeed || 5);
  const [packaging, setPackaging] = useState<number>(existingFeedback?.subRatings?.packaging || 5);
  const [pressPerformance, setPressPerformance] = useState<number>(existingFeedback?.subRatings?.pressPerformance || 5);

  const [selectedTags, setSelectedTags] = useState<string[]>(
    existingFeedback?.tags || ['Sharp Dot Reproduction', 'Punctual Dock Delivery', 'Airtight Nitrogen Sealing']
  );
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select an overall star rating (1 to 5 stars).');
      return;
    }

    const feedbackPayload: OrderFeedback = {
      id: existingFeedback?.id || `fb_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.contactPerson || order.customer.companyName,
      companyName: order.customer.companyName,
      rating,
      subRatings: {
        inkQuality,
        deliverySpeed,
        packaging,
        pressPerformance
      },
      tags: selectedTags,
      comment: comment.trim() || 'Process ink batch performed to high commercial offset pressroom specifications.',
      submittedAt: new Date().toISOString(),
      pressModel: order.customer.pressModel,
      ...(existingFeedback?.ownerResponse ? { ownerResponse: existingFeedback.ownerResponse } : {})
    };

    onSubmitFeedback(order.id, feedbackPayload);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  const activeStarScore = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Rate Order Experience
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Delivered Order
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Order #{order.orderNumber} · {order.customer.companyName} ({order.totalKg.toFixed(1)} kg)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Success Banner Overlay if Submitted */}
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Feedback Recorded!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reviewing your press delivery. Your feedback helps our laboratory and logistics teams maintain ISO 12647 precision standards.
              </p>
            </div>
          ) : (
            <>
              {/* Order Context Recap Strip */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-semibold text-slate-900">
                    {order.items.length} CMYK Inks ({order.totalKg} kg)
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-mono">
                    {order.customer.pressModel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>Delivered to {order.deliveryAddress?.city || order.customer.city}</span>
                </div>
              </div>

              {/* 1. Overall Star Rating */}
              <div className="p-4 bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-xl text-center space-y-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
                  Overall Pressroom Satisfaction
                </span>

                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          star <= activeStarScore
                            ? 'text-amber-500 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="h-9 flex flex-col justify-center">
                  <span className="font-bold text-sm text-slate-900">
                    {activeStarScore} / 5 Stars — {RATING_DESCRIPTIONS[activeStarScore]?.label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {RATING_DESCRIPTIONS[activeStarScore]?.desc}
                  </span>
                </div>
              </div>

              {/* 2. Detailed Dimension Sub-Ratings */}
              <div className="space-y-3">
                <label className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Key Evaluation Criteria
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Ink Quality */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">Ink Pigment &amp; Gloss</span>
                      <span className="text-[10px] text-slate-500">Dot gain &amp; color saturation</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setInkQuality(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${s <= inkQuality ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Press Performance */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">Press Run &amp; Tack</span>
                      <span className="text-[10px] text-slate-500">Viscosity &amp; high-speed setting</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPressPerformance(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${s <= pressPerformance ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Speed */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">Delivery &amp; Transit Speed</span>
                      <span className="text-[10px] text-slate-500">Punctuality to press dock</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setDeliverySpeed(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${s <= deliverySpeed ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Packaging */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block text-xs">Vacuum Can Packaging</span>
                      <span className="text-[10px] text-slate-500">Airtight nitrogen seal integrity</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setPackaging(s)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${s <= packaging ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Highlight Tags Selector */}
              <div>
                <label className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-2">
                  What went best with this batch? (Select Highlights)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Comments & Pressroom Feedback Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Pressroom Operator Comments</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {comment.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding print density, rub resistance, emulsification stability on press, or driver delivery experience..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                />
              </div>

              {/* Previous Owner Response if any */}
              {existingFeedback?.ownerResponse && (
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-900 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-700" />
                    <span>BR Agency Technical Support Reply</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">
                    {existingFeedback.ownerResponse.comment}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Responded: {new Date(existingFeedback.ownerResponse.respondedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{existingFeedback ? 'Update Review' : 'Submit Press Review'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
