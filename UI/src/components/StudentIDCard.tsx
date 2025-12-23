import React from 'react';

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

export const StudentIDCard: React.FC<StudentIDCardProps> = ({
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
  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg overflow-hidden border-2 border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SCMC</h1>
            <p className="text-sm opacity-90">Student Management Center</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Student ID Card</p>
            <p className="text-xs opacity-75">Valid until: {programInfo?.end_date || 'Ongoing'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Profile Picture */}
          <div className="shrink-0">
            {profilePicture ? (
              <img
                className="h-24 w-24 rounded-lg object-cover border-2 border-white shadow-md"
                src={profilePicture}
                alt="Profile"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 border-2 border-white shadow-md">
                <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Student Information */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{name}</h2>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Student ID:</span>
                <span className="font-mono font-semibold text-gray-900">{cardId}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Template:</span>
                <span className="font-semibold text-blue-600">
                  {template ? template.charAt(0).toUpperCase() + template.slice(1) : 'Not specified'}
                </span>
              </div>

              {email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-gray-900">{email}</span>
                </div>
              )}

              {phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="text-gray-900">{phone}</span>
                </div>
              )}

              {birthday && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Birthday:</span>
                  <span className="text-gray-900">{birthday}</span>
                </div>
              )}

              {sex && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="text-gray-900">{sex}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${isConfirmed ? 'text-green-600' : 'text-red-600'}`}>
                  {isConfirmed ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Program Information */}
        {programInfo && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Program Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Program:</span> <span className="text-blue-900 font-medium">{programInfo.program_name}</span></p>
              <p><span className="text-gray-600">Start Date:</span> <span className="text-blue-900">{programInfo.start_date}</span></p>
              <p><span className="text-gray-600">End Date:</span> <span className="text-blue-900">{programInfo.end_date}</span></p>
              <p><span className="text-gray-600">Daily Schedule:</span> <span className="text-blue-900">{programInfo.daily_schedule}</span></p>
            </div>
          </div>
        )}

        {/* Courses Taken */}
        {coursesTaken.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Courses Completed</h3>
            <div className="space-y-2">
              {coursesTaken.map((course) => (
                <div key={course.category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {course.category}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {course.latest_score}% Score
                    </div>
                    <div className="text-xs text-gray-500">
                      {course.sessions_completed} sessions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer with Signature */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <p>Issued by: SCMC Platform</p>
            <p>Valid Student ID Card</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Authorized Signature</div>
            <div className="border-b border-gray-400 w-24 inline-block"></div>
            <div className="text-xs text-gray-400 mt-1">SCMC Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};
