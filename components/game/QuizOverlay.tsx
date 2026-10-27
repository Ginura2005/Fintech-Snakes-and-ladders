"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
  squareNumber: number;
}

interface QuizOverlayProps {
  question: QuizQuestion;
  onAnswer: (questionId: string, squareNumber: number, selectedOption: number) => void;
}

export default function QuizOverlay({ question, onAnswer }: QuizOverlayProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setTimeout(() => {
      onAnswer(question.id, question.squareNumber, selected);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-full text-xs font-medium text-yellow-700 mb-2">
              📝 FinTech Quiz — Square {question.squareNumber}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">{question.category}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                question.difficulty === "easy" ? "bg-green-50 text-green-700" :
                question.difficulty === "medium" ? "bg-yellow-50 text-yellow-700" :
                "bg-red-50 text-red-700"
              }`}>
                {question.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <p className="text-gray-800 font-semibold text-base leading-relaxed mb-5">
          {question.question}
        </p>

        {/* Options */}
        <div className="space-y-2 mb-5">
          {question.options.map((option, index) => {
            const isSelected = selected === index;
            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={submitted}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                } ${submitted ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current mr-3 text-xs font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={selected === null || submitted}
            className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
              selected === null || submitted
                ? "bg-gray-300 cursor-not-allowed"
                : "brand-gradient hover:opacity-90 shadow-md"
            }`}
          >
            {submitted ? "Submitting…" : "Submit Answer"}
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Answer correctly for +50 bonus points!
        </p>
      </div>
    </div>
  );
}
