import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Dumbbell,
  Heart,
  UtensilsCrossed,
  Clock,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

// Offline Intelligent AI Coach knowledge base tailored specifically to RepKraft
const COACH_KNOWLEDGE = [
  {
    triggers: ['leg press', 'squat', 'knee', 'safety'],
    title: 'Leg Press Safety & Form',
    response: `Here is how to execute the Incline Leg Press with 100% safety and maximum quad growth:
1. **Seat Position**: Press your glutes and lower back firmly against the backrest throughout the entire movement. Never allow your hips to lift or tuck under at the bottom (which strains the lumbar spine).
2. **Foot Placement**: Place your feet shoulder-width in the middle of the platform with toes pointed slightly outward (~15°).
3. **Descent**: Lower the sled smoothly over 2–3 seconds until your knees reach a 90° angle.
4. **Ascent & Golden Rule**: Press through your midfoot and heels. **NEVER lock or snap your knees hyperextended at the top!** Keep a soft, micro-bend in your knees to keep tension on your quads and protect your joints.`
  },
  {
    triggers: ['rest', 'between sets', 'rest time', 'timer'],
    title: 'Optimal Rest Rules on 6-Day PPL',
    response: `Rest intervals on your 2-Set RepKraft split are dialed for maximum mechanical tension:
• **Heavy Compound Pressing (Bench / Overhead / Leg Press)**: Rest **90 to 120 seconds** (up to 150s on heavy Leg Press). This restores ~95% of ATP/CP energy stores so set 2 matches set 1 in intensity.
• **Machine Rows / Lat Pulldowns**: Rest **90 seconds**.
• **Isolations (Lateral Raises, Tricep Pushdown, Curls, Calf Raises)**: Rest **60 to 75 seconds**.
• **Between Exercises**: Take a **120-second (2 min)** breather using the Transition Rest Timer to grab water and set your next machine.`
  },
  {
    triggers: ['meal', 'kerala', 'protein', 'food', 'diet', 'today'],
    title: "Kerala High-Protein Meal Schedule",
    response: `Your personalized Kerala daily nutrition timetable:
• **6:00 AM (Pre-Workout)**: 1 Black coffee + 1 banana + 5 soaked almonds (quick glycogen & caffeine surge).
• **8:30 AM (Post-Workout Breakfast)**: 3 boiled eggs (or 1 scoop whey in water) + 2 Appams / Idlis with light kadala curry (30g protein).
• **1:00 PM (Kerala Lunch)**: 1 cup matta rice + 150g grilled/steamed fish (Ayala/Sardine) or chicken breast + thoran + moru curry (35g protein).
• **5:00 PM (Evening Snack)**: 1 cup boiled sprouted green gram (cherupayar) or roasted chana + black tea (12g protein).
• **8:30 PM (Dinner)**: 2 wheat chapathis + 150g paneer bhurji or chicken curry + cucumber salad (32g protein).
• **Daily Target**: ~140g clean protein + 3.5L water!`
  },
  {
    triggers: ['cardio', 'walk', 'cycling', 'when to do cardio'],
    title: 'Cardio Timing on 6-Day PPL',
    response: `To maximize fat burn without draining muscle strength on your 6-Day split:
1. **Leg Days (Wednesday & Saturday)**: Keep intense cardio away! Only do casual slow walking so your quads and calves recover fully.
2. **Push/Pull Days (Mon, Tue, Thu, Fri)**: Do the **10-minute Post-Lift Walk** right after lifting to flush lactic acid.
3. **Sunday (Full Rest Day)**: Best day for the **25–30 min Incline Treadmill or Brisk Outdoor Walk**—it boosts active recovery blood flow and step count without heavy joint impact.`
  },
  {
    triggers: ['progressive overload', 'pr', 'weight', 'increase'],
    title: 'How to Progress Weight Safely',
    response: `Follow the **Double Progression Rule**:
1. Keep the working weight constant until you can perform **12 clean, strict reps** across BOTH of your sets.
2. Once you hit 12 reps on both sets with good form, add the smallest available increment (+1.25 kg to +2.5 kg total).
3. With the new weight, your reps might drop to 9 or 10 reps. Build back up to 12 reps before increasing again!`
  }
];

export default function FloatingAICoach() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm-1',
      sender: 'coach',
      text: "Hey champion! I'm your RepKraft AI Coach. Ask me anything about proper exercise form, rest times, your Kerala meal plan, or cardio timing on your 6-day split!"
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef(null);

  const promptChips = [
    'How to do Leg Press safely?',
    'Rest time between sets?',
    "Today's Kerala protein meals",
    'Cardio timing on PPL split',
    'How to increase weights safely?'
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendPrompt = (question) => {
    const q = (question || inputVal).trim();
    if (!q) return;

    // Add User message
    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Generate intelligent response
    setTimeout(() => {
      const qLower = q.toLowerCase();
      const matched = COACH_KNOWLEDGE.find((k) =>
        k.triggers.some((t) => qLower.includes(t))
      );

      const replyText = matched
        ? matched.response
        : `Great question regarding "${q}"! On your 6-Day PPL split, always prioritize strict form over heavy ego lifting: control the 2-second negative stretch, pause for 1 second at full muscle contraction, and stay consistent with your 140g daily protein. Try tapping one of the quick guide chips above for exact form or diet breakdowns!`;

      const botMsg = { id: `bot-${Date.now()}`, sender: 'coach', text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    }, 450);
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-20 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
        title="RepKraft AI Coach"
      >
        <Bot className="w-6 h-6 stroke-[2.5]" />
        <span className="w-3 h-3 rounded-full bg-emerald-400 absolute top-0.5 right-0.5 ring-2 ring-white animate-pulse" />
      </button>

      {/* Slide-Up Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#181B20] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl h-[85vh] max-h-[620px] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5 leading-none">
                    RepKraft AI Coach <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <span className="text-[10px] font-bold text-purple-200">
                    Form, Nutrition & PPL Recovery
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt Chips Bar */}
            <div className="p-2.5 bg-slate-50 dark:bg-[#20242C] border-b border-slate-200/80 dark:border-[#2D333B] flex gap-1.5 overflow-x-auto scrollbar-none">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(chip)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#181B20] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-[#2D333B] text-[10px] font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m) => {
                const isCoach = m.sender === 'coach';

                return (
                  <div
                    key={m.id}
                    className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                        isCoach
                          ? 'bg-slate-100 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200/70 dark:border-[#2D333B]'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendPrompt();
              }}
              className="p-3 bg-white dark:bg-[#181B20] border-t border-slate-100 dark:border-[#2D333B] flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask about form, rest, diet..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#22262E] text-slate-900 dark:text-white border border-slate-200 dark:border-[#2D333B] text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
