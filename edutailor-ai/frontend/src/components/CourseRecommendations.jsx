export default function CourseRecommendations({ courses }) {

  if (!Array.isArray(courses)) {
    return null;
  }

  return (

    <div className="mt-10">

      <h2 className="text-3xl font-bold text-white mb-6">
        Recommended Courses
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {courses.map((course, index) => (

          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
          >

            <h3 className="text-xl font-bold text-white mb-2">
              {course?.title || "Course"}
            </h3>

            <p className="text-gray-400 mb-4">
              {course?.description || ""}
            </p>

            <a
              href={course?.resource || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl inline-block"
            >
              Open Course
            </a>

          </div>

        ))}

      </div>

    </div>
  );
}
