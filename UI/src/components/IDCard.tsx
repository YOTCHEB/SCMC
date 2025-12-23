import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaEnvelope, FaPhone, FaBirthdayCake, FaGenderless, FaDownload } from 'react-icons/fa';
import html2canvas from 'html2canvas';

interface Course {
  category: string;
  latest_score: number;
  sessions_completed: number;
}

interface ProgramInfo {
  program_name: string;
  start_date: string;
  end_date: string;
  daily_schedule: string;
}

interface StudentIDCardProps {
  name: string;
  cardId: string;
  profilePicture?: string;
  template: string;
  email?: string;
  phone?: string;
  birthday?: string;
  sex?: string;
  coursesTaken?: Course[];
  programInfo?: ProgramInfo | null;
  isConfirmed?: boolean;
}

export const IDCard: React.FC<StudentIDCardProps> = ({
  name,
  cardId,
  profilePicture,
  template,
  email,
  phone,
  birthday,
  sex,
  coursesTaken = [],
  programInfo = null,
  isConfirmed = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadIDCard = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `SCMC_ID_Card_${cardId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading ID card:', error);
      alert('Failed to download ID card. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all hover:scale-105 hover:shadow-3xl" ref={cardRef}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex justify-between items-center relative">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide">SCMC</h1>
          <p className="text-sm opacity-90">Student Career Mentor Chatbot</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Student ID Card</p>
          <p className="text-xs opacity-80">Valid until: {programInfo?.end_date || 'Ongoing'}</p>
        </div>
        {/* Watermark logo */}
        <div className="absolute top-0 right-0 opacity-10 text-6xl font-black pointer-events-none">SCMC</div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-5">
        <div className="flex space-x-5">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="h-28 w-28 rounded-xl border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="h-28 w-28 rounded-xl bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Student Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
            <div className="text-sm space-y-1">
              <div className="flex items-center">
                <span className="text-gray-600 w-24">ID:</span>
                <span className="font-mono font-semibold text-gray-900">{cardId}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-24">Template:</span>
                <span className="font-semibold text-indigo-600">
                  {template ? template.charAt(0).toUpperCase() + template.slice(1) : 'N/A'}
                </span>
              </div>
              {email && (
                <div className="flex items-center space-x-2">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-gray-900">{email}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-gray-400" />
                  <span className="text-gray-900">{phone}</span>
                </div>
              )}
              {birthday && (
                <div className="flex items-center space-x-2">
                  <FaBirthdayCake className="text-gray-400" />
                  <span className="text-gray-900">{birthday}</span>
                </div>
              )}
              {sex && (
                <div className="flex items-center space-x-2">
                  <FaGenderless className="text-gray-400" />
                  <span className="text-gray-900">{sex}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 w-24">Status:</span>
                <span className={`font-semibold ${isConfirmed ? 'text-green-600' : 'text-red-500'}`}>
                  {isConfirmed ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Program Info */}
        {programInfo && (
          <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-xl">
            <h3 className="text-indigo-700 font-semibold mb-2">Program Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium text-gray-600">Program:</span> <span className="text-indigo-900">{programInfo.program_name}</span></p>
              <p><span className="font-medium text-gray-600">Start:</span> {programInfo.start_date}</p>
              <p><span className="font-medium text-gray-600">End:</span> {programInfo.end_date}</p>
              <p><span className="font-medium text-gray-600">Schedule:</span> {programInfo.daily_schedule}</p>
            </div>
          </div>
        )}

        {/* Courses */}
        {coursesTaken.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-gray-900 font-semibold mb-2">Courses Completed</h3>
            {coursesTaken.map(course => (
              <div key={course.category} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
                <span className="font-medium text-gray-900 capitalize">{course.category}</span>
                <div className="text-right">
                  <span className="text-indigo-600 font-semibold">{course.latest_score}%</span>
                  <span className="text-gray-500 text-xs block">{course.sessions_completed} sessions</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code */}
        <div className="flex justify-center mt-5">
          <QRCodeSVG value={cardId} size={80} bgColor="#ffffff" fgColor="#4f46e5" />
        </div>

        {/* Download Button */}
        <div className="flex justify-center mt-5">
          <button
            onClick={downloadIDCard}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <FaDownload className="text-lg" />
            <span>Download ID Card</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
        <div>
          <p>Issued by SCMC Platform</p>
          <p>Valid Student ID Card</p>
        </div>
        <div className="text-right">
          <p className="mb-1">Authorized Signature</p>
          <div className="border-b border-gray-400 w-28 inline-block"></div>
          <p className="mt-1 text-gray-400">SCMC Admin</p>
        </div>
      </div>
    </div>
  );
};
