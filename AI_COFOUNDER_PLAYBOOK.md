# 🧠 The AI Co-Founder Playbook
### Strategy, Tactics, and Prompts for "Vibe Coding"

This isn't a coding tutorial. It's a manual on how to be a **Product Manager** who directs an **AI Lead Engineer**.

---

## 1. The Philosophy
You are no longer a "Coder" typing syntax. You are an **Architect**.
- **Your Job**: Define the *what* and the *why*. Review the work.
- **AI's Job**: Figure out the *how*. Write the syntax. Fix the typos.

### The Golden Rule
> **"Never write code unless you absolutely have to."**
If you find yourself fixing a CSS margin manually, you have broken the loop. Tell the AI to fix it.

---

## 2. The Core Loop
Success comes from a tight iteration loop. Do not give the AI a 10-page essay. Work in steps.

1.  **Context Loading** (One time)
    - Run the "Activator Prompt" (see `AI_STARTUP_GUIDE.md`).
2.  **The Prompt**
    - State your **Goal** clearly.
    - Reference specific **Files** (e.g., "Look at `HomeScreen.tsx`...").
    - Add **Constraints** (e.g., "Use the existing `Button` component").
3.  **Review (Crucial)**
    - Don't just trust the code. Read it.
    - Does it hallucinate a library we don't have?
    - Does it break the rules in `.ai-instructions.md`?
4.  **Verify**
    - exact command: `npm run ios` or checking the Simulator.
5.  **Commit**
    - "Great, commit that." (If using an Agentic IDE) or git commit manually.

---

## 3. Prompt Library (Copy-Paste)

### 🆕 The "New Screen" Pattern
Use this when you want to build a new feature/page.
> "I need a new screen called `ProfileScreen`.
> 1. Create the file in `src/screens`.
> 2. Register it in `RootNavigator.tsx` inside the `MainStacks` or `Tabs` as appropriate.
> 3. It should display [USER_DETAILS] and have a button to [ACTION].
> 4. Use our existing UI components."

### 🗄 The "Schema Change" Pattern (Supabase)
Use this when you need to store new data.
> "I need to store [DATA_TYPE, e.g., 'User Preferences'].
> 1. Check the current schema using the Supabase MCP tool to see what tables exist.
> 2. EITHER: Propose a SQL migration to create a new table called `[TABLE_NAME]`.
> 3. OR: Propose adding columns to the existing `[TABLE_NAME]` table.
> 4. After I run the SQL, update `src/types/supabase.ts`."

### 🐛 The "Bug Fix" Pattern
Use this when something crashes.
> "The app is crashing on the `SettingsScreen`.
> Here is the error from the terminal:
> `[PASTE_ERROR_LOG_HERE]`
> Analyze `SettingsScreen.tsx` and `RootNavigator.tsx` to find the cause. Fix it ensuring you don't break [OTHER_FEATURE]."

### 🎨 The "Visual Tweak" Pattern
Use this for styling.
> "The 'Login' button on `AuthScreen` looks wrong.
> 1. Make it full width.
> 2. Change the background color to match our theme primary color.
> 3. Add 10px of vertical padding.
> Use `StyleSheet.create`."

---

## 4. Advanced Tactics

### 🔌 Using "Superpowers" (MCP)
If you set up MCP (see `MCP_SETUP.md`), you can speak to the outside world.

- **Check Docs**: *"I don't know how to use `FlashList`. Use Context7 to find the best implementation guide and simple code examples."*
- **Check Live Data**: *"List the rows in the `daily_goals` table via Supabase MCP to make sure my save worked."*

### 📸 Screenshot Driven Development
If you use Cursor or Windsurf:
1. Take a screenshot of your Simulator.
2. Drag it into the chat.
3. Prompt: *"Make the header look like this design."* or *"Why is this button off-center?"*
