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

interface IDCardProps {
  name: string;
  cardId: string;
  profilePicture?: string;
  template: string;
  coursesTaken?: Course[];
  programInfo?: ProgramInfo | null;
  signatureImageUrl?: string;
}

export const IDCardEnhanced: React.FC<IDCardProps> = ({
  name,
  cardId,
  profilePicture,
  template,
  coursesTaken = [],
  programInfo = null,
  signatureImageUrl,
}) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-md border border-gray-300 p-6">
      <div className="flex items-center space-x-4">
        <div className="shrink-0">
          {profilePicture ? (
            <img className="h-24 w-24 rounded-full object-cover" src={profilePicture} alt="Profile" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xl font-medium text-black">{name}</div>
          <p className="text-gray-500">Student ID: <span className="font-mono">{cardId}</span></p>
          <p className="text-gray-500">Mentor Template: {template ? template.charAt(0).toUpperCase() + template.slice(1) : 'Not specified'}</p>
          {programInfo && (
            <div className="mt-2 text-gray-600">
              <p>Program: {programInfo.program_name}</p>
              <p>Start Date: {programInfo.start_date}</p>
              <p>End Date: {programInfo.end_date}</p>
              <p>Daily Schedule: {programInfo.daily_schedule}</p>
            </div>
          )}
          {coursesTaken.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700">Courses Taken:</h3>
              <ul className="list-disc list-inside text-gray-600">
                {coursesTaken.map((course) => (
                  <li key={course.category}>
                    {course.category.charAt(0).toUpperCase() + course.category.slice(1)} - Score: {course.latest_score}%, Sessions: {course.sessions_completed}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {signatureImageUrl && (
        <div className="mt-6 flex justify-center">
          <img src={signatureImageUrl} alt="SCMC Signature" className="h-16" />
        </div>
      )}
    </div>
  );
};
