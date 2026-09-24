'use client';

import React from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProhibitedGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProhibitedGoodsModal({ isOpen, onClose }: ProhibitedGoodsModalProps) {
  if (!isOpen) return null;

  const prohibitedList = [
    { title: 'Flammable & Explosive Materials', desc: 'Firecrackers, arms, ammunition, fireworks, gunpowder, paint cans, adhesives, fuel.' },
    { title: 'Corrosive & Toxic Chemicals', desc: 'Acids, poisonous chemicals, infectious biological substances, hazardous or bio-medical waste.' },
    { title: 'Contraband & Illegal Substances', desc: 'Alcohol, narcotics, psychotropic substances, unauthorized pharmaceuticals, tobacco contraband.' },
    { title: 'Precious Metals & Valuables', desc: 'Gold, silver, platinum, jewelry, diamonds, bearer securities, banknotes, currency coins.' },
    { title: 'Live Animals & Human Remains', desc: 'Pets, livestock, diagnostic biological specimens, organs, human remains.' },
    { title: 'Unprotected Fragile Displays', desc: 'Unpacked glass sheets, unwrapped OLED/LED screens, open liquids.' },
    { title: 'Sensitive Documents', desc: 'Passports, government stamp papers, traveler’s cheques, original property deeds.' },
    { title: 'Hazardous Batteries & Machinery', desc: 'Wet car batteries, generator machinery leaking oils, fuels, or grease.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Prohibited Goods & Safety Policy</h3>
              <p className="text-xs text-rose-700 font-medium">As per Central Motor Vehicles Act & SwifLoad Safety Mandate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-amber-800 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Zero Tolerance Policy:</strong> SwifLoad driver-partners are legally mandated to inspect cargo prior to loading. If any prohibited consignment is detected, the trip will be cancelled immediately and reported to civic authorities.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {prohibitedList.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>What you CAN safely ship:</strong> Furniture, electronic appliances, industrial machinery parts, FMCG crates, e-commerce parcels, garments, hardware, home relocation goods, and verified commercial consignments.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
