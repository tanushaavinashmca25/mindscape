import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import Footer from "./Footer";

import {
  FiVideo,
  FiFileText,
  FiUsers,
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiXCircle,
  FiDownload,
} from 'react-icons/fi';
import { usePomodoroTimer } from './PomodoroContext';
import PDFViewerAdvanced from './PDFViewerAdvanced';
import VideoPlayer from './VideoPlayer';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

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

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('lectures');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [classmates, setClassmates] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);

  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  const [watchProgress, setWatchProgress] = useState({});
  const [noteProgress, setNoteProgress] = useState({});
  const [watchedLecturesToday, setWatchedLecturesToday] = useState({});

  const token = localStorage.getItem('token');
  const { PomodoroButton } = usePomodoroTimer();

  useEffect(() => {
    fetchCourseDetails();
    fetchClassmates();
    fetchWatchProgress();
    fetchNoteProgress();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const [courseRes, detailsRes] = await Promise.all([
        axios.get(`/api/student/courses/${courseId}`, { headers: { authorization: token } }),
        axios.get(`/api/student/courses/${courseId}/details`, { headers: { authorization: token } }),
      ]);

      setCourse({ ...courseRes.data.course, ...detailsRes.data });
      setCurrentStudentId(detailsRes.data.studentId);
    } catch {
      setError('Failed to fetch course details');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassmates = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/students`, {
      headers: { authorization: token },
    });
    setClassmates(res.data.students || []);
  };

  const fetchWatchProgress = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/progress`, {
      headers: { authorization: token },
    });

    const map = {};
    res.data(progress || []).forEach(p => {
      map[p.lecture_id] = p.progress || 0;
    });
    setWatchProgress(map);
  };

  const fetchNoteProgress = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/note-progress`, {
      headers: { authorization: token },
    });

    const map = {};
    res.data(progress || []).forEach(p => {
      map[p.note_id] = p.viewed || 0;
    });
    setNoteProgress(map);
  };

  const updateWatchProgress = async (lectureId, progress) => {
    await axios.post(
      `/api/student/lectures/${lectureId}/progress`,
      { progress },
      { headers: { authorization: token } }
    );

    setWatchProgress(prev => ({ ...prev, [lectureId]: progress }));
  };

  const markWatch = async () => {
    const res = await axios.post(
      `/api/student/courses/${courseId}/watch`,
      {},
      { headers: { authorization: token } }
    );

    setMessage(res.data.message);
    fetchCourseDetails();
    fetchClassmates();
  };

  const handleVideoProgress = (state, lectureId) => {
    const { playedSeconds, accumulated, duration } = state;
    const progress = duration > 0 ? playedSeconds / duration : 0;

    updateWatchProgress(lectureId, progress);

    if (
      duration > 0 &&
      accumulated >= 0.75 * duration &&
      !watchedLecturesToday[lectureId]
    ) {
      setWatchedLecturesToday(prev => ({ ...prev, [lectureId]: true }));
      markWatch();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!course) return <div className="p-8">Course not found</div>;

 
    return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft className="mr-2" /> Back to Dashboard
          </button>
          <PomodoroButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Course Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
                  <p className="text-gray-600">Taught by {course.teacherName}</p>
                </div>
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600 font-semibold">
                    Streak: {course.streak} 🔥
                  </span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            {selectedLecture && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">{selectedLecture.title}</h2>

                <div className="rounded-lg overflow-hidden">
                  <VideoPlayer
                    lecture={selectedLecture}
                    onProgress={(state) => handleVideoProgress(state, selectedLecture.id)}
                  />
                </div>

                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(selectedLecture.upload_date).toLocaleDateString()}

                  {watchProgress[selectedLecture.id] >= 0.75 && (
                    <div className="ml-4 text-green-600 flex items-center">
                      <FiCheck className="mr-2" /> Marked as watched
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PDF Viewer */}
            {selectedNote && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{selectedNote.title}</h2>
                  <button
                    onClick={() => setSelectedNote(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    <FiXCircle className="mr-2" /> Close
                  </button>
                </div>

                {isPDF(selectedNote.file_path) ? (
                  <div className="rounded-lg overflow-hidden">
                    <PDFViewerAdvanced filePath={selectedNote.file_path} />
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="max-w-md mx-auto">
                      <FiFileText className="text-blue-500 text-5xl mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-800 mb-2">
                        This file type can't be previewed
                      </h3>
                      <p className="text-gray-600 mb-6">
                        This document is available for download only.
                      </p>
                      <a
                        href={`https://mindscape-ghx1.onrender.com${selectedNote.file_path}`}
                        download
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                      >
                        <FiDownload className="mr-2" /> Download File
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(selectedNote.upload_date).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Course Content Tabs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex space-x-4 border-b mb-4">
                <button
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-2 px-4 ${
                    activeTab === 'lectures'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  Lectures
                </button>

                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 px-4 ${
                    activeTab === 'notes'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  Notes
                </button>

                <button
                  onClick={() => setActiveTab('classmates')}
                  className={`pb-2 px-4 ${
                    activeTab === 'classmates'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  Classmates
                </button>
              </div>

              {message && (
                <Message type={message.includes('Error') ? 'error' : 'success'}>
                  {message}
                </Message>
              )}

              {/* Lectures */}
              {activeTab === 'lectures' && (
                <div className="space-y-4">
                  {course.lectures.map((lec) => (
                    <div
                      key={lec.id}
                      className={`bg-gray-50 p-4 rounded-lg border hover:border-blue-200 transition-colors ${
                        watchProgress[lec.id] >= 0.75 ? 'border-green-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiVideo className="text-blue-500 mr-3 text-xl" />
                          <div>
                            <h4 className="font-medium text-gray-800 flex items-center">
                              {lec.title}
                              {watchProgress[lec.id] >= 0.75 && (
                                <FiCheck className="ml-2 text-green-600" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiClock className="mr-1" />
                              {new Date(lec.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedLecture(lec);
                            setSelectedNote(null);
                          }}
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            selectedLecture && selectedLecture.id === lec.id
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <FiVideo className="mr-2" /> Watch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  {course.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`bg-gray-50 p-4 rounded-lg border hover:border-blue-200 transition-colors ${
                        noteProgress[note.id] ? 'border-green-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FiFileText className="text-blue-500 mr-3 text-xl" />
                          <div>
                            <h4 className="font-medium text-gray-800 flex items-center">
                              {note.title}
                              {noteProgress[note.id] && (
                                <FiCheck className="ml-2 text-green-600" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiClock className="mr-1" />
                              {new Date(note.upload_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleNoteView(note)}
                          className={`px-4 py-2 rounded-lg flex items-center ${
                            selectedNote && selectedNote.id === note.id
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          <FiFileText className="mr-2" /> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Classmates */}
              {activeTab === 'classmates' && (
                <div className="space-y-4">
                  {classmates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No other students enrolled
                    </p>
                  ) : (
                    classmates.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border ${
                          student.id === currentStudentId
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">
                              {student.name}
                              {student.id === currentStudentId && (
                                <span className="ml-2 text-sm text-blue-600">(You)</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">Current Course Streak</p>
                          </div>

                          <div className="flex items-center">
                            <span className="text-orange-600 font-semibold">
                              {student.streak}
                            </span>
                            <span className="ml-1">🔥</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <SectionHeader icon={<FiUsers className="text-green-500" />} title="Classmates" />
              <div className="space-y-4">
                {classmates.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No other students enrolled</p>
                ) : (
                  classmates.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg border ${
                        student.id === currentStudentId
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.name}
                            {student.id === currentStudentId && (
                              <span className="ml-2 text-sm text-blue-600">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">Current Course Streak</p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-orange-600 font-semibold">{student.streak}</span>
                          <span className="ml-1">🔥</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

    </div>
  );
};

export default CourseDetails;


