
import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Choose a campaign",
      description: "Browse verified campaigns from people in immediate need of assistance",
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Send your support",
      description: "Make a secure donation with just a few clicks—no account required",
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Instant delivery",
      description: "Funds are transferred to recipients within minutes, not days or weeks",
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We've redesigned emergency financial support to be immediate, transparent, and frictionless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white p-8 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">{step.icon}</div>
                <span className="text-3xl font-bold text-gray-200">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:max-w-xl">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Zero Platform Fees</h3>
              <p className="text-blue-100 text-lg">
                100% of your donation goes directly to the recipient. Our platform is supported by optional tips and corporate sponsors, not by taking a percentage of donations.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 md:p-8">
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">Transparent Fee Structure</h4>
                <div className="flex justify-between text-lg mb-2">
                  <span>Platform Fee:</span>
                  <span className="font-bold">$0</span>
                </div>
                <div className="flex justify-between text-lg mb-2">
                  <span>Payment Processing:</span>
                  <span className="font-bold">2.9% + $0.30</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm">
                    Optional tip to support our operations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
