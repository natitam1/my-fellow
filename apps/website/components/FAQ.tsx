"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

const faqs = [
  {
    question: "What is My Fellow?",
    answer:
      "My Fellow is a mobile application designed for AAU 4-killo Students Christian Fellowship to help students stay connected, access fellowship information, register for events, and grow spiritually through daily devotionals.",
  },
  {
    question: "How can I download the app?",
    answer:
      "You can download the app directly from our website's download section. Currently, we provide the Android APK, and we are working on bringing it to the App Store and Play Store.",
  },
  {
    question: "How do I register for events?",
    answer:
      "Once you have the app installed, navigate to the 'Events' section. You'll see a list of upcoming fellowship events. Click on any event to see details and find the registration button.",
  },
  {
    question: "Is my giving secure?",
    answer:
      "Yes, we use the Chapa payment gateway, which is a secure and trusted payment system in Ethiopia. Your financial information is handled securely by their platform.",
  },
  {
    question: "How can I join a team?",
    answer:
      "You can find information about different teams (Evangelism, Bible Study, Worship, etc.) in the 'Teams' section of the app. Each team listing includes the leader's contact information so you can reach out directly.",
  },
  {
    question: "I'm having technical issues. What should I do?",
    answer:
      "If you experience any bugs or technical difficulties, please reach out to us through the 'Support' page on this website or use the feedback section within the app.",
  },
];

const FAQItem = ({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="border-b border-zinc-200 py-4">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-semibold text-zinc-900">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-zinc-500"
        >
          <HiChevronDown className="h-6 w-6" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-base text-zinc-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faqs"
      className="bg-white py-24 sm:py-32 border-t border-zinc-200"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Have questions about My Fellow? We've got answers to the most common
            ones.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
