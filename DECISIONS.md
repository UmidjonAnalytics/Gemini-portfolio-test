# Architecture & Design Decisions

1. **Firestore Real-time Sync**: `onSnapshot` is heavily utilized. The admin forms update Firestore which immediately pushes changes to the public UI components listening to the same collections. This fulfills the requirement that updates appear in other tabs within ~1 second without refresh.

2. **Empty-State Logic**: To ensure sections disappear completely if they have zero published items, the `Header` and the individual components both establish their own `onSnapshot` listeners to the required collections. This allows the Header navigation to conditionally render links and the components to `return null` when empty.

3. **Multilingual Architecture**:
   - Static strings are handled via a custom lightweight dictionary approach (`src/lib/i18n.ts` + JSON files) combined with a Zustand store keeping track of the user's selected language.
   - Dynamic data in Firestore utilizes nested maps (`title: { en, ru, uz }`). The helper function `getLocalizedField` is used everywhere on the public site to elegantly fall back to English if the translation is missing.

4. **Icons**: Due to conflicting peer dependencies with React 19 in the latest `lucide-react`, I fell back to using standard SVG paths where necessary or using `react-icons` as an alternative to ensure the build completes properly.

5. **Security Rules**: Deployed strict `firestore.rules` and `storage.rules`. Reads are public for `settings`, `profile`, and `published` items. Writes require Firebase authentication context. Messages are create-only for the public, read-only for the admin.

6. **Interactive Charts**: Allowed admins to input raw JSON (`[{"name": "Jan", "value": 100}]`) in the project editor. The public site dynamically extracts keys and utilizes `recharts` to render a Bar, Line, or Area chart depending on user interaction in the project modal.

7. **Drag and Drop**: `@hello-pangea/dnd` was chosen for robust drag-and-drop lists inside the admin panel. Upon a drop event, a batch update assigns the new sequential index to the `order` property across all dragged elements simultaneously.
