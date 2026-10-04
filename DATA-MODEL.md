# Data Model

All collections are located at the root of the Firestore database.

## Collections

### `settings/main`
- `defaultLanguage` (string): 'en' | 'ru' | 'uz'
- `defaultTheme` (string): 'system' | 'light' | 'dark'
- `accentColor` (string): Hex color code
- `seoTitle`, `seoDescription`, `googleAnalyticsId` (string)
- `sections` (map): Booleans allowing manual toggle of sections (hero, about, skills, etc.)

### `profile/main`
- `name` (string)
- `title`, `tagline`, `bio`, `location` (Localized Map: `{ en: string, ru: string, uz: string }`)
- `languages` (string)
- `availability` (string): 'open' | 'freelance' | 'busy'
- `photoUrl`, `cvUrl` (string)
- `counters` (map): `projects`, `experienceYears`, `tools`, `students` (numbers)
- `socials` (map): `email`, `linkedin`, `github`, `telegram`, `phone` (strings)

### `skills`
- `name` (Localized Map)
- `category` (string): 'bi' | 'programming' | 'databases' | 'soft'
- `proficiency` (number): 0 - 100
- `icon` (string): Emoji
- `order` (number)
- `published` (boolean)

### `projects`
- `title`, `summary`, `problem`, `approach`, `results` (Localized Map)
- `tools` (array of strings)
- `domain` (string)
- `coverImage`, `githubUrl`, `liveUrl`, `iframeUrl`, `chartJson` (string)
- `featured`, `published` (boolean)
- `order` (number)

### `experience`
- `company` (string)
- `role`, `description` (Localized Map)
- `startDate`, `endDate` (string)
- `order` (number)
- `published` (boolean)

### `education`
- `institution`, `degree`, `field` (Localized Map)
- `startDate`, `endDate` (string)
- `order` (number)
- `published` (boolean)

### `certificates`
- `name` (Localized Map)
- `issuer`, `date`, `credentialId`, `url`, `image` (string)
- `order` (number)
- `published` (boolean)

### `testimonials`
- `name`, `company`, `avatarUrl` (string)
- `role`, `text` (Localized Map)
- `order` (number)
- `published` (boolean)

### `messages`
- `name`, `email`, `message` (string)
- `createdAt` (timestamp)
- `read` (boolean)
