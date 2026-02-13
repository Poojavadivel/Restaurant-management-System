import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Users,
  CheckCircle,
  Bell,
  Shield,
  Coffee,
  MapPin,
  ArrowRight,
  Phone,
  Mail,
  Home as HomeIcon,
  ChevronDown,
  Calendar,
} from "lucide-react";

import { cancelQueueEntry, fetchQueueEntries, joinQueue, updateQueueEntry } from "@/api/queue";

interface QueueProps {
  queueNumber: number | null;
  onJoinQueue: (number: number) => void;
}

interface QueueEntry {
  id: string;
  name: string;
  guests: number;
  notificationMethod: "sms" | "email";
  contact: string;
  hall: "AC" | "Main" | "VIP" | "Any";
  segment: "Front" | "Middle" | "Back" | "Any";
  position: number;
  estimatedWaitMinutes: number;
  joinedAt: Date;
  queueDate: string; // Date for which queue is booked
  notifiedAt5Min: boolean;
}

export default function Queue({
  queueNumber,
  onJoinQueue,
}: QueueProps) {
  const [showForm, setShowForm] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [guestsDropdownOpen, setGuestsDropdownOpen] =
    useState(false);
  const [hallDropdownOpen, setHallDropdownOpen] =
    useState(false);
  const [segmentDropdownOpen, setSegmentDropdownOpen] =
    useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    guests: "2",
    queueDate: new Date().toISOString().split("T")[0], // Default to today
    notificationMethod: "sms" as "sms" | "email",
    contact: "",
    hall: "Any" as "AC" | "Main" | "VIP" | "Any",
    segment: "Any" as "Front" | "Middle" | "Back" | "Any",
  });

  // Queue database (shared across all users) - Load from localStorage
  const [queueDatabase, setQueueDatabase] = useState<
    QueueEntry[]
  >(() => {
    const saved = localStorage.getItem("queueDatabase");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((e: any) => ({
            ...e,
            joinedAt: e?.joinedAt ? new Date(e.joinedAt) : new Date(),
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [currentUserEntry, setCurrentUserEntry] =
    useState<QueueEntry | null>(() => {
      const saved = localStorage.getItem("currentUserEntry");
      if (saved) {
        const entry = JSON.parse(saved);
        // Reconstruct Date object
        entry.joinedAt = new Date(entry.joinedAt);
        return entry;
      }
      return null;
    });

  // Save to localStorage whenever queue changes
  useEffect(() => {
    localStorage.setItem(
      "queueDatabase",
      JSON.stringify(queueDatabase),
    );
  }, [queueDatabase]);

  // Load queue entries from backend for the selected date (best-effort)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const entries = await fetchQueueEntries(formData.queueDate);
        if (cancelled) return;
        setQueueDatabase(entries as any);
      } catch {
        // keep localStorage-backed behavior if backend is offline
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.queueDate]);

  useEffect(() => {
    if (currentUserEntry) {
      localStorage.setItem(
        "currentUserEntry",
        JSON.stringify(currentUserEntry),
      );
      setShowStatus(true);
      setShowForm(true);
    } else {
      localStorage.removeItem("currentUserEntry");
    }
  }, [currentUserEntry]);

  // Real-time timer with MM:SS format
  useEffect(() => {
    if (currentUserEntry) {
      const interval = setInterval(() => {
        setCurrentUserEntry((prev) => {
          if (!prev) return null;

          // Calculate elapsed time in minutes
          const timeElapsedMinutes =
            (Date.now() - prev.joinedAt.getTime()) /
            (1000 * 60);
          const newEstimatedWaitMinutes = Math.max(
            0,
            prev.position * 60 - timeElapsedMinutes,
          );

          // Check if within last 5 minutes
          if (
            newEstimatedWaitMinutes <= 5 &&
            newEstimatedWaitMinutes > 0 &&
            !prev.notifiedAt5Min
          ) {
            alert(
              `🔔 Your table will be ready shortly!\n\nCombination: ${prev.guests} guests, ${prev.hall} Hall, ${prev.segment} Segment\n\nPlease confirm you're on your way.`,
            );
            return {
              ...prev,
              estimatedWaitMinutes: newEstimatedWaitMinutes,
              notifiedAt5Min: true,
            };
          }

          return {
            ...prev,
            estimatedWaitMinutes: newEstimatedWaitMinutes,
          };
        });
      }, 1000); // Update every second for real-time countdown

      return () => clearInterval(interval);
    }
  }, [currentUserEntry]);

  // Sync 5-min notification flag to backend (best-effort)
  useEffect(() => {
    if (!currentUserEntry) return;
    if (!currentUserEntry.notifiedAt5Min) return;

    updateQueueEntry(currentUserEntry.id, {
      notifiedAt5Min: true,
    }).catch(() => {
      // ignore
    });
  }, [currentUserEntry?.id, currentUserEntry?.notifiedAt5Min]);

  // Calculate position based on combination
  const calculatePosition = (
    guests: number,
    hall: string,
    segment: string,
  ): number => {
    const sameComboEntries = queueDatabase.filter(
      (entry) =>
        entry.guests === guests &&
        entry.hall === hall &&
        entry.segment === segment,
    );
    return sameComboEntries.length + 1;
  };

  // Scroll to form
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!formData.contact.trim()) {
      alert("Please enter your contact details");
      return;
    }

    const guestsNum = parseInt(formData.guests);
    const optimisticPosition = calculatePosition(
      guestsNum,
      formData.hall,
      formData.segment,
    );

    const newEntry: QueueEntry = {
      id: `QUEUE${Date.now()}`,
      name: formData.name,
      guests: guestsNum,
      notificationMethod: formData.notificationMethod,
      contact: formData.contact,
      hall: formData.hall,
      segment: formData.segment,
      position: optimisticPosition,
      estimatedWaitMinutes: optimisticPosition * 60,
      joinedAt: new Date(),
      queueDate: formData.queueDate,
      notifiedAt5Min: false,
    };

    try {
      const created = await joinQueue(newEntry as any);
      setQueueDatabase((prev) => [...prev, created as any]);
      setCurrentUserEntry(created as any);
      onJoinQueue(created.position);
    } catch {
      // fallback: local-only behavior
      setQueueDatabase([...queueDatabase, newEntry]);
      setCurrentUserEntry(newEntry);
      onJoinQueue(newEntry.position);
    }

    setShowStatus(true);
    setShowForm(true);
  };

  const handleCancelQueue = async () => {
    if (!currentUserEntry) return;

    if (
      confirm(
        "Are you sure you want to cancel your queue position?",
      )
    ) {
      try {
        await cancelQueueEntry(currentUserEntry.id);
        try {
          const refreshed = await fetchQueueEntries(formData.queueDate);
          setQueueDatabase(refreshed as any);
        } catch {
          setQueueDatabase(queueDatabase.filter((e) => e.id !== currentUserEntry.id));
        }
      } catch {
        // fallback: local-only behavior
        const updatedQueue = queueDatabase.filter(
          (entry) => entry.id !== currentUserEntry.id,
        );
        setQueueDatabase(updatedQueue);
      }

      setCurrentUserEntry(null);
      setShowStatus(false);
      setShowForm(false);

      // Reset form
      setFormData({
        name: "",
        guests: "2",
        queueDate: new Date().toISOString().split("T")[0], // Reset to today
        notificationMethod: "sms",
        contact: "",
        hall: "Any",
        segment: "Any",
      });
    }
  };

  const handleViewStatus = () => {
    setShowStatus(true);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleBackToHero = () => {
    setShowForm(false);
    setShowStatus(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatWaitTime = (minutes: number): string => {
    if (minutes < 5) return "Almost Ready!";
    if (minutes < 60) {
      // MM:SS format for times under 1 hour
      const mins = Math.floor(minutes);
      const secs = Math.floor((minutes - mins) * 60);
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    const wholeHours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    const remainingSeconds = Math.floor(
      ((minutes % 60) - remainingMinutes) * 60,
    );
    return `${wholeHours}h ${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1769773297747-bd00e31b33aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudCUyMGludGVyaW9yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzAxMjIwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Fine Dining Restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#3E2723]/70 via-[#3E2723]/50 to-[#3E2723]/70" />
        </div>

        {/* Center Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1
            className="text-5xl md:text-7xl mb-6 text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            "Good food is always worth the wait."
          </h1>
          <p className="text-xl md:text-2xl text-[#EADBC8] mb-12">
            Relax. Your table will be prepared with care.
          </p>
          <button
            onClick={scrollToForm}
            className="group bg-[#8B5A2B] text-white px-10 py-4 rounded-lg hover:bg-[#6D4C41] transition-all shadow-lg hover:shadow-xl flex items-center gap-3 mx-auto"
          >
            Join the Queue
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl md:text-5xl text-center mb-4 text-[#8B5A2B]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            A Better Way to Wait
          </h2>
          <p className="text-center text-[#6D4C41] mb-16 text-lg">
            No standing. No confusion. Just comfort and trust.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-[#E8DED0]">
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-[#8B5A2B]" />
              </div>
              <h3
                className="text-xl mb-3 text-[#3E2723]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Live Queue Updates
              </h3>
              <p className="text-[#6D4C41]">
                Your position updates automatically in real-time
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-[#E8DED0]">
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="w-8 h-8 text-[#8B5A2B]" />
              </div>
              <h3
                className="text-xl mb-3 text-[#3E2723]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Smart Notifications
              </h3>
              <p className="text-[#6D4C41]">
                We'll notify you when your table is almost ready
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-[#E8DED0]">
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-8 h-8 text-[#8B5A2B]" />
              </div>
              <h3
                className="text-xl mb-3 text-[#3E2723]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Comfortable Waiting
              </h3>
              <p className="text-[#6D4C41]">
                No standing in line. Relax anywhere you like
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-[#E8DED0]">
              <div className="w-16 h-16 bg-[#8B5A2B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-[#8B5A2B]" />
              </div>
              <h3
                className="text-xl mb-3 text-[#3E2723]"
                style={{
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Fair Queue System
              </h3>
              <p className="text-[#6D4C41]">
                Position based on your specific table needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN QUEUE FORM SECTION / STATUS PAGE */}
      <section
        ref={formRef}
        className="py-20 px-6 bg-[#FAF7F2]"
      >
        <div className="max-w-4xl mx-auto">
          {!showStatus ? (
            /* JOIN QUEUE FORM */
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-[#E8DED0]">
              {/* Header */}
              <div className="text-center mb-10">
                <h2
                  className="text-4xl mb-3 text-[#8B5A2B]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Table Reservation
                </h2>
                <p className="text-[#6D4C41] text-lg mb-6">
                  Fine Dining Restaurant
                </p>

                {currentUserEntry && (
                  <button
                    onClick={handleViewStatus}
                    className="bg-[#8B5A2B]/10 text-[#8B5A2B] px-6 py-2 rounded-lg hover:bg-[#8B5A2B]/20 transition-colors"
                  >
                    View Your Status
                  </button>
                )}
              </div>

              {/* Form */}
              <form
                onSubmit={handleJoinQueue}
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white"
                    required
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setGuestsDropdownOpen(
                          !guestsDropdownOpen,
                        )
                      }
                      className="w-full px-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white text-left flex items-center justify-between"
                    >
                      <span>{formData.guests} guests</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${guestsDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {guestsDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8DED0] rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-4 gap-3 p-2">
                          {["2", "4", "6", "8"].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  guests: num,
                                });
                                setGuestsDropdownOpen(false);
                              }}
                              className={`py-3 rounded-lg border-2 transition-all ${
                                formData.guests === num
                                  ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                                  : "border-[#E8DED0] text-[#3E2723] hover:border-[#8B5A2B]"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Queue Date */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Queue Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B5A2B] pointer-events-none" />
                    <input
                      type="date"
                      value={formData.queueDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          queueDate: e.target.value,
                        })
                      }
                      min={
                        new Date().toISOString().split("T")[0]
                      }
                      className="w-full pl-12 pr-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Notification Method */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Notification Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          notificationMethod: "sms",
                        })
                      }
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                        formData.notificationMethod === "sms"
                          ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                          : "border-[#E8DED0] text-[#3E2723] hover:border-[#8B5A2B]"
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          notificationMethod: "email",
                        })
                      }
                      className={`flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all ${
                        formData.notificationMethod === "email"
                          ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                          : "border-[#E8DED0] text-[#3E2723] hover:border-[#8B5A2B]"
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    {formData.notificationMethod === "sms"
                      ? "Mobile Number"
                      : "Email Address"}
                  </label>
                  <input
                    type={
                      formData.notificationMethod === "sms"
                        ? "tel"
                        : "email"
                    }
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: e.target.value,
                      })
                    }
                    placeholder={
                      formData.notificationMethod === "sms"
                        ? "+1 (555) 000-0000"
                        : "your.email@example.com"
                    }
                    className="w-full px-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white"
                    required
                  />
                </div>

                {/* Location Preference */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Location Preference (Hall)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setHallDropdownOpen(!hallDropdownOpen)
                      }
                      className="w-full px-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white text-left"
                    >
                      {formData.hall}
                      <ChevronDown className="w-4 h-4 ml-2 inline-block" />
                    </button>
                    {hallDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8DED0] rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-4 gap-3 p-2">
                          {["AC", "Main", "VIP", "Any"].map(
                            (hall) => (
                              <button
                                key={hall}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    hall: hall as any,
                                  });
                                  setHallDropdownOpen(false);
                                }}
                                className={`py-3 rounded-lg border-2 transition-all ${
                                  formData.hall === hall
                                    ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                                    : "border-[#E8DED0] text-[#3E2723] hover:border-[#8B5A2B]"
                                }`}
                              >
                                {hall}
                              </button>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segment Preference */}
                <div>
                  <label className="block text-[#3E2723] mb-2">
                    Segment Preference
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSegmentDropdownOpen(
                          !segmentDropdownOpen,
                        )
                      }
                      className="w-full px-4 py-3 border border-[#E8DED0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5A2B] bg-white text-left"
                    >
                      {formData.segment}
                      <ChevronDown className="w-4 h-4 ml-2 inline-block" />
                    </button>
                    {segmentDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8DED0] rounded-lg shadow-lg z-10">
                        <div className="grid grid-cols-4 gap-3 p-2">
                          {[
                            "Front",
                            "Middle",
                            "Back",
                            "Any",
                          ].map((segment) => (
                            <button
                              key={segment}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  segment: segment as any,
                                });
                                setSegmentDropdownOpen(false);
                              }}
                              className={`py-3 rounded-lg border-2 transition-all ${
                                formData.segment === segment
                                  ? "border-[#8B5A2B] bg-[#8B5A2B] text-white"
                                  : "border-[#E8DED0] text-[#3E2723] hover:border-[#8B5A2B]"
                              }`}
                            >
                              {segment}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#8B5A2B] text-white py-4 rounded-lg hover:bg-[#6D4C41] transition-colors shadow-lg hover:shadow-xl"
                >
                  Join Queue
                </button>
              </form>
            </div>
          ) : (
            /* QUEUE STATUS PAGE */
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={handleBackToHero}
                className="flex items-center gap-2 text-[#8B5A2B] hover:text-[#6D4C41] transition-colors mb-4"
              >
                <HomeIcon className="w-5 h-5" />
                Back to Queue Home
              </button>

              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <h3
                    className="text-2xl text-green-800"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Successfully Joined the Queue!
                  </h3>
                </div>
                <p className="text-green-700">
                  We'll notify you when your table is almost
                  ready
                </p>
              </div>

              {/* Main Status Card - Dark Brown Highlight */}
              {currentUserEntry && (
                <div className="bg-gradient-to-br from-[#8B5A2B] to-[#6D4C41] text-white rounded-2xl p-8 shadow-2xl">
                  <h3
                    className="text-3xl mb-6"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Welcome, {currentUserEntry.name}!
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Position */}
                    <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                      <p className="text-[#EADBC8] mb-2">
                        Your Current Position
                      </p>
                      <p
                        className="text-6xl mb-2"
                        style={{
                          fontFamily:
                            "'Playfair Display', serif",
                        }}
                      >
                        #{currentUserEntry.position}
                      </p>
                      <p className="text-sm text-[#EADBC8]">
                        in your queue
                      </p>
                    </div>

                    {/* Estimated Wait */}
                    <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                      <p className="text-[#EADBC8] mb-2">
                        Estimated Wait Time
                      </p>
                      <p
                        className="text-6xl mb-2"
                        style={{
                          fontFamily:
                            "'Playfair Display', serif",
                        }}
                      >
                        {formatWaitTime(
                          currentUserEntry.estimatedWaitMinutes,
                        )}
                      </p>
                      <p className="text-sm text-[#EADBC8]">
                        {currentUserEntry.estimatedWaitMinutes <
                        5
                          ? "Almost there!"
                          : "live countdown"}
                      </p>
                    </div>
                  </div>

                  {/* Live Updates Indicator */}
                  <div className="mt-6 flex items-center justify-center gap-3 text-[#EADBC8]">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span>Live updates active</span>
                  </div>
                </div>
              )}

              {/* Reservation Details Card */}
              {currentUserEntry && (
                <div className="bg-white rounded-2xl p-8 border border-[#E8DED0] shadow-lg">
                  <h3
                    className="text-2xl mb-6 text-[#8B5A2B]"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Reservation Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Customer Name
                      </p>
                      <p className="text-lg text-[#3E2723]">
                        {currentUserEntry.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Number of Guests
                      </p>
                      <p className="text-lg text-[#3E2723]">
                        {currentUserEntry.guests} people
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Hall Preference
                      </p>
                      <p className="text-lg text-[#3E2723]">
                        {currentUserEntry.hall}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Segment Preference
                      </p>
                      <p className="text-lg text-[#3E2723]">
                        {currentUserEntry.segment}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Notification Method
                      </p>
                      <p className="text-lg text-[#3E2723] capitalize">
                        {currentUserEntry.notificationMethod}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6D4C41] mb-1">
                        Contact
                      </p>
                      <p className="text-lg text-[#3E2723]">
                        {currentUserEntry.contact}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Summary Cards */}
              {currentUserEntry && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 text-center">
                    <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-sm text-blue-700 mb-2">
                      Current Position
                    </p>
                    <p
                      className="text-5xl text-blue-900 mb-2"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      #{currentUserEntry.position}
                    </p>
                    <p className="text-blue-700">
                      {currentUserEntry.guests} guests •{" "}
                      {currentUserEntry.hall} •{" "}
                      {currentUserEntry.segment}
                    </p>
                  </div>

                  {/* Time Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-orange-200 text-center">
                    <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                    <p className="text-sm text-orange-700 mb-2">
                      Estimated Time
                    </p>
                    <p
                      className="text-5xl text-orange-900 mb-2"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {formatWaitTime(
                        currentUserEntry.estimatedWaitMinutes,
                      )}
                    </p>
                    <p className="text-orange-700">
                      Updates automatically
                    </p>
                  </div>
                </div>
              )}

              {/* Cancel Queue Button */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DED0]">
                <button
                  onClick={handleCancelQueue}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Queue Position
                </button>
                <p className="text-center text-sm text-[#6D4C41] mt-3">
                  You can rejoin anytime if you change your mind
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}