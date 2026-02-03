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
    res.data.progress.forEach(p => {
      map[p.lecture_id] = p.progress || 0;
    });
    setWatchProgress(map);
  };

  const fetchNoteProgress = async () => {
    const res = await axios.get(`/api/student/courses/${courseId}/note-progress`, {
      headers: { authorization: token },
    });

    const map = {};
    res.data.progress.forEach(p => {
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
  <div className="flex flex-col min-h-screen">

    <div className="flex-grow container mx-auto px-4 py-8">

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

          {/* MAIN CONTENT */}
          <div className="lg:col-span-3 space-y-6">

            {/* Course Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {course.title}
                  </h1>
                  <p className="text-gray-600">
                    Taught by {course.teacherName}
                  </p>
                </div>

                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-600 font-semibold">
                    Streak: {course.streak} 🔥
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Lecture Player */}
            {selectedLecture && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">
                  {selectedLecture.title}
                </h2>

                <div className="rounded-lg overflow-hidden">
                  <VideoPlayer
                    lecture={selectedLecture}
                    onProgress={(state) =>
                      handleVideoProgress(state, selectedLecture.id)
                    }
                  />
                </div>

                <div className="mt-4 text-sm text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {new Date(
                    selectedLecture.upload_date
                  ).toLocaleDateString()}

                  {watchProgress[selectedLecture.id] >= 0.75 && (
                    <div className="ml-4 text-green-600 flex items-center">
                      <FiCheck className="mr-2" />
                      Marked as watched
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Course Tabs */}
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
                <Message
                  type={message.includes('Error') ? 'error' : 'success'}
                >
                  {message}
                </Message>
              )}

              {/* Lectures List */}
              {activeTab === 'lectures' && (
                <div className="space-y-4">
                  {course.lectures.map((lec) => (
                    <div
                      key={lec.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{lec.title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              lec.upload_date
                            ).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedLecture(lec);
                            setSelectedNote(null);
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          Watch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Classmates */}
              {activeTab === 'classmates' && (
                <div className="space-y-4">
                  {classmates.map((student) => (
                    <div
                      key={student.id}
                      className="p-4 rounded-lg border bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{student.name}</p>
                        <div>
                          {student.streak} 🔥
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <SectionHeader
                icon={<FiUsers className="text-green-500" />}
                title="Classmates"
              />

              <div className="space-y-4">
                {classmates.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-lg border bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{student.name}</p>
                      <div>{student.streak} 🔥</div>
                    </div>
                  </div>
                ))}
              </div>

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
