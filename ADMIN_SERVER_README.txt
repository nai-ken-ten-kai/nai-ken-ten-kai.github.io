# How to Run the Admin Server for nai-ken-ten-kai

1. **Activate your virtual environment:**
   ```
   source admin_venv/bin/activate
   ```

2. **Start the admin server (recommended port 5010):**
   ```
   python scripts/admin_simple.py --port 5010
   ```
   Or, to allow access from other devices on your network:
   ```
   python scripts/admin_simple.py --host 0.0.0.0 --port 5010
   ```

3. **Keep the terminal open!**
   - The server must keep running in the terminal for the admin panel to be accessible.
   - If you close the terminal, the server will stop.

4. **Access the admin panel:**
   - Open your browser and go to: http://127.0.0.1:5010/

5. **(Optional) Run in background:**
   ```
   nohup python scripts/admin_simple.py --port 5010 > admin.log 2>&1 &
   ```
   - Use this only if you want the server to keep running after closing the terminal (logs will be in admin.log).

---

# Special Note for Space 140 (Shared Projection Space)
- Space 140 is a shared space and can be used by multiple artists over time.
- The admin system supports multiple updates for the same space, each with its own artist and images.
- To visually indicate that space 140 is a shared space (e.g., green color), you may want to:
  - Set a special status (e.g., `"shared"`) for space 140 in the JSON data.
  - Update the frontend (spaces.js, CSS) to show shared spaces in green, even after being taken.
- The system will allow you to keep adding updates for space 140, and each update can have a different artist.

# If you need to mark a space as shared:
- In the admin panel, add a "shared" status for space 140 (or edit the JSON directly).
- Make sure the frontend recognizes and styles `status: "shared"` as green.

---

# Troubleshooting
- If you cannot access the admin panel, make sure the server is running and the terminal is open.
- If you change the admin script, restart the server to apply changes.
- For any issues, check the terminal output for errors.
