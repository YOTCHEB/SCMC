import React from 'react';
import { FaCalendarAlt, FaClock, FaBookOpen, FaCoffee, FaPlay } from 'react-icons/fa';

interface TimetableDisplayProps {
  timetable: {
    content: string;
    level: string;
    category: string;
    generated_at: string;
  };
  onContinue: () => void;
}

interface DaySchedule {
  day: string;
  activities: Array<{
    time?: string;
    topic?: string;
    breaktime?: string;
    afterbreaktime?: string;
    content?: string;
  }>;
}

export const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ timetable, onContinue }) => {
  console.log('TimetableDisplay received timetable:', timetable);

  if (!timetable || !timetable.content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-xl font-semibold">No timetable data available to display.</p>
      </div>
    );
  }

  const parseTimetableContent = (content: string): DaySchedule[] => {
    const days: DaySchedule[] = [];
    const lines = content.split('\n').filter(line => line.trim() !== '');

    let currentDay: DaySchedule | null = null;
    let lineCount = 0;
    const maxLines = 1000; // safety limit to prevent infinite loops or huge processing

    for (const line of lines) {
      if (lineCount++ > maxLines) {
        console.warn('parseTimetableContent: reached max line processing limit');
        break;
      }

      const lowerLine = line.toLowerCase().trim();

      // Check if this is a day header
      const dayMatch = lowerLine.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      if (dayMatch) {
        if (currentDay) {
          days.push(currentDay);
        }
        currentDay = {
          day: dayMatch[1].charAt(0).toUpperCase() + dayMatch[1].slice(1),
          activities: []
        };
        continue;
      }

      if (!currentDay) continue;

      // Parse different types of content
      if (lowerLine.includes('time:') || lowerLine.includes('topic:') ||
          lowerLine.includes('breaktime:') || lowerLine.includes('afterbreaktime:')) {

        const activity: any = {};

        // Extract time
        const timeMatch = line.match(/time:\s*(.+?)(?=\s*(?:topic:|breaktime:|afterbreaktime:|$))/i);
        if (timeMatch) activity.time = timeMatch[1].trim();

        // Extract topic
        const topicMatch = line.match(/topic:\s*(.+?)(?=\s*(?:breaktime:|afterbreaktime:|$))/i);
        if (topicMatch) activity.topic = topicMatch[1].trim();

        // Extract breaktime
        const breakMatch = line.match(/breaktime:\s*(.+?)(?=\s*(?:afterbreaktime:|$))/i);
        if (breakMatch) activity.breaktime = breakMatch[1].trim();

        // Extract afterbreaktime
        const afterBreakMatch = line.match(/afterbreaktime:\s*(.+?)$/i);
        if (afterBreakMatch) activity.afterbreaktime = afterBreakMatch[1].trim();

        if (Object.keys(activity).length > 0) {
          currentDay.activities.push(activity);
        }
      } else if (lowerLine.includes('break') || lowerLine.includes('lunch') || lowerLine.includes('rest')) {
        // Handle break lines
        currentDay.activities.push({ breaktime: line.trim() });
      } else if (/\d{1,2}:\d{2}|\d{1,2}(am|pm)/i.test(line)) {
        // Handle time-based lines
        currentDay.activities.push({ time: line.trim() });
      } else {
        // Handle general content
        currentDay.activities.push({ content: line.trim() });
      }
    }

    if (currentDay) {
      days.push(currentDay);
    }

    return days;
  };

  const parsedSchedule = parseTimetableContent(timetable.content);

  const getActivityIcon = (activity: any) => {
    if (activity.breaktime) return <FaCoffee className="text-orange-500" />;
    if (activity.topic) return <FaBookOpen className="text-blue-500" />;
    if (activity.time) return <FaClock className="text-green-500" />;
    return <FaPlay className="text-purple-500" />;
  };

  const getActivityColor = (activity: any) => {
    if (activity.breaktime) return 'bg-orange-50 border-orange-200';
    if (activity.topic) return 'bg-blue-50 border-blue-200';
    if (activity.time) return 'bg-green-50 border-green-200';
    return 'bg-purple-50 border-purple-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full mb-4 shadow-lg">
            <FaClock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Your Personalized Learning Schedule
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Based on your assessment results, here's your recommended timetable for <span className="font-semibold text-blue-600">{timetable.category}</span>.
          </p>
        </div>

        {/* Timetable Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-10 hover:shadow-3xl transition-all duration-300">

          {/* Card Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" /> Weekly Schedule
            </h2>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 font-semibold rounded-full shadow-inner text-sm">
              {timetable.level.charAt(0).toUpperCase() + timetable.level.slice(1)} Level
            </span>
          </div>

          {/* Structured Timetable Display */}
          <div className="space-y-6">
            {parsedSchedule.map((daySchedule, dayIndex) => (
              <div key={dayIndex} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  {daySchedule.day}
                </h3>

                <div className="space-y-3">
                  {daySchedule.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className={`p-4 rounded-xl border-2 ${getActivityColor(activity)} shadow-sm hover:shadow-md transition-shadow duration-200`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity)}
                        </div>
                        <div className="flex-1 space-y-2">
                          {activity.time && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">Time:</span>
                              <span className="text-gray-600">{activity.time}</span>
                            </div>
                          )}
                          {activity.topic && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">Topic:</span>
                              <span className="text-gray-600">{activity.topic}</span>
                            </div>
                          )}
                          {activity.breaktime && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">Break Time:</span>
                              <span className="text-gray-600">{activity.breaktime}</span>
                            </div>
                          )}
                          {activity.afterbreaktime && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700">After Break:</span>
                              <span className="text-gray-600">{activity.afterbreaktime}</span>
                            </div>
                          )}
                          {activity.content && !activity.time && !activity.topic && !activity.breaktime && !activity.afterbreaktime && (
                            <div className="text-gray-600">{activity.content}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Generated Timestamp */}
          <div className="mt-6 text-right text-xs text-gray-400 italic">
            Generated at: {new Date(timetable.generated_at).toLocaleString()}
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <button
              onClick={onContinue}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-10 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 shadow-lg transition-all duration-300"
            >
              Start Learning Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
