import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";

import {
  FiUploadCloud,
  FiVideo,
  FiFileText,
  FiUsers,
  FiBook,
  FiInbox,
  FiCheck,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi';

// Common Components
const Message = ({ type, children }) => (
  <div
    className={`p-3 rounded-lg mb-4 text-sm ${
      type === 'error'
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-700'
    }`}
  >
    {children}
  </div>
);

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center mb-4">
    {icon}
    <h2 className="text-xl font-semibold ml-2">{title}</h2>
  </div>
);

// Upload Section
const UploadSection = ({ courseId, onUploaded }) => {
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureFile, setLectureFile] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteFile, setNoteFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  const handleLectureUpload = async (e) => {
    e.preventDefault();
    if (!lectureFile || !lectureTitle) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('video', lectureFile);
    formData.append('title', lectureTitle);

    try {
      const res = await axios.post(
        `https://mindscape-ghx1.onrender.com/api/teacher/courses/${courseId}/lecture`,
        formData,
        {
          headers: {
            authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage(res.data.message || 'Lecture uploaded successfully');
      setLectureTitle('');
      setLectureFile(null);

      if (onUploaded) onUploaded();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error uploading lecture');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteUpload = async (e) => {
    e.preventDefault();
    if (!noteFile || !noteTitle) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('note', noteFile);
    formData.append('title', noteTitle);

    try {
      const res = await axios.post(
        `https://mindscape-ghx1.onrender.com/api/teacher/courses/${courseId}/note`,
        formData,
        {
          headers: {
            authorization: token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setMessage(res.data.message || 'Note uploaded successfully');
      setNoteTitle('');
      setNoteFile(null);

      if (onUploaded) onUploaded();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error uploading note');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

 return (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">

    <div className="flex-grow p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-blue-700 mb-8 flex items-center">
          <FiBook className="mr-3 text-indigo-600" />
          Welcome, {teacherName}!
        </h1>

        {message && (
          <Message type={message.toLowerCase().includes('error') ? 'error' : 'success'}>
            {message}
          </Message>
        )}
        {error && <Message type="error">{error}</Message>}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Courses List */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-6">
              <SectionHeader
                icon={<FiBook className="text-indigo-600" />}
                title="Your Courses"
              />

              <div className="space-y-3">
                {courses.map((course) => {
                  const pendingCount = getPendingRequestsCount(course.id);

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`p-4 rounded-xl cursor-pointer transition-all relative ${
                        selectedCourse?.id === course.id
                          ? 'bg-indigo-100 border border-indigo-300'
                          : 'bg-gray-50 hover:bg-indigo-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800">
                        {course.title}
                      </h3>

                      {pendingCount > 0 && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Course Management */}
          <div className="lg:col-span-3">
            {selectedCourse ? (
              <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {selectedCourse.title}
                    </h2>
                    <p className="text-gray-600">
                      Manage your course content and students
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { key: 'uploads', icon: <FiUploadCloud />, label: 'Uploads' },
                      { key: 'contents', icon: <FiBook />, label: 'Contents' },
                      { key: 'students', icon: <FiUsers />, label: 'Students' },
                      { key: 'requests', icon: <FiInbox />, label: 'Requests' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-full flex items-center transition-all ${
                          activeTab === tab.key
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'uploads' && (
                  <UploadSection courseId={selectedCourse.id} />
                )}

                {activeTab === 'contents' && (
                  <ContentsSection courseId={selectedCourse.id} />
                )}

                {activeTab === 'students' && (
                  <StudentsSection students={students} onRefresh={fetchStudents} />
                )}

                {activeTab === 'requests' && (
                  <div className="space-y-4">
                    {enrollmentRequests.filter(
                      (request) => request.course_id === selectedCourse.id
                    ).length === 0 ? (
                      <p className="text-gray-500 text-center py-6">
                        No enrollment requests for this course
                      </p>
                    ) : (
                      enrollmentRequests
                        .filter((request) => request.course_id === selectedCourse.id)
                        .map((request) => (
                          <div
                            key={request.id}
                            className="bg-gray-50 p-5 rounded-xl border border-gray-200"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-gray-700">
                                  Requested by <strong>{request.studentName}</strong>
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(request.request_date).toLocaleDateString()}
                                </p>
                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : request.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {request.status}
                              </span>
                            </div>

                            {request.status === 'pending' && (
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() =>
                                    handleEnrollmentRequest(request.id, 'approved')
                                  }
                                  disabled={loading}
                                  className="bg-green-100 text-green-700 px-4 py-2 rounded-full hover:bg-green-200 transition flex items-center"
                                >
                                  <FiCheck className="mr-1" /> Approve
                                </button>

                                <button
                                  onClick={() =>
                                    handleEnrollmentRequest(request.id, 'rejected')
                                  }
                                  disabled={loading}
                                  className="bg-red-100 text-red-700 px-4 py-2 rounded-full hover:bg-red-200 transition flex items-center"
                                >
                                  <FiX className="mr-1" /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-8 text-center">
                <p className="text-gray-600">
                  Select a course to manage content and students.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);


};

export default TeacherDashboard;
