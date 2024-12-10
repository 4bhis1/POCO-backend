import { Profile } from "passport-github2";
import { authenticateUser } from "../Services/user.service";

export interface User {
  username: string;
  email?: string;
  name: string;
  accessToken: string;
}

interface Props {
  user?: User;
  access_token?: string;
}

export const authenticateReponse = async (
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: (error: any, props?: Props) => void
) => {
  try {
    let email = profile.emails?.[0]?.value;

    // Fetch emails if not provided in the profile
    if (!email) {
      const response = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "PO-CO",
        },
      });

      const emails = await response.json();
      console.log("🚀 ~ file: app.ts:67 ~ emails:", emails);
      // Select the primary email if available
      const primaryEmail = emails.find((e: any) => e.primary)?.email;
      email = primaryEmail;
    }

    const user: User = {
      username: profile.username || "No username",
      email,
      name: profile.displayName || profile.username || "No name",
      accessToken, // Store the access token if needed
    };
    console.log("🚀 ~ file: app.ts:79 ~ user:", user);

    const access_token = await authenticateUser(user);

    return done(null, { user, ...access_token });
  } catch (error) {
    return done(error);
  }
};

export const userProfileHtml = (user_id: string) => `
   <!DOCTYPE html>
<html>
<head>
  <title>Create Repository</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background-color: #f8f9fa;
      color: #333;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    h1 {
      text-align: center;
      color: #007BFF;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background-color: #fff;
    }

    label {
      display: flex;
      flex-direction: column;
      font-weight: bold;
      color: #555;
    }

    input[type="text"],
    input[type="checkbox"] {
      margin-top: 5px;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    input[type="text"]:focus {
      border-color: #007BFF;
      outline: none;
      box-shadow: 0 0 4px rgba(0, 123, 255, 0.3);
    }

    button {
      background: #007BFF;
      color: white;
      border: none;
      padding: 10px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    button:hover {
      background: #0056b3;
    }

    .message {
      margin-top: 20px;
      font-size: 14px;
      font-weight: bold;
    }

    .error {
      color: red;
    }

    .checkbox-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
    }

    /* Loader styles */
    .loader {
      display: none;
      margin: 20px auto;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007BFF;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <h1>Create Repository</h1>
  <form id="repoForm">
    <label>
      Repository Name:
      <input type="text" name="repoName" id="repoName" required placeholder="Enter repository name">
    </label>
    <label class="checkbox-group">
      Private:  
      <input type="checkbox" name="isPrivate" id="isPrivate">
    </label>
    <label class="checkbox-group">
      Show streaks on main profile: 
      <input type="checkbox" name="showStrickOnMainPage" id="showStrickOnMainPage">
    </label>
    <button id="button" type="submit">Create</button>
  </form>
  <div class="loader" id="loader"></div>
  <p id="responseMessage" class="message" style="display: none;"></p>

  <script>
  console.log(">> scriptLoaded")
    document.getElementById("repoForm").addEventListener("submit", async function (event) {
    console.log(">> dunnign")
      event.preventDefault();
      const repoName = document.getElementById("repoName").value;
      const isPrivate = document.getElementById("isPrivate").checked;
      const loader = document.getElementById("loader");
      const messageElement = document.getElementById("responseMessage");

      // Show the loader
      loader.style.display = "block";

      try {
        const response = await fetch("/api/create-repo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: '${user_id}', repoName, isPrivate })
        });

        const result = await response.json();

        console.log(">>> result", result)

        if (response.ok) {
          messageElement.style.color = "green";
          messageElement.textContent = result.message;
          // Close the tab after 2 seconds

          window.location="profile"
          
        } else {
          messageElement.style.color = "red";
          messageElement.textContent = result.message || "An error occurred.";
        }
        messageElement.style.display = "block";
      } catch (error) {
       console.log(">>> error", error)
        messageElement.style.color = "red";
        messageElement.textContent = "An unexpected error occurred.";
        messageElement.style.display = "block";
      } finally {
        // Hide the loader
        loader.style.display = "none";
      }
    });
  </script>
</body>
</html>
  `;

export const successPage = `<!DOCTYPE html>
<html>
<head>
  <title>Success</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      color: #333;
    }

    .container {
      text-align: center;
      background-color: #fff;
      padding: 40px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font-size: 60px;
      margin: 0;
      color: #28a745; /* Green for success */
    }

    h2 {
      margin: 10px 0;
      color: #555;
    }

    p {
      margin: 20px 0;
      color: #666;
    }

    a {
      text-decoration: none;
      color: #fff;
      background-color: #007BFF;
      padding: 10px 20px;
      border-radius: 4px;
      transition: background-color 0.3s;
      font-size: 16px;
    }

    a:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Success!</h1>
    <h2>Your action was completed successfully.</h2>
    <p>Thank you! Everything went smoothly. You can continue exploring or return to the main page.</p>
  </div>
</body>
</html>
`;
