return (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">

    {/* Page Content */}
    <div className="flex-grow p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-blue-700 mb-8 flex items-center">
          <FiUser className="mr-3 text-indigo-600" />
          Admin Dashboard
        </h1>

        {/* Messages */}
        {message && (
          <Message type="success" onClose={clearMessage}>
            {message}
          </Message>
        )}
        {error && (
          <Message type="error" onClose={clearError}>
            {error}
          </Message>
        )}

        {/* Add New User Section */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-8 mb-10">
          <SectionHeader
            icon={<FiUserPlus className="text-indigo-600" />}
            title="Add New User"
          />

          <form onSubmit={handleAddUser} className="space-y-4">

            <div className="flex gap-6">
              <label className="flex items-center text-gray-700">
                <input
                  type="radio"
                  checked={userType === 'teacher'}
                  onChange={() => setUserType('teacher')}
                  className="mr-2 accent-indigo-600"
                />
                Teacher
              </label>

              <label className="flex items-center text-gray-700">
                <input
                  type="radio"
                  checked={userType === 'student'}
                  onChange={() => setUserType('student')}
                  className="mr-2 accent-indigo-600"
                />
                Student
              </label>
            </div>

            <input
              type="text"
              placeholder="Name"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />

            {userType === 'teacher' && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">
                  Courses they teach:
                </h3>

                {newUser.courses.map((course, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Course ${index + 1}`}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={course}
                    onChange={(e) => handleCourseChange(index, e.target.value)}
                    required
                  />
                ))}

                <button
                  type="button"
                  onClick={addCourseField}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add another course
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full hover:scale-105 hover:shadow-lg transition duration-300"
            >
              Add User
            </button>
          </form>
        </div>

        {/* Teachers Table */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-8 mb-10">
          <SectionHeader
            icon={<FiBook className="text-indigo-600" />}
            title="Teachers"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Courses</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-gray-200 hover:bg-indigo-50 transition"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{teacher.name}</td>
                    <td className="py-3 px-4">{teacher.username}</td>
                    <td className="py-3 px-4">
                      {teacher.courses
                        ? JSON.parse(teacher.courses)
                            .map((c) => c.title)
                            .join(", ")
                        : "No courses"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteUser(teacher.id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-8">
          <SectionHeader
            icon={<FiUsers className="text-indigo-600" />}
            title="Students"
          />

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-indigo-100 text-indigo-700">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Username</th>
                  <th className="py-3 px-4 text-left">Courses</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-200 hover:bg-indigo-50 transition"
                  >
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.username}</td>
                    <td className="py-3 px-4">
                      {student.courses
                        ? JSON.parse(student.courses)
                            .map((c) => c.title)
                            .join(", ")
                        : "No courses"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deleteUser(student.id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                      >
                        <FiTrash2 className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>

    <Footer />
  </div>
);
