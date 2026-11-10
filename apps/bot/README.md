# 4Kilo Fellowship Telegram Bot

## Description

The 4Kilo Fellowship Bot is a comprehensive Telegram-based application designed to serve as both an interactive platform for fellowship members and a powerful management dashboard for administrators. Built specifically for the 4Kilo Fellowship community, the bot streamlines communication, centralized information access, event registration, and administrative tasks, all within the Telegram interface.

It provides seamless integration with a robust backend, effectively mirroring the capabilities of the primary administrative dashboard and making it easily accessible via mobile devices or desktop Telegram clients.

## Key Features

The bot interfaces are divided into Public Features for general users and members, and Administrative Features for authorized personnel.

### Public Features

- **User Authentication and Registration:** A structured, multi-step conversation flow to collect detailed user information, including Name, Team, Department, Year of Study, and securely hashed passwords.
- **Fellowship Information Catalog:** Detailed, on-demand information regarding Programs, Teams, Locations, Leaders, and Social Links.
- **Event Management for Users:** Browsing upcoming events, viewing event details, and self-registration for particular events.
- **Team Join Requests:** Users can browse team options and submit join requests directly to the leadership of those teams.
- **Marketplace & Products:** Access to an integrated marketplace where users can browse listed items or products.
- **Personal Profiles and Records:** A dedicated section (My Profile) where users can view their current join requests, track marketplace orders, and monitor their financial givings.
- **Donation and Payment Handling:** Secure handlers to support direct donations and record interactions related to payments.
- **Daily Devotions:** Easily accessible daily devotions directly through the bot interface.

### Administrative Capabilities

Authorized administrators have access to an exclusive inline menu system that mirrors full dashboard functionality:

- **Global Dashboard & Statistics:** Comprehensive insights into total users, active events, volume of registrations, processed transactions, and total revenue.
- **User Management:** Listing and paginating through registered users to view key details like roles and contact information.
- **CRUD Operations:** Full Create, Read, Update, and Delete capabilities over the core entities:
  - Events
  - Devotions
  - Leaders
  - Programs
  - Teams
  - Locations
- **Review Workflows:** Manage dynamic data entries by approving or rejecting Marketplace Orders and Team Join Requests.
- **Transaction Monitoring:** Keeping track of financial contributions and payments.

## Architecture and Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Telegram Framework:** grammY (`grammy`, `@grammyjs/conversations`, `@grammyjs/menu`)
- **HTTP Client:** Axios (for interacting with the external `my-fellow-admin` APIs)
- **Environment Management:** dotenv
- **Development Tooling:** nodemon, ts-node

The architecture relies strongly on session-based contextual state tracking, utilizing the `grammy` conversation and session plugins. This allows for complex dialogs, such as the multi-step registration or the step-by-step submission forms used by administrators to insert new data entries.

## Project Structure

- `src/index.ts`: The main entry point for the bot, initializing endpoints, conversational states, handlers, and the callback query router.
- `src/config.ts`: Environment configuration and validation.
- `src/api/`: Axios-based client functions used for submitting data to and retrieving data from the main backend system.
- `src/bot/context.ts`: Types and interfaces representing the `grammy` context and session state structure.
- `src/bot/message-manager.ts`: Utilities for safely editing or sending messages to provide a clean UX.
- `src/bot/keyboards.ts`: Statically and dynamically generated inline keyboards and reply keyboards.
- `src/bot/handlers/`: Domain-specific interaction logic split out by feature:
  - `auth/`: Login, registration steps, and logout.
  - `admin/`: Complete suite of CRUD handlers and dashboard components for authorized users.
  - `events/`, `devotions/`, `teams/`, `locations/`, `programs/`, `leaders/`, `marketplace/`: Logic for handling data presentation and interactions.
  - `profile/`: Handles individual user states, historical orders, give records, and requests.
  - `payments/`: Donation and transactional flows.

## Prerequisites

Before running this project, ensure you have the following installed on your target machine:

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A valid Telegram Bot Token from BotFather
- Network access to the remote backend REST API

## Installation

1. **Clone the Repository**
   Using git, pull the codebase to your local environment.

2. **Install Dependencies**
   Navigate to the project root directory and run the following command to retrieve all necessary packages:

   npm install

3. **Configure Environment Variables**
   Create a `.env` file in the root directory. You must supply all the keys expected by the application. Commonly, this will include:
   - `BOT_TOKEN`: Your Telegram Bot API token.
   - Any backend base URL defined in the configuration or required by `axios`.

## Running the Application

### Development Mode

To start the bot in development mode with hot-reloading (ideal for testing changes dynamically), utilize the `dev` script:

npm run dev

This runs the bot using `nodemon` and `ts-node`, watching for any changes in the `src` directory.

### Production Build

1. Compile the TypeScript source code into plain JavaScript:

   npm run build

2. Start the compiled application:

   npm start

## Usage Examples

- Standard users interact with the bot using structured keyboards appended to replies, navigating through `Events`, `Leaders`, `Fellow Info`, `Give`, `Programs`, `Teams`, `Locations`, and `Social Links`.
- Administrators can trigger the exclusive administration menu by sending the `Admin` text or utilizing the corresponding button. The bot will authenticate the user role dynamically before granting access to CRUD lists and dashboard statistics.

## Development and Contribution

- The project relies on a modular handler architecture. To add a new feature, instantiate a handler file in `src/bot/handlers`, define the callback behaviors, and hook the callback prefix or string in `src/index.ts`.
- When appending fields to the user session, ensure `SessionData` in `src/bot/context.ts` is updated.
- Administrative inputs are dynamically routed via `src/bot/handlers/admin/index.ts`; new administrative sub-entities should follow the `handleAdmin[Entity]FormStep` pattern.

## License

This project is licensed under the ISC License.
