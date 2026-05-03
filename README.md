# Resume Crafter

A web application for building and generating professional resumes tailored to each job you apply for.

Tennessee Technological University — CSC 3100: Web Programming (Spring 2026)

---

### Description

Resume Crafter lets users manage their profile, work experience, skills, certifications, and awards in one place. When ready, users select which items to include and generate a clean, printable resume. AI-powered suggestions via the Google Gemini API help improve professional summaries and job responsibility bullet points.

---

### Technologies Used

| Technology | Purpose |
|------------|---------|
| Node.js / Express.js | Web server and API routes |
| SQLite3 | Database |
| Bootstrap 5 | UI framework |
| SweetAlert2 | Popup notifications |
| Google Gemini API | AI-powered text suggestions |
| UUID | Unique ID generation |

All libraries are served locally (no CDN dependencies).

---

### Features

- Single page application with modular JavaScript
- Profile management with contact info and professional summary
- Work experience with detailed responsibilities per job
- Skills organized by category
- Certifications and awards tracking
- Selectable resume builder with print/PDF export
- AI-powered suggestions for summaries and job details
- User-configurable API key via Settings page
- Accessible design (semantic HTML, ARIA labels, form labels)

---

### How to Run

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file and add your Gemini API key:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
4. Run `node server.js`
5. Open `http://localhost:8000` in your browser

---

### Author

Bryson Bargas — [GitHub](https://github.com/BryceMani4c)

---

### AI Usage Disclaimer

Claude AI was used in the creation of this project, primarily in the formatting and assisting in implementation of transferring data from the database into a clean and concise format as a resume to be saved or printed after.
