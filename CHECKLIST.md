# Manual QA Checklist

- [x] Build succeeds with 0 errors (`npm run build`)
- [x] ESLint passes with 0 errors (`npm run lint`)
- [x] Admin Login: Correctly rejects bad passwords, redirects authenticated users.
- [x] Admin Dashboard: Checklist accurately reflects populated sections.
- [x] Empty State: Trashing/drafting all items in a collection hides that section on the live site.
- [x] Fast Updates: Saving an admin form updates an adjacent public tab in < 1s.
- [x] Trilingual Support: Switching EN/RU/UZ toggles UI and Dynamic content. Fallbacks to EN work.
- [x] Dark/Light Mode: Toggles seamlessly, persists, and prevents flash of white on load.
- [x] Project Filters: Clicking domain/tool chips accurately filters the grid.
- [x] Project Search & Sort: Live search and sorting logic functions correctly.
- [x] Project Modal: Traps focus, handles escape key, handles arrow navigation between projects.
- [x] Recharts: Mini-chart renders valid JSON correctly and toggles between Bar, Line, and Area.
- [x] Drag & Drop: Reordering items in admin correctly updates their display order publicly.
- [x] Storage: Image and PDF uploads succeed.
- [x] Contact Form: Successfully writes to `messages` collection.
- [x] Danger Zone: Seed script successfully generates a realistic layout; clear script safely wipes the DB.
