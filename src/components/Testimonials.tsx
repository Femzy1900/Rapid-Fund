
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Within 10 minutes of posting my medical emergency, I had the funds to pay for my daughter's treatment. RapidFund literally saved her life.",
      name: "Jennifer L.",
      location: "Dallas, TX",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      type: "Recipient"
    },
    {
      id: 2,
      quote: "After the hurricane hit, we were desperate. Traditional aid was weeks away, but through RapidFund, we had support within hours.",
      name: "Marcus T.",
      location: "New Orleans, LA",
      image: "https://randomuser.me/api/portraits/men/42.jpg",
      type: "Recipient"
    },
    {
      id: 3,
      quote: "I love the instant confirmation that my donation went directly to the person in need. The transparency is why I keep coming back.",
      name: "Alexis K.",
      location: "Seattle, WA",
      image: "https://randomuser.me/api/portraits/women/62.jpg",
      type: "Donor"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Success Stories</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Real people, real impact—see how RapidFund is making a difference
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <Card key={testimonial.id} className="bg-white border-gray-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{testimonial.location}</span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        testimonial.type === "Recipient" 
                          ? "bg-blue-50 text-blue-700" 
                          : "bg-orange-50 text-orange-700"
                      }`}>
                        {testimonial.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <svg className="absolute top-0 left-0 w-8 h-8 text-blue-100 -mt-3 -ml-2" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10 8c-2.667 0-5 1.333-7 4 0.667-0.667 1.667-1 3-1 2.667 0 4 1.333 4 4 0 1.333-0.333 2.333-1 3s-1.667 1-3 1c-1.333 0-2.333-0.5-3-1.5s-1-2.167-1-3.5c0-2 0.667-4 2-6s3-3.333 5-4l1 3zM26 8c-2.667 0-5 1.333-7 4 0.667-0.667 1.667-1 3-1 2.667 0 4 1.333 4 4 0 1.333-0.333 2.333-1 3s-1.667 1-3 1c-1.333 0-2.333-0.5-3-1.5s-1-2.167-1-3.5c0-2 0.667-4 2-6s3-3.333 5-4l1 3z"></path>
                  </svg>
                  <p className="text-gray-600 ml-5">{testimonial.quote}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block bg-gray-100 rounded-lg p-6 md:p-8 max-w-3xl">
            <div className="flex items-center justify-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <span className="ml-2 font-bold">4.9/5</span>
            </div>
            <p className="text-xl md:text-2xl font-medium">
              "RapidFund has helped over <span className="text-blue-600 font-bold">25,000 people</span> receive urgent financial support since 2023"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
