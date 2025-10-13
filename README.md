# EduMentor: AI-Powered Career Guidance & Mentorship Platform

### 📌 Overview

**EduMentor** is a web-based Career Guidance & Recommendation System designed to help students make informed career choices through personalized recommendations and expert mentorship.

Powered by a **Supabase backend**, the platform intelligently matches students to suitable career paths and mentors based on their preferences, skills, and academic performance. The system integrates a Recommendation API that processes a student's `city`, `preferred language`, `interest tags`, and `aptitude test scores` to provide tailored career field suggestions. Students can book mentorship sessions, access verified educational resources, and track their career guidance journey.

### 🎯 Key Features

-   **Student Registration & Profile Management:** Secure sign-up and comprehensive student profiles.
-   **Personalized Career Recommendations:** AI-driven suggestions based on aptitude quizzes and profile data.
-   **Skill-Based Matching with Mentors:** Connects students with the most suitable mentors based on expertise.
-   **Mentor Onboarding & Admin Approval:** A verification system for mentors to ensure quality.
-   **Session Booking System:** Manage mentorship sessions with `Pending`, `Accepted`, and `Completed` statuses.
-   **Career Field Information:** Detailed insights into careers, including:
    -   Average Salary
    -   Required Skills
    -   Top Colleges
-   **Curated Educational Resources:** Access to verified materials like PDFs, articles, and videos.
-   **Multilingual Resource Support:** Resources tailored to the student's preferred language.
-   **Admin Management Dashboard:** A central panel for admins to manage mentors, content, and users.
-   **Secure & Scalable Backend (Supabase):** Leveraging Supabase for robust authentication, database management, and security.

### 🗄️ Database Structure (Supabase & PostgreSQL)

The system is built on a relational database schema in Supabase with the following core tables:

-   **profiles:** Manages user identity and roles (student, mentor, admin).
-   **student_profiles:** Stores student-specific data like grade, interests, and location.
-   **mentor_profiles:** Contains mentor expertise, experience, and availability.
-   **careers:** Holds details for various career fields.
-   **colleges:** Information on educational institutions.
-   **quiz_results:** Stores student aptitude test scores and generated recommendations.
-   **appointments:** Manages session bookings between students and mentors.
-   **scholarships / resources:** Tables for educational materials and funding opportunities.

### 🛠️ Tech Stack

| Category            | Technology                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Frontend** | **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **shadcn/ui**, **React Query** |
| **Backend** | **Supabase** (Backend-as-a-Service)                                                                         |
| **Database** | **PostgreSQL** (via Supabase)                                                                               |
| **Authentication** | **Supabase Auth** (Email/Password, Google OAuth, RLS)                                                       |
| **File Storage** | **Supabase Storage** (for profile pictures, resources)                                                      |
| **Recommendation API**| Custom logic built with **Supabase Edge Functions** |
| **Version Control** | **Git & GitHub** |

### 🚧 Project Status

-   [x] **Foundation & Authentication:** User registration and login system is complete.
-   [x] **Database Schema:** Core tables and security policies (RLS) are implemented in Supabase.
-   [ ] **Aptitude Quiz & Recommendation Engine:** In progress.
-   [ ] **Student & Mentor Dashboards:** UI to be connected with real backend data.
-   [ ] **Session Booking System:** To be implemented.
-   [ ] **Admin Panel:** To be developed.
