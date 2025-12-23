import React from 'react';

export const HelpSupport: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">Help & Support</h3>
      <p className="text-gray-600">
        If you have any questions or need assistance, please reach out to our support team.
      </p>
      <ul className="mt-4 space-y-2">
        <li>📧 Email: support@example.com</li>
        <li>📞 Phone: (123) 456-7890</li>
        <li>💬 Live Chat: Available on our website</li>
      </ul>
      <p className="text-gray-600 mt-4">
        You can also check our FAQ section for common questions and answers.
      </p>
    </div>
  );
};
