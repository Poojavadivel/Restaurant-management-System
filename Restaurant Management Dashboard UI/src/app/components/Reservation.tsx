import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, CheckCircle, RefreshCw, MapPin, LayoutGrid, Phone, User as UserIcon, XCircle } from 'lucide-react';
import type { User } from '@/app/App';
import {
  createReservation,
  deleteReservation,
  deleteWaitingQueueEntry,
  fetchReservationAvailability,
  fetchReservations,
  fetchWaitingQueueEntries,
  joinWaitingQueue,
} from '@/api/reservations';
import reservationBg from '@/assets/bc26fc098845bd66b4573c68aa0755232c104a7c.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';
import '@/styles/reservation.css';

interface ReservationProps {
  user: User;
}

type ReservationTab = 'book' | 'check' | 'my-reservations' | 'waiting-queue';

// Database-like structure for individual tables
interface Table {
  tableId: string;
  tableName: string;
  location: string;
  segment: string;
  capacity: number;
}

// Database-like structure for table reservations
interface TableReservation {
  reservationId: string; // Primary Key
  userId: string; // Foreign Key (user email in this case)
  tableNumber: number;
  date: string;
  timeSlot: string;
  guests: number;
  location: string;
  segment: string;
  userName: string;
  userPhone: string;
  status: 'Confirmed' | 'Pending';
}

interface WaitingQueueEntry {
  queueId: string;
  userId: string; // Foreign Key
  date: string;
  timeSlot: string;
  guests: number;
  position: number;
  estimatedWait: string;
}

// Total tables available (distributed across locations/segments)
const TOTAL_TABLES = 12;

// Sample table dataset (kept in frontend; backend mirrors this)
const ALL_TABLES: Table[] = [
  { tableId: 'T001', tableName: 'VIP Table 1', location: 'VIP Hall', segment: 'Front', capacity: 4 },
  { tableId: 'T002', tableName: 'VIP Table 2', location: 'VIP Hall', segment: 'Middle', capacity: 6 },
  { tableId: 'T003', tableName: 'VIP Table 3', location: 'VIP Hall', segment: 'Back', capacity: 8 },
  { tableId: 'T004', tableName: 'AC Table 1', location: 'AC Hall', segment: 'Front', capacity: 4 },
  { tableId: 'T005', tableName: 'AC Table 2', location: 'AC Hall', segment: 'Middle', capacity: 4 },
  { tableId: 'T006', tableName: 'AC Table 3', location: 'AC Hall', segment: 'Middle', capacity: 6 },
  { tableId: 'T007', tableName: 'AC Table 4', location: 'AC Hall', segment: 'Back', capacity: 2 },
  { tableId: 'T008', tableName: 'Main Table 1', location: 'Main Hall', segment: 'Front', capacity: 4 },
  { tableId: 'T009', tableName: 'Main Table 2', location: 'Main Hall', segment: 'Front', capacity: 6 },
  { tableId: 'T010', tableName: 'Main Table 3', location: 'Main Hall', segment: 'Middle', capacity: 8 },
  { tableId: 'T011', tableName: 'Main Table 4', location: 'Main Hall', segment: 'Back', capacity: 2 },
  { tableId: 'T012', tableName: 'Main Table 5', location: 'Main Hall', segment: 'Back', capacity: 4 },
];

// Sample reservations (kept in frontend; backend will override when available)
function getSampleReservations(user: User): TableReservation[] {
  return [
    {
      reservationId: 'RES001',
      userId: user.email,
      tableNumber: 5,
      date: '2026-02-10',
      timeSlot: '7:30 AM – 8:50 AM',
      guests: 4,
      location: 'Main Hall',
      segment: 'Window Seat',
      userName: user.name,
      userPhone: '9876543210',
      status: 'Confirmed',
    },
    {
      reservationId: 'RES002',
      userId: user.email,
      tableNumber: 8,
      date: '2026-02-15',
      timeSlot: '6:40 PM – 8:00 PM',
      guests: 2,
      location: 'VIP Hall',
      segment: 'Corner Table',
      userName: user.name,
      userPhone: '9876543210',
      status: 'Pending',
    },
  ];
}

