import React, { useState } from 'react';
import { User } from '../types';
import { storage } from '../utils/storage';
import { api } from '../utils/api_new';
import { IDCard } from './IDCard';
import { Upload, User as UserIcon, Calendar, Mail, Phone, Camera, FileText, Search, CheckCircle } from 'lucide-react';



interface RegistrationFormProps {
  onRegister: (user: User) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    sex: '' as 'male' | 'female' | 'other',
    email: '',
    phone: '',
    template: '' as 'career' | 'business' | 'education' | 'finance',
    programName: '',
    programStartDate: '',
    programEndDate: '',
    dailyStartTime: '',
    dailyEndTime: '',
    customProgramName: '',
    programDurationUnit: '',
    programDurationLength: '',
    expectedCompletionDate: '',
  });
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [cvFile, setCvFile] = useState<string>('');
  const [cvFileName, setCvFileName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseSearch, setCourseSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCvFile(event.target?.result as string);
        setCvFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.birthday) newErrors.birthday = 'Birthday is required';
    if (!formData.sex) newErrors.sex = 'Gender is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.template) newErrors.template = 'Template selection is required';

    // Education template specific validation
    if (formData.template === 'education') {
      if (!formData.programName.trim()) newErrors.programName = 'Program name is required';
      if (!formData.programStartDate) newErrors.programStartDate = 'Program start date is required';
      if (!formData.programEndDate) newErrors.programEndDate = 'Program end date is required';
      if (!formData.dailyStartTime) newErrors.dailyStartTime = 'Daily start time is required';
      if (!formData.dailyEndTime) newErrors.dailyEndTime = 'Daily end time is required';
      if (formData.programName === 'Other' && !formData.customProgramName.trim()) {
        newErrors.customProgramName = 'Please specify your program name';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const registrationData = {
          name: formData.name,
          birthday: formData.birthday,
          sex: formData.sex,
          email: formData.email,
          phone: formData.phone,
          profilePicture,
          template: formData.template,
          cvFile: formData.template === 'career' ? cvFile : undefined,
          cvFileName: formData.template === 'career' ? cvFileName : undefined,
          programName: formData.template === 'education' ?
            (formData.programName === 'Other' ? formData.customProgramName : formData.programName) :
            undefined,
          programStartDate: formData.template === 'education' ? formData.programStartDate : undefined,
          programEndDate: formData.template === 'education' ? formData.programEndDate : undefined,
          dailySchedule: formData.template === 'education' ?
            `${formData.dailyStartTime} - ${formData.dailyEndTime}` :
            undefined,
          programDurationUnit: formData.template === 'education' ? formData.programDurationUnit : undefined,
          programDurationLength: formData.template === 'education' ? (formData.programDurationLength ? formData.programDurationLength : undefined) : undefined,
          expectedCompletionDate: formData.template === 'education' ? formData.expectedCompletionDate : undefined,
        };

        const response = await api.registerUser(registrationData);
        console.log('Registration response:', response);

        // Create user object for local storage (not confirmed yet)
        const user: User = {
          id: response.user_id,
          name: formData.name,
          birthday: formData.birthday,
          sex: formData.sex,
          email: formData.email,
          phone: formData.phone,
          profilePicture,
          template: formData.template,
          cardId: response.card_id,
          createdAt: new Date().toISOString(),
          cvFile: formData.template === 'career' ? cvFile : undefined,
          cvFileName: formData.template === 'career' ? cvFileName : undefined,
          programName: formData.template === 'education' ? formData.programName : undefined,
          programStartDate: formData.template === 'education' ? formData.programStartDate : undefined,
          programEndDate: formData.template === 'education' ? formData.programEndDate : undefined,
          dailySchedule: formData.template === 'education' ? `${formData.dailyStartTime} - ${formData.dailyEndTime}` : undefined,
          programDurationUnit: formData.template === 'education' ? formData.programDurationUnit : undefined,
          programDurationLength: formData.template === 'education' ? (formData.programDurationLength ? formData.programDurationLength : undefined) : undefined,
          expectedCompletionDate: formData.template === 'education' ? formData.expectedCompletionDate : undefined,
          isConfirmed: false,
        };

        // Call onRegister to let parent handle confirmation
        onRegister(user);
      } catch (error) {
        console.error("Registration failed:", error);
        setErrors({ submit: error instanceof Error ? error.message : 'Registration failed. Please try again.' });
      }
    }
  };





  const templates = [
    { value: 'career', label: 'Career Guidance', icon: '💼', description: 'Job search, interview prep, career planning' },
    { value: 'business', label: 'Business Mentor', icon: '🚀', description: 'Entrepreneurship, business strategy, startups' },
    { value: 'education', label: 'Education Guide', icon: '📚', description: 'Study planning, academic guidance, skills' },
    { value: 'finance', label: 'Finance Advisor', icon: '💰', description: 'Financial planning, investments, budgeting' },
  ];

  const courses = [
    'Computer Science', 'Software Engineering', 'Data Science', 'Artificial Intelligence', 'Cybersecurity',
    'Information Technology', 'Computer Engineering', 'Web Development', 'Mobile App Development',
    'Business Administration', 'Business Management', 'Marketing', 'Finance', 'Accounting',
    'Human Resources', 'Supply Chain Management', 'International Business', 'Entrepreneurship',
    'Economics', 'Statistics', 'Mathematics', 'Applied Mathematics', 'Actuarial Science',
    'Physics', 'Chemistry', 'Biology', 'Biochemistry', 'Microbiology', 'Genetics',
    'Environmental Science', 'Geology', 'Astronomy', 'Astrophysics', 'Meteorology',
    'Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Veterinary Medicine', 'Public Health',
    'Psychology', 'Sociology', 'Anthropology', 'Political Science', 'International Relations',
    'History', 'Archaeology', 'Philosophy', 'Theology', 'Religious Studies',
    'English Literature', 'Comparative Literature', 'Creative Writing', 'Journalism',
    'Linguistics', 'Foreign Languages', 'Translation Studies',
    'Art & Design', 'Fine Arts', 'Graphic Design', 'Industrial Design', 'Fashion Design',
    'Architecture', 'Urban Planning', 'Interior Design',
    'Music', 'Music Theory', 'Music Performance', 'Music Production',
    'Film Studies', 'Theater Arts', 'Dance', 'Performing Arts',
    'Education', 'Early Childhood Education', 'Special Education', 'Educational Psychology',
    'Law', 'Criminal Justice', 'Criminology', 'Forensic Science',
    'Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
    'Chemical Engineering', 'Aerospace Engineering', 'Biomedical Engineering',
    'Agriculture', 'Horticulture', 'Food Science', 'Nutrition', 'Dietetics',
    'Sports Science', 'Kinesiology', 'Physical Therapy', 'Occupational Therapy',
    'Geography', 'Urban Studies', 'Tourism & Hospitality', 'Event Management',
    'Library Science', 'Information Science', 'Digital Media', 'Game Design',
    'Neuroscience', 'Cognitive Science', 'Marine Biology', 'Oceanography',
    'Aviation', 'Pilot Training', 'Air Traffic Control',
    'Military Science', 'Strategic Studies', 'Peace and Conflict Studies',
    'Gender Studies', 'Cultural Studies', 'African Studies', 'Asian Studies',
    'Other'
  ];

  const filteredCourses = courses.filter(course =>
    course.toLowerCase().includes(courseSearch.toLowerCase())
  );







  // Default: Registration form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Student Career Mentor ChatBot
          </h1>
          <p className="text-blue-100">Create your personalized learning profile</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>

              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Camera size={48} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">
                  <UserIcon size={20} className="text-blue-600" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              {/* Birthday */}
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={20} className="text-blue-600" />
                  Birthday
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  className={`form-input ${errors.birthday ? 'border-red-500' : ''}`}
                />
                {errors.birthday && <p className="form-error">{errors.birthday}</p>}
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className={`form-input ${errors.sex ? 'border-red-500' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && <p className="form-error">{errors.sex}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  <Mail size={20} className="text-blue-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  <Phone size={20} className="text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+265 (99) 000-0000"
                />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Mentor</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <label
                    key={template.value}
                    className={`template-card ${
                      formData.template === template.value
                        ? 'template-card-selected'
                        : 'template-card-default'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{template.label}</h3>
                    <p className="text-sm opacity-75">{template.description}</p>
                  </label>
                ))}
              </div>
              {errors.template && <p className="form-error">{errors.template}</p>}

              {/* CV Upload for Career Template */}
              {formData.template === 'career' && (
                <div className="form-group">
                  <label className="form-label">
                    <FileText size={20} className="text-blue-600" />
                    Upload CV/Resume (PDF/DOCX)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleCvUpload}
                      className="hidden"
                      id="cv-upload"
                    />
                    <label htmlFor="cv-upload" className="cursor-pointer">
                      <div className="text-gray-400 mb-2">
                        <FileText size={32} />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {cvFileName ? `Selected: ${cvFileName}` : 'Click to upload your CV'}
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF or DOCX files only (max 5MB)
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* Education Program Fields */}
              {formData.template === 'education' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Education Program Details</h3>

                  <div className="form-group">
                    <label className="form-label">
                      📚 Program/Course
                    </label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400 z-10" />
                      <input
                        type="text"
                        placeholder="Search for a course..."
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Enhanced dropdown with better styling */}
                    <div className="mt-2 border border-gray-300 rounded-md max-h-48 overflow-y-auto shadow-lg">
                      {filteredCourses.length === 0 ? (
                        <div className="p-3 text-gray-500 text-center">
                          No courses found
                        </div>
                      ) : (
                        filteredCourses.map((course) => (
                          <div
                            key={course}
                            onClick={() => setFormData({ ...formData, programName: course })}
                            className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                              formData.programName === course
                                ? 'bg-blue-100 border-l-4 border-blue-600'
                                : 'border-l-4 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{course}</span>
                              {formData.programName === course && (
                                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {errors.programName && <p className="form-error mt-2">{errors.programName}</p>}
                  </div>

                  {formData.programName === 'Other' && (
                    <div className="form-group">
                      <label className="form-label">
                        📝 Specify Program Name
                      </label>
                      <input
                        type="text"
                        name="customProgramName"
                        value={formData.customProgramName}
                        onChange={(e) => setFormData({ ...formData, customProgramName: e.target.value })}
                        className={`form-input ${errors.customProgramName ? 'border-red-500' : ''}`}
                        placeholder="Enter your program/course name"
                      />
                      {errors.customProgramName && <p className="form-error">{errors.customProgramName}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">
                        📅 Start Date
                      </label>
                      <input
                        type="date"
                        name="programStartDate"
                        value={formData.programStartDate}
                        onChange={handleInputChange}
                        className={`form-input ${errors.programStartDate ? 'border-red-500' : ''}`}
                      />
                      {errors.programStartDate && <p className="form-error">{errors.programStartDate}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        📅 End Date
                      </label>
                      <input
                        type="date"
                        name="programEndDate"
                        value={formData.programEndDate}
                        onChange={handleInputChange}
                        className={`form-input ${errors.programEndDate ? 'border-red-500' : ''}`}
                      />
                      {errors.programEndDate && <p className="form-error">{errors.programEndDate}</p>}
                    </div>
                  </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">
                        ⏰ Daily Start Time
                      </label>
                      <input
                        type="time"
                        name="dailyStartTime"
                        value={formData.dailyStartTime}
                        onChange={handleInputChange}
                        className={`form-input ${errors.dailyStartTime ? 'border-red-500' : ''}`}
                      />
                      {errors.dailyStartTime && <p className="form-error">{errors.dailyStartTime}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        ⏰ Daily End Time
                      </label>
                      <input
                        type="time"
                        name="dailyEndTime"
                        value={formData.dailyEndTime}
                        onChange={handleInputChange}
                        className={`form-input ${errors.dailyEndTime ? 'border-red-500' : ''}`}
                      />
                      {errors.dailyEndTime && <p className="form-error">{errors.dailyEndTime}</p>}
                    </div>
                  </div>

                  {/* Course Duration Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">
                        📅 Program Duration
                      </label>
                      <select
                        name="programDurationUnit"
                        value={formData.programDurationUnit}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select duration unit</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        ⏱️ Duration Length
                      </label>
                      <input
                        type="number"
                        name="programDurationLength"
                        value={formData.programDurationLength}
                        onChange={handleInputChange}
                        placeholder="e.g., 12"
                        min="1"
                        max="60"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        🎯 Expected Completion
                      </label>
                      <input
                        type="date"
                        name="expectedCompletionDate"
                        value={formData.expectedCompletionDate}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle size={20} className="text-green-600 mr-2" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={!!successMessage}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {successMessage ? 'Processing...' : 'Create My Profile & Generate ID Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