// Sample waiting queue entries (kept in frontend; backend will override when available)
function getSampleWaitingQueue(user: User): WaitingQueueEntry[] {
  return [
    {
      queueId: 'QUEUE001',
      userId: user.email,
      date: '2026-02-08',
      timeSlot: '6:40 PM – 8:00 PM',
      guests: 3,
      position: 2,
      estimatedWait: '15-20 mins',
    },
  ];
}

export default function Reservation({ user }: ReservationProps) {
  const [activeTab, setActiveTab] = useState<ReservationTab>('book');
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  const [bookingData, setBookingData] = useState({
    date: null as Date | null,
    time: '',
    guests: '2',
    location: 'any',
    segment: 'any',
    name: user.name,
    phone: ''
  });

  const [checkData, setCheckData] = useState({
    date: null as Date | null,
    time: '',
    guests: '2',
    location: 'any',
    segment: 'any'
  });

  const [availabilityResults, setAvailabilityResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showWaitingQueueOption, setShowWaitingQueueOption] = useState(false);
  const [selectedFullSlot, setSelectedFullSlot] = useState<string>('');

  // Confirmation Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const [tableReservations, setTableReservations] = useState<TableReservation[]>(() => getSampleReservations(user));

  const [waitingQueue, setWaitingQueue] = useState<WaitingQueueEntry[]>(() => getSampleWaitingQueue(user));

  const timeSlots = [
    '7:30 AM – 8:50 AM',
    '9:10 AM – 10:30 AM',
    '12:00 PM – 1:20 PM',
    '1:40 PM – 3:00 PM',
    '6:40 PM – 8:00 PM',
    '8:20 PM – 9:40 PM'
  ];

  const locations = ['VIP Hall', 'AC Hall', 'Main Hall'];
  const segments = ['Front side Tables', 'Middle side tables', 'Back side tables'];
  const guestOptions = [2, 4, 6, 8];

  // Get my reservations from table reservations
  const myReservations = tableReservations.filter(res => res.userId === user.email);

  // Get my waiting queue entries
  const myWaitingQueue = waitingQueue.filter(entry => entry.userId === user.email);

  // Local fallback helpers (when backend is offline)
  const getReservedTableNumbers = (date: Date | null, timeSlot: string): number[] => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tableReservations
      .filter(res => res.date === dateStr && res.timeSlot === timeSlot)
      .map(res => res.tableNumber);
  };

  const getNextAvailableTable = (date: Date | null, timeSlot: string): number | null => {
    if (!date) return null;
    const reservedTables = getReservedTableNumbers(date, timeSlot);
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      if (!reservedTables.includes(i)) {
        return i;
      }
    }
    return null;
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [reservations, entries] = await Promise.all([
          fetchReservations(user.email),
          fetchWaitingQueueEntries(user.email),
        ]);
        if (cancelled) return;
        setTableReservations(reservations as any);
        setWaitingQueue(entries as any);
      } catch {
        // Keep UI usable if backend is offline (sample data stays)
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user.email]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.date || !bookingData.time) {
      alert('Please select both date and time slot');
      return;
    }

    const newReservation: TableReservation = {
      reservationId: `RES${Date.now()}`,
      userId: user.email,
      tableNumber: 0,
      date: bookingData.date.toISOString().split('T')[0],
      timeSlot: bookingData.time,
      guests: parseInt(bookingData.guests),
      location: bookingData.location,
      segment: bookingData.segment,
      userName: bookingData.name,
      userPhone: bookingData.phone,
      status: 'Confirmed',
    };

    try {
      const created = await createReservation(newReservation as any);
      setTableReservations((prev) => [...prev, created as any]);
      setStep('success');
    } catch (err: any) {
      // Offline fallback (keep sample/local logic)
      if (String(err?.message || '').includes('no_tables_available')) {
        alert('No tables available for this time slot. Please check availability or join the waiting queue.');
        return;
      }

      const tableNumber = getNextAvailableTable(bookingData.date, bookingData.time);
      if (tableNumber === null) {
        alert('No tables available for this time slot. Please check availability or join the waiting queue.');
        return;
      }

      const localReservation: TableReservation = {
        ...newReservation,
        tableNumber,
      };

      setTableReservations((prev) => [...prev, localReservation]);
      setStep('success');
    }
  };

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkData.date || !checkData.time) {
      alert('Please select both date and time slot');
      return;
    }

    try {
      const dateStr = checkData.date.toISOString().split('T')[0];
      const res = await fetchReservationAvailability({
        date: dateStr,
        timeSlot: checkData.time,
        guests: parseInt(checkData.guests),
        location: checkData.location,
        segment: checkData.segment,
      });

      setAvailabilityResults(res.tables as any);
      setShowResults(true);
      setShowWaitingQueueOption(Boolean(res.showWaitingQueueOption));
      setSelectedFullSlot(res.showWaitingQueueOption ? checkData.time : '');
    } catch {
      // Offline fallback: compute availability from sample tables + current local reservations
      const dateStr = checkData.date.toISOString().split('T')[0];

      const reservedTableIds = tableReservations
        .filter(res => res.date === dateStr && res.timeSlot === checkData.time)
        .map(res => `T${String(res.tableNumber).padStart(3, '0')}`);

      const filteredTables = ALL_TABLES.filter(table => {
        const locationMatch = checkData.location === 'any' || table.location.toLowerCase() === checkData.location;
        const segmentMatch = checkData.segment === 'any' || table.segment.toLowerCase().includes(checkData.segment.split(' ')[0].toLowerCase());
        const capacityMatch = table.capacity >= parseInt(checkData.guests);
        return locationMatch && segmentMatch && capacityMatch;
      });

      const tablesWithStatus = filteredTables.map(table => ({
        ...table,
        isAvailable: !reservedTableIds.includes(table.tableId)
      }));

      setAvailabilityResults(tablesWithStatus as any);
      setShowResults(true);

      const allBooked = tablesWithStatus.every((t: any) => !t.isAvailable);
      if (allBooked && tablesWithStatus.length > 0) {
        setShowWaitingQueueOption(true);
        setSelectedFullSlot(checkData.time);
      } else {
        setShowWaitingQueueOption(false);
        setSelectedFullSlot('');
      }
    }
  };

  const handleRefresh = () => {
    // Refresh all data - in a real app, this would fetch from server
    setShowResults(false);
    setAvailabilityResults([]);
    setShowWaitingQueueOption(false);
    setSelectedFullSlot('');
    
    // You could add a visual feedback here
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn?.classList.add('animate-spin');
    setTimeout(() => {
      refreshBtn?.classList.remove('animate-spin');
    }, 500);
  };

  const handleNewReservation = () => {
    setBookingData({
      date: null,
      time: '',
      guests: '2',
      location: 'any',
      segment: 'any',
      name: user.name,
      phone: ''
    });
    setStep('form');
    setActiveTab('book');
  };

  const handleCancelReservation = (reservationId: string) => {
    setConfirmDialogData({
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this reservation?',
      onConfirm: async () => {
        try {
          await deleteReservation(reservationId);
        } catch {
          // allow UI to proceed even if backend fails
        }
        setTableReservations(tableReservations.filter(reservation => reservation.reservationId !== reservationId));
        setShowConfirmDialog(false);
      },
    });
    setShowConfirmDialog(true);
  };

  const handleLeaveQueue = (queueId: string) => {
    setConfirmDialogData({
      title: 'Leave Queue',
      message: 'Are you sure you want to leave this queue?',
      onConfirm: async () => {
        try {
          await deleteWaitingQueueEntry(queueId);
        } catch {
          // allow UI to proceed even if backend fails
        }
        setWaitingQueue(waitingQueue.filter(item => item.queueId !== queueId));
        setShowConfirmDialog(false);
      },
    });
    setShowConfirmDialog(true);
  };

  const handleJoinWaitingQueue = () => {
    if (!checkData.date || !checkData.time) return;

    const queueId = `QUEUE${Date.now()}`;
    const payload = {
      queueId,
      userId: user.email,
      date: checkData.date.toISOString().split('T')[0],
      timeSlot: checkData.time,
      guests: parseInt(checkData.guests),
    };

    (async () => {
      try {
        const created = await joinWaitingQueue(payload);
        setWaitingQueue((prev) => [...prev, created as any]);
      } catch {
        // fallback: optimistic insert if backend is down
        const optimistic: WaitingQueueEntry = {
          queueId,
          userId: payload.userId,
          date: payload.date,
          timeSlot: payload.timeSlot,
          guests: payload.guests,
          position: waitingQueue.filter((q) => q.date === payload.date && q.timeSlot === payload.timeSlot).length + 1,
          estimatedWait: '20-30 mins',
        };
        setWaitingQueue((prev) => [...prev, optimistic]);
      }

      setActiveTab('waiting-queue');
      alert('Successfully joined the waiting queue!');
    })();
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12 px-6">
        <div className="max-w-lg w-full bg-white rounded-xl border border-[#8B5A2B]/20 shadow-xl p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Reservation Confirmed!</h2>
            <p className="text-gray-700 mb-8">
              Your table has been reserved successfully
            </p>

            <div className="bg-[#FAF7F2] rounded-lg p-6 mb-6 text-left border border-[#8B5A2B]/10">
              <h3 className="font-semibold mb-4 text-[#8B5A2B]">Reservation Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-[#3E2723]">{bookingData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-[#3E2723]">{bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-IN', { dateStyle: 'long' }) : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-[#3E2723]">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium text-[#3E2723]">{bookingData.guests} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium capitalize text-[#3E2723]">{bookingData.location}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNewReservation}
              className="w-full bg-[#8B5A2B] text-white py-3 rounded-lg font-semibold hover:bg-[#6D4822] transition-colors shadow-md"
            >
              Make Another Reservation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* SECTION 1 — HERO HEADER (First Slide) */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Animation */}
        <div className="absolute inset-0">
          <img
            src={reservationBg}
            alt="Restaurant Reservation"
            className="reservation-hero-bg w-full h-full object-cover object-center"
          />
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        
        {/* Content - Positioned in the center with animations */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1 
            className="reservation-hero-title text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl" 
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Table Reservation
          </h1>
          <p className="reservation-hero-subtitle text-xl md:text-2xl text-white/90 font-light leading-relaxed">
            No waiting, No worries - just great dining.<br />
            Reserve your table and enjoy every moment.
          </p>
        </div>
      </section>

      {/* SECTION 2 — RESERVATION OPERATIONS (Second Slide - Scrollable) */}
      <section className="relative py-20 px-6 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white/95 backdrop-blur-sm rounded-t-2xl border-t border-x border-[#8B5A2B]/20 p-2 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'book'
                  ? 'bg-[#8B5A2B] text-white shadow-md'
                  : 'bg-transparent text-[#8B5A2B] hover:bg-[#8B5A2B]/10'
              }`}
            >
              <Calendar className="w-5 h-5 inline mr-2" />
              Book a Table
            </button>
            <button
              onClick={() => setActiveTab('check')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'check'
                  ? 'bg-[#8B5A2B] text-white shadow-md'
                  : 'bg-transparent text-[#8B5A2B] hover:bg-[#8B5A2B]/10'
              }`}
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Check Availability
            </button>
            <button
              onClick={() => setActiveTab('my-reservations')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'my-reservations'
                  ? 'bg-[#8B5A2B] text-white shadow-md'
                  : 'bg-transparent text-[#8B5A2B] hover:bg-[#8B5A2B]/10'
              }`}
            >
              <LayoutGrid className="w-5 h-5 inline mr-2" />
              My Reservations
            </button>
            <button
              onClick={() => setActiveTab('waiting-queue')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'waiting-queue'
                  ? 'bg-[#8B5A2B] text-white shadow-md'
                  : 'bg-transparent text-[#8B5A2B] hover:bg-[#8B5A2B]/10'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Waiting Queue
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white/95 backdrop-blur-sm rounded-b-2xl border border-[#8B5A2B]/20 shadow-xl p-8">
            {/* Book a Table Tab */}
            {activeTab === 'book' && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Select date, time, and number of guests
                </h2>
                
                <form onSubmit={handleBookingSubmit} className="space-y-8">
                  {/* Selection Row */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Date</label>
                      <DatePicker
                        selected={bookingData.date}
                        onChange={(date) => setBookingData({ ...bookingData, date })}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select a date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                        required
                      />
                    </div>

                    {/* Time Slot */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Time Slot</label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                        required
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Guests</label>
                      <select
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                        required
                      >
                        {guestOptions.map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Location</label>
                      <select
                        value={bookingData.location}
                        onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        {locations.map((loc) => (
                          <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Segment Preference */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Segment Preference</label>
                      <select
                        value={bookingData.segment}
                        onChange={(e) => setBookingData({ ...bookingData, segment: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        {segments.map((seg) => (
                          <option key={seg} value={seg.toLowerCase()}>{seg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Your Details Section */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold mb-6 text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Your Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Name</label>
                        <input
                          type="text"
                          value={bookingData.name}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          placeholder="Enter your name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-800">Phone</label>
                        <input
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                          placeholder="Enter your phone number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!bookingData.date || !bookingData.time || !bookingData.name || !bookingData.phone}
                    className="w-full bg-[#8B5A2B] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#6D4822] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                  >
                    Confirm Reservation
                  </button>
                </form>
              </div>
            )}

            {/* Check Availability Tab */}
            {activeTab === 'check' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Check Table Availability
                  </h2>
                  {showResults && (
                    <button
                      onClick={handleRefresh}
                      className="refresh-btn flex items-center gap-2 px-4 py-2 bg-[#8B5A2B] text-white rounded-lg hover:bg-[#6D4822] transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleCheckAvailability} className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Date</label>
                      <DatePicker
                        selected={checkData.date}
                        onChange={(date) => setCheckData({ ...checkData, date })}
                        minDate={new Date()}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select a date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                        required
                      />
                    </div>

                    {/* Time Slot */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Time Slot</label>
                      <select
                        value={checkData.time}
                        onChange={(e) => setCheckData({ ...checkData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        <option value="">All time slots</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guests */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Guests</label>
                      <select
                        value={checkData.guests}
                        onChange={(e) => setCheckData({ ...checkData, guests: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        {guestOptions.map((num) => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Location</label>
                      <select
                        value={checkData.location}
                        onChange={(e) => setCheckData({ ...checkData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        <option value="any">Any Location</option>
                        {locations.map((loc) => (
                          <option key={loc} value={loc.toLowerCase()}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    {/* Segment */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-800">Segment</label>
                      <select
                        value={checkData.segment}
                        onChange={(e) => setCheckData({ ...checkData, segment: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B5A2B] focus:ring-2 focus:ring-[#8B5A2B]/20"
                      >
                        <option value="any">Any Segment</option>
                        {segments.map((seg) => (
                          <option key={seg} value={seg.toLowerCase()}>{seg}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!checkData.date}
                    className="w-full bg-[#8B5A2B] text-white py-4 rounded-lg font-bold text-lg hover:bg-[#6D4822] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
                  >
                    Check Availability
                  </button>
                </form>

                {/* Availability Results */}
                {showResults && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div>
                      <h3 className="text-2xl font-bold text-[#3E2723] mb-2">Available tables</h3>
                      <p className="text-gray-600">
                        {availabilityResults.filter(t => t.isAvailable).length} available out of {availabilityResults.length} matching tables
                      </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-[#FAF7F2]">
                            <th className="text-left py-4 px-6 font-bold text-sm text-gray-700 uppercase">TABLE</th>
                            <th className="text-left py-4 px-6 font-bold text-sm text-gray-700 uppercase">LOCATION</th>
                            <th className="text-left py-4 px-6 font-bold text-sm text-gray-700 uppercase">SEGMENT</th>
                            <th className="text-left py-4 px-6 font-bold text-sm text-gray-700 uppercase">CAPACITY</th>
                            <th className="text-left py-4 px-6 font-bold text-sm text-gray-700 uppercase">STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availabilityResults.map((table, index) => (
                            <tr 
                              key={table.tableId}
                              className={`border-b border-gray-100 ${
                                index % 2 === 0 ? 'bg-white' : 'bg-[#FAF7F2]/30'
                              }`}
                            >
                              <td className="py-5 px-6 text-gray-800">{table.tableName}</td>
                              <td className="py-5 px-6">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                                  table.location === 'VIP Hall' 
                                    ? 'bg-white border-2 border-orange-500 text-orange-600'
                                    : table.location === 'AC Hall'
                                    ? 'bg-white border border-gray-400 text-gray-700'
                                    : 'bg-white border border-[#8B5A2B] text-[#8B5A2B]'
                                }`}>
                                  {table.location.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-5 px-6 text-gray-800">{table.segment}</td>
                              <td className="py-5 px-6 text-gray-800">{table.capacity}</td>
                              <td className="py-5 px-6">
                                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                                  table.isAvailable
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {table.isAvailable ? 'AVAILABLE' : 'RESERVED'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Waiting Queue Option */}
                    {showWaitingQueueOption && (
                      <div className="mt-6 p-6 bg-amber-50 border-2 border-amber-400 rounded-lg">
                        <h4 className="font-bold text-amber-800 mb-2">All Tables Booked</h4>
                        <p className="text-amber-700 mb-4">
                          The selected time slot ({selectedFullSlot}) has no available tables. Would you like to join the waiting queue?
                        </p>
                        <button
                          onClick={handleJoinWaitingQueue}
                          className="bg-[#8B5A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D4822] transition-colors shadow-md"
                        >
                          Join Waiting Queue
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* My Reservations Tab */}
            {activeTab === 'my-reservations' && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  My Reservations
                </h2>

                {myReservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No reservations found</p>
                    <button
                      onClick={() => setActiveTab('book')}
                      className="mt-4 bg-[#8B5A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D4822] transition-colors"
                    >
                      Book a Table
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myReservations.map((reservation) => (
                      <div
                        key={reservation.reservationId}
                        className="bg-[#FAF7F2] border border-[#8B5A2B]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-[#8B5A2B] mb-1">
                              Table {reservation.tableNumber}
                            </h3>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                reservation.status === 'Confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {reservation.status}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCancelReservation(reservation.reservationId)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">
                              {new Date(reservation.date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{reservation.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{reservation.guests} Guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700 capitalize">{reservation.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{reservation.userName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{reservation.userPhone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Waiting Queue Tab */}
            {activeTab === 'waiting-queue' && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-[#8B5A2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Waiting Queue
                </h2>

                {myWaitingQueue.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No active queue entries</p>
                    <button
                      onClick={() => setActiveTab('check')}
                      className="mt-4 bg-[#8B5A2B] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6D4822] transition-colors"
                    >
                      Check Availability
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myWaitingQueue.map((entry) => (
                      <div
                        key={entry.queueId}
                        className="bg-[#FAF7F2] border border-[#8B5A2B]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-[#8B5A2B] mb-1">
                              Position #{entry.position}
                            </h3>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                              Estimated Wait: {entry.estimatedWait}
                            </span>
                          </div>
                          <button
                            onClick={() => handleLeaveQueue(entry.queueId)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                          >
                            Leave Queue
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">
                              {new Date(entry.date).toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{entry.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#8B5A2B]" />
                            <span className="text-gray-700">{entry.guests} Guests</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmDialogData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#8B5A2B]/20 overflow-hidden">
            {/* Header with brown background */}
            <div className="bg-[#8B5A2B] px-8 py-6">
              <h3 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {confirmDialogData.title}
              </h3>
            </div>
            
            {/* Content */}
            <div className="px-8 py-6">
              <p className="text-gray-700 text-lg mb-6">{confirmDialogData.message}</p>
              
              <div className="flex justify-end gap-3">
                <button
                  className="px-8 py-3 rounded-lg border-2 border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#8B5A2B]/10 transition-colors font-semibold"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-8 py-3 rounded-lg bg-[#8B5A2B] text-white hover:bg-[#6D4822] transition-colors font-semibold shadow-md"
                  onClick={confirmDialogData.onConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}